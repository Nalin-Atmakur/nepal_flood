"""
tests/test_places.py — invariants of gazetteer/places.csv (README.md, step 4).

Run:  ../pipeline/.venv/bin/python -m pytest gazetteer/tests -q
"""
from __future__ import annotations

import csv
import io
import re
import sys
from pathlib import Path

import pytest

HERE = Path(__file__).resolve().parent
GAZ = HERE.parent
sys.path.insert(0, str(GAZ))

import build_gazetteer as bg  # noqa: E402
import to_sql  # noqa: E402

CSV_PATH = GAZ / "places.csv"
COLUMNS = [
    "id", "name_en", "name_ne", "name_hi", "name_zh", "aliases", "kind", "district",
    "municipality", "ward", "lat", "lon", "elev_m", "km", "side", "in_channel",
    "below_barrier_lakes", "notes",
]
KINDS = {
    "settlement", "camp", "tunnel_portal", "checkpost", "helipad", "lodge_cluster",
    "hospital", "shelter", "border", "district", "hazard",
}
ID_RE = re.compile(r"^[a-z][a-z0-9_]*$")
DEVANAGARI = re.compile(r"[ऀ-ॿ]")
LAT_MIN, LAT_MAX, LON_MIN, LON_MAX = 26.3, 29.0, 83.5, 86.5

REQUIRED_IDS = {
    # CN side
    "gyirong_port", "resuo", "barrier_lake_site",
    # NP upper corridor
    "rasuwagadhi", "timure", "ghattekhola", "thuman", "briddim", "goljung", "gatlang", "tatopani", "nagthali",
    "syabrubesi", "thulo_syabru", "bamboo", "lama_hotel", "langtang_village", "kyanjin_gompa", "gosaikunda",
    "dhunche", "ramche", "mailung", "haku", "simle", "betrawati", "salletar", "shantibazar", "pairebesi",
    "khalti_basti", "sole",
    # Nuwakot / Dhading / downstream
    "bidur", "trishuli_bazar", "battar", "devighat", "galchhi", "malekhu", "benighat", "gajuri", "mugling",
    "devghat", "bharatpur",
    # hydropower
    "ut1_mailung_camp", "ut3", "ut3a", "ut3b", "rasuwagadhi_hep", "chilime_hep", "sanjen_hep",
    "langtang_khola_hep", "mailung_khola_hep",
    # checkposts, helipads
    "rasuwagadhi_immigration", "timure_security_posts", "syabrubesi_np_checkpost", "dhunche_np_gate",
    "dhunche_helipad", "syabrubesi_helipad", "timure_helipad",
    # hospitals / shelters
    "rasuwa_district_hospital", "trishuli_hospital", "maithali_barracks", "betrawati_school_shelter",
    "tuth_kathmandu", "trauma_center_kathmandu", "bharatpur_body_centre", "pokhara_pahs",
    # districts
    "rasuwa", "nuwakot", "dhading", "gorkha", "tanahun", "chitwan", "nawalparasi_east", "nawalparasi_west",
    "sindhupalchok", "bhotekoshi_rm_sindhupalchok",
}

# Chainage used by design/corridor-3d.js — the gazetteer must agree with the 3D.
CHAINAGE_3D = {"gyirong_port": -3, "timure": 4, "syabrubesi": 16, "langtang_village": 20, "mailung": 26,
               "betrawati": 40, "bidur": 46, "devighat": 50, "galchhi": 60, "malekhu": 68}


@pytest.fixture(scope="module")
def raw_text() -> str:
    assert CSV_PATH.exists(), "places.csv missing — run build_gazetteer.py"
    return CSV_PATH.read_text(encoding="utf-8")


@pytest.fixture(scope="module")
def rows(raw_text) -> list[dict]:
    r = csv.DictReader(io.StringIO(raw_text))
    assert r.fieldnames == COLUMNS, f"header mismatch: {r.fieldnames}"
    return list(r)


def test_row_count(rows):
    assert 70 <= len(rows) <= 90, len(rows)


def test_ids_unique_and_slug(rows):
    ids = [r["id"] for r in rows]
    assert len(ids) == len(set(ids)), "duplicate ids"
    for i in ids:
        assert ID_RE.match(i), i


def test_required_coverage(rows):
    missing = REQUIRED_IDS - {r["id"] for r in rows}
    assert not missing, sorted(missing)


def test_coordinates_in_bounds(rows):
    for r in rows:
        lat, lon = float(r["lat"]), float(r["lon"])
        assert LAT_MIN <= lat <= LAT_MAX, (r["id"], lat)
        assert LON_MIN <= lon <= LON_MAX, (r["id"], lon)


def test_every_row_has_names(rows):
    for r in rows:
        assert r["name_en"].strip(), r["id"]
        assert DEVANAGARI.search(r["name_ne"]), (r["id"], "name_ne must be Devanagari")
        assert DEVANAGARI.search(r["name_hi"]), (r["id"], "name_hi must be Devanagari")
        if r["side"] == "CN":
            assert r["name_zh"].strip(), (r["id"], "CN rows need name_zh")


def test_kinds_and_side(rows):
    for r in rows:
        assert r["kind"] in KINDS, (r["id"], r["kind"])
        assert r["side"] in ("NP", "CN"), r["id"]


def test_booleans_and_km(rows):
    for r in rows:
        assert r["in_channel"] in ("true", "false"), r["id"]
        assert r["below_barrier_lakes"] in ("true", "false"), r["id"]
        if r["in_channel"] == "true":
            assert r["km"].strip() != "", (r["id"], "in_channel rows need km")
            float(r["km"])
        if r["below_barrier_lakes"] == "true":
            assert r["in_channel"] == "true", (r["id"], "below_barrier_lakes implies in_channel")
        if r["in_channel"] == "true" and r["side"] == "NP":
            assert r["below_barrier_lakes"] == "true", (r["id"], "every in-channel NP place is below the barrier lakes")
        if r["km"].strip():
            assert -30 <= float(r["km"]) <= 120, (r["id"], r["km"])
        if r["ward"].strip():
            assert 1 <= int(r["ward"]) <= 33, r["id"]
        if r["elev_m"].strip():
            assert 100 <= int(r["elev_m"]) <= 5500, (r["id"], r["elev_m"])


def test_chainage_matches_3d(rows):
    by_id = {r["id"]: r for r in rows}
    for pid, km in CHAINAGE_3D.items():
        assert float(by_id[pid]["km"]) == km, (pid, by_id[pid]["km"], km)


def test_km_monotonic_downstream_for_channel_rows(rows):
    """Rows are written upstream→downstream; in-channel km must not decrease within a side."""
    for side in ("CN", "NP"):
        kms = [float(r["km"]) for r in rows if r["side"] == side and r["in_channel"] == "true"]
        assert kms == sorted(kms), (side, kms)


def test_settlements_have_aliases(rows):
    for r in rows:
        if r["kind"] in ("settlement", "border", "district"):
            assert r["aliases"].strip(), (r["id"], "settlements need aliases")
        parts = [p for p in r["aliases"].split("|")] if r["aliases"] else []
        assert all(p.strip() == p and p for p in parts), (r["id"], "aliases must be non-empty, trimmed, pipe-separated")
        assert len(parts) == len(set(parts)), (r["id"], "duplicate alias")
        # aliases must be unique across places (otherwise resolve_places cannot pick one)
    seen: dict[str, str] = {}
    for r in rows:
        for a in filter(None, r["aliases"].split("|")):
            key = a.casefold()
            assert key not in seen or seen[key] == r["id"], (a, seen.get(key), r["id"])
            seen[key] = r["id"]


def test_coordinate_provenance_noted(rows):
    for r in rows:
        n = r["notes"]
        assert ("coord: OSM" in n) or ("coord: NDRRMA" in n) or ("coord estimated" in n), (r["id"], "notes must say where the coordinate came from")


def test_name_collision_row(rows):
    r = next(x for x in rows if x["id"] == "bhotekoshi_rm_sindhupalchok")
    assert r["kind"] == "district"
    assert "NOT the Bhote Koshi river corridor" in r["notes"]
    assert r["district"] == "Sindhupalchok"


def test_ndrrma_locations_are_mapped():
    """Every NDRRMA location in the cache must map to a row (fails loudly when the API adds a place)."""
    cache = GAZ / ".cache"
    if not cache.exists():
        pytest.skip("no .cache/ — run build_gazetteer.py first")
    import json
    seeds = {s.id for s in bg.SEED + bg.NDRRMA_RESCUED_EXTRA}
    p = cache / "ndrrma_rescued_locations.json"
    if p.exists():
        for loc in json.loads(p.read_text(encoding="utf-8"))["results"]:
            pid = bg.NDRRMA_RESCUED_MAP.get(loc["title"]) or bg.NDRRMA_RESCUED_MAP.get(loc["title_ne"])
            assert pid in seeds, (loc["id"], loc["title"])
    p = cache / "ndrrma_stationed_locations.json"
    if p.exists():
        for loc in json.loads(p.read_text(encoding="utf-8"))["results"]:
            assert loc["id"] in bg.NDRRMA_STATIONED_ROWS, (loc["id"], loc["title"])


def test_ndrrma_names_present_in_csv(rows):
    """The NDRRMA spellings must be searchable via aliases."""
    blob = "|".join(r["aliases"] + "|" + r["name_ne"] for r in rows)
    for title in ("टिमुरे, रसुवा", "स्याफ्रुवेशी", "कोलनी", "हाफुबेसी", "सलिटार", "मानेढुङ्गा"):
        assert title in blob, title
    by_id = {r["id"]: r for r in rows}
    for pid in ("rasuwa_district_hospital", "trishuli_hospital", "tuth_kathmandu", "dhunche_army_camp",
                "galchhi_relief_camp", "timure_health_post"):
        assert pid in by_id, pid
        assert "coord: NDRRMA centroid" in by_id[pid]["notes"], pid


def test_csv_round_trips(rows, raw_text):
    buf = io.StringIO()
    w = csv.DictWriter(buf, fieldnames=COLUMNS, lineterminator="\n")
    w.writeheader()
    for r in rows:
        w.writerow(r)
    assert buf.getvalue() == raw_text
    # and through the builder's own writer
    typed = [{**r, "aliases": r["aliases"].split("|") if r["aliases"] else [],
              "in_channel": r["in_channel"] == "true", "below_barrier_lakes": r["below_barrier_lakes"] == "true"} for r in rows]
    tmp = HERE / "_roundtrip.csv"
    try:
        bg.write_csv(typed, tmp)
        assert tmp.read_text(encoding="utf-8") == raw_text
    finally:
        tmp.unlink(missing_ok=True)


def test_to_sql_renders_every_row(rows):
    sql = to_sql.render(rows)
    assert sql.startswith("-- GENERATED")
    assert "insert into places (" + ", ".join(COLUMNS) + ") values" in sql
    assert sql.rstrip().endswith("on conflict (id) do update set " + ", ".join(f"{c} = excluded.{c}" for c in COLUMNS[1:]) + ";")
    for r in rows:
        assert f"($p${r['id']}$p$, " in sql, r["id"]
    assert sql.count("$p$") % 2 == 0
    assert "array[$p$Timmure$p$" in sql
    assert "'{}'::text[]" not in sql or any(not r["aliases"] for r in rows)


def test_to_sql_value_rules():
    assert to_sql.sql_value("ward", "") == "null"
    assert to_sql.sql_value("ward", "2") == "2"
    assert to_sql.sql_value("km", "-3") == "-3.0"
    assert to_sql.sql_value("in_channel", "true") == "true"
    assert to_sql.sql_value("aliases", "a|b c") == "array[$p$a$p$, $p$b c$p$]::text[]"
    assert to_sql.sql_value("aliases", "") == "'{}'::text[]"
    assert to_sql.sql_value("notes", "it's \"quoted\"") == "$p$it's \"quoted\"$p$"
    with pytest.raises(ValueError):
        to_sql.sql_value("notes", "bad $p$ tag")
    with pytest.raises(ValueError):
        to_sql.sql_value("in_channel", "yes")


def test_seed_sql_file_matches_csv(rows):
    """db/seed/places.sql must be regenerated whenever places.csv changes (README step 3)."""
    sql_path = GAZ.parent / "db" / "seed" / "places.sql"
    assert sql_path.exists(), "run to_sql.py"
    assert sql_path.read_text(encoding="utf-8") == to_sql.render(rows)


def test_build_offline_is_deterministic(rows):
    """Rebuilding from the cache reproduces the committed CSV exactly."""
    if not (GAZ / ".cache").exists():
        pytest.skip("no .cache/")
    built = bg.build(offline=True, refresh=False)
    tmp = HERE / "_rebuild.csv"
    try:
        bg.write_csv(built, tmp)
        assert tmp.read_text(encoding="utf-8") == CSV_PATH.read_text(encoding="utf-8")
    finally:
        tmp.unlink(missing_ok=True)
