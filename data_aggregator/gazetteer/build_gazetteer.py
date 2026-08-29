#!/usr/bin/env python3
"""
build_gazetteer.py — reproducible builder for gazetteer/places.csv (see README.md, step 1).

    SEED (embedded, hand-curated)  ──┐
    NDRRMA rescued-locations API   ──┼──▶ merge ──▶ places.csv
    NDRRMA stationed-locations API ──┤
    Nominatim (OSM) geocoder       ──┘

Every network response is cached under gazetteer/.cache/ (gitignored) so a rebuild is
deterministic and offline-capable:

    python build_gazetteer.py            # use cache, fetch only what is missing
    python build_gazetteer.py --offline  # cache only, never touch the network
    python build_gazetteer.py --refresh  # ignore the cache and re-fetch everything

Coordinate policy (recorded in the `notes` column of every row):
  * "coord: NDRRMA centroid"  — the point published by ndrrma.gov.np stationed-locations.
  * "coord: OSM/Nominatim"    — first Nominatim hit within `radius_km` of the seed guess.
  * "coord estimated"         — no acceptable OSM hit; the seed guess is used as-is.
Nominatim is queried at most once per second with a descriptive User-Agent, per the
OSM usage policy.
"""
from __future__ import annotations

import argparse
import csv
import hashlib
import json
import math
import re
import sys
import time
from dataclasses import dataclass, field
from pathlib import Path

HERE = Path(__file__).resolve().parent
CACHE = HERE / ".cache"
OUT = HERE / "places.csv"

COLUMNS = [
    "id", "name_en", "name_ne", "name_hi", "name_zh", "aliases", "kind", "district",
    "municipality", "ward", "lat", "lon", "elev_m", "km", "side", "in_channel",
    "below_barrier_lakes", "notes",
]

USER_AGENT = "nepalfloodtracker-gazetteer/1.0 (contact@nepalfloodtracker.com)"
NOMINATIM = "https://nominatim.openstreetmap.org/search"
NDRRMA_RESCUED = "https://ndrrma.gov.np/api/v1/rescues/rescued-locations/"
NDRRMA_STATIONED = "https://ndrrma.gov.np/api/v1/rescues/stationed-locations/"

# Bounding box for sanity checks (also enforced by tests/test_places.py).
LAT_MIN, LAT_MAX, LON_MIN, LON_MAX = 26.3, 29.0, 83.5, 86.5


# ─────────────────────────────────────────────────────────────────────────────
# Seed list
# ─────────────────────────────────────────────────────────────────────────────

@dataclass
class Seed:
    id: str
    name_en: str
    name_ne: str
    name_hi: str
    kind: str
    guess: tuple[float, float]              # (lat, lon) used when OSM has no acceptable hit
    name_zh: str = ""
    aliases: list[str] = field(default_factory=list)
    district: str = ""
    municipality: str = ""
    ward: str = ""
    elev_m: str = ""                        # seeded elevation (blank = unknown; OSM `ele` overrides)
    km: str = ""
    side: str = "NP"
    in_channel: bool = False
    below: bool = False                     # below_barrier_lakes
    notes: str = ""
    queries: list[str] = field(default_factory=list)   # Nominatim queries, tried in order
    radius_km: float = 8.0                  # accept a hit only within this distance of `guess`
    fixed: bool = False                     # True = never geocode (coordinate is authoritative)
    prefer: str = "place"                   # "place": place > boundary > anything · "boundary": boundary relations only


def P(**kw) -> Seed:  # noqa: N802 — short constructor for the table below
    return Seed(**kw)


SEED: list[Seed] = [
    # ── China side (Gyirong County, Tibet AR) ────────────────────────────────
    P(id="gyirong_port", name_en="Gyirong (Kerung) Port", name_ne="केरुङ नाका", name_hi="केरुंग बंदरगाह",
      name_zh="吉隆口岸", kind="border", side="CN", guess=(28.2905, 85.3815), km="-3", in_channel=True,
      aliases=["Gyirong Port", "Kerung", "Kyirong", "Jilong", "Jilong Port", "Gyirong Kouan", "केरुङ", "केरुङ भन्सार",
               "केरुंग", "吉隆口岸", "吉隆"],
      notes="China–Nepal trade and Kailash-pilgrim gateway; immigration complex destroyed 26 Aug (T+7 min); ~80 Nepali container drivers stranded",
      queries=["吉隆口岸", "Gyirong Port, Tibet"], radius_km=6),
    P(id="resuo", name_en="Resuo village", name_ne="रेसुओ गाउँ", name_hi="रेसुओ गांव", name_zh="热索村", kind="settlement",
      side="CN", guess=(28.2960, 85.3835), km="-1", in_channel=True,
      aliases=["Resuo", "Resuo Cun", "Resuo Bridge", "热索村", "热索桥", "रेसुओ"],
      notes="Village at the Friendship (Resuo) Bridge hosting the Gyirong port zone; the port complex proper is ~1 km north (see gyirong_port)",
      queries=["热索村", "Resuo, Gyirong"], radius_km=6),
    P(id="gyirong_town", name_en="Gyirong town (Kyirong)", name_ne="केरुङ बजार", name_hi="केरुंग कस्बा", name_zh="吉隆镇",
      kind="settlement", side="CN", guess=(28.4060, 85.3315), km="-25", in_channel=False,
      aliases=["Gyirong Town", "Gyirong Zhen", "Kyirong town", "Kerung town", "Jilong Zhen", "吉隆镇", "केरुङ बजार"],
      notes="County-seat town ~25 km up-valley on the Gyirong Zangbo, not hit; Chinese-side evacuation and staging hub",
      queries=["吉隆镇", "Gyirong Town, Tibet"], radius_km=8),
    P(id="barrier_lake_site", name_en="Barrier lake site (Chhochen Khola–Purepu Tsangpo confluence)",
      name_ne="थुनिएको ताल (छोचेन खोला–पुरेपु साङ्पो सङ्गम)", name_hi="अवरुद्ध झील (छोचेन खोला–पुरेपु सांगपो संगम)",
      name_zh="堰塞湖（曲琼曲–普热普藏布汇合处）", kind="hazard", side="CN", guess=(28.305, 85.402), km="-8", in_channel=True,
      aliases=["barrier lake", "Chinese-side barrier lake", "Chhochen Khola", "Purepu Tsangpo", "थुनिएको ताल", "堰塞湖"],
      notes="Chinese-side lake >2.5 M m3, barrier ~150 m x 40-50 m high, overflowing since 28 Aug; volunteer-derived blockage point 28.305/85.402; coord estimated",
      fixed=True),
    P(id="barrier_lake_lhende", name_en="Lhende Khola barrier lake (upper)", name_ne="ल्हेन्दे खोला थुनिएको ताल",
      name_hi="ल्हेंदे खोला अवरुद्ध झील", name_zh="伦德曲堰塞湖", kind="hazard", side="CN", guess=(28.36, 85.42), km="-18",
      in_channel=True,
      aliases=["Lhende lake", "Lende Khola lake", "second barrier lake", "Nepal-side Lhende lake", "ल्हेन्दे ताल"],
      notes="~0.11 km2 lake ~18 km above Rasuwagadhi identified by NDRRMA in Planet/Landsat imagery 27 Aug 11:44; coord estimated from the 18 km figure",
      fixed=True),

    # ── Nepal, upper corridor (Rasuwa) ───────────────────────────────────────
    P(id="rasuwagadhi", name_en="Rasuwagadhi", name_ne="रसुवागढी", name_hi="रसुवागढ़ी", kind="border",
      guess=(28.2797, 85.3777), district="Rasuwa", municipality="Gosaikunda RM", ward="2", km="0", in_channel=True,
      below=True,
      aliases=["Rasuwagadi", "Rasuwa Gadhi", "Rasuwagarhi", "Rasuwa border", "Friendship Bridge", "रसुवागढी", "रसुवागढी नाका", "热索瓦"],
      notes="Border crossing at the Friendship Bridge; customs, immigration, APF/Army/Police posts and pilgrim hotels swept; repo reference 28.2797/85.3777",
      queries=["Rasuwagadhi, Nepal"], radius_km=5),
    P(id="rasuwagadhi_immigration", name_en="Rasuwagadhi immigration office", name_ne="रसुवागढी अध्यागमन कार्यालय",
      name_hi="रसुवागढ़ी आप्रवासन कार्यालय", kind="checkpost", guess=(28.2790, 85.3780), district="Rasuwa",
      municipality="Gosaikunda RM", ward="2", km="0", in_channel=True, below=True,
      aliases=["Rasuwagadhi customs", "Rasuwagadhi immigration", "रसुवागढी भन्सार", "अध्यागमन कार्यालय रसुवागढी"],
      notes="Immigration + customs at the bridge; swept 26 Aug; coord estimated", fixed=True),
    P(id="rasuwagadhi_hep", name_en="Rasuwagadhi Hydropower (111 MW)", name_ne="रसुवागढी जलविद्युत आयोजना",
      name_hi="रसुवागढ़ी जलविद्युत परियोजना", kind="tunnel_portal", guess=(28.262, 85.376), district="Rasuwa",
      municipality="Gosaikunda RM", km="1", in_channel=True, below=True,
      aliases=["Rasuwagadhi HEP", "Rasuwagadhi Hydropower Project", "RGHPP", "रसुवागढी जलविद्युत"],
      notes="111 MW; six/seven-storey underground powerhouse near Timure; 49 missing, 4 rescued (29 Aug); coord estimated", fixed=True),
    P(id="timure", name_en="Timure", name_ne="टिमुरे", name_hi="टिमुरे", kind="settlement", guess=(28.250, 85.374),
      district="Rasuwa", municipality="Gosaikunda RM", ward="2", elev_m="1725", km="4", in_channel=True, below=True,
      aliases=["Timmure", "Timure Bazar", "टिमुरे", "टिमुरे बजार", "提木热"],
      notes="Dry port, pilgrim hotels, 300+ vehicles swept; 123 airlifted 27 Aug; helipad gone; elev from repo",
      queries=["Timure, Rasuwa, Nepal", "Timure, Nepal"], radius_km=6),
    P(id="timure_security_posts", name_en="Timure security posts (APF/Army/Police)", name_ne="टिमुरे सुरक्षा चौकी",
      name_hi="टिमुरे सुरक्षा चौकी", kind="checkpost", guess=(28.248, 85.375), district="Rasuwa",
      municipality="Gosaikunda RM", ward="2", km="4", in_channel=True, below=True,
      aliases=["Timure APF post", "Timure police post", "Timure army post", "टिमुरे प्रहरी चौकी", "टिमुरे सशस्त्र प्रहरी"],
      notes="Armed Police Force, Nepal Army and Nepal Police posts at Timure; swept; coord estimated", fixed=True),
    P(id="timure_helipad", name_en="Timure helipad (destroyed)", name_ne="टिमुरे हेलिप्याड", name_hi="टिमुरे हेलीपैड",
      kind="helipad", guess=(28.247, 85.3745), district="Rasuwa", municipality="Gosaikunda RM", ward="2", km="4",
      in_channel=True, below=True, aliases=["टिमुरे हेलिप्याड"],
      notes="Destroyed 26 Aug; helicopters lift from cleared ground/hillsides instead; coord estimated", fixed=True),
    P(id="ghattekhola", name_en="Ghattekhola", name_ne="घट्टेखोला", name_hi="घट्टेखोला", kind="settlement",
      guess=(28.217, 85.365), district="Rasuwa", municipality="Gosaikunda RM", km="8", in_channel=True, below=True,
      aliases=["Ghatte Khola", "Ghattekhola Bazar", "घट्टे खोला"],
      notes="Roadside settlement between Timure and Syabrubesi on the Bhote Koshi",
      queries=["Ghattekhola, Rasuwa, Nepal", "Ghatte Khola, Nepal"], radius_km=6),
    P(id="thuman", name_en="Thuman", name_ne="थुमन", name_hi="थुमन", kind="settlement", guess=(28.233, 85.342),
      district="Rasuwa", municipality="Aamachhodingmo RM", elev_m="2340", km="4", in_channel=False,
      aliases=["Thuman village", "थुमन गाउँ"],
      notes="Tamang Heritage Trail village above the west bank; off-corridor; no rescue reporting found (information gap); elev approx",
      queries=["Thuman, Rasuwa, Nepal"], radius_km=6),
    P(id="briddim", name_en="Briddim", name_ne="ब्रिद्दिम", name_hi="ब्रिद्दिम", kind="settlement", guess=(28.200, 85.370),
      district="Rasuwa", municipality="Gosaikunda RM", ward="3", elev_m="2230", km="10", in_channel=False,
      aliases=["Bridim", "Bridhim", "Briddhim", "Briddim village", "ब्रिद्दिम गाउँ", "बृद्‌धिम", "ब्रिद्धिम"],
      notes="Tamang Heritage Trail homestay village on the ridge above the east bank between Timure and Syabrubesi; off-corridor; elev approx",
      queries=["Bridhim, Rasuwa", "Briddim, Rasuwa, Nepal"], radius_km=4),
    P(id="goljung", name_en="Goljung", name_ne="गोल्जुङ", name_hi="गोलजुंग", kind="settlement", guess=(28.180, 85.305),
      district="Rasuwa", municipality="Aamachhodingmo RM", elev_m="2200", km="16", in_channel=False,
      aliases=["Goljung village", "Goljong", "गोल्जुङ गाउँ"],
      notes="Village on the Chilime side valley west of Syabrubesi; off-corridor; elev approx",
      queries=["Goljung, Rasuwa, Nepal"], radius_km=6),
    P(id="gatlang", name_en="Gatlang", name_ne="गतलाङ", name_hi="गतलांग", kind="settlement", guess=(28.160, 85.270),
      district="Rasuwa", municipality="Aamachhodingmo RM", elev_m="2240", km="16", in_channel=False,
      aliases=["Gatlang village", "Gatlang Tamang village", "गतलाङ गाउँ", "गात्लाङ"],
      notes="Tamang Heritage Trail village on the Parvati Kunda ridge; off-corridor; elev approx",
      queries=["Gatlang, Rasuwa, Nepal"], radius_km=6),
    P(id="tatopani", name_en="Tatopani (Rasuwa)", name_ne="तातोपानी", name_hi="तातोपानी", kind="settlement",
      guess=(28.215, 85.305), district="Rasuwa", municipality="Aamachhodingmo RM", elev_m="2607", km="16",
      in_channel=False, aliases=["Tatopani hot springs", "Tatopani Rasuwa", "तातोपानी रसुवा"],
      notes="Hot-spring lodge village on the Tamang Heritage Trail north of Chilime; off-corridor; NOT Tatopani/Kodari in Sindhupalchok; elev approx",
      queries=["Tatopani, Rasuwa, Nepal"], radius_km=6),
    P(id="nagthali", name_en="Nagthali", name_ne="नागथली", name_hi="नागथली", kind="lodge_cluster", guess=(28.225, 85.325),
      district="Rasuwa", municipality="Aamachhodingmo RM", elev_m="3165", km="4", in_channel=False,
      aliases=["Nagthali viewpoint", "Nagthali Ghyang", "नागथली"],
      notes="Viewpoint lodges between Tatopani and Thuman; off-corridor; elev approx",
      queries=["Nagthali, Rasuwa, Nepal"], radius_km=6),
    P(id="syabrubesi", name_en="Syabrubesi", name_ne="स्याफ्रुबेसी", name_hi="स्याब्रूबेसी", kind="settlement",
      guess=(28.162, 85.334), district="Rasuwa", municipality="Gosaikunda RM", ward="3", elev_m="1460", km="16",
      in_channel=True, below=True,
      aliases=["Syafrubesi", "Syaphrubesi", "Shyaprubesi", "Syabru Besi", "Syabru Bensi", "Syabrubensi", "Syapru Besi",
               "स्याब्रुबेसी", "स्याफ्रुबेसी", "स्याफ्रु बेसी", "स्याफ्रुवेशी", "स्याफ्रुबेशी", "स्याफ्रुबेँसी", "स्याब्रुबेँसी", "夏布鲁贝西"],
      notes="Langtang trailhead bazaar; swept, 240+ buildings destroyed (EMSR927); ward chair missing; helipad destroyed; ward 3 per OSM (some reporting says ward 5); elev from repo",
      queries=["Syabru Besi, Nepal", "Syabrubesi, Nepal"], radius_km=5),
    P(id="syabrubesi_np_checkpost", name_en="Syabrubesi national park checkpost", name_ne="स्याफ्रुबेसी निकुञ्ज चेकपोस्ट",
      name_hi="स्याब्रूबेसी राष्ट्रीय उद्यान चेकपोस्ट", kind="checkpost", guess=(28.163, 85.336), district="Rasuwa",
      municipality="Gosaikunda RM", ward="3", km="16", in_channel=True, below=True,
      aliases=["Langtang National Park checkpost Syabrubesi", "Syabrubesi TIMS check", "लाङटाङ निकुञ्ज चेकपोस्ट"],
      notes="Langtang NP / TIMS entry check at the trailhead; TIMS register is the trekker registry; coord estimated", fixed=True),
    P(id="syabrubesi_helipad", name_en="Syabrubesi helipad (destroyed)", name_ne="स्याफ्रुबेसी हेलिप्याड",
      name_hi="स्याब्रूबेसी हेलीपैड", kind="helipad", guess=(28.160, 85.335), district="Rasuwa",
      municipality="Gosaikunda RM", ward="3", km="16", in_channel=True, below=True, aliases=["स्याफ्रुबेसी हेलिप्याड"],
      notes="Destroyed 26 Aug; a private helicopter turned back unable to land; coord estimated", fixed=True),
    P(id="thulo_syabru", name_en="Thulo Syabru", name_ne="ठूलो स्याफ्रु", name_hi="ठूलो स्याब्रू", kind="settlement",
      guess=(28.132, 85.360), district="Rasuwa", municipality="Gosaikunda RM", elev_m="2210", km="16",
      in_channel=False, aliases=["Thulo Syaphru", "Syabru village", "Thulo Shyabru", "ठूलो स्याब्रु"],
      notes="Hillside village on the Gosaikunda trail above the Langtang–Trishuli junction; off-corridor; elev approx",
      queries=["Thulo Syabru, Nepal", "Thulo Syaphru, Nepal"], radius_km=6),
    P(id="bamboo", name_en="Bamboo (Langtang trail)", name_ne="बाम्बु", name_hi="बांबू", kind="lodge_cluster",
      guess=(28.160, 85.395), district="Rasuwa", municipality="Gosaikunda RM", elev_m="1970", km="20",
      in_channel=False, aliases=["Bamboo Lodge", "Bamboo Langtang", "बाम्बु लज"],
      notes="Lodge cluster on the Langtang Khola; trail Bamboo→Kyanjin reported intact; off-corridor; elev approx",
      queries=["Bamboo, Langtang, Nepal"], radius_km=6),
    P(id="lama_hotel", name_en="Lama Hotel", name_ne="लामा होटल", name_hi="लामा होटल", kind="lodge_cluster",
      guess=(28.175, 85.430), district="Rasuwa", municipality="Gosaikunda RM", elev_m="2470", km="20",
      in_channel=False, aliases=["Lama Hotel Langtang", "लामा होटेल"],
      notes="Lodge cluster on the Langtang trail; off-corridor; elev approx",
      queries=["Lama Hotel, Langtang, Nepal"], radius_km=6),
    P(id="langtang_village", name_en="Langtang village", name_ne="लाङटाङ गाउँ", name_hi="लांगटांग गांव", kind="settlement",
      guess=(28.213, 85.510), district="Rasuwa", municipality="Gosaikunda RM", ward="4", elev_m="3430", km="20",
      in_channel=False, aliases=["Langtang", "Langtang Gaun", "Lantang", "लाङटाङ", "लाङ्टाङ", "लांगटांग", "朗塘村"],
      notes="Side valley, not flooded; NTC tower restored; off-corridor (Langtang Khola joins at Syabrubesi, km 16; 3D uses km 20); repo reference 28.21/85.51",
      queries=["Langtang, Rasuwa, Nepal", "Langtang village, Nepal"], radius_km=6),
    P(id="kyanjin_gompa", name_en="Kyanjin Gompa", name_ne="क्याञ्जिन गुम्बा", name_hi="क्यांजिन गोम्पा", kind="settlement",
      guess=(28.212, 85.565), district="Rasuwa", municipality="Gosaikunda RM", ward="4", elev_m="3900", km="20",
      in_channel=False, aliases=["Kyanjin", "Kyangjin Gompa", "Kyanjin Gumba", "क्याञ्जिन", "क्यान्जिन गुम्बा"],
      notes="Head of the Langtang valley; not flooded; NTC tower restored; trekkers walk out or airlift; off-corridor; elev from repo",
      queries=["Kyanjin Gompa, Nepal"], radius_km=6),
    P(id="gosaikunda", name_en="Gosaikunda", name_ne="गोसाइँकुण्ड", name_hi="गोसाईकुंड", kind="lodge_cluster",
      guess=(28.083, 85.415), district="Rasuwa", municipality="Gosaikunda RM", elev_m="4380", km="", in_channel=False,
      aliases=["Gosainkunda", "Gosaikund", "Gosain Kund", "Gosaikunda lake", "गोसाइकुण्ड", "गोसाईकुण्ड", "गोसाइँकुण्ड"],
      notes="Pilgrimage lake (Janai Purnima 28 Aug); never in the flood path; ~62 Nepali pilgrims listed missing en route; off-corridor; elev approx",
      queries=["Gosaikunda, Nepal", "Gosainkunda Lake, Nepal"], radius_km=8),
    P(id="dhunche", name_en="Dhunche", name_ne="धुन्चे", name_hi="धुंचे", kind="settlement", guess=(28.110, 85.300),
      district="Rasuwa", municipality="Gosaikunda RM", ward="6", elev_m="2000", km="22", in_channel=False,
      aliases=["Dhunche Bazar", "Rasuwa HQ", "धुन्चे", "धुञ्चे", "धुन्चे बजार"],
      notes="District HQ above the flood; Army forward base and helicopter staging; intact; elev from repo",
      queries=["Dhunche, Nepal"], radius_km=5),
    P(id="dhunche_np_gate", name_en="Dhunche national park gate", name_ne="धुन्चे निकुञ्ज गेट", name_hi="धुंचे राष्ट्रीय उद्यान गेट",
      kind="checkpost", guess=(28.108, 85.298), district="Rasuwa", municipality="Gosaikunda RM", ward="6", km="22",
      in_channel=False, aliases=["Langtang National Park HQ", "Langtang NP entry Dhunche", "लाङटाङ राष्ट्रिय निकुञ्ज कार्यालय"],
      notes="Langtang NP headquarters / entry gate at Dhunche; coord estimated", fixed=True),
    P(id="dhunche_helipad", name_en="Dhunche helipad (usable)", name_ne="धुन्चे हेलिप्याड", name_hi="धुंचे हेलीपैड",
      kind="helipad", guess=(28.1113, 85.2950), district="Rasuwa", municipality="Gosaikunda RM", ward="6", km="22",
      in_channel=False, aliases=["धुन्चे हेलिप्याड", "Heli Road Dhunche"],
      notes="Primary helicopter staging point for the upper corridor; usable; coord estimated from OSM 'Heli Road' (way/265006462)", fixed=True),
    P(id="hakubesi", name_en="Hakubesi", name_ne="हाकुबेसी", name_hi="हाकुबेसी", kind="settlement", guess=(28.1165, 85.279),
      district="Rasuwa", km="21", in_channel=True, below=True,
      aliases=["Haku Besi", "Hakubensi", "हाकु बेसी", "हाफुबेसी"],
      notes="Valley-floor settlement below Haku on the Trishuli opposite Dhunche (UT-1 headworks reach); NDRRMA rescued-locations spelling 'हाफुबेसी' is read as हाकुबेसी (judgment call)",
      queries=["Haku Besi, Nepal", "Hakubesi, Rasuwa, Nepal"], radius_km=4),
    P(id="haku", name_en="Haku", name_ne="हाकु", name_hi="हाकु", kind="settlement", guess=(28.1255, 85.2737),
      district="Rasuwa", km="21", in_channel=False,
      aliases=["Haku village", "Haku Gaun", "हाकु गाउँ", "हाकू"],
      notes="Village on the west-bank hillside opposite Dhunche, above the UT-1 headworks; off-corridor (hillside)",
      queries=["Haku, Rasuwa, Nepal"], radius_km=4),
    P(id="mailung", name_en="Mailung", name_ne="मैलुङ", name_hi="मैलुंग", kind="settlement", guess=(28.070, 85.207),
      district="Rasuwa", municipality="Uttargaya RM", ward="1", km="26", in_channel=True, below=True,
      aliases=["Mailung Bazar", "Mailung Dobhan", "Mailung Khola", "मैलुङ", "मैलुङ्ग", "मैलुङ खोला", "मैलुंग"],
      notes="Hydropower cluster (UT-1 powerhouse, UT-3A, Mailung Khola HEP) at the Mailung Khola–Trishuli confluence; portals buried; main live front",
      queries=["Mailung, Rasuwa, Nepal", "Mailung Khola, Nepal"], radius_km=5),
    P(id="ut1_mailung_camp", name_en="Upper Trishuli-1 camp (Mailung/Haku)", name_ne="माथिल्लो त्रिशूली-१ क्याम्प",
      name_hi="ऊपरी त्रिशूली-1 कैंप", kind="camp", guess=(28.0725, 85.2093), district="Rasuwa",
      km="26", in_channel=True, below=True,
      aliases=["UT-1", "UT1", "Upper Trishuli 1", "Upper Trishuli-1 Hydropower", "Upper Trishuli-1 Hydroelectric Project", "NWEDC", "माथिल्लो त्रिशूली १", "अपर त्रिशूली-१"],
      notes="216 MW (NWEDC); powerhouse/camp at Mailung, headworks up-valley at Hakubesi; 73 Indian + 9 Korean nationals missing, 254 rescued (29 Aug); tunnel entry/exit points buried in mud",
      queries=["Upper Trishuli-1, Rasuwa"], radius_km=3),
    P(id="mailung_khola_hep", name_en="Mailung Khola Hydropower (5 MW)", name_ne="मैलुङ खोला जलविद्युत",
      name_hi="मैलुंग खोला जलविद्युत", kind="tunnel_portal", guess=(28.075, 85.205), district="Rasuwa",
      municipality="Uttargaya RM", km="26", in_channel=True, below=True,
      aliases=["Mailung Khola HEP", "Mailung Khola Hydropower Project", "मैलुङ खोला जलविद्युत आयोजना"],
      notes="5 MW on the Mailung Khola just above its confluence with the Trishuli; coord estimated", fixed=True),
    P(id="ut3a", name_en="Upper Trishuli-3A (60 MW)", name_ne="माथिल्लो त्रिशूली-३ए", name_hi="ऊपरी त्रिशूली-3A",
      kind="tunnel_portal", guess=(28.060, 85.210), district="Rasuwa", municipality="Uttargaya RM", km="28",
      in_channel=True, below=True,
      aliases=["UT-3A", "UT3A", "Upper Trishuli 3A", "Upper Trishuli 3 'A'", "माथिल्लो त्रिशूली ३ए", "अपर त्रिशूली-३ ए"],
      notes="60 MW NEA project; cable-tunnel portal buried; 35-45 missing; first controlled blast 29 Aug; coord estimated", fixed=True),
    P(id="ramche", name_en="Ramche", name_ne="रामचे", name_hi="रामचे", kind="settlement", guess=(28.033, 85.219),
      district="Rasuwa", municipality="Kalika RM", ward="1", km="30", in_channel=False,
      aliases=["Ramche Rasuwa", "राम्चे", "रामचे रसुवा"],
      notes="Hillside village (former Ramche VDC) above the Mailung–Simle reach of the Trishuli; telecom repeater restored by airlifted generator; above the channel",
      queries=["Ramche, Rasuwa, Nepal"], radius_km=4),
    P(id="simle", name_en="Simle", name_ne="सिम्ले", name_hi="सिमले", kind="settlement", guess=(28.029, 85.191),
      district="Rasuwa", municipality="Uttargaya RM", km="32", in_channel=True, below=True,
      aliases=["Simle Rasuwa", "सिम्ले रसुवा"],
      notes="Valley-floor settlement in Uttargaya between Mailung and Betrawati",
      queries=["Simle, Rasuwa, Nepal"], radius_km=5),
    P(id="ut3", name_en="Upper Trishuli-3 (37 MW)", name_ne="माथिल्लो त्रिशूली-३", name_hi="ऊपरी त्रिशूली-3",
      kind="tunnel_portal", guess=(28.000, 85.210), district="Rasuwa", municipality="Uttargaya RM", km="33",
      in_channel=True, below=True, aliases=["UT-3", "UT3", "Upper Trishuli 3", "माथिल्लो त्रिशूली ३"],
      notes="37 MW per the research table (213 missing → ~128; 85 rescued); site buried; may be the same scheme outlets call Trishuli 3B — unresolved; coord estimated", fixed=True),
    P(id="sole", name_en="Sole", name_ne="सोले", name_hi="सोले", kind="settlement", guess=(28.000, 85.195),
      district="Rasuwa", municipality="Uttargaya RM", km="34", in_channel=False,
      aliases=["Sole Rasuwa", "Sole Gaun", "सोले गाउँ"],
      notes="Uttargaya hillside village; sheltering site",
      queries=["Sole, Rasuwa, Nepal"], radius_km=8),
    P(id="khalti_basti", name_en="Khalti Basti", name_ne="खल्टी बस्ती", name_hi="खल्टी बस्ती", kind="settlement",
      guess=(27.992, 85.200), district="Rasuwa", municipality="Uttargaya RM", ward="7", km="35", in_channel=False,
      aliases=["Khalti", "Khaltibasti", "खल्टी", "खाल्टे बस्ती"],
      notes="Uttargaya ward-7 hamlet across the river; 40-50 people unable to cross (29 Aug)",
      queries=["Khalti, Rasuwa, Nepal"], radius_km=8),
    P(id="pairebesi", name_en="Pairebesi", name_ne="पैरेबेसी", name_hi="पैरेबेसी", kind="settlement", guess=(27.988, 85.192),
      district="Rasuwa", municipality="Uttargaya RM", km="36", in_channel=True, below=True,
      aliases=["Paire Besi", "Pairebensi", "पैरे बेसी"],
      notes="Valley-floor settlement north of Betrawati",
      queries=["Pairebesi, Rasuwa, Nepal", "Paire Besi, Nepal"], radius_km=8),
    P(id="ut3b", name_en="Upper Trishuli-3B", name_ne="माथिल्लो त्रिशूली-३बी", name_hi="ऊपरी त्रिशूली-3B",
      kind="tunnel_portal", guess=(27.980, 85.190), district="Rasuwa", municipality="Uttargaya RM", km="37",
      in_channel=True, below=True,
      aliases=["UT-3B", "UT3B", "Upper Trishuli 3B", "Trishuli 3B", "माथिल्लो त्रिशूली ३बी", "त्रिशूली ३बी"],
      notes="20-25 missing; Chinese/PLA tunnel specialists assigned 29 Aug; Trishuli 3B substation also damaged; coord estimated", fixed=True),
    P(id="salletar", name_en="Salletar", name_ne="सल्लेटार", name_hi="सल्लेटार", kind="settlement", guess=(27.985, 85.188),
      district="Rasuwa", municipality="Uttargaya RM", km="37", in_channel=False,
      aliases=["Salle Tar", "Sallitar", "सलिटार", "सल्ले टार"],
      notes="Terrace village near Betrawati used as a shelter site; NDRRMA rescued-locations spelling 'सलिटार'",
      queries=["Salletar, Rasuwa, Nepal", "Sallitar, Nepal"], radius_km=8),
    P(id="shantibazar", name_en="Shanti Bazar", name_ne="शान्ति बजार", name_hi="शांति बाज़ार", kind="settlement",
      guess=(27.975, 85.186), district="Rasuwa", municipality="Uttargaya RM", km="39", in_channel=True, below=True,
      aliases=["Shantibazar", "Shanti Bazaar", "Santibazar", "शान्तिबजार", "शान्ति बजार"],
      notes="Bazaar just upstream of Betrawati in Uttargaya",
      queries=["Shanti Bazar, Rasuwa, Nepal", "Shantibazar, Nepal"], radius_km=8),
    P(id="betrawati", name_en="Betrawati", name_ne="बेत्रावती", name_hi="बेत्रावती", kind="settlement", guess=(27.966, 85.183),
      district="Rasuwa", municipality="Uttargaya RM", km="40", in_channel=True, below=True,
      aliases=["Betrabati", "Betravati", "Bettrawati", "बेत्रावती", "वेत्रवती", "बेत्रवती", "बेत्रावती बजार"],
      notes="Bazaar straddling the Rasuwa (Uttargaya RM) / Nuwakot (Bidur-10) boundary — OSM node is on the Nuwakot side, NDRRMA files it under Rasuwa; bridge gone, district isolated; ~3,500 sheltering incl. people on oxygen; repo reference 27.966/85.183",
      queries=["Betrawati, Nepal"], radius_km=5),
    P(id="betrawati_school_shelter", name_en="Betrawati school shelter", name_ne="बेत्रावती विद्यालय आश्रयस्थल",
      name_hi="बेत्रावती स्कूल आश्रय", kind="shelter", guess=(27.968, 85.185), district="Rasuwa", municipality="Uttargaya RM",
      km="40", in_channel=False, aliases=["Betrawati school", "बेत्रावती स्कुल", "बेत्रावती विद्यालय"],
      notes="~450 people sheltering at a Betrawati school (29 Aug); coord estimated", fixed=True),

    # ── Nepal, Nuwakot / Dhading ─────────────────────────────────────────────
    P(id="trishuli_bazar", name_en="Trishuli Bazar", name_ne="त्रिशूली बजार", name_hi="त्रिशूली बाज़ार", kind="settlement",
      guess=(27.930, 85.160), district="Nuwakot", municipality="Bidur Municipality", km="44", in_channel=True, below=True,
      aliases=["Trishuli", "Trisuli", "Trisuli Bazar", "Trishuli Bazaar", "त्रिशुली", "त्रिशूली", "त्रिशुली बजार"],
      notes="Bridge at Trishuli Bazar gone; Army coordination centre nearby; NDRRMA rescued-locations 'त्रिशुली'",
      queries=["Trishuli Bazar, Nuwakot, Nepal", "Trisuli, Nepal"], radius_km=6),
    P(id="battar", name_en="Battar", name_ne="बट्टार", name_hi="बट्टार", kind="settlement", guess=(27.900, 85.147),
      district="Nuwakot", municipality="Bidur Municipality", ward="4", km="45", in_channel=True, below=True,
      aliases=["Battar Bazar", "Batar", "Batar Bazar", "बट्टार बजार", "बटार बजार"],
      notes="Bazaar between Trishuli and Bidur; community shelter here (NDRRMA stationed-locations, whose centroid sits ~3 km north)",
      queries=["Battar, Nuwakot, Nepal"], radius_km=4),
    P(id="bidur", name_en="Bidur", name_ne="विदुर", name_hi="विदुर", kind="settlement", guess=(27.900, 85.147),
      district="Nuwakot", municipality="Bidur Municipality", km="46", in_channel=True, below=True,
      aliases=["Bidur Municipality", "Nuwakot HQ", "Bidur / Trishuli", "विदुर नगरपालिका", "बिदुर"],
      notes="Nuwakot district HQ; Army relief camp here (NDRRMA stationed-locations)",
      queries=["Bidur, Nuwakot, Nepal"], radius_km=4),
    P(id="colony", name_en="Colony (Trishuli hydropower colony)", name_ne="कोलनी", name_hi="कॉलोनी", kind="camp",
      guess=(27.935, 85.162), district="Nuwakot", municipality="Bidur Municipality", km="44", in_channel=True, below=True,
      aliases=["Kolani", "Trishuli Colony", "NEA colony Trishuli", "कोलोनी", "कोलनी"],
      notes="NDRRMA rescued-locations lists 'कोलनी' without a centroid; read as the NEA Trishuli hydropower staff colony at Trishuli Bazar (judgment call — could be another project colony); coord estimated",
      fixed=True),
    P(id="devighat", name_en="Devighat", name_ne="देवीघाट", name_hi="देवीघाट", kind="settlement", guess=(27.905, 85.135),
      district="Nuwakot", municipality="Bidur Municipality", km="50", in_channel=True, below=True,
      aliases=["Devi Ghat", "Devighat Hydropower", "देवीघाट", "देवीघाट जलविद्युत"],
      notes="Tadi–Trishuli confluence; Devighat power station damaged; repo reference 27.905/85.135 is ~5 km north of the OSM node",
      queries=["Devighat, Nuwakot, Nepal"], radius_km=6),
    P(id="galchhi", name_en="Galchhi", name_ne="गल्छी", name_hi="गल्छी", kind="settlement", guess=(27.840, 84.985),
      district="Dhading", municipality="Galchhi RM", km="60", in_channel=True, below=True,
      aliases=["Galchi", "Galchhi Bazar", "गल्छी बजार", "गल्छि"],
      notes="Prithvi Highway junction; Trishuli rose 9 m in 30 min here; surviving live DHM gauge",
      queries=["Galchhi, Dhading, Nepal", "Galchi, Nepal"], radius_km=6),
    P(id="gajuri", name_en="Gajuri", name_ne="गजुरी", name_hi="गजुरी", kind="settlement", guess=(27.826, 84.903),
      district="Dhading", municipality="Gajuri RM", km="64", in_channel=True, below=True,
      aliases=["Gajuri Bazar", "गजुरी बजार"],
      notes="Prithvi Highway bazaar on the Trishuli between Galchhi and Malekhu",
      queries=["Gajuri, Dhading, Nepal"], radius_km=6),
    P(id="malekhu", name_en="Malekhu", name_ne="मलेखु", name_hi="मलेखु", kind="settlement", guess=(27.812, 84.826),
      district="Dhading", municipality="Benighat Rorang RM", km="68", in_channel=True, below=True,
      aliases=["Malekhu Bazar", "मलेखु बजार"],
      notes="Highway bazaar; DHM gauge washed away; three concrete bridges Galchhi–Malekhu gone",
      queries=["Malekhu, Dhading, Nepal"], radius_km=6),
    P(id="benighat", name_en="Benighat", name_ne="बेनीघाट", name_hi="बेनीघाट", kind="settlement", guess=(27.795, 84.786),
      district="Dhading", municipality="Benighat Rorang RM", km="74", in_channel=True, below=True,
      aliases=["Beni Ghat", "बेनी घाट"],
      notes="Budhi Gandaki–Trishuli confluence on the Prithvi Highway",
      queries=["Benighat, Dhading, Nepal"], radius_km=6),
    P(id="mugling", name_en="Mugling", name_ne="मुग्लिन", name_hi="मुगलिंग", kind="settlement", guess=(27.855, 84.565),
      district="Chitwan", municipality="Ichchhakamana RM", km="85", in_channel=True, below=True,
      aliases=["Muglin", "Mugling Bazar", "मुग्लिङ", "मुग्लिन बजार"],
      notes="Marsyangdi–Trishuli confluence; highway junction for Pokhara/Narayanghat",
      queries=["Mugling, Nepal"], radius_km=6),

    # ── Downstream (Narayani) ────────────────────────────────────────────────
    P(id="devghat", name_en="Devghat", name_ne="देवघाट", name_hi="देवघाट", kind="settlement", guess=(27.720, 84.420),
      district="Tanahun", municipality="Devghat RM", km="100", in_channel=True, below=True,
      aliases=["Devghat Dham", "Deoghat", "देवघाट धाम"],
      notes="Kali Gandaki–Trishuli confluence; surviving live DHM gauge; bodies recovered here",
      queries=["Devghat, Nepal"], radius_km=6),
    P(id="bharatpur", name_en="Bharatpur", name_ne="भरतपुर", name_hi="भरतपुर", kind="settlement", guess=(27.683, 84.433),
      district="Chitwan", municipality="Bharatpur Metropolitan", km="110", in_channel=True, below=True,
      aliases=["Narayanghat", "Narayangarh", "Bharatpur Chitwan", "भरतपुर चितवन", "नारायणघाट", "नारायणगढ"],
      notes="Chitwan HQ on the Narayani; body identification centre",
      queries=["Bharatpur, Chitwan, Nepal"], radius_km=8),
    P(id="bharatpur_body_centre", name_en="Bharatpur Hospital (body identification centre)", name_ne="भरतपुर अस्पताल",
      name_hi="भरतपुर अस्पताल", kind="hospital", guess=(27.6825, 84.4335), district="Chitwan",
      municipality="Bharatpur Metropolitan", km="110", in_channel=False,
      aliases=["Bharatpur Hospital", "Bharatpur body centre", "भरतपुर अस्पताल शव"],
      notes="Bodies recovered downstream (Chitwan/Nawalparasi) collected and identified here",
      queries=["Bharatpur Hospital, Chitwan, Nepal"], radius_km=8),

    # ── Hydropower in the Syabrubesi cluster ────────────────────────────────
    P(id="chilime_hep", name_en="Chilime Hydropower (22 MW)", name_ne="चिलिमे जलविद्युत", name_hi="चिलिमे जलविद्युत",
      kind="tunnel_portal", guess=(28.165, 85.328), district="Rasuwa", municipality="Gosaikunda RM", km="15",
      in_channel=True, below=True,
      aliases=["Chilime HEP", "Chilime Hydropower Company", "Chilime powerhouse", "चिलिमे जलविद्युत कम्पनी", "चिलिमे हाइड्रोपावर"],
      notes="22 MW; powerhouse at the Chilime Khola–Bhote Koshi confluence by Syabrubesi (OSM maps the headworks at 28.1812/85.3056, Aamachhodingmo-05); 8 missing (6 in tunnel); coord estimated", fixed=True),
    P(id="chilime", name_en="Chilime", name_ne="चिलिमे", name_hi="चिलिमे", kind="settlement", guess=(28.197, 85.298),
      district="Rasuwa", municipality="Aamachhodingmo RM", km="16", in_channel=False,
      aliases=["Chilime village", "Chilime Gaun", "चिलिमे गाउँ"],
      notes="Village on the Chilime Khola (dam site of Chilime HEP); NDRRMA rescued-locations 'चिलिमे' may mean the powerhouse — see chilime_hep; off-corridor",
      queries=["Chilime, Rasuwa, Nepal"], radius_km=6),
    P(id="sanjen_hep", name_en="Sanjen Hydropower", name_ne="सान्जेन जलविद्युत", name_hi="सांजेन जलविद्युत",
      kind="tunnel_portal", guess=(28.185, 85.306), district="Rasuwa", municipality="Aamachhodingmo RM", km="",
      in_channel=False,
      aliases=["Sanjen HEP", "Sanjen Jalavidhyut", "Sanjen Upper", "सान्जेन जलविद्युत कम्पनी"],
      notes="Sanjen (42.5 MW) + Sanjen Upper (14.8 MW) on the Sanjen Khola above Chilime; not reported hit; off-corridor; coord estimated at the APF 'Sanjen Hydropower Security Base' (OSM node/4158781389)", fixed=True),
    P(id="langtang_khola_hep", name_en="Langtang Khola Hydropower (20 MW)", name_ne="लाङटाङ खोला जलविद्युत",
      name_hi="लांगटांग खोला जलविद्युत", kind="tunnel_portal", guess=(28.160, 85.342), district="Rasuwa",
      municipality="Gosaikunda RM", km="17", in_channel=True, below=True,
      aliases=["Langtang Khola HEP", "Langtang Khola Hydropower Project", "लाङटाङ खोला जलविद्युत आयोजना"],
      notes="20 MW; 42 missing, 18 rescued; helicopter-only after bridge washout; coord estimated", fixed=True),

    # ── Hospitals, shelters, barracks ───────────────────────────────────────
    P(id="rasuwa_district_hospital", name_en="Rasuwa District Hospital", name_ne="जिल्ला अस्पताल रसुवा",
      name_hi="रसुवा ज़िला अस्पताल", kind="hospital", guess=(28.1127, 85.299), district="Rasuwa",
      municipality="Gosaikunda RM", ward="6", km="22", in_channel=False,
      aliases=["District Hospital Rasuwa", "Dhunche hospital", "रसुवा जिल्ला अस्पताल", "धुन्चे अस्पताल"],
      notes="Dhunche; receives helicopter casualties", fixed=True),
    P(id="trishuli_hospital", name_en="Trishuli Hospital", name_ne="त्रिशूली अस्पताल", name_hi="त्रिशूली अस्पताल",
      kind="hospital", guess=(27.929, 85.165), district="Nuwakot", municipality="Bidur Municipality", km="44",
      in_channel=False, aliases=["Trishuli District Hospital", "Trisuli Hospital", "त्रिशूली जिल्ला अस्पताल", "त्रिशुली अस्पताल"],
      notes="Nuwakot district hospital at Trishuli Bazar", fixed=True),
    P(id="maithali_barracks", name_en="Maithali barracks (No.1 Military Training Centre)", name_ne="मैथली ब्यारेक (नं. १ सैनिक तालिम केन्द्र)",
      name_hi="मैथली बैरक (नं. 1 सैन्य प्रशिक्षण केंद्र)", kind="camp", guess=(27.922, 85.158), district="Nuwakot",
      municipality="Bidur Municipality", km="45", in_channel=False,
      aliases=["No.1 Military Training Centre", "Nepal Army barracks Trishuli", "Trishuli barracks", "नं. १ सैनिक तालिम केन्द्र", "त्रिशूली ब्यारेक"],
      notes="Nepal Army coordination nerve centre for the response (Trishuli, Nuwakot); coord estimated", fixed=True),
    P(id="tuth_kathmandu", name_en="TU Teaching Hospital, Kathmandu", name_ne="त्रिवि शिक्षण अस्पताल",
      name_hi="त्रिभुवन विश्वविद्यालय शिक्षण अस्पताल", kind="hospital", guess=(27.7352, 85.3310), district="Kathmandu",
      municipality="Kathmandu Metropolitan", km="", in_channel=False,
      aliases=["TUTH", "Tribhuvan University Teaching Hospital", "Teaching Hospital Maharajgunj", "शिक्षण अस्पताल महाराजगञ्ज"],
      notes="Maharajgunj; receiving hospital for airlifted casualties; off-corridor", fixed=True),
    P(id="trauma_center_kathmandu", name_en="National Trauma Center, Kathmandu", name_ne="राष्ट्रिय ट्रमा सेन्टर",
      name_hi="राष्ट्रीय ट्रॉमा सेंटर", kind="hospital", guess=(27.7057, 85.3138), district="Kathmandu",
      municipality="Kathmandu Metropolitan", km="", in_channel=False,
      aliases=["Trauma Center", "Bir Hospital Trauma Center", "National Trauma Centre", "ट्रमा सेन्टर", "बीर अस्पताल ट्रमा सेन्टर"],
      notes="Bir Hospital campus; receiving hospital for injured; off-corridor",
      queries=["National Trauma Center, Kathmandu"], radius_km=3),
    P(id="pokhara_pahs", name_en="Pokhara Academy of Health Sciences", name_ne="पोखरा स्वास्थ्य विज्ञान प्रतिष्ठान",
      name_hi="पोखरा स्वास्थ्य विज्ञान अकादमी", kind="hospital", guess=(28.2125, 83.986), district="Kaski",
      municipality="Pokhara Metropolitan", km="", in_channel=False,
      aliases=["PAHS", "Western Regional Hospital", "Pokhara hospital", "पश्चिमाञ्चल क्षेत्रीय अस्पताल", "पोखरा अस्पताल"],
      notes="Receiving hospital for casualties routed west; off-corridor",
      queries=["Pokhara Academy of Health Sciences, Pokhara", "Western Regional Hospital, Pokhara"], radius_km=5),
    P(id="kathmandu", name_en="Kathmandu", name_ne="काठमाडौँ", name_hi="काठमांडू", name_zh="加德满都", kind="settlement",
      guess=(27.7172, 85.3240), district="Kathmandu", municipality="Kathmandu Metropolitan", km="", in_channel=False,
      aliases=["Kathmandu", "KTM", "Kathmandu Valley", "काठमाडौं", "काठमाण्डौ", "काठमांडू", "加德满都"],
      notes="Destination for airlifts and for families arriving from abroad; off-corridor",
      queries=["Kathmandu, Nepal"], radius_km=8),

    # ── Districts (kind district; coordinates are centroids) ─────────────────
    P(id="rasuwa", name_en="Rasuwa", name_ne="रसुवा", name_hi="रसुवा", kind="district", guess=(28.15, 85.30),
      district="Rasuwa", km="", in_channel=False,
      aliases=["Rasuwa District", "रसुवा जिल्ला", "रसुवा"],
      notes="District: Uttargaya, Kalika, Gosaikunda, Naukunda, Aamachhodingmo (Parbatikunda) RMs; boundary centroid",
      queries=["रसुवा जिल्ला", "Rasuwa, Nepal"], radius_km=40, prefer="boundary"),
    P(id="nuwakot", name_en="Nuwakot", name_ne="नुवाकोट", name_hi="नुवाकोट", kind="district", guess=(27.92, 85.15),
      district="Nuwakot", km="", in_channel=False,
      aliases=["Nuwakot District", "नुवाकोट जिल्ला", "नुवाकोट"],
      notes="District (HQ Bidur); boundary centroid",
      queries=["नुवाकोट जिल्ला", "Nuwakot, Nepal"], radius_km=40, prefer="boundary"),
    P(id="dhading", name_en="Dhading", name_ne="धादिङ", name_hi="धादिंग", kind="district", guess=(27.90, 84.90),
      district="Dhading", km="", in_channel=False,
      aliases=["Dhading District", "धादिङ जिल्ला", "धादिङ्ग"],
      notes="District (Galchhi, Gajuri, Malekhu, Benighat); boundary centroid",
      queries=["धादिङ जिल्ला", "Dhading, Nepal"], radius_km=40, prefer="boundary"),
    P(id="gorkha", name_en="Gorkha", name_ne="गोरखा", name_hi="गोरखा", kind="district", guess=(28.25, 84.65),
      district="Gorkha", km="", in_channel=False,
      aliases=["Gorkha District", "गोरखा जिल्ला"],
      notes="District; pilgrim bus from Gorkha to Gosaikunda lost at Dobhan; boundary centroid",
      queries=["गोरखा जिल्ला", "Gorkha, Nepal"], radius_km=50, prefer="boundary"),
    P(id="tanahun", name_en="Tanahun", name_ne="तनहुँ", name_hi="तनहुं", kind="district", guess=(27.95, 84.25),
      district="Tanahun", km="", in_channel=False,
      aliases=["Tanahun District", "Tanahu", "तनहुँ जिल्ला", "तनहु"],
      notes="District (Devghat); boundary centroid",
      queries=["तनहुँ जिल्ला", "Tanahun, Nepal"], radius_km=40, prefer="boundary"),
    P(id="chitwan", name_en="Chitwan", name_ne="चितवन", name_hi="चितवन", kind="district", guess=(27.55, 84.45),
      district="Chitwan", km="", in_channel=False,
      aliases=["Chitwan District", "चितवन जिल्ला"],
      notes="District (Bharatpur, Mugling); bodies recovered from the Narayani; boundary centroid",
      queries=["चितवन जिल्ला", "Chitwan, Nepal"], radius_km=40, prefer="boundary"),
    P(id="nawalparasi_east", name_en="Nawalparasi East (Nawalpur)", name_ne="नवलपरासी पूर्व (नवलपुर)", name_hi="नवलपरासी पूर्व (नवलपुर)",
      kind="district", guess=(27.65, 84.10), district="Nawalpur", km="", in_channel=False,
      aliases=["Nawalpur", "Nawalpur District", "Nawalparasi (Bardaghat Susta East)", "नवलपुर", "नवलपुर जिल्ला", "नवलपरासी (बर्दघाट सुस्ता पूर्व)"],
      notes="District east of the Narayani; bodies recovered; boundary centroid",
      queries=["नवलपुर जिल्ला", "Nawalpur District, Nepal"], radius_km=40, prefer="boundary"),
    P(id="nawalparasi_west", name_en="Nawalparasi West (Parasi)", name_ne="नवलपरासी पश्चिम (परासी)", name_hi="नवलपरासी पश्चिम (परासी)",
      kind="district", guess=(27.55, 83.75), district="Parasi", km="", in_channel=False,
      aliases=["Parasi", "Nawalparasi W", "Nawalparasi (Bardaghat Susta West)", "परासी", "नवलपरासी पश्चिम", "नवलपरासी (बर्दघाट सुस्ता पश्चिम)"],
      notes="District west of the Narayani; bodies recovered; boundary centroid",
      queries=["नवलपरासी पश्चिम", "Nawalparasi West, Nepal"], radius_km=40, prefer="boundary"),
    P(id="sindhupalchok", name_en="Sindhupalchok", name_ne="सिन्धुपाल्चोक", name_hi="सिंधुपालचोक", kind="district",
      guess=(27.95, 85.70), district="Sindhupalchok", km="", in_channel=False,
      aliases=["Sindhupalchowk", "Sindhupalchok District", "सिन्धुपाल्चोक जिल्ला", "सिन्धुपाल्चोक"],
      notes="District east of Rasuwa; appears in NDRRMA rescued-locations (name-collision watch: its Bhotekoshi RM is a different river); boundary centroid",
      queries=["सिन्धुपाल्चोक जिल्ला", "Sindhupalchowk, Nepal"], radius_km=40, prefer="boundary"),
    P(id="bhotekoshi_rm_sindhupalchok", name_en="Bhotekoshi Rural Municipality (Sindhupalchok)",
      name_ne="भोटेकोशी गाउँपालिका (सिन्धुपाल्चोक)", name_hi="भोटेकोशी ग्रामीण नगरपालिका (सिंधुपालचोक)", kind="district",
      guess=(27.93, 85.92), district="Sindhupalchok", municipality="Bhotekoshi RM", km="", in_channel=False,
      aliases=["Bhotekoshi RM", "Bhote Koshi Gaunpalika", "Bhotekoshi Gaupalika", "भोटेकोशी गाउँपालिका", "भोटेकोसी गाउँपालिका"],
      notes="NOT the Bhote Koshi river corridor of this event: a rural municipality on the Sun Koshi/Bhote Koshi (Kodari) in Sindhupalchok. DAO/Setu records naming 'Bhotekoshi' need this disambiguation; boundary centroid",
      queries=["Bhotekoshi Rural Municipality, Sindhupalchok, Nepal", "Bhotekoshi, Sindhupalchok, Nepal"], radius_km=30, prefer="boundary"),
]

# NDRRMA stationed-locations → new rows (centroid is authoritative). Key = API `id`.
NDRRMA_STATIONED_ROWS: dict[int, dict] = {
    1: dict(id="dhunche_army_camp", name_en="Dhunche Nepali Army relief camp", name_ne="धुन्चे नेपाली सेना राहत शिविर",
            name_hi="धुंचे नेपाली सेना राहत शिविर", kind="shelter", district="Rasuwa", municipality="Gosaikunda RM", ward="6",
            km="22", aliases=["Dhunche relief camp", "Dhunche army camp", "धुन्चे राहत शिविर"],
            notes="Army forward base and relief camp at Dhunche"),
    2: dict(id="rasuwa_district_hospital"),
    3: dict(id="syabrubesi_shelter", name_en="Syabrubesi temporary shelter", name_ne="स्याफ्रुबेसी अस्थायी आश्रयस्थल",
            name_hi="स्याब्रूबेसी अस्थायी आश्रय", kind="shelter", district="Rasuwa", municipality="Gosaikunda RM", ward="3",
            km="16", in_channel=True, below=True, aliases=["Syabrubesi shelter", "स्याफ्रुबेसी आश्रयस्थल"],
            notes="Temporary shelter for survivors at Syabrubesi"),
    4: dict(id="timure_health_post", name_en="Timure health post", name_ne="टिमुरे स्वास्थ्य चौकी", name_hi="टिमुरे स्वास्थ्य चौकी",
            kind="hospital", district="Rasuwa", municipality="Gosaikunda RM", ward="2", km="3", in_channel=True, below=True,
            aliases=["Timure Health Post"],
            notes="Health post; NDRRMA stationing site (centroid lies ~1.5 km north of the Timure bazaar point)"),
    5: dict(id="bidur_army_camp", name_en="Bidur Nepali Army relief camp", name_ne="विदुर नेपाली सेना राहत शिविर",
            name_hi="विदुर नेपाली सेना राहत शिविर", kind="shelter", district="Nuwakot", municipality="Bidur Municipality",
            km="46", aliases=["Bidur relief camp", "Bidur army camp", "विदुर राहत शिविर"],
            notes="Army relief camp at Bidur (Nuwakot HQ)"),
    6: dict(id="trishuli_hospital"),
    7: dict(id="battar_shelter", name_en="Battar community shelter", name_ne="बट्टार सामुदायिक आश्रयस्थल",
            name_hi="बट्टार सामुदायिक आश्रय", kind="shelter", district="Nuwakot", municipality="Bidur Municipality", km="45",
            aliases=["Battar shelter", "बट्टार आश्रयस्थल"], notes="Community shelter at Battar"),
    8: dict(id="kalikasthan_phc", name_en="Kalikasthan primary health centre", name_ne="कालिकास्थान प्राथमिक स्वास्थ्य केन्द्र",
            name_hi="कालिकास्थान प्राथमिक स्वास्थ्य केंद्र", kind="hospital", district="Rasuwa", municipality="Kalika RM",
            km="30", aliases=["Kalikasthan PHC", "Kalikasthan", "कालिकास्थान"],
            notes="Kalika RM headquarters on the Dhunche road, on the ridge east of the channel; off-corridor (hillside)"),
    9: dict(id="dhaibung_relief_centre", name_en="Dhaibung relief collection centre", name_ne="धैबुङ राहत सङ्कलन केन्द्र",
            name_hi="धैबुंग राहत संग्रह केंद्र", kind="shelter", district="Rasuwa", municipality="Kalika RM", ward="2", km="34",
            aliases=["Dhaibung", "धैबुङ", "धइबुङ", "धैबुङ राहत केन्द्र"],
            notes="Relief collection point on the Dhunche road above the Simle–Betrawati reach (OSM village node 28.0022/85.2112); off-corridor (hillside)"),
    10: dict(id="galchhi_relief_camp", name_en="Galchhi transit relief camp", name_ne="गल्छी ट्रान्जिट राहत शिविर",
             name_hi="गल्छी ट्रांजिट राहत शिविर", kind="shelter", district="Dhading", municipality="Galchhi RM", km="60",
             aliases=["Galchhi relief camp", "गल्छी राहत शिविर"], notes="Transit relief camp at the Galchhi highway junction"),
    13: dict(id="tuth_kathmandu"),
}

# NDRRMA rescued-locations title → place id (these have no centroid in the API).
NDRRMA_RESCUED_MAP: dict[str, str] = {
    "Sindhupalchok": "sindhupalchok",
    "नुवाकोट": "nuwakot",
    "रसुवा": "rasuwa",
    "वेत्रवती, रसुवा": "betrawati",
    "बेत्रावती, रसुवा": "betrawati",
    "टिमुरे, रसुवा": "timure",
    "टिमुरे": "timure",
    "स्याफ्रुबेसी": "syabrubesi",
    "स्याफ्रुवेशी": "syabrubesi",
    "स्याफ्रुबेशी": "syabrubesi",
    "रसुवागढी": "rasuwagadhi",
    "त्रिशुली": "trishuli_bazar",
    "कोलनी": "colony",
    "शान्ति बजार": "shantibazar",
    "धुन्चे": "dhunche",
    "बट्टार": "battar",
    "मैलुङ": "mailung",
    "हाफुबेसी": "hakubesi",
    "चिलिमे": "chilime",
    "सलिटार": "salletar",
    "मानेढुङ्गा": "manedhunga",
}

# Rescued-location names that are not otherwise in SEED get a row of their own.
NDRRMA_RESCUED_EXTRA: list[Seed] = [
    P(id="manedhunga", name_en="Manedhunga", name_ne="मानेढुङ्गा", name_hi="मानेढुंगा", kind="settlement",
      guess=(27.975, 85.175), district="Rasuwa", municipality="Uttargaya RM", km="40", in_channel=False,
      aliases=["Mane Dhunga", "Manedhunga Rasuwa", "माने ढुङ्गा"],
      notes="Listed by NDRRMA rescued-locations without a centroid; placed near Betrawati in Uttargaya (judgment call)",
      queries=["Manedhunga, Rasuwa, Nepal", "Manedhunga, Nuwakot, Nepal", "Mane Dhunga, Nepal"], radius_km=12),
]


# ─────────────────────────────────────────────────────────────────────────────
# Network helpers (cached)
# ─────────────────────────────────────────────────────────────────────────────

class Fetcher:
    def __init__(self, offline: bool, refresh: bool):
        self.offline, self.refresh = offline, refresh
        self._last_nominatim = 0.0
        CACHE.mkdir(exist_ok=True)
        (CACHE / "nominatim").mkdir(exist_ok=True)

    def _get_json(self, url: str, params: dict | None, cache_file: Path, throttle: bool) -> dict | list | None:
        if cache_file.exists() and not self.refresh:
            return json.loads(cache_file.read_text(encoding="utf-8"))
        if self.offline:
            print(f"  [offline] no cache for {cache_file.name}", file=sys.stderr)
            return None
        import requests  # local import so --offline works without the dependency
        if throttle:
            wait = 1.1 - (time.monotonic() - self._last_nominatim)
            if wait > 0:
                time.sleep(wait)
        try:
            r = requests.get(url, params=params, headers={"User-Agent": USER_AGENT, "Accept": "application/json"}, timeout=40)
            if throttle:
                self._last_nominatim = time.monotonic()
            r.raise_for_status()
            data = r.json()
        except Exception as e:  # noqa: BLE001 — a failed lookup must not stop the build
            print(f"  [fetch failed] {url} {params or ''}: {e}", file=sys.stderr)
            return None
        cache_file.write_text(json.dumps(data, ensure_ascii=False, indent=1), encoding="utf-8")
        return data

    def ndrrma(self, which: str) -> list[dict]:
        url = NDRRMA_RESCUED if which == "rescued" else NDRRMA_STATIONED
        data = self._get_json(url, None, CACHE / f"ndrrma_{which}_locations.json", throttle=False)
        return list((data or {}).get("results", [])) if isinstance(data, dict) else []

    def nominatim(self, query: str) -> list[dict]:
        key = hashlib.sha1(query.encode("utf-8")).hexdigest()[:16]
        data = self._get_json(
            NOMINATIM,
            {"q": query, "format": "jsonv2", "limit": 5, "extratags": 1, "addressdetails": 0},
            CACHE / "nominatim" / f"{key}.json", throttle=True,
        )
        return data if isinstance(data, list) else []


def haversine_km(a: tuple[float, float], b: tuple[float, float]) -> float:
    r = 6371.0
    la1, lo1, la2, lo2 = map(math.radians, (a[0], a[1], b[0], b[1]))
    h = math.sin((la2 - la1) / 2) ** 2 + math.cos(la1) * math.cos(la2) * math.sin((lo2 - lo1) / 2) ** 2
    return 2 * r * math.asin(math.sqrt(h))


def _hit_rank(hit: dict) -> int:
    cat = hit.get("category") or hit.get("class") or ""
    if cat == "boundary":
        return 0
    if cat == "place":
        return 1
    return 2


_EST_CLAUSE = re.compile(r";\s*(coord estimated[^;]*)$")


def geocode(seed: Seed, f: Fetcher) -> tuple[float, float, str, str, str]:
    """Return (lat, lon, elev_m, coord_note, notes_without_coord_clause)."""
    if seed.fixed or not seed.queries:
        # Fixed rows: a trailing "; coord estimated …" clause in the seed notes becomes the
        # coordinate note (so it always ends up last); NDRRMA centroid rows get theirs in build() step 2.
        m = _EST_CLAUSE.search(seed.notes)
        if m:
            return seed.guess[0], seed.guess[1], seed.elev_m, m.group(1), seed.notes[: m.start()]
        return seed.guess[0], seed.guess[1], seed.elev_m, "coord estimated", seed.notes
    for q in seed.queries:
        hits = f.nominatim(q)
        if seed.prefer == "boundary":
            hits = [h for h in hits if _hit_rank(h) == 0]
        else:
            hits = sorted(hits, key=lambda h: (_hit_rank(h) != 1, _hit_rank(h)))  # place first, then boundary, then rest
        for hit in hits:
            try:
                lat, lon = float(hit["lat"]), float(hit["lon"])
            except (KeyError, ValueError):
                continue
            if haversine_km((lat, lon), seed.guess) <= seed.radius_km:
                elev = seed.elev_m
                ele = (hit.get("extratags") or {}).get("ele")
                if ele and re.fullmatch(r"\d{2,4}(\.\d+)?", str(ele)):
                    elev = str(int(round(float(ele))))
                short = (hit.get("display_name") or "").split(",")[0]
                note = f"coord: OSM/Nominatim {hit.get('osm_type', '?')}/{hit.get('osm_id', '?')} '{short}'"
                return round(lat, 5), round(lon, 5), elev, note, seed.notes
    return seed.guess[0], seed.guess[1], seed.elev_m, "coord estimated", seed.notes


# ─────────────────────────────────────────────────────────────────────────────
# Build
# ─────────────────────────────────────────────────────────────────────────────

def join_notes(*parts: str) -> str:
    return "; ".join(p for p in parts if p)


def _add_alias(r: dict, *names: str) -> None:
    for a in names:
        if a and a not in r["aliases"] and a not in (r["name_en"], r["name_ne"], r["name_hi"]):
            r["aliases"].append(a)


def build(offline: bool, refresh: bool) -> list[dict]:
    """Merge SEED + NDRRMA + Nominatim into row dicts. Internally each row carries `_notes`
    (list of provenance parts) and `_coord` (the coordinate note); they are joined at the end
    so the coordinate note is always the last clause of `notes`."""
    f = Fetcher(offline, refresh)
    rows: dict[str, dict] = {}
    order: list[str] = []

    # 1. seeds (+ the extra rows that exist only because NDRRMA names them)
    for s in SEED + NDRRMA_RESCUED_EXTRA:
        if s.id in rows:
            raise SystemExit(f"duplicate seed id {s.id}")
        lat, lon, elev, cnote, notes = geocode(s, f)
        rows[s.id] = {
            "id": s.id, "name_en": s.name_en, "name_ne": s.name_ne, "name_hi": s.name_hi, "name_zh": s.name_zh,
            "aliases": list(dict.fromkeys(s.aliases)), "kind": s.kind, "district": s.district,
            "municipality": s.municipality, "ward": s.ward, "lat": lat, "lon": lon, "elev_m": elev, "km": s.km,
            "side": s.side, "in_channel": s.in_channel, "below_barrier_lakes": s.below,
            "_notes": [notes] if notes else [], "_coord": cnote,
        }
        order.append(s.id)

    # 2. NDRRMA stationed-locations: centroids are authoritative
    for loc in f.ndrrma("stationed"):
        spec = NDRRMA_STATIONED_ROWS.get(loc.get("id"))
        title, title_ne = loc.get("title", ""), loc.get("title_ne", "")
        c = (loc.get("centroid") or {}).get("coordinates")
        if spec is None:
            print(f"  [ndrrma] unmapped stationed-location id={loc.get('id')} '{title}' — add it to NDRRMA_STATIONED_ROWS", file=sys.stderr)
            continue
        pid = spec["id"]
        tag = f"NDRRMA stationed-locations id {loc.get('id')} '{title}'"
        if pid in rows:
            r = rows[pid]
        else:
            r = {"id": pid, "name_en": spec["name_en"], "name_ne": spec["name_ne"], "name_hi": spec["name_hi"], "name_zh": "",
                 "aliases": list(spec.get("aliases", [])), "kind": spec["kind"], "district": spec.get("district", ""),
                 "municipality": spec.get("municipality", ""), "ward": spec.get("ward", ""), "lat": "", "lon": "",
                 "elev_m": "", "km": spec.get("km", ""), "side": "NP", "in_channel": spec.get("in_channel", False),
                 "below_barrier_lakes": spec.get("below", False),
                 "_notes": [spec["notes"]] if spec.get("notes") else [], "_coord": ""}
            rows[pid] = r
            order.append(pid)
        _add_alias(r, title, title_ne)
        if c and len(c) == 2:
            r["lat"], r["lon"] = round(float(c[1]), 5), round(float(c[0]), 5)
            r["_coord"] = f"coord: NDRRMA centroid ({tag})"
        else:
            r["_notes"].append(tag)

    # 3. NDRRMA rescued-locations: names only → aliases + notes on the mapped row
    for loc in f.ndrrma("rescued"):
        title, title_ne = loc.get("title", ""), loc.get("title_ne", "")
        pid = NDRRMA_RESCUED_MAP.get(title) or NDRRMA_RESCUED_MAP.get(title_ne)
        if pid is None or pid not in rows:
            print(f"  [ndrrma] unmapped rescued-location id={loc.get('id')} '{title}' — add it to NDRRMA_RESCUED_MAP", file=sys.stderr)
            continue
        r = rows[pid]
        _add_alias(r, title, title_ne)
        tag = f"NDRRMA rescued-locations id {loc.get('id')} '{title}'"
        if tag not in r["_notes"]:
            r["_notes"].append(tag)
        c = (loc.get("centroid") or {}).get("coordinates")
        if c and len(c) == 2 and not r["_coord"].startswith("coord: NDRRMA"):
            r["lat"], r["lon"] = round(float(c[1]), 5), round(float(c[0]), 5)
            r["_coord"] = f"coord: NDRRMA centroid ({tag})"

    # 4. sort: CN first by km, then NP by km (blank km last), then id — the corridor reads top→bottom
    def sort_key(pid: str):
        r = rows[pid]
        km = float(r["km"]) if str(r["km"]).strip() != "" else 9999.0
        kind_rank = 0 if r["kind"] != "district" else 1
        return (kind_rank, km, r["id"])

    out = []
    for pid in sorted(order, key=sort_key):
        r = rows[pid]
        notes = join_notes(*r.pop("_notes"), r.pop("_coord"))
        out.append({**r, "notes": notes})

    # 5. sanity
    for r in out:
        if r["lat"] == "" or r["lon"] == "":
            raise SystemExit(f"{r['id']}: no coordinate")
        if not (LAT_MIN <= float(r["lat"]) <= LAT_MAX and LON_MIN <= float(r["lon"]) <= LON_MAX):
            raise SystemExit(f"{r['id']}: coordinate {r['lat']},{r['lon']} outside the corridor bounding box")
        if r["in_channel"] and str(r["km"]).strip() == "":
            raise SystemExit(f"{r['id']}: in_channel rows need km")
        if not any(k in r["notes"] for k in ("coord: OSM", "coord: NDRRMA", "coord estimated")):
            raise SystemExit(f"{r['id']}: notes lack coordinate provenance")
    return out


def write_csv(rows: list[dict], path: Path = OUT) -> None:
    with path.open("w", encoding="utf-8", newline="") as fh:
        w = csv.DictWriter(fh, fieldnames=COLUMNS, lineterminator="\n")
        w.writeheader()
        for r in rows:
            w.writerow({
                **r,
                "aliases": "|".join(r["aliases"]),
                "in_channel": "true" if r["in_channel"] else "false",
                "below_barrier_lakes": "true" if r["below_barrier_lakes"] else "false",
            })


def main(argv: list[str] | None = None) -> int:
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("--offline", action="store_true", help="never touch the network; use .cache/ only")
    ap.add_argument("--refresh", action="store_true", help="ignore .cache/ and re-fetch everything")
    ap.add_argument("--out", type=Path, default=OUT)
    a = ap.parse_args(argv)
    rows = build(a.offline, a.refresh)
    write_csv(rows, a.out)
    n_osm = sum("coord: OSM" in r["notes"] for r in rows)
    n_ndrrma = sum("coord: NDRRMA" in r["notes"] for r in rows)
    n_est = sum("coord estimated" in r["notes"] for r in rows)
    print(f"wrote {a.out} — {len(rows)} rows: {n_osm} OSM/Nominatim, {n_ndrrma} NDRRMA centroid, {n_est} estimated")
    return 0


if __name__ == "__main__":
    sys.exit(main())
