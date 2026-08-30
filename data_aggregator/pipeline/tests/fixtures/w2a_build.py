"""
tests/fixtures/w2a_build.py — wave-2 (official) captures → anonymised fixtures `w2a_*`.
Same rules as tests/build_fixtures.py: names → EXAMPLE-PERSON-n, phones → 98XXXXXXXX, photos/thumbnails
dropped, PII sources pass through their normaliser's prestore() so the fixture is what normalise() receives.
    .venv/bin/python tests/fixtures/w2a_build.py <capture_dir>
Capture file names expected: setu.html setu_p18.html udb_dead.html udb_missing.html udb_found.html udb_dist{3,4,5}.json
udb_rasuwa.html udb_chitwan.html gh_api.json gh_raw_root.txt(ndrrma-rescue.csv) gh_heli.csv gh_foreign.csv gh_hosp.csv
gh_dhm.json heoc_news.html heoc_sitrep00.html dao_nuwakot.html dao_rasuwa.html ifrc.json ifrc_appealdoc.json mwr.html
mwr_2140605.html mwr_2140823.html mfa.html mfa_0828.html usemb.html usemb_alert.html newsinfo.json bulletins.json
"""
from __future__ import annotations

import json
import re
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[2]))
from lib import config  # noqa: E402
from normalisers import Part, make_envelope  # noqa: E402
from normalisers import ifrc_go, police_udb, setu_recordlist, volunteer_bulletin_repo  # noqa: E402

CAP = Path(sys.argv[1]) if len(sys.argv) > 1 else Path(".")
OUT = config.FIXTURE_DIR
_n = [0]
PHONE_ANY = re.compile(r"(?<![\d०-९])\+?[\d०-९][\d०-९\-\s]{7,}[\d०-९](?![\d०-९])")


def person() -> str:
    _n[0] += 1
    return f"EXAMPLE-PERSON-{_n[0]}"


DATE_LIKE = re.compile(r"\d{4}-\d{2}-\d{2}(?:[ T]\d{2}:\d{2}(?::\d{2})?)?")


def scrub(text: str) -> str:
    """Phones → 98XXXXXXXX, but ISO dates/times (2083-05-13 15:12:59, 2026-08-27) are kept."""
    keep: list[str] = []

    def hold(m):
        keep.append(m.group(0))
        return f"\x00DATE{len(keep) - 1}\x00"
    t = DATE_LIKE.sub(hold, text)
    t = PHONE_ANY.sub("98XXXXXXXX", t)
    return re.sub(r"\x00DATE(\d+)\x00", lambda m: keep[int(m.group(1))], t)


def slim(html: str) -> str:
    html = re.sub(r"<script.*?</script>|<style.*?</style>|<svg.*?</svg>", "", html, flags=re.S | re.I)
    return scrub(html)


def read(name: str) -> str:
    return (CAP / name).read_text(encoding="utf-8", errors="replace")


def write(name: str, data: bytes | str) -> None:
    b = data.encode("utf-8") if isinstance(data, str) else data
    (OUT / name).write_bytes(b)
    print(f"{name:44} {len(b):>9} bytes")


# 1. setu — page 1 through prestore (projection); page 18 as scrubbed HTML for the paging test
p1 = setu_recordlist.prestore([Part(url=setu_recordlist.BASE, body=read("setu.html"))], None)[0]
assert '"name"' not in p1.body and '"contact"' not in p1.body
write("w2a_setu_recordlist.json", p1.body)
h = read("setu_p18.html")
recs = setu_recordlist._records_from_js(h) or []
for r in recs:
    for key, repl in (("name", person()), ("reporter", "EXAMPLE-REPORTER"), ("contact", "98XXXXXXXX"), ("repcon", "98XXXXXXXX"), ("details", "-")):
        v = str(r.get(key) or "")
        if len(v) >= 3:
            h = h.replace(json.dumps(v, ensure_ascii=False)[1:-1], repl).replace(v, repl)
h = scrub(h)
chk = setu_recordlist.parse_page(h)
assert len(chk["records"]) == len(recs) and chk["page"] == 18, chk["page"]
for r in recs:
    assert str(r.get("name")) not in h
write("w2a_setu_recordlist_p18.html", h)

# 2. police udb — three sections through prestore; district lookups; two scrubbed district pages
ps = police_udb.prestore([
    Part(url=f"{police_udb.BASE}/dead-bodies-lists?province_id=&district_id=&date_from=2026-08-26", body=read("udb_dead.html")),
    Part(url=f"{police_udb.BASE}/missing?province_id=&district_id=&date_from=2026-08-26", body=read("udb_missing.html")),
    Part(url=f"{police_udb.BASE}/found?province_id=&district_id=&date_from=2026-08-26", body=read("udb_found.html")),
], None)
assert all("deadbody" not in p.body and "<img" not in p.body for p in ps)
write("w2a_police_udb.json", make_envelope(ps))
for prov in (3, 4, 5):
    write(f"w2a_police_udb_dist{prov}.json", (CAP / f"udb_dist{prov}.json").read_bytes())


def scrub_udb(html: str) -> str:
    def mask(m):
        body = m.group(1)
        body = re.sub(r">([^<]{2,})<", ">REDACTED<", body)
        body = re.sub(r'src="[^"]*"', 'src="#"', body)
        body = re.sub(r'href="[^"]*deadbody[^"]*"', 'href="#"', body)
        return "<tbody>" + body + "</tbody>"
    return scrub(re.sub(r"<tbody[^>]*>([\s\S]*?)</tbody>", mask, slim(html)))


for name in ("rasuwa", "chitwan"):
    s = scrub_udb(read(f"udb_{name}.html"))
    assert "deadbody" not in s
    write(f"w2a_police_udb_{name}.html", s)

# 3. volunteer bulletin — listing + CSV projections + dhm json (CSV rows never leave prestore)
raw = "https://raw.githubusercontent.com/nirajbhusal/rasuwa-flood-bulletin/main/"
ps = volunteer_bulletin_repo.prestore([
    Part(url="https://api.github.com/repos/nirajbhusal/rasuwa-flood-bulletin/contents/", body=read("gh_api.json")),
    Part(url=raw + "ndrrma-rescue.csv", body=read("gh_raw_root.txt")),
    Part(url=raw + "army-heli-rescue.csv", body=read("gh_heli.csv")),
    Part(url=raw + "rasuwa-foreign-rescued.csv", body=read("gh_foreign.csv")),
    Part(url=raw + "rasuwa-hospital-dhunche.csv", body=read("gh_hosp.csv")),
    Part(url=raw + "dhm-rivers.json", body=read("gh_dhm.json")),
])
for p in ps:
    if p.url.endswith(".csv"):
        d = json.loads(p.body)
        assert set(d["counts"]) <= {"status", "nationality", "country", "location", "rescued_date", "gender", "Country", "Rescue Date (BS)", "Gender", "लिंग", "उद्धार मिति", "अवस्था"}, d["counts"].keys()
        assert len(p.body) < 20000
write("w2a_volunteer_bulletin_repo.json", make_envelope(ps))

# 4. heoc — listing (phones scrubbed) + detail with the base64 images replaced
write("w2a_heoc_sitreps.html", scrub(read("heoc_news.html")))
d = re.sub(r"data:image/[a-z]+;base64,[A-Za-z0-9+/=]+", "data:image/webp;base64,AAAA", read("heoc_sitrep00.html"))
write("w2a_heoc_sitreps_detail.html", scrub(d))

# 5. dao nuwakot — post page (slimmed) + a synthetic workbook with the real headers and fake rows
write("w2a_dao_nuwakot_rescued.html", slim(read("dao_nuwakot.html")))
import io
import openpyxl
wb = openpyxl.Workbook()
ws = wb.active
ws.title = "उद्दार गरेको नेपालीको विवरण"
ws.append(["क्र.सं.", "मिति", "नामथ", "लिङ्ग", "अन्दाजी उमेर", "ठेगाना", "उद्दार गरेको स्थान"])
locs = ["नुवाकोट"] * 5 + ["बेत्रावती"] * 3 + ["त्रिशूली"] * 2 + ["धुन्चे"] * 2
for i, loc in enumerate(locs, 1):
    ws.append([i, "२०८३।०५।१० गते ", person(), "पुरुष" if i % 2 else "महिला", 20 + i, "नुवाकोट", loc])
ws.append([None, None, None, None, None, None, None])
ws2 = wb.create_sheet("विदेशी  नागरिक उद्दार")
ws2.append(["उद्दार गरिएका विदेशी नागरिकहरुको विवरण"])
ws2.append(["सि.न.", "मिति", "नामथ", "ठेगाना", "उमेर", "लिङ", "सम्पर्क नं.", "उद्दार गरेको स्थान", "उपचरार्थ अस्पताल", "घर फिर्ता", "आफ्नतको सम्पर्क नं.", "कै."])
for i, cty in enumerate(["भारत देश"] * 3 + ["चीन देश"] * 2, 1):
    ws2.append([i, "२०८३।०५।१० गते ", person(), cty, 30 + i, "पुरुष", "98XXXXXXXX", "त्रिशूली", None, None, "98XXXXXXXX", None])
buf = io.BytesIO()
wb.save(buf)
write("w2a_dao_nuwakot_rescued.xlsx", buf.getvalue())

# 6. dao rasuwa hub
write("w2a_dao_rasuwa_hub.html", slim(read("dao_rasuwa.html")))

# 7. ifrc — through prestore (every `contacts` block and the contact email removed)
ifrc_part = ifrc_go.prestore([Part(url="https://goadmin.ifrc.org/api/v2/event/8073/", body=read("ifrc.json"))], None)[0]
assert "contacts" not in ifrc_part.body and "@nrcs.org" not in ifrc_part.body
write("w2a_ifrc_go.json", ifrc_part.body)
write("w2a_ifrc_go_appealdoc.json", (CAP / "ifrc_appealdoc.json").read_bytes())

# 8–9. china
write("w2a_china_mwr.html", slim(read("mwr.html")))
write("w2a_china_mwr_2140605.html", slim(read("mwr_2140605.html")))
write("w2a_china_mwr_2140823.html", slim(read("mwr_2140823.html")))
write("w2a_china_mfa_pressers.html", slim(read("mfa.html")))
write("w2a_china_mfa_pressers_0828.html", slim(read("mfa_0828.html")))

# 10. us embassy
write("w2a_us_embassy_alerts.html", slim(read("usemb.html")))
write("w2a_us_embassy_alerts_0829.html", slim(read("usemb_alert.html")))

# 11–12. ndrrma json — newsinfo trimmed to 12 cards
ni = json.loads(read("newsinfo.json"))
ni["results"] = ni["results"][:12]
ni["next"] = None
txt = json.dumps(ni, ensure_ascii=False)
txt = re.sub(r"(Contact:\s*)[^<>\-\d]{3,60}?(\s*(?:\([^)]*\))?\s*-\s*)", lambda m: m.group(1) + person() + m.group(2), txt)
write("w2a_ndrrma_newsinfo.json", scrub(txt))
write("w2a_ndrrma_bulletins.json", (CAP / "bulletins.json").read_bytes())
print("done")
