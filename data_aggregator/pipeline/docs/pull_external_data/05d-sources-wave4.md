# 05d · Sources, wave 4 — beyond the catalogue (30 Aug 2026, lane S4)

All 51 catalogued sources had normalisers by 04:30 BST. This wave asked "what did the research not catalogue?",
probed ~40 candidates live and built the four with the best rescue-value ÷ effort. Every viable candidate — built
or not — is in `sources.yaml` (ids `W4-*` in `catalogue`), so the registry stays the single list.

## 1. Shortlist

| Candidate | URL | Format | Holds | Verdict |
|---|---|---|---|---|
| Nepal Red Cross situation updates | `nrcs.org` → `website-api.nrcs.org/media/highlights/files/*.pdf` | HTML → PDF (text layer, no OCR) | relief, hospital beds, warehouses, volunteers; quotes NDRRMA totals | **built** `nrcs_situation_updates` |
| BIPAD incident/loss API | `bipadportal.gov.np/api/v1/incident/?…&expand=loss` | JSON | NEOC ward-level dead/missing/injured/families/houses | **built** `bipad_incidents` — event not yet entered (30 Aug), wired for when it is |
| ICIMOD, INSEC Online (EN), Radio Nepal (NE), Khabarhub (NE), Setopati (NE), Himalkhabar, Deshsanchar | feeds | RSS | cause/warning science; rights monitor (missing by home district); Nepali dailies | **built** `outlet_rss_set_2` |
| ReliefWeb report pages | `reliefweb.int/report/nepal/…` from the RSS | HTML (JSON-LD + `<article>`) | full text of OCHA flash updates, UN RC/HCT sitreps, WFP/IOM/WVI/NRCS updates | **built** `reliefweb_reports` |
| DAO Dhading / Chitwan / Gorkha | `dao{dhading,chitwan,gorkha}.moha.gov.np` | HTML (same CMS as DAO Rasuwa) | nothing flood-specific on 30 Aug | registered `dao_downstream_hubs`, `verified: false` |
| NTC news | `ntc.net.np/news` | JS-rendered | tower restoration notices | registered `ntc_news`, false — needs a browser; outlets relay the same |
| MoHA | `moha.gov.np` | HTML | one directive (unclaimed bodies) | registered `moha_notices`, false |
| NEA notices | `nea.org.np/notices` | bot challenge (TSPD) | outage notices | registered `nea_notices`, false |
| IPPAN | `ippan.org.np` | HTML | nothing published | registered `ippan_statements`, false |
| ReliefWeb API | `api.reliefweb.int/v1` 410 · `/v2` 403 (needs an approved appname) | — | — | not viable; HTML route used instead |
| Nepal Army news, NEOC, Republica RSS, THT RSS, Setopati EN RSS, ekantipur RSS, tourism.gov.np notices, UNOSAT products, hydrology.gov.np | 404 / 000 / empty / JS | — | — | not viable |
| Rasuwa local outlets (rasuwakhabar, rasuwaonline) | connection refused | — | — | not viable |
| Telegram / X / Facebook | no open API | — | — | skipped by rule |
| Volunteer Google Sheets | none found public | — | — | none |

## 2. `nrcs_situation_updates`

```
 nrcs.org ──▶ PDF_RE over the page ──▶ pdf_links(): …Situation_Update_N.pdf (newest first) + Press_release_*.pdf, ≤ 6
          ──▶ ctx.fetch(pdf) ──▶ pdf_text() (pypdf) ──▶ parse_update()
                                                      ├─ as_of: latest "<d> August 2026" in the text, noon NPT
                                                      ├─ figures: dead_quoted 579 · missing_quoted 1,924 · rescued_quoted 4,451 ·
                                                      │           personnel_{army,police,apf}_quoted · nrcs_volunteers · ambulances_deployed ·
                                                      │           families_reached · people_sheltering_nuwakot   (first match each)
                                                      └─ article: "NRCS Rasuwa flood situation update #N", body = 3,000-char excerpt
```
Quirks: the homepage embeds the PDF URLs in `srcset`-like attributes rather than plain anchors — the regex runs over the
whole page. `_quoted` metrics carry the note "quoting the NDRRMA situation report" so figures_latest never ranks
them above NDRRMA's own row. Press releases give an article only. Nothing is uploaded to Storage (no PII).
Failure: no PDF links → one note; a PDF without a text layer → note, skipped.

## 3. `bipad_incidents`

```
 /api/v1/incident/?incident_on__gt=2026-08-25…&limit=500&expand=loss
   ──▶ prestore(): per incident keep id/title/titleNe/times/hazard/wards/point/streetAddress/dataSource/source/verified
                   + loss.{*Count} only  (drops createdBy, detail, description, estimatedLoss …)
   ──▶ normalise(): incidentOn ≥ 26 Aug and hazard ∈ {flood, flash flood, landslide, heavy rainfall, GLOF, avalanche}
                    (hazard = the word before " at " in the title; the numeric `hazard` id is not a stable vocabulary)
        ├─ per incident: incident_{dead,missing,injured,people_affected,families_affected,families_evacuated,
        │                houses_destroyed,bridges_destroyed,roads_destroyed} > 0, scope place:<gazetteer id> | incident:<id>
        └─ national: bipad_flood_{incidents,dead,missing,injured} with the "event not yet entered" note
```
On 30 Aug 04:55 UTC the API held 144 incidents since 25 Aug, none for the Bhote Koshi event (unrelated daily
floods/landslides elsewhere → 15 rows in the fixture). When NEOC enters the event, ward-level official losses arrive
here without code changes; the note text should then be retired.

## 4. `outlet_rss_set_2`

Envelope of 7 feeds → `_rss.feed_to_articles` (the same code path as `outlet_rss_set`, relevance gate included). ICIMOD
supplies cause/warning pieces ("Standing in solidarity…", "Major flash flood sweeps…"); INSEC EN tracks missing
people by home province ("22 of 171 missing persons from Madhesh…"); the Nepali feeds add Radio Nepal, Khabarhub,
Setopati, Himal and Deshsanchar. Setopati/Himal items have no `pubDate` → `published_at` falls back to the feed's
own hints or stays null (dated items sort first on the site since migration 009).

## 5. `reliefweb_reports`

```
 updates/rss.xml?search=rasuwa ──▶ report_links(): newest ≤ 8 /report/ links
   ──▶ ctx.fetch(page) ──▶ parse_report(): JSON-LD headline · datePublished · abstract
                                           source org = first <a href="/organization/…">  →  publisher "<org> (via ReliefWeb)"
                                           body = <article> text (abstract prepended), ≤ 8,000 chars
                                           figures: first "N dead|deaths|killed|bodies", "N missing", "N rescued", "N injured", "N displaced" → *_quoted
```
`reliefweb_rss` (feed summaries) stays as is; this id adds the bodies. Because `articles` upserts are
ignore-duplicates by design, the source carries `enrich_bodies: true` in `sources.yaml`: after the normal upsert the
puller calls `Db.enrich_article_bodies()` which PATCHes body/publisher/published_at of the existing rows by URL
(never title, places, extracted or source_id). Fetches are per run (8 pages, 60-min cadence)
— ReliefWeb serves the HTML without a challenge under the browser UA. Figures are "as written" quotes (note carries
the report title) and are never mapped into the site's agency columns.

## 6. Candidates with `verified: false`

`select_due()` skips them on the schedule (no parser yet, no point fetching), but `--only <id>` still fetches them so a
future normaliser can be developed against the live page without touching the flag first.

## 7. Running

```
pipeline/.venv/bin/python db/seed/gen_sources.py && pipeline/.venv/bin/python db/apply.py --only seed
pipeline/.venv/bin/python pipeline/pull_external_data.py --only nrcs_situation_updates,bipad_incidents,outlet_rss_set_2,reliefweb_reports --force
pipeline/.venv/bin/python -m pytest pipeline/tests/test_normalisers_w4.py -q
```
