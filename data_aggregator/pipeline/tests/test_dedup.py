"""Scoring matrix + thresholds + clustering for processing/dedup.py (pure functions, no DB)."""
from lib import config
from lib.text import name_key, person_key
from processing import dedup as D


def rec(**kw):
    base = {"source": "form", "external_id": "x", "person_key": None, "key_strength": None, "group_key": None,
            "nationality": None, "age_band": None, "sex": None, "place_id": None, "status": "missing", "at": None}
    base.update(kw)
    return base


def test_phone_and_passport_are_certain():
    pk = person_key(phone="9841234567")
    s, why = D.score(rec(person_key=pk, key_strength="phone"), rec(source="opmcm", person_key=pk, key_strength="phone"))
    assert s == 1.0 and D.decide(s) == "merge" and "phone" in why[0]
    pp = person_key(passport="AB123456")
    s, _ = D.score(rec(person_key=pp, key_strength="passport"), rec(person_key=pp, key_strength="passport"))
    assert s == 1.0


def test_name_hash_equality_is_a_merge():
    pk = person_key(name="Ram Bahadur Tamang", age=34, nationality="Nepali")
    s, why = D.score(rec(person_key=pk, key_strength="name"), rec(source="ndrrma", person_key=pk, key_strength="name"))
    assert s == 0.9 and D.decide(s) == "merge"


def test_name_jw_band_is_grey_zone():
    a = rec(name_key=name_key("Ram Bahadur Tamang"), age_band="18-39", nationality="Nepali")
    b = rec(name_key=name_key("Ram Bahadur Tamamg"), age_band="18-39", nationality="nepali")
    s, why = D.score(a, b)
    assert config.DEDUP_QUEUE_THRESHOLD <= s < config.DEDUP_MERGE_THRESHOLD and D.decide(s) == "queue"
    c = rec(name_key=name_key("Ram Bahadur Tamang"), age_band="18-39", nationality="Nepali")
    s2, _ = D.score(a, c)
    assert s2 >= s and s2 <= 0.9


def test_bonus_and_conflicts():
    pk = person_key(name="Sita Gurung", age=30, nationality="Nepali")
    a = rec(person_key=pk, key_strength="name", group_key="g", place_id="timure", sex="female", age_band="18-39")
    b = rec(person_key=pk, key_strength="name", group_key="g", place_id="timure", sex="female", age_band="18-39")
    s, why = D.score(a, b)
    assert s == 1.0 and "same group and place" in why
    c = rec(person_key=pk, key_strength="name", sex="male", age_band="18-39")
    s, why = D.score(a, c)
    assert s == 0.4 and D.decide(s) == "distinct" and "conflicting sex" in why
    d = rec(person_key=pk, key_strength="name", age_band="65+")
    s, why = D.score(a, d)
    assert s == 0.4 and "age bands far apart" in why


def test_no_overlap_is_distinct():
    s, why = D.score(rec(person_key="a"), rec(person_key="b"))
    assert s == 0.0 and D.decide(s) == "distinct"


def test_thresholds():
    assert D.decide(0.9) == "merge" and D.decide(0.89) == "queue" and D.decide(0.6) == "queue" and D.decide(0.59) == "distinct"


def test_clustering_is_deterministic():
    pk = person_key(phone="9841234567")
    pk2 = person_key(name="Hari Prasad", age=50, nationality="Nepali")
    records = [
        rec(external_id="r1", person_key=pk, key_strength="phone", place_id="timure", status="missing", at="2026-08-27T10:00:00+05:45"),
        rec(source="opmcm", external_id="o1", person_key=pk, key_strength="phone", status="lost", at="2026-08-28T10:00:00+05:45"),
        rec(source="ndrrma", external_id="n1", person_key=pk, key_strength="name", place_id="dhunche", status="rescued", at="2026-08-29T10:00:00+05:45"),
        rec(source="opmcm", external_id="o2", person_key=pk2, key_strength="name", sex="male", status="lost"),
        rec(source="ndrrma", external_id="n2", person_key=pk2, key_strength="name", sex="female", status="rescued"),
        rec(source="form", external_id="r9"),
    ]
    clusters, queue = D.cluster(records)
    sizes = sorted(len(c) for c in clusters)
    assert sizes == [1, 1, 1, 3]
    big = next(c for c in clusters if len(c) == 3)
    e = D.entity_from_cluster(big)
    assert e["status"] == "rescued" and e["status_source"] == "ndrrma" and e["probable_place_id"] == "dhunche"
    assert e["last_place_id"] == "dhunche" and len(e["merged_from"]) == 3 and e["person_key"] == pk
    assert queue == []
    again, _ = D.cluster(list(records))
    assert sorted(len(c) for c in again) == sizes


def test_merge_stats_and_idempotent_rebuild():
    pk = person_key(phone="9841234567")
    records = [
        rec(external_id="r1", person_key=pk, key_strength="phone", status="missing", at="2026-08-27T10:00:00+05:45"),
        rec(source="opmcm", external_id="o1", person_key=pk, key_strength="phone", status="lost", at="2026-08-28T10:00:00+05:45"),
        rec(source="opmcm", external_id="o2", person_key=person_key(name="A B", age=30, nationality="Nepali"), key_strength="name", status="lost"),
    ]
    ents = [D.entity_from_cluster(c) for c, in [(c,) for c in D.cluster(records)[0]] if any(r.get("person_key") for r in c)]
    ms = D.merge_stats_from(ents, open_queue=2)
    assert ms == {"entities": 2, "merged": 1, "merge_rate": 0.5, "cross_source": 1, "by_source_pair": {"form+opmcm": 1}, "queue_open": 2}
    # a second pass over the same records rebuilds merged_from from scratch — nothing accumulates
    again = [D.entity_from_cluster(c) for c in D.cluster(records)[0] if any(r.get("person_key") for r in c)]
    assert sorted(len(e["merged_from"]) for e in again) == sorted(len(e["merged_from"]) for e in ents) == [1, 2]
    assert D.merge_stats_from(again) == {**ms, "queue_open": 0}
    assert D.merge_stats_from([]) == {"entities": 0, "merged": 0, "merge_rate": 0.0, "cross_source": 0, "by_source_pair": {}, "queue_open": 0}


def test_input_hash_is_order_insensitive_and_status_sensitive():
    a = rec(external_id="r1", person_key="k1", status="missing", place_id="timure")
    b = rec(source="opmcm", external_id="o1", person_key="k2", status="lost")
    h = D.input_hash([a, b])
    assert h == D.input_hash([b, a]) and len(h) == 24
    assert h != D.input_hash([a, dict(b, status="rescued")]) and h != D.input_hash([a]) and h != D.input_hash([a, dict(b, place_id="dhunche")])
