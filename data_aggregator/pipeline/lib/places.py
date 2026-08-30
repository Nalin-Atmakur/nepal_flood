"""
lib/places.py — the corridor gazetteer in memory: load, alias index, resolve free text → place_id.
See docs/process_data/01-resolve-places.md.

    places (DB table)  ──┐
    gazetteer/places.csv ─┼─▶ Gazetteer(...)  ─▶ resolve(text) → 'timure' | None
    built-in fallback    ─┘                     resolve_all(text) → [Match, …]  (prose)

Load order: DB table `places` → CSV → built-in minimal list (ids identical to the gazetteer
lane's builder so figures written before the CSV lands keep the same `place:<id>` scopes).
Matching is case/diacritic/script-insensitive via lib.text.match_key: every alias is indexed
by its full key and its consonant skeleton; the text is scanned as token n-grams, longest
alias first, non-overlapping; Chinese aliases are matched by substring. A conservative
Jaro-Winkler pass (≥ 0.93 on full keys, tokens ≥ 5 chars) catches spelling drift such as
'Rasuwadhi' → rasuwagadhi. `resolve()` prefers a settlement over a district when both appear
('टिमुरे, रसुवा' → timure).
"""
from __future__ import annotations

import csv
import re
from dataclasses import dataclass, field
from pathlib import Path
from typing import Any, Iterable

from . import config, log
from .text import jaro_winkler, match_key, nfc, script_of

_TOKEN_SPLIT = re.compile(r"[\s,;:।॥()\[\]{}/\\\-–—\"'“”‘’.!?<>|]+")
MAX_NGRAM = 5
SKELETON_MIN = 3
FUZZY_MIN_LEN = 5
FUZZY_THRESHOLD = 0.93
SKELETON_JW_MIN = 0.86
# common words whose consonant skeleton collides with a place alias (full keys, post-collapse)
STOPWORDS = {
    "selter", "selters", "kount", "border", "kamp", "bridge", "riber", "plod", "road", "bilage", "distrikt", "banks",
    "bank", "tunel", "toun", "market", "sekol", "hosbital", "kolony", "boint", "beoble", "sabe", "sabed",
    "trekers", "sitrep", "rebort", "tem", "tems", "bost", "bosts", "bater", "batar", "kandidate", "kande", "korridor",
}


@dataclass
class Place:
    id: str
    name_en: str
    name_ne: str = ""
    name_hi: str = ""
    name_zh: str = ""
    aliases: list[str] = field(default_factory=list)
    kind: str = "settlement"
    district: str = ""
    municipality: str = ""
    lat: float | None = None
    lon: float | None = None
    elev_m: int | None = None
    km: float | None = None
    side: str = "NP"
    in_channel: bool = False
    below_barrier_lakes: bool = False
    notes: str = ""

    def all_names(self) -> list[str]:
        out = [self.name_en, self.name_ne, self.name_hi, self.name_zh] + list(self.aliases)
        seen: set[str] = set()
        res = []
        for n in out:
            n = nfc(n).strip()
            if n and n.lower() not in seen:
                seen.add(n.lower())
                res.append(n)
        return res


@dataclass
class Match:
    place_id: str
    alias: str
    start: int
    end: int
    kind: str
    exact: bool = True


def _to_bool(v: Any) -> bool:
    return str(v).strip().lower() in ("true", "t", "1", "yes")


def _to_float(v: Any) -> float | None:
    try:
        return float(v) if v not in (None, "", "None") else None
    except (TypeError, ValueError):
        return None


def place_from_row(row: dict[str, Any]) -> Place:
    aliases = row.get("aliases") or []
    if isinstance(aliases, str):
        s = aliases.strip()
        if s.startswith("{") and s.endswith("}"):   # postgres array literal
            s = s[1:-1]
            aliases = [a.strip().strip('"') for a in re.split(r',(?=(?:[^"]*"[^"]*")*[^"]*$)', s) if a.strip()]
        else:
            aliases = [a.strip() for a in s.split("|") if a.strip()]
    elev = row.get("elev_m")
    try:
        elev_i = int(float(elev)) if elev not in (None, "", "None") else None
    except (TypeError, ValueError):
        elev_i = None
    return Place(
        id=str(row["id"]).strip(), name_en=nfc(row.get("name_en") or row["id"]),
        name_ne=nfc(row.get("name_ne") or ""), name_hi=nfc(row.get("name_hi") or ""),
        name_zh=nfc(row.get("name_zh") or ""), aliases=[nfc(a) for a in aliases],
        kind=(row.get("kind") or "settlement"), district=(row.get("district") or ""),
        municipality=(row.get("municipality") or ""), lat=_to_float(row.get("lat")),
        lon=_to_float(row.get("lon")), elev_m=elev_i, km=_to_float(row.get("km")),
        side=(row.get("side") or "NP"), in_channel=_to_bool(row.get("in_channel")),
        below_barrier_lakes=_to_bool(row.get("below_barrier_lakes")), notes=(row.get("notes") or ""),
    )


# Minimal fallback so scopes stay stable before the gazetteer lane lands (ids match its builder).
BUILTIN: list[dict[str, Any]] = [
    {"id": "gyirong_port", "name_en": "Gyirong Port", "name_ne": "केरुङ नाका", "name_hi": "ग्यिरोंग पोर्ट", "name_zh": "吉隆口岸", "kind": "border", "side": "CN", "km": -3, "in_channel": True,
     "aliases": "Gyirong|Kerung|Kyirong|Jilong|Jilong Port|Gyirong Kouan|केरुङ|केरुङ भन्सार|Gyirong border|Kerung border|Gyirong immigration|Gyirong Port (China side)"},
    {"id": "resuo", "name_en": "Resuo", "name_ne": "रेसुओ", "name_zh": "热索村", "kind": "settlement", "side": "CN", "km": -4, "in_channel": True, "aliases": "Resuo Cun|Resuo Bridge|热索桥"},
    {"id": "gyirong_town", "name_en": "Gyirong Town", "name_ne": "केरुङ", "name_zh": "吉隆镇", "kind": "settlement", "side": "CN", "km": -25, "aliases": "Gyirong Zhen|Kerung town|Jilong Zhen"},
    {"id": "rasuwagadhi", "name_en": "Rasuwagadhi", "name_ne": "रसुवागढी", "name_hi": "रसुवागढ़ी", "name_zh": "热索瓦", "kind": "border", "district": "Rasuwa", "km": 0, "in_channel": True,
     "aliases": "Rasuwagadi|Rasuwa Gadhi|Rasuwagarhi|Rasuwa border|Friendship Bridge|रसुवागढी नाका|Rasuwa Gadi|Rasuwagadhi border"},
    {"id": "rasuwagadhi_hep", "name_en": "Rasuwagadhi Hydropower Project", "name_ne": "रसुवागढी जलविद्युत", "kind": "tunnel_portal", "district": "Rasuwa", "km": 1, "in_channel": True, "aliases": "Rasuwagadhi HEP|RGHPP"},
    {"id": "timure", "name_en": "Timure", "name_ne": "टिमुरे", "name_hi": "टिमुरे", "kind": "settlement", "district": "Rasuwa", "km": 4, "in_channel": True, "below_barrier_lakes": True, "aliases": "Timure bazaar|Timure Bazar|Timure dry port|टिमुरे बजार"},
    {"id": "timure_helipad", "name_en": "Timure helipad", "name_ne": "टिमुरे हेलिप्याड", "kind": "helipad", "district": "Rasuwa", "km": 4, "aliases": ""},
    {"id": "ghattekhola", "name_en": "Ghattekhola", "name_ne": "घट्टेखोला", "kind": "settlement", "district": "Rasuwa", "km": 8, "in_channel": True, "below_barrier_lakes": True, "aliases": "Ghatte Khola"},
    {"id": "thuman", "name_en": "Thuman", "name_ne": "थुमन", "kind": "settlement", "district": "Rasuwa", "km": 4, "aliases": ""},
    {"id": "briddim", "name_en": "Briddim", "name_ne": "ब्रिद्दिम", "kind": "settlement", "district": "Rasuwa", "aliases": "Bridim"},
    {"id": "goljung", "name_en": "Goljung", "name_ne": "गोल्जुङ", "kind": "settlement", "district": "Rasuwa", "aliases": "Goljung village|गोल्जुङ्ग"},
    {"id": "gatlang", "name_en": "Gatlang", "name_ne": "गतलाङ", "kind": "settlement", "district": "Rasuwa", "aliases": ""},
    {"id": "syabrubesi", "name_en": "Syabrubesi", "name_ne": "स्याफ्रुबेसी", "name_hi": "स्याब्रुबेसी", "kind": "settlement", "district": "Rasuwa", "km": 16, "in_channel": True, "below_barrier_lakes": True,
     "aliases": "Syaphrubesi|Shyaprubesi|Syabru Besi|Syabrubensi|Syafrubesi|Syabru Bensi|स्याफ्रुबेशी|स्याफ्रुवेशी|स्याब्रुबेसी|स्याफ्रुबेँसी|Syaprubesi"},
    {"id": "thulo_syabru", "name_en": "Thulo Syabru", "name_ne": "ठूलो स्याफ्रु", "kind": "settlement", "district": "Rasuwa", "aliases": "Thulo Syaphru|Syabru village"},
    {"id": "lama_hotel", "name_en": "Lama Hotel", "name_ne": "लामा होटल", "kind": "lodge_cluster", "district": "Rasuwa", "aliases": ""},
    {"id": "langtang_village", "name_en": "Langtang village", "name_ne": "लाङटाङ गाउँ", "name_hi": "लांगटांग", "kind": "settlement", "district": "Rasuwa", "aliases": "Langtang|Langtang Valley|लाङटाङ|लाङ्टाङ|Langtang valley"},
    {"id": "kyanjin_gompa", "name_en": "Kyanjin Gompa", "name_ne": "क्याञ्जिन गुम्बा", "kind": "settlement", "district": "Rasuwa", "aliases": "Kyanjin|Kyangjin|Kyanjin Gumba|क्याञ्जिन"},
    {"id": "gosaikunda", "name_en": "Gosaikunda", "name_ne": "गोसाईकुण्ड", "kind": "settlement", "district": "Rasuwa", "aliases": "Gosainkunda|गोसाइँकुण्ड"},
    {"id": "dhunche", "name_en": "Dhunche", "name_ne": "धुन्चे", "name_hi": "धुन्चे", "kind": "settlement", "district": "Rasuwa", "km": 30, "aliases": "Dhunche bazaar|Dhunche Bazar|Rasuwa headquarters|धुन्चे बजार"},
    {"id": "ramche", "name_en": "Ramche", "name_ne": "रामचे", "kind": "settlement", "district": "Rasuwa", "aliases": ""},
    {"id": "mailung", "name_en": "Mailung", "name_ne": "मैलुङ", "name_hi": "मैलुंग", "kind": "settlement", "district": "Rasuwa", "km": 32, "in_channel": True, "below_barrier_lakes": True, "aliases": "Mailung Dovan|Mailung Bazar|मैलुंग|मैलुङ्ग"},
    {"id": "ut1_mailung_camp", "name_en": "Upper Trishuli-1 camp (Mailung)", "name_ne": "अपर त्रिशूली-१ क्याम्प", "kind": "camp", "district": "Rasuwa", "km": 32, "in_channel": True, "below_barrier_lakes": True,
     "aliases": "Upper Trishuli 1|Upper Trishuli-1|UT-1|UT1|Upper Trisuli 1|अपर त्रिशूली १|अपर त्रिशुली-१|UT-1 camp|Upper Trishuli-1 tunnel"},
    {"id": "haku", "name_en": "Haku", "name_ne": "हाकु", "kind": "settlement", "district": "Rasuwa", "aliases": ""},
    {"id": "hakubesi", "name_en": "Hakubesi", "name_ne": "हाकुबेसी", "kind": "settlement", "district": "Rasuwa", "aliases": "Haku Besi|हाकुबेशी"},
    {"id": "ut3a", "name_en": "Upper Trishuli-3A", "name_ne": "त्रिशूली ३ए", "kind": "tunnel_portal", "district": "Nuwakot", "aliases": "Trishuli 3A|Trishuli-3A|UT-3A|त्रिशूली ३ए|त्रिशुली ३ ए"},
    {"id": "ut3", "name_en": "Upper Trishuli-3", "name_ne": "त्रिशूली ३", "kind": "tunnel_portal", "district": "Nuwakot", "aliases": "Trishuli 3|UT-3"},
    {"id": "ut3b", "name_en": "Trishuli-3B", "name_ne": "त्रिशूली ३बी", "kind": "tunnel_portal", "district": "Nuwakot", "aliases": "Trishuli 3B|UT-3B|त्रिशूली ३बी"},
    {"id": "salletar", "name_en": "Salletar", "name_ne": "सल्लेटार", "kind": "settlement", "district": "Nuwakot", "aliases": "Salle Tar|सलिटार"},
    {"id": "shantibazar", "name_en": "Shanti Bazar", "name_ne": "शान्ति बजार", "kind": "settlement", "district": "Nuwakot", "aliases": "Shantibazar|Shanti Bazaar"},
    {"id": "betrawati", "name_en": "Betrawati", "name_ne": "बेत्रावती", "name_hi": "बेत्रावती", "kind": "settlement", "district": "Nuwakot", "km": 46, "in_channel": True, "below_barrier_lakes": True,
     "aliases": "Betravati|Betrabati|Betrawoti|वेत्रवती|बेत्रावति|Betrawati bazaar"},
    {"id": "trishuli_bazar", "name_en": "Trishuli Bazar", "name_ne": "त्रिशूली बजार", "kind": "settlement", "district": "Nuwakot", "km": 52, "aliases": "Trishuli Bazaar|Trisuli Bazar|त्रिशुली बजार|त्रिशुली|त्रिशूली"},
    {"id": "battar", "name_en": "Battar", "name_ne": "बट्टार", "kind": "settlement", "district": "Nuwakot", "km": 53, "aliases": "Batar|बट्टार बजार"},
    {"id": "bidur", "name_en": "Bidur", "name_ne": "विदुर", "name_hi": "बिदुर", "kind": "settlement", "district": "Nuwakot", "km": 54, "aliases": "Bidur Municipality|Bidur / Trishuli|बिदुर|विदुर नगरपालिका"},
    {"id": "colony", "name_en": "Colony (Trishuli)", "name_ne": "कोलनी", "kind": "settlement", "district": "Nuwakot", "aliases": "Colony|Trishuli Colony"},
    {"id": "devighat", "name_en": "Devighat", "name_ne": "देवीघाट", "kind": "settlement", "district": "Nuwakot", "km": 60, "in_channel": True, "aliases": "Devi Ghat|देवीघाट जलविद्युत"},
    {"id": "galchhi", "name_en": "Galchhi", "name_ne": "गल्छी", "name_hi": "गलछी", "kind": "settlement", "district": "Dhading", "km": 75, "in_channel": True, "aliases": "Galchi|Gal Chhi|गल्छि"},
    {"id": "gajuri", "name_en": "Gajuri", "name_ne": "गजुरी", "kind": "settlement", "district": "Dhading", "aliases": ""},
    {"id": "malekhu", "name_en": "Malekhu", "name_ne": "मलेखु", "kind": "settlement", "district": "Dhading", "km": 90, "in_channel": True, "aliases": "Malekhu bazaar|Furke Khola"},
    {"id": "benighat", "name_en": "Benighat", "name_ne": "बेनीघाट", "kind": "settlement", "district": "Dhading", "aliases": "Beni Ghat"},
    {"id": "mugling", "name_en": "Mugling", "name_ne": "मुग्लिन", "kind": "settlement", "district": "Chitwan", "km": 105, "aliases": "Muglin|मुग्लिङ"},
    {"id": "kali_khola", "name_en": "Kali Khola", "name_ne": "काली खोला", "kind": "settlement", "district": "Dhading", "aliases": "Kalikhola"},
    {"id": "devghat", "name_en": "Devghat", "name_ne": "देवघाट", "kind": "settlement", "district": "Tanahun", "km": 125, "aliases": "Dev Ghat"},
    {"id": "bharatpur", "name_en": "Bharatpur", "name_ne": "भरतपुर", "kind": "settlement", "district": "Chitwan", "km": 130, "aliases": "Narayanghat|Narayangadh|नारायणघाट"},
    {"id": "chilime", "name_en": "Chilime", "name_ne": "चिलिमे", "kind": "settlement", "district": "Rasuwa", "aliases": "Chilime HEP|चिलिमे जलविद्युत"},
    {"id": "manedhunga", "name_en": "Manedhunga", "name_ne": "मानेढुङ्गा", "kind": "settlement", "district": "Nuwakot", "aliases": "Mane Dhunga"},
    {"id": "kathmandu", "name_en": "Kathmandu", "name_ne": "काठमाडौं", "name_hi": "काठमांडू", "name_zh": "加德满都", "kind": "settlement", "district": "Kathmandu", "aliases": "काठमाण्डौ|काठमाडौँ|KTM"},
    {"id": "dhunche_army_camp", "name_en": "Dhunche Nepali Army Relief Camp", "name_ne": "धुन्चे नेपाली सेना राहत शिविर", "kind": "shelter", "district": "Rasuwa", "lat": 28.1118, "lon": 85.2977, "aliases": ""},
    {"id": "rasuwa_district_hospital", "name_en": "Rasuwa District Hospital", "name_ne": "जिल्ला अस्पताल रसुवा", "kind": "hospital", "district": "Rasuwa", "lat": 28.1127, "lon": 85.299, "aliases": "Rasuwa District Hospital, Dhunche"},
    {"id": "syabrubesi_shelter", "name_en": "Syabrubesi Temporary Shelter", "name_ne": "स्याफ्रुबेँसी अस्थायी आश्रयस्थल", "kind": "shelter", "district": "Rasuwa", "lat": 28.1642, "lon": 85.3392, "aliases": ""},
    {"id": "timure_health_post", "name_en": "Timure Health Post", "name_ne": "टिमुरे स्वास्थ्य चौकी", "kind": "hospital", "district": "Rasuwa", "lat": 28.2638, "lon": 85.3762, "aliases": ""},
    {"id": "bidur_army_camp", "name_en": "Bidur Nepali Army Relief Camp", "name_ne": "विदुर नेपाली सेना राहत शिविर", "kind": "shelter", "district": "Nuwakot", "lat": 27.9139, "lon": 85.1505, "aliases": ""},
    {"id": "trishuli_hospital", "name_en": "Trishuli District Hospital", "name_ne": "त्रिशूली जिल्ला अस्पताल", "kind": "hospital", "district": "Nuwakot", "lat": 27.929, "lon": 85.165, "aliases": "Trishuli Hospital|Trishuli Hospital, Bidur"},
    {"id": "battar_shelter", "name_en": "Battar Community Shelter", "name_ne": "बट्टार सामुदायिक आश्रयस्थल", "kind": "shelter", "district": "Nuwakot", "lat": 27.9245, "lon": 85.1488, "aliases": ""},
    {"id": "kalikasthan_phc", "name_en": "Kalikasthan Primary Health Centre", "name_ne": "कालिकास्थान प्राथमिक स्वास्थ्य केन्द्र", "kind": "hospital", "district": "Rasuwa", "lat": 28.056, "lon": 85.268, "aliases": "Kalikasthan"},
    {"id": "dhaibung_relief_centre", "name_en": "Dhaibung Relief Collection Centre", "name_ne": "धैबुङ राहत सङ्कलन केन्द्र", "kind": "shelter", "district": "Rasuwa", "lat": 28.024, "lon": 85.245, "aliases": "Dhaibung"},
    {"id": "galchhi_relief_camp", "name_en": "Galchhi Transit Relief Camp", "name_ne": "गल्छी ट्रान्जिट राहत शिविर", "kind": "shelter", "district": "Dhading", "lat": 27.84, "lon": 84.985, "aliases": ""},
    {"id": "tuth_kathmandu", "name_en": "Tribhuvan University Teaching Hospital", "name_ne": "त्रिभुवन विश्वविद्यालय शिक्षण अस्पताल", "kind": "hospital", "district": "Kathmandu", "lat": 27.7352, "lon": 85.331, "aliases": "TUTH|TU Teaching Hospital|TUTH, Kathmandu"},
    {"id": "rasuwa", "name_en": "Rasuwa", "name_ne": "रसुवा", "name_hi": "रसुवा", "kind": "district", "district": "Rasuwa", "aliases": "Rasuwa district|रसुवा जिल्ला"},
    {"id": "nuwakot", "name_en": "Nuwakot", "name_ne": "नुवाकोट", "name_hi": "नुवाकोट", "kind": "district", "district": "Nuwakot", "aliases": "Nuwakot district|नुवाकोट जिल्ला"},
    {"id": "dhading", "name_en": "Dhading", "name_ne": "धादिङ", "name_hi": "धादिंग", "kind": "district", "district": "Dhading", "aliases": "Dhading district|धादिङ्ग"},
    {"id": "gorkha", "name_en": "Gorkha", "name_ne": "गोरखा", "kind": "district", "district": "Gorkha", "aliases": "Gorkha district"},
    {"id": "tanahun", "name_en": "Tanahun", "name_ne": "तनहुँ", "kind": "district", "district": "Tanahun", "aliases": "Tanahu|तनहुं"},
    {"id": "chitwan", "name_en": "Chitwan", "name_ne": "चितवन", "kind": "district", "district": "Chitwan", "aliases": "Chitwan district"},
    {"id": "nawalparasi_east", "name_en": "Nawalparasi East", "name_ne": "नवलपरासी पूर्व", "kind": "district", "district": "Nawalparasi East", "aliases": "Nawalpur|Nawalparasi (Bardaghat Susta East)|नवलपुर|नवलपरासी पूर्व"},
    {"id": "nawalparasi_west", "name_en": "Nawalparasi West", "name_ne": "नवलपरासी पश्चिम", "kind": "district", "district": "Nawalparasi West", "aliases": "Parasi|Nawalparasi (Bardaghat Susta West)|नवलपरासी पश्चिम|परासी"},
    {"id": "sindhupalchok", "name_en": "Sindhupalchok", "name_ne": "सिन्धुपाल्चोक", "kind": "district", "district": "Sindhupalchok", "aliases": "Sindhupalchowk|Sindhupalchok district"},
    {"id": "makwanpur", "name_en": "Makwanpur", "name_ne": "मकवानपुर", "kind": "district", "district": "Makwanpur", "aliases": ""},
    {"id": "bhotekoshi_rm_sindhupalchok", "name_en": "Bhotekoshi Rural Municipality (Sindhupalchok)", "name_ne": "भोटेकोशी गाउँपालिका", "kind": "settlement", "district": "Sindhupalchok",
     "aliases": "Bhotekoshi RM|Bhotekoshi Rural Municipality|Bhote Koshi Rural Municipality|Bhotekoshi Gaunpalika|भोटेकोशी गाउँपालिका|Bahrabise|बाह्रबिसे"},
]


class Gazetteer:
    def __init__(self, places: Iterable[Place], source: str = "memory"):
        self.places: dict[str, Place] = {}
        self.source = source
        for p in places:
            self.places[p.id] = p
        self._full: dict[str, list[tuple[str, str]]] = {}
        self._skel: dict[str, list[tuple[str, str]]] = {}
        self._cjk: list[tuple[str, str]] = []
        self._build()

    # ---- loading -----------------------------------------------------------
    @classmethod
    def from_rows(cls, rows: Iterable[dict[str, Any]], source: str = "rows") -> "Gazetteer":
        return cls([place_from_row(r) for r in rows], source=source)

    @classmethod
    def from_csv(cls, path: Path) -> "Gazetteer":
        with path.open(encoding="utf-8", newline="") as fh:
            return cls.from_rows(list(csv.DictReader(fh)), source=f"csv:{path.name}")

    @classmethod
    def builtin(cls) -> "Gazetteer":
        return cls.from_rows(BUILTIN, source="builtin")

    @classmethod
    def load(cls, db: Any = None, csv_path: Path | None = None) -> "Gazetteer":
        """DB → CSV → built-in. Tolerates an empty `places` table and a missing CSV."""
        if db is not None:
            try:
                rows = db.select_all("places", {"select": "*", "order": "id"})
                if rows:
                    g = cls.from_rows(rows, source="db")
                    log.info("places.loaded", source="db", n=len(g.places))
                    return g
                log.warn("places.empty_table")
            except Exception as e:  # noqa: BLE001 — fall through to CSV
                log.warn("places.db_failed", error=type(e).__name__)
        p = csv_path or config.GAZETTEER_CSV
        if p.exists():
            try:
                g = cls.from_csv(p)
                if g.places:
                    log.info("places.loaded", source="csv", n=len(g.places))
                    return g
            except Exception as e:  # noqa: BLE001
                log.warn("places.csv_failed", error=type(e).__name__)
        g = cls.builtin()
        log.info("places.loaded", source="builtin", n=len(g.places))
        return g

    # ---- index -------------------------------------------------------------
    def _build(self) -> None:
        for p in self.places.values():
            for alias in p.all_names():
                if script_of(alias) == "hans":
                    self._cjk.append((match_key(alias), p.id))
                    continue
                full = match_key(alias, skeleton=False)
                skel = match_key(alias, skeleton=True)
                if full:
                    self._full.setdefault(full, []).append((p.id, alias))
                if skel and len(skel) >= SKELETON_MIN:
                    self._skel.setdefault(skel, []).append((p.id, alias))
        self._cjk.sort(key=lambda t: -len(t[0]))
        self._fuzzy_keys = [k for k in self._full if len(k) >= FUZZY_MIN_LEN]

    def __len__(self) -> int:
        return len(self.places)

    def get(self, place_id: str | None) -> Place | None:
        return self.places.get(place_id or "")

    def all(self) -> list[Place]:
        return list(self.places.values())

    def ids(self) -> list[str]:
        return list(self.places.keys())

    def _pick(self, cands: list[tuple[str, str]]) -> tuple[str, str]:
        """When one alias key maps to several places, prefer the non-district one."""
        cands = sorted(cands, key=lambda c: (self.places[c[0]].kind == "district", c[0]))
        return cands[0]

    # ---- resolution --------------------------------------------------------
    def resolve_all(self, text: str | None, fuzzy: bool = True) -> list[Match]:
        text = nfc(text)
        if not text:
            return []
        matches: list[Match] = []
        # Chinese aliases: substring
        low = text.lower()
        for key, pid in self._cjk:
            i = low.find(key)
            if i >= 0:
                matches.append(Match(pid, key, i, i + len(key), self.places[pid].kind))
        # token n-grams
        tokens: list[tuple[str, int, int]] = []
        for m in re.finditer(r"[^\s,;:।॥()\[\]{}/\\\-–—\"'“”‘’.!?<>|]+", text):
            tokens.append((m.group(0), m.start(), m.end()))
        consumed = [False] * len(tokens)
        for n in range(min(MAX_NGRAM, len(tokens)), 0, -1):
            for i in range(0, len(tokens) - n + 1):
                if any(consumed[i:i + n]):
                    continue
                phrase = text[tokens[i][1]:tokens[i + n - 1][2]]
                full = match_key(phrase, skeleton=False)
                hit = None
                exact = True
                if full and full in self._full:
                    hit = self._pick(self._full[full])
                else:
                    skel = match_key(phrase, skeleton=True)
                    if skel and len(skel) >= SKELETON_MIN and skel in self._skel and full not in STOPWORDS:
                        cand = self._pick(self._skel[skel])
                        # a consonant-skeleton hit must also look like the alias with vowels in
                        if jaro_winkler(full, match_key(cand[1], skeleton=False)) >= SKELETON_JW_MIN:
                            hit = cand
                            exact = False
                    if hit is None and fuzzy and n == 1 and len(full) >= FUZZY_MIN_LEN and full not in STOPWORDS:
                        best, best_s = None, 0.0
                        for k in self._fuzzy_keys:
                            s = jaro_winkler(full, k)
                            if s > best_s:
                                best, best_s = k, s
                        if best and best_s >= FUZZY_THRESHOLD:
                            hit = self._pick(self._full[best])
                            exact = False
                if hit:
                    pid, alias = hit
                    matches.append(Match(pid, alias, tokens[i][1], tokens[i + n - 1][2], self.places[pid].kind, exact))
                    for j in range(i, i + n):
                        consumed[j] = True
        matches.sort(key=lambda m: m.start)
        return matches

    def resolve(self, text: str | None, fuzzy: bool = True) -> str | None:
        ms = self.resolve_all(text, fuzzy=fuzzy)
        if not ms:
            return None
        ms.sort(key=lambda m: (m.kind == "district", not m.exact, -(m.end - m.start), m.start))
        return ms[0].place_id

    def resolve_ids(self, text: str | None) -> list[str]:
        out: list[str] = []
        for m in self.resolve_all(text):
            if m.place_id not in out:
                out.append(m.place_id)
        return out
