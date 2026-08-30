"""③ ledger: the phones hook (NTC/Ncell figures + telecom articles), last observed contact, district rows."""
from datetime import datetime, timezone

from lib.places import Gazetteer
from processing import ledger as L

NOW = datetime(2026, 8, 30, 1, 0, tzinfo=timezone.utc)


def _fig(metric, as_of, scope="place:betrawati"):
    return {"publisher": "NTC/Ncell via press", "metric": metric, "scope": scope, "value": 1, "as_of": as_of, "url": "https://x/1"}


def test_phones_status_from_figures():
    restored, display, at = L.phones_status([_fig("telecom_restored", "2026-08-29T06:00:00+00:00")], [])
    assert restored is True and display == "yes (since 29 Aug)" and at.isoformat().startswith("2026-08-29T06:00")
    restored, display, at = L.phones_status([_fig("telecom_outage", "2026-08-28T06:00:00+00:00")], [])
    assert (restored, display, at) == (False, "no", None)
    assert L.phones_status([], []) == (None, None, None)


def test_phones_status_newest_signal_wins():
    figs = [_fig("telecom_outage", "2026-08-28T06:00:00+00:00"), _fig("telecom_restored", "2026-08-29T06:00:00+00:00")]
    assert L.phones_status(figs, [])[1] == "yes (since 29 Aug)"
    later_outage = [{"title": "Betrawati tower still down again, NTC says", "body": "", "published_at": "2026-08-29T20:00:00+00:00"}]
    assert L.phones_status(figs, later_outage)[:2] == (False, "no")
    older_outage = [{"title": "Betrawati tower still down, NTC says", "body": "", "published_at": "2026-08-27T20:00:00+00:00"}]
    assert L.phones_status(figs, older_outage)[1] == "yes (since 29 Aug)"
    same_instant = [{"title": "Betrawati tower still down, NTC says", "body": "", "published_at": "2026-08-29T06:00:00+00:00"}]
    assert L.phones_status(figs, same_instant)[0] is True                       # a figure beats an article on the same instant
    undated = [{"title": "NTC restores tower at Betrawati", "body": "", "published_at": None}]
    assert L.phones_status([], undated) == (True, "yes", None)


def test_phones_from_articles_still_works():
    restored = [{"title": "NTC restores tower at Syabrubesi", "body": "", "published_at": "2026-08-28T10:00:00+00:00"}]
    assert L.phones_from_articles(restored) == (True, "yes (since 28 Aug)")


def test_scan_articles_feeds_the_hook(gaz):
    from normalisers.ntc_restoration_articles import scan_articles
    arts = [{"url": "https://english.khabarhub.com/2026/29/565536/", "title": "NTC restores tower near Trishuli-3A; Betrawati back on network",
             "body": "80 of 120 affected sites restored.", "published_at": "2026-08-29T06:00:00+00:00", "places": ["betrawati", "ut3a", "nuwakot"]}]
    rows = scan_articles(arts, gaz, NOW)
    scopes = {f["scope"] for f in rows.figures if f["metric"] == "telecom_restored"}
    assert scopes == {"place:betrawati", "place:ut3a"}                            # the district is skipped
    tel = [f for f in rows.figures if f["scope"] == "place:betrawati"]
    assert L.phones_status(tel, [])[1] == "yes (since 29 Aug)"


def test_last_contact_is_observed_only():
    assert L.last_contact([], [], [], [], NOW) is None
    got = L.last_contact(["2026-08-27T10:00:00+00:00"], ["2026-08-28T12:00:00+00:00"], [], ["2026-08-26T03:00:00+00:00"], NOW)
    assert got.isoformat().startswith("2026-08-28T12:00")
    assert L.last_contact([], [], ["2026-08-29T06:00:00+00:00"], [], NOW).isoformat().startswith("2026-08-29T06:00")
    assert L.last_contact([], [], [], ["2026-08-26T03:00:00+00:00"], NOW).isoformat().startswith("2026-08-26T03:00")   # Timure 08:45 NPT
    assert L.last_contact(["2026-09-05T00:00:00+00:00"], [], [], [], NOW) is None                                       # futures dropped
    assert L.last_contact([None, ""], [], [], [], NOW) is None
    assert "gauge" in L.CONTACT_TIMELINE_KINDS and "wave" in L.CONTACT_TIMELINE_KINDS and "impact" in L.CONTACT_TIMELINE_KINDS


def test_is_observed_rejects_fetch_time_as_of():
    assert not L.is_observed("2026-08-30T00:20:06+00:00", "2026-08-30T00:20:06.78+00:00")     # ndrrma_rescues as_of = fetched_at
    assert L.is_observed("2026-08-29T12:45:00+00:00", "2026-08-30T00:20:06+00:00")            # sitrep-dated figure
    assert L.is_observed("2026-08-29T12:45:00+00:00", None) and not L.is_observed(None, None)


def test_district_rows_are_labelled(gaz):
    assert L.status_label(500, 20, 480, "district", "rasuwa") == "district"
    assert L.status_label(500, 20, 480, "settlement", "kathmandu") == "district"                # DISTRICT_LIKE
    assert L.status_label(500, 20, 480, "settlement", "bhotekoshi_rm_sindhupalchok") == "district"
    assert L.status_label(10, 2, 8, "settlement", "timure") == "mostly_unknown"
    assert L.status_label(0, 0, 0, None, None) == "no_data"
    assert L.is_district_like(gaz.get("rasuwa")) and L.is_district_like(gaz.get("kathmandu"), "kathmandu")
    assert not L.is_district_like(gaz.get("timure"), "timure")


def test_telecom_templates():
    en, ne, hi = L.tpl("telecom_restored")
    assert "restored" in en and ne and hi
    assert L.tpl("telecom_outage")[0].startswith("Mobile network reported down")
