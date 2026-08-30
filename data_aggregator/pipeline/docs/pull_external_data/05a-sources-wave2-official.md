# 05a — wave 2 (official / government) normalisers

Twelve sources from the catalogue's §A/A′ that had `raw_pulls` rows but no normaliser after wave 1.
One section each: endpoint(s), response shape, quirks, what it emits, the fixture behind
`tests/test_normalisers_w2a.py`. Same contract as [04-normalising](04-normalising.md); PII rule as in
[05-sources](05-sources.md). Fixtures are built by `tests/fixtures/w2a_build.py <capture_dir>` (names →
`EXAMPLE-PERSON-n`, phones → `98XXXXXXXX`, ISO dates preserved, PII sources through their `prestore()`).

```
   sources.yaml id           family    normaliser                    emits
   ───────────────────────── ───────── ───────────────────────────── ───────────────────────────────────────────
   setu_recordlist           html      setu_recordlist.py            figures 'Setu (NDRRMA)'  (+ keyed projection in raw_pulls)
   police_udb                html      police_udb.py                 figures 'Nepal Police (UDB)' (+ count projection in raw_pulls)
   volunteer_bulletin_repo   s3        volunteer_bulletin_repo.py    figures 'Volunteer bulletin (nirajbhusal)' (+ count projection)
   heoc_sitreps              html      heoc_sitreps.py               articles 'HEOC/MoHP'
   dao_nuwakot_rescued       html      dao_nuwakot_rescued.py        figures 'DAO Nuwakot', article, XLSX → Storage raw/dao_nuwakot/
   dao_rasuwa_hub            html      dao_rasuwa_hub.py             articles 'DAO Rasuwa'
   ifrc_go                   json_api  ifrc_go.py                    figures 'IFRC', articles (+ contacts stripped in raw_pulls)
   china_mwr                 html      china_mwr.py                  articles (zh) 'China MWR', figures when a lake volume is stated
   china_mfa_pressers        html      china_mfa_pressers.py         articles (en) 'China MFA'
   us_embassy_alerts         html      us_embassy_alerts.py          articles 'US Embassy Kathmandu'
   ndrrma_newsinfo           json_api  ndrrma_newsinfo.py            articles 'NDRRMA'
   ndrrma_bulletins          json_api  ndrrma_bulletins.py           articles + figures 'NDRRMA'
```

Shared helpers added for these: `lib/html.py` (`absolutize`, `meta_content`, `php_uniqid_datetime`,
`tbody_rows`). New dependency: `openpyxl` (requirements.txt) for the DAO Nuwakot workbook.

Three of them page or sub-fetch inside `normalise()` through `ctx.fetch` (setu pages, UDB districts,
HEOC / DAO / MWR / MFA / IFRC detail pages); those bodies stay in memory — only the puller's own fetch
lands in `raw_pulls`, after `prestore()` where the source is PII.

---

## setu_recordlist — `GET https://setu.ndrrma.gov.np/admin/recordlist.php` (+ `?page=2..N`)

Shape: PHP page, ~100 `.rl` cards per page, pager `recordlist.php?page=N` (18 pages on 30 Aug), and a
`var REC = [...]` script that mirrors the cards **with** `name`, `contact`, `reporter`, `repcon`,
`details`, `age`, `gender`, `loc`, `status`, `source` (reporting DAO), `verified`, `when`, `time`.
Status labels seen: `Missing`, `Found - Safe`, `Found - Injured`, `Found - Dead`, `Rescued`.
Cadence 2h, `pii: true`.

`prestore()` turns the page into `{page, pages, records:[{status, source, when, time, loc, verified,
gender, age_band, person_key}]}` (`loc` PII-redacted and ≤ 80 chars, `person_key` = sha256 of contact
phone else name + age band). That projection is what `raw_pulls` holds and what `normalise()` receives;
`normalise()` fetches pages 2..N (cap 30) and projects them the same way in memory.

Emits (publisher `Setu (NDRRMA)`, `as_of = fetched_at`, url = the list): `missing`, `found_safe`,
`found_injured`, `found_dead`, `rescued`, `found` (sum of the Found-* labels), `records_total`,
`records_verified` — national; `missing` scoped `source:<reporting DAO slug>` (note says "reporting
office", it is *not* the place) and `place:<gazetteer id>` when the card's `loc` resolves. Every figure
note carries `pages k/N`; a `pull.note` says "counts are partial" when a page failed. Unresolved short
`loc` strings (≤ 40 chars, no digits) go to `place_hints`.

Fixture `w2a_setu_recordlist.json` (page 1 projection) + `w2a_setu_recordlist_p18.html` (page 18, names /
contacts replaced, served by the test fetcher as page 2; pages 3–18 return 404 so the test asserts the
partial-count note).

## police_udb — `GET https://udb.nepalpolice.gov.np/{dead-bodies-lists|missing|found}?province_id=&district_id=&date_from=2026-08-26` + 13 district list pages

> Since 30 Aug (P5) the 13 affected-district `dead-bodies-lists` pages are listed in `sources.yaml` (ids in
> `DISTRICT_IDS`) so the puller's thread pool fetches them; `normalise()` reads their counts from the envelope and only
> falls back to `GET /get-district/{province}` + `ctx.fetch` when an envelope has no district parts. See `03-fetching.md` §6.

Shape: Laravel HTML, 20 rows/page (photo, description list, place found), pager links carry
`&count=<total>&page=N` and the text "Showing 1 out of N Pages"; single-page lists have neither, an
empty list is one `colspan` row. District ids: `GET /get-district/{province_id}` → `[{id, english_name,
nepali_name, pradesh_id}]` (Bagmati 3: Rasuwa 29, Nuwakot 28, Dhading 30, Makwanpur 31, Chitawan 35,
Kathmandu 27, Sindhupalchok 23; Gandaki 4: Gorkha 36, Tanahu 38, Kaski 40, Lamjung 37, East Nawalparasi
77; Lumbini 5: West Nawalparasi 48). TLS is self-signed: `sources.yaml` `auth` says "self-signed" so the
puller fetches with `verify=False`, and the normaliser's sub-fetches pass `verify=False` too.
Cadence daily, `pii: true`.

`prestore()` reduces each section page to `{section, url, date_from, count, pages, rows}` — no photo URL,
no description, no name reaches `raw_pulls`.

Emits (publisher `Nepal Police (UDB)`, `as_of = fetched_at`): `bodies_recorded`, `missing_recorded`,
`found_recorded` national (note "records dated from 2026-08-26; N page(s)"); `bodies_recorded` scoped
`district:<slug>` for the 13 affected districts above (slugs match the NDRRMA sitrep ones:
`nawalparasi_east`, `tanahun`, `chitwan` …) plus `bodies_recorded_sum_of_districts` (explicitly not the
national total). Quirk: the pre-event baseline (26 records for 1–25 Aug) is excluded by `date_from`; the
missing register is *not* where police missing notices go (57 vs thousands elsewhere).

Fixture `w2a_police_udb.json` (3 projections), `w2a_police_udb_dist{3,4,5}.json`, and two district pages
with every `<tbody>` text node masked (`w2a_police_udb_rasuwa.html` 5 rows/no pager,
`w2a_police_udb_chitwan.html` `count=117`, 6 pages).

## volunteer_bulletin_repo — GitHub contents listing + 5 raw files

URLs (list in `sources.yaml`): `https://api.github.com/repos/nirajbhusal/rasuwa-flood-bulletin/contents/`
(60 req/h unauthenticated — fine at 60m cadence) and `raw.githubusercontent.com/…/main/{ndrrma-rescue.csv,
army-heli-rescue.csv, rasuwa-foreign-rescued.csv, rasuwa-hospital-dhunche.csv, dhm-rivers.json}`.
The earlier 404 was the bare directory URL — raw.githubusercontent.com has no directory listings; the files
themselves resolve. `family.json` / `*.json` name lists and `latest.json` (whose `body` names a rescued
child) are deliberately not pulled. `pii: true`, reliability C (a volunteer compiling official lists).

`prestore()` replaces every CSV with `{file, rows, columns, counts:{<safe column>: {value: n}}}` where safe
columns are `status nationality country location rescued_date gender Country "Rescue Date (BS)" लिंग
उद्धार मिति अवस्था` (≤ 100 distinct values each). Names, addresses, ages, remarks never leave the frame.
`dhm-rivers.json` (5 gauges, no PII) and the listing are kept as they are.

Emits (publisher `Volunteer bulletin (nirajbhusal)`, url = the raw file, `as_of = fetched_at`):
`rescued_named_listed` (ndrrma-rescue rows; scoped `status:` and `nationality:`), `rescued` scoped
`place:<gazetteer id | slug>` from its `location` column (+ `place_hints`), `heli_rescued_listed`,
`foreigners_rescued_listed` (scoped `nationality:`), `hospital_dhunche_listed` (scoped `status:` from
अवस्था), `repo_files`, and `water_level_m` scoped `station:<slug>` with `as_of = observed_at` (a second
route to the DHM levels; BIPAD stays the primary). Quirk: `csv.reader` sees 79 hospital rows where
`wc -l` says 81 — two cells hold quoted line breaks.

Fixture `w2a_volunteer_bulletin_repo.json` (6-part envelope after `prestore()`).

## heoc_sitreps — `GET https://heoc.mohp.gov.np/news` (+ the featured detail page)

The `sources.yaml` URL was a `{sitrep-slug}` template that the puller could never expand (404 in every
pull); it now points at the listing. Shape: one featured card (`news-date` "August 29, 2026",
`news-heading`, "read more" → `/news/<slug>/detail`) plus a JS template with the same classes (the
featured regex therefore anchors on `\s+class="welcome-button"`). The detail page's "other news" block
lists the previous sitreps (`news-row` → link, thumbnail, `news-detail-text`). Slugs are irregular
(`sitrep-00` is SitRep 04, `sitrep%2002`, `sitrep-03` and `sitrep-04` are both titled SitRep 03,
`TREATMENT` is the referral directive). Every sitrep body is **a base64 JPEG (~3 MB)**: no text, no OCR —
the article row has `body = None` and a `pull.note` says so. Cadence daily.

Emits `articles` (publisher `HEOC/MoHP`, lang by script): the featured item with its printed date (noon
NPT) and each "other news" item with `published_at` recovered from the thumbnail's PHP `uniqid()` file
name (`6a92d3a8c004d` → upload second; `lib.html.php_uniqid_datetime`), `None` when implausible. The
Nepali referral directive has no event keyword and is dropped by the relevance gate (by design).

Fixture `w2a_heoc_sitreps.html` + `w2a_heoc_sitreps_detail.html` (base64 images replaced).

## dao_nuwakot_rescued — post page → `.xlsx` → Storage `raw/dao_nuwakot/<sha16>.xlsx`

`GET https://daonuwakot.moha.gov.np/post/ma-ta-bha-tha-ra-…` — HTML post "मिति २०८३ भाद्र १२ गते सम्म उद्दार
गरिएका व्यक्तिहरुको विवरण" linking the same workbook three ways (`/upload/…/files/<name>.xlsx` direct,
`/assets/122/<name>.xlsx/file`, a `/pdf-viewer?file=` wrapper) plus PDFs. `find_xlsx_links()` prefers the
direct `/upload/` link. Family changed `pdf → html` in `sources.yaml` (the pulled URL is the post page).
Cadence daily, `pii: true` — the workbook (names, ages, addresses, phones) is fetched with `ctx.fetch`,
uploaded to the ARCHIVE bucket and read with `openpyxl` in memory; only counts leave `sheet_stats()`.

Workbook shape: sheet 1 "उद्दार गरेको नेपालीको विवरण" (header क्र.सं. · मिति · नामथ · लिङ्ग · अन्दाजी उमेर · ठेगाना ·
उद्दार गरेको स्थान; ~1,436 rows), sheet 2 "विदेशी  नागरिक उद्दार" (title row, then सि.न. · मिति · नामथ · ठेगाना
(= country, "भारत देश") · उमेर · लिङ · सम्पर्क नं. · उद्दार गरेको स्थान · … ; ~170 rows). Data rows = rows after
the header whose first cell is a serial number. The header row is found by "नाम"/"मिति", the location
column by "स्थान", the foreign sheet by "विदेशी" in its title.

Emits (publisher `DAO Nuwakot`, `as_of` = the BS date in the title → 2026-08-28 NPT, url = the post):
`rescued` national + scoped `place:<gazetteer id | slug>` per rescue location (+ `place_hints`),
`rescued_foreign` national + scoped `nationality:<slug>`; note = file name · sha16 · sheet. One
`articles` row for the post (body names the office and the flood so the relevance gate keeps it).

Fixture `w2a_dao_nuwakot_rescued.html` + a synthetic `w2a_dao_nuwakot_rescued.xlsx` (real headers, 12 + 5
fake rows).

## dao_rasuwa_hub — `GET https://daorasuwa.moha.gov.np/page/bha-ta-ka-sha-b-dha-bha-tha-ra`

Livewire page "भोटेकोशी बाढी (भाद्र २०८३)". Content = `.pro_contents` cards (`<a\n href>` + `<strong>title</strong>`
+ `<small>2083-05-11</small>`) and a footer "पछिल्लो अपडेट गरिएको : 2083-05-13 15:12:59". The linked pages hold
scanned PDFs (office notices; a treatment list with PII) — never fetched. Cadence daily.

Emits `articles` (publisher `DAO Rasuwa`, lang `ne`): the hub itself (`published_at` = the footer BS
timestamp → 2026-08-29 15:12 NPT) and one per card (`published_at` = card date, noon NPT; `body` = hub
title + office name, so a notice titled only "कार्यालयबाट जारी सूचना" passes the gate). BS dates via
`_common.parse_bs_datetime` on the numeric `2083-05-11` form.

Fixture `w2a_dao_rasuwa_hub.html`.

## ifrc_go — `GET https://goadmin.ifrc.org/api/v2/event/8073/` (+ `/appeal_document/?appeal=<id>`)

Shape: `{id, name "Nepal: Rasuwa Flash Flood, 2026", glide FF-2026-000162-NPL, disaster_start_date,
num_affected, updated_at, ifrc_severity_level_display, summary (HTML), appeals[{id, code MDRNP022,
atype_display, amount_requested, amount_funded, num_beneficiaries, status_display}], field_reports[{id,
summary, report_date, num_dead … num_displaced, contacts[]}], contacts[]}`. `appeal_documents` is `null`
on the event, so the appeal-document list is fetched per appeal (`{results:[{name, document_url,
created_at, type}]}`). `field_report/<id>/` returns 404 — the embedded summary is all there is.
Cadence 6h.

`prestore()` removes every `contacts` block (NRCS/IFRC staff names, emails, phones) and
`emergency_response_contact_email` before `raw_pulls`.

Emits (publisher `IFRC`, `as_of` = event `updated_at`, note = GLIDE · appeal code/type/status):
`appeal_amount_requested_chf`, `appeal_amount_funded_chf`, `appeal_beneficiaries`, `affected` (event
`num_affected` when numeric), and `dead/missing/injured/affected/displaced` from field reports when they
are numeric (`as_of = report_date`; none were on 30 Aug). `articles`: the GO event page
(`go.ifrc.org/emergencies/8073`, body = summary text), each field report (`go.ifrc.org/reports/<id>`),
each appeal document (`go-api.ifrc.org/api/DownloadFile/…`). Quirk: GO says CHF 18 M requested while the
IFRC press release says 25 M — the figure note keeps the appeal code so the site can label it.

Fixture `w2a_ifrc_go.json` (after `prestore()`) + `w2a_ifrc_go_appealdoc.json`.

## china_mwr — `GET http://www.mwr.gov.cn/xw/slyw/` (+ detail pages)

Listing: `<ul class="slnewsconlist"><li><span>2026-08-27</span><a href="./202608/t20260827_2140605.html">…</a></li>`.
Kept when the title matches 吉隆 / 堰塞湖 / 尼泊尔 / 西藏 / 错坚 / 普热普强 / 樟木 / 东林藏布. Detail pages carry
`<meta name="PubDate" content="2026-08-27 22:57:20">` (CST) and the text in the `xlcontainer` block
(cut before 作者：/责编/扫一扫). The newest 6 unseen items are fetched (state key `pages`); items already
seen or unfetchable still get an article with the listing date. Cadence 6h.

Emits `articles` (publisher `China MWR`, lang `zh`, body ≤ 2000 chars) and, only when a bulletin states
a volume in 立方米 near 堰塞湖/库容/蓄水量/水量, a figure scoped `place:barrier_lake_site` with `as_of = PubDate`
and the matched phrase as note: `barrier_lake_volume_m3` for stored water ("截至8月27日上午估算蓄水量约200万
立方米" → 2.0 Mm³, from the 27 Aug Level-IV response bulletin) and `barrier_lake_inflow_m3` when the phrase
is an inflow/outflow (入湖/来水/下泄: "未来3天入湖水量约300万立方米" → 3.0 Mm³ expected over three days).
The 27 Aug consultation and 30 Aug bulletins state no number.

Fixture `w2a_china_mwr.html` + `w2a_china_mwr_2140605.html` + `w2a_china_mwr_2140823.html`.

## china_mfa_pressers — `GET https://www.mfa.gov.cn/eng/xw/fyrbt/lxjzh/` (+ detail pages)

Listing links `./202608/t20260828_12012299.html` with the date in the file name. Pressers dated from
2026-08-26 (newest 5 unseen, state key `pages`) are fetched; only `<p>` paragraphs matching Nepal /
Gyirong / Kyirong / Tibet / Xizang / mudslide / flash flood / barrier lake / Rasuwa / glacier become the
body — a presser without such a paragraph produces no row (noted). `published_at` = `<meta
name="PubDate">` (date only, CST midnight). Titles carry no keyword, so the body is what passes the
relevance gate; without a fetcher nothing is emitted. Cadence daily.

Emits `articles` (publisher `China MFA`, lang `en`). Fixture `w2a_china_mfa_pressers.html` +
`w2a_china_mfa_pressers_0828.html`.

## us_embassy_alerts — `GET https://np.usembassy.gov/category/alert/` (+ alert pages since the event)

WordPress archive (browser UA required — `lib.http` always sends one). Entries: `<h2 class="entry-date">
August 29, 2026</h2><h2 class="entry-title"><a href=…>…</a></h2>`; titles contain NBSP/NNBSP which are
normalised. Alerts dated from the day before the event (newest 8 unseen, state key `pages`) are fetched
for their body: the text after the `meta-info-top` marker, cut at "Assistance:" (which drops the
phone/email block), PII-redacted, ≤ 2000 chars — because "Natural Disaster Alert: U.S. Embassy Kathmandu
Nepal, August 26, 2026" has no event keyword and Kathmandu alone is not a corridor place. Cadence daily.

Emits `articles` (publisher `US Embassy Kathmandu`, lang `en`, `published_at` = entry date, noon NPT).
Pre-event items ("Worldwide Caution" …) are emitted without a body and dropped by the gate.
Fixture `w2a_us_embassy_alerts.html` + `w2a_us_embassy_alerts_0829.html`.

## ndrrma_newsinfo — `GET https://ndrrma.gov.np/api/v1/pressnotenews/newsinfo/?ordering=-id&limit=40`

Shape: `{count, next, previous, results:[{id, title, title_ne, description(_ne) HTML, summary(_ne)
("None" as a string), date "2026-08-29", image}]}` — `limit=40` added (the default page is 200 cards /
2 MB). Cards older than two days before the event are skipped. Cadence 2h.

Emits `articles` (publisher `NDRRMA`): `url` = the card image (the only stable per-card URL; falls back
to the API detail URL), title `title_ne | title`, lang by script, `published_at` = `date` noon NPT,
`body` = description text with every line naming someone to call ("Contact: <name> - <phone>", सम्पर्क,
9+ digit runs) dropped and `redact_pii` applied — the relief-collection-point cards list coordinators'
names and mobiles. No figures (the amounts are prose). Fixture `w2a_ndrrma_newsinfo.json` (12 cards,
contact names → `EXAMPLE-PERSON-n`).

## ndrrma_bulletins — `GET https://ndrrma.gov.np/api/v1/bulletin/bulletins/?ordering=-id&limit=5`

Shape: `{count 2299, results:[{id, title "Daily Disaster Bulletin (27 August 2026)", title_ne, date
(publication day, the morning after), summary (EN prose "Over the past 24 hours, 51 disaster-related
incidents…"), summary_ne, pdffile, image, bulletin_type{bul_type "Daily Bulletin"}}]}`. The PDF is the
national incident table, not corridor-specific — not fetched. `limit=5` added. Cadence daily.

Emits `articles` (publisher `NDRRMA`, url = `pdffile`, `published_at` = the day in the title at 10:00 NPT,
body = summary) and `disaster_incidents_24h` (publisher `NDRRMA`, national, `as_of` = that day) parsed
from the summary. Fixture `w2a_ndrrma_bulletins.json`.

---

## Judgment calls (for the reviewer)

- **Counts, never rows.** Setu, UDB, the bulletin repo and the DAO workbook are person registries; the
  pipeline stores projections (`prestore()`) or nothing, and figures are counts by status / place /
  nationality. `person_key` is kept in the Setu projection only so revisions of the same record can be
  tracked later; it is a hash.
- **Setu `source:` scope is the reporting DAO**, not a place — the note says so; the `place:` figures
  come from the card's location text through the gazetteer.
- **UDB district list is fixed** (13 districts, 3 provinces) instead of crawling all 77 — 16 requests a
  day against a self-signed host is the budget.
- **HEOC dates from `uniqid()`** are upload times, not the sitrep's "as of"; noted in the article, never
  used for figures.
- **Relevance gate and keyword-less titles**: DAO Rasuwa notices, the DAO Nuwakot post and US Embassy
  alerts get a short factual `body` (hub title / office name / the alert text) rather than a change to the
  central keyword list, which the other lane owns.
- **China MWR volume figures** are regex-gated on an explicit 立方米 phrase near 堰塞湖/库容/蓄水量; nothing is
  inferred from press paraphrases.
