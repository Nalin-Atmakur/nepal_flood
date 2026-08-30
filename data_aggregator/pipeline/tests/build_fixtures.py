"""
tests/build_fixtures.py — turn captured live responses into anonymised fixtures.
Run once from a capture directory (see docs/pull_external_data/06-adding-a-source.md step 4):
    .venv/bin/python tests/build_fixtures.py <capture_dir>
Names → EXAMPLE-PERSON-n, phones → 98XXXXXXXX, photos/thumbnails dropped, PII sources pass
through their normaliser's prestore() so the fixture is exactly what normalise() receives.
"""
from __future__ import annotations

import json
import re
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent.parent))
from lib import config  # noqa: E402
from normalisers import Part, make_envelope  # noqa: E402
from normalisers import ndrrma_rescues, opmcm_person_reports  # noqa: E402

CAP = Path(sys.argv[1]) if len(sys.argv) > 1 else Path(".")
OUT = config.FIXTURE_DIR
OUT.mkdir(parents=True, exist_ok=True)
_n = [0]


def person() -> str:
    _n[0] += 1
    return f"EXAMPLE-PERSON-{_n[0]}"


PHONE_ANY = re.compile(r"(?<![\d०-९])\+?[\d०-९][\d०-९\-\s]{7,}[\d०-९](?![\d०-९])")


def scrub(text: str) -> str:
    return PHONE_ANY.sub("98XXXXXXXX", text)


def write(name: str, data: bytes) -> None:
    (OUT / name).write_bytes(data)
    print(f"{name:40} {len(data):>9} bytes")


def part(name: str, url: str, status: int = 200, body: str | None = None) -> Part:
    b = body if body is not None else (CAP / name).read_text(encoding="utf-8", errors="replace")
    return Part(url=url, status=status, body=b)


# 1. opmcm_stats — no PII
write("opmcm_stats.json", (CAP / "opmcm_stats.json").read_bytes())

# 2. opmcm_person_reports — prestore projection (names/photos gone), 25 rows
lost = json.loads((CAP / "opmcm_pr_lost.json").read_text())
lost["data"]["items"] = lost["data"]["items"][:25]
ps = [part("", "https://rescue.opmcm.gov.np/api/person-reports?type=lost&limit=200&page=1", body=json.dumps(lost, ensure_ascii=False)),
      part("opmcm_pr_found.json", "https://rescue.opmcm.gov.np/api/person-reports?type=found&limit=200&page=1"),
      Part(url="https://rescue.opmcm.gov.np/api/person-reports?type=rescued&limit=200&page=1", status=400, body='{"success":false}', error="http 400")]
ps = opmcm_person_reports.prestore(ps, None)
for p in ps:
    assert "fullName" not in p.body and "thumbnail" not in p.body
write("opmcm_person_reports.json", make_envelope(ps))

# 3. ndrrma_rescues — persons through prestore
persons = json.loads((CAP / "ndrrma_rescued_persons.json").read_text())
ps = [part("", "https://ndrrma.gov.np/api/v1/rescues/rescued-persons/?limit=500&offset=0", body=json.dumps(persons, ensure_ascii=False)),
      part("ndrrma_status_counts.json", "https://ndrrma.gov.np/api/v1/rescues/status-counts/"),
      part("ndrrma_rescued_statistics.json", "https://ndrrma.gov.np/api/v1/rescues/rescued-statistics/"),
      part("ndrrma_rescued_locations.json", "https://ndrrma.gov.np/api/v1/rescues/rescued-locations/"),
      part("ndrrma_stationed_locations.json", "https://ndrrma.gov.np/api/v1/rescues/stationed-locations/")]
ps = ndrrma_rescues.prestore(ps, None)
for p in ps:
    assert '"name"' not in p.body or "rescued-persons" not in p.url
write("ndrrma_rescues.json", make_envelope(ps))

# 4. ndrrma_publications — list + sitrep #8 text (scrubbed of any phone-like digits)
write("ndrrma_publications.json", (CAP / "ndrrma_publications.json").read_bytes())
write("ndrrma_publications_sitrep8.txt", scrub((CAP / "sitrep_388.txt").read_text()).encode("utf-8"))

# 5. bipad — corridor stations + a handful of others, images/demography dropped
bip = json.loads((CAP / "bipad_river_stations.json").read_text())
keep = []
pat = re.compile(r"trishuli|bhote ?koshi|langtang|phalakhu|narayani at devghat|bagmati river at bhorleni|jhimruk", re.I)
for s in bip["results"]:
    if pat.search(s.get("title") or ""):
        s.pop("image", None); s.pop("affectedDemography", None)
        keep.append(s)
bip["results"] = keep
bip["next"] = None
write("bipad_river_stations.json", make_envelope([Part(url="https://bipadportal.gov.np/api/v1/river-stations/?limit=1000", body=json.dumps(bip, ensure_ascii=False))]))

# 6. mofa — category page + the 28 Aug update page (scripts/styles removed)
def slim(html: str) -> str:
    html = re.sub(r"<script.*?</script>|<style.*?</style>|<svg.*?</svg>", "", html, flags=re.S | re.I)
    return scrub(html)
write("mofa_flashflood.html", slim((CAP / "mofa_flashflood.html").read_text(errors="replace")).encode("utf-8"))
write("mofa_flashflood_1864.html", slim((CAP / "mofa_1864.html").read_text(errors="replace")).encode("utf-8"))
write("mofa_flashflood_1866.html", slim((CAP / "mofa_1866.html").read_text(errors="replace")).encode("utf-8"))

# 7. dhm_weather — forecaster's name replaced
cf = json.loads((CAP / "dhm_country_forecast.json").read_text())
if isinstance(cf.get("user"), dict):
    cf["user"] = {"name": person(), "signature": None}
ps = [part("dhm_three_days.json", "https://dhm.gov.np/mfd/api/three-days-forecast-latest"),
      part("", "https://dhm.gov.np/mfd/api/country-forecast", body=json.dumps(cf, ensure_ascii=False)),
      part("dhm_weather.json", "https://dhm.gov.np/mfd/api/weather"),
      part("dhm_mountain.json", "https://dhm.gov.np/mfd/api/mountain/all-info")]
write("dhm_weather.json", make_envelope(ps))

# 8. openmeteo — both sites (Langtang fetched live if missing)
import urllib.request
lt = CAP / "openmeteo_langtang.json"
if not lt.exists():
    url = "https://api.open-meteo.com/v1/forecast?latitude=28.21&longitude=85.51&hourly=precipitation,cloud_cover_low&models=ecmwf_ifs025&timezone=Asia%2FKathmandu&forecast_days=4"
    lt.write_bytes(urllib.request.urlopen(url, timeout=30).read())
ps = [part("openmeteo_dhunche.json", "https://api.open-meteo.com/v1/forecast?latitude=28.11&longitude=85.30&hourly=precipitation,cloud_cover_low&models=ecmwf_ifs025&timezone=Asia%2FKathmandu&forecast_days=4"),
      part("openmeteo_langtang.json", "https://api.open-meteo.com/v1/forecast?latitude=28.21&longitude=85.51&hourly=precipitation,cloud_cover_low&models=ecmwf_ifs025&timezone=Asia%2FKathmandu&forecast_days=4")]
write("openmeteo_corridor.json", make_envelope(ps))

# 9–11. usgs, gdacs, hot — no PII
write("usgs_fdsn.json", (CAP / "usgs.json").read_bytes())
write("gdacs_event.json", (CAP / "gdacs.json").read_bytes())
write("hot_bridge_damage.geojson", (CAP / "hot_bridge.geojson").read_bytes())

# 12. reliefweb — as is (authors are organisations)
write("reliefweb_rss.xml", (CAP / "reliefweb.xml").read_bytes())

# 13. outlet feeds — 8 items each, bylines replaced
feeds = {
    "rss_onlinekhabar.xml": "https://www.onlinekhabar.com/feed", "rss_ok_en.xml": "https://english.onlinekhabar.com/feed",
    "rss_kp.xml": "https://kathmandupost.com/rss", "rss_khabarhub.xml": "https://english.khabarhub.com/feed/",
    "rss_risingnepal.xml": "https://risingnepaldaily.com/rss", "rss_nepalnews.xml": "https://english.nepalnews.com/rss",
    "rss_radionepal.xml": "https://radionepalonline.com/en/feed/", "rss_ratopati.xml": "https://english.ratopati.com/rss",
    "rss_annapurna.xml": "https://annapurnapost.com/rss", "rss_gorkhapatra.xml": "https://gorkhapatraonline.com/rss",
    "rss_newsofnepal.xml": "https://newsofnepal.com/feed/", "rss_bbc.xml": "https://feeds.bbci.co.uk/nepali/rss.xml",
    "rss_nepalitimes.xml": "https://nepalitimes.com/feed",
}
ps = []
for fn, url in feeds.items():
    x = (CAP / fn).read_text(encoding="utf-8", errors="replace")
    items = re.findall(r"<item>.*?</item>|<item\s[^>]*>.*?</item>", x, flags=re.S)
    head = x.split("<item")[0]
    body = head + "".join(items[:8]) + "</channel></rss>"
    body = re.sub(r"(<dc:creator>)(?:<!\[CDATA\[)?.*?(?:\]\]>)?(</dc:creator>)", lambda m: m.group(1) + person() + m.group(2), body, flags=re.S)
    body = re.sub(r"(<author>)(?:<!\[CDATA\[)?.*?(?:\]\]>)?(</author>)", lambda m: m.group(1) + person() + m.group(2), body, flags=re.S)
    ps.append(Part(url=url, body=scrub(body)))
write("outlet_rss_set.json", make_envelope(ps))
print("done")
