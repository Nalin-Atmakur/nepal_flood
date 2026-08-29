"""Row-level security, positive and negative, against the live project (docs/05-rls.md).

The website's anon key must be able to read public DERIVED/reference tables and views,
insert into submissions_log only as an authenticated (anonymous-auth) user, and must NOT
be able to read any ARCHIVE/RAW/private table.
"""
from __future__ import annotations
import pytest

PUBLIC_SELECT = ["figures_latest", "place_status", "stats", "report_counts", "place_timeline",
                 "places", "sources", "gauges", "submissions_log",
                 "v_live_counts", "v_articles_recent", "v_place_status_latest", "v_gauges_latest", "v_sources_status"]
PRIVATE = ["raw_pulls", "figures", "articles", "reports_anon", "pulls", "entities", "entity_events",
           "dedup_queue", "findings", "_migrations", "reports_archive", "users"]


@pytest.mark.parametrize("rel", PUBLIC_SELECT)
def test_anon_can_select_public(anon, rel):
    res = anon.table(rel).select("*").limit(1).execute()
    assert isinstance(res.data, list)


@pytest.mark.parametrize("rel", PRIVATE)
def test_anon_cannot_read_private(anon, rel):
    """Either an error (no privilege) or an empty result (RLS with no policy) — never rows."""
    try:
        res = anon.table(rel).select("*").limit(1).execute()
    except Exception:
        return
    assert res.data == [], f"anon read rows from private relation {rel}"


def test_anon_cannot_insert_report_without_session(anon):
    with pytest.raises(Exception):
        anon.table("reports_archive").insert({"respondent_type": "family", "text": "x", "user_id": "00000000-0000-0000-0000-000000000000"}).execute()


def test_anon_cannot_write_derived(anon):
    with pytest.raises(Exception):
        anon.table("stats").insert({"id": "rls_probe", "value": "x"}).execute()


def test_service_can_read_private(service):
    res = service.table("sources").select("id").limit(1).execute()
    assert res.data


def test_anonymous_signin_enabled(keys):
    """Anonymous auth must be on: the site relies on it for identity."""
    from supabase import create_client
    c = create_client(keys["url"], keys["anon"])
    r = c.auth.sign_in_anonymously()
    assert r.user and r.user.id
    uid = r.user.id
    # as that user: can insert own users row and own report, can read own report, cannot read others
    c.table("users").upsert({"id": uid, "lang": "en"}).execute()
    ins = c.table("reports_archive").insert({"user_id": uid, "respondent_type": "family", "text": "RLS probe — synthetic, no real person", "lang": "en"}).execute()
    rid = ins.data[0]["id"]
    own = c.table("reports_archive").select("id,status").eq("id", rid).execute()
    assert own.data and own.data[0]["status"] == "received"
    # withdraw is the only permitted update; other fields are frozen by the trigger
    c.table("reports_archive").update({"withdrawn_at": "now()"}).eq("id", rid).execute()
    after = c.table("reports_archive").select("status,withdrawn_at").eq("id", rid).execute().data[0]
    assert after["status"] == "withdrawn" and after["withdrawn_at"]
    with pytest.raises(Exception):
        c.table("reports_archive").update({"text": "tampered"}).eq("id", rid).execute()
    # a different anonymous user cannot see it
    c2 = create_client(keys["url"], keys["anon"])
    c2.auth.sign_in_anonymously()
    other = c2.table("reports_archive").select("id").eq("id", rid).execute()
    assert other.data == []
    c.auth.sign_out(); c2.auth.sign_out()
