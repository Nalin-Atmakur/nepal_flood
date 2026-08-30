import csv

from lib import config
from lib.places import Gazetteer, place_from_row


def test_builtin_loads_and_resolves(gaz):
    assert len(gaz) > 50
    cases = {
        "टिमुरे, रसुवा": "timure", "Bhote Koshi at Shyaprubesi": "syabrubesi", "Upper Trishuli-1 camp (Mailung)": "ut1_mailung_camp",
        "रसुवागढीमा थप ३ शव भेटिए": "rasuwagadhi", "Betrawati shelter count passes 3,500": "betrawati", "吉隆口岸附近": "gyirong_port",
        "Langtang trekkers safe but cut off": "langtang_village", "Trishuli 3A powerhouse flooded": "ut3a", "Bahrabise": "bhotekoshi_rm_sindhupalchok",
        "Galchi": "galchhi", "Rasuwadhi - Gyirong border": "gyirong_port", "बाढ़ प्रभावित इलाकों में भारतीय राहत दल पहुंचा": None,
        "Helicopter shuttle resumes": None, "Kathmandu Post": "kathmandu",
    }
    for text, want in cases.items():
        assert gaz.resolve(text) == want, (text, gaz.resolve(text))


def test_resolve_all_and_preference(gaz):
    ids = gaz.resolve_ids("Helicopter shuttle Dhunche–Syabrubesi resumes; Rasuwa DEOC")
    assert ids[:2] == ["dhunche", "syabrubesi"] and "rasuwa" in ids
    assert gaz.resolve("Rasuwa District Hospital, Dhunche") == "rasuwa_district_hospital"   # longest alias wins
    assert gaz.resolve("Sindhupalchok Bhotekoshi RM ward 3") == "bhotekoshi_rm_sindhupalchok"  # settlement over district


def test_four_scripts(gaz):
    assert gaz.resolve("Timure") == "timure"          # EN
    assert gaz.resolve("टिमुरे") == "timure"           # NE
    assert gaz.resolve("बेत्रावती") == "betrawati"     # HI spelling identical here; Hindi name column also indexed
    assert gaz.resolve("加德满都") == "kathmandu"       # ZH
    assert gaz.resolve("Rasuwagadhi") == gaz.resolve("Rasuwagadi") == gaz.resolve("रसुवागढी")


def test_common_words_do_not_match(gaz):
    for w in ("shelter", "count", "border", "camp", "bridge", "river", "flood", "road", "village", "people", "team"):
        assert gaz.resolve(w) is None, w


def test_row_parsing_pg_array_and_pipe():
    p = place_from_row({"id": "x", "name_en": "X", "aliases": '{"A B",C}', "kind": "settlement", "in_channel": "true", "km": "4.5"})
    assert p.aliases == ["A B", "C"] and p.in_channel is True and p.km == 4.5
    p2 = place_from_row({"id": "y", "name_en": "Y", "aliases": "A|B", "below_barrier_lakes": True})
    assert p2.aliases == ["A", "B"] and p2.below_barrier_lakes is True


def test_csv_fallback_when_present(tmp_path):
    csv_path = tmp_path / "places.csv"
    with csv_path.open("w", newline="", encoding="utf-8") as fh:
        w = csv.DictWriter(fh, fieldnames=["id", "name_en", "name_ne", "aliases", "kind", "district", "km", "side", "in_channel", "below_barrier_lakes"])
        w.writeheader()
        w.writerow({"id": "timure", "name_en": "Timure", "name_ne": "टिमुरे", "aliases": "Timure bazaar", "kind": "settlement", "district": "Rasuwa",
                    "km": "4", "side": "NP", "in_channel": "true", "below_barrier_lakes": "true"})
    g = Gazetteer.load(db=None, csv_path=csv_path)
    assert g.source.startswith("csv") and g.resolve("टिमुरे बजार") == "timure"


def test_empty_db_falls_back(gaz):
    class EmptyDb:
        def select_all(self, *a, **k):
            return []
    g = Gazetteer.load(db=EmptyDb(), csv_path=config.PIPELINE_DIR / "does-not-exist.csv")
    assert g.source == "builtin" and len(g) == len(gaz)
