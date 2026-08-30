# 15 · /sources — every source, and exactly what we extracted from it

```
  sources ⋈ pulls ──────────── v_sources_status ─┐   (server, ISR 5 min)          row (md+) · card (phones)
  figures / articles counts ── v_source_counts ───┤──▶ app/[lang]/sources/page.tsx  ──▶ SourceRow (server: strings, grade)
                                                  │                                        └─▶ SourceExtract (client)
  newest ≤ 40 figures/source ─ v_source_figures_recent ─┐  fetched on first "▸"                 ▸ button (aria-expanded)
  newest ≤ 8 headlines/source  v_source_articles_recent ─┘  anon key, cached per row            panel: counts · figures · headlines
```

1. **Views** (`db/migrations/012_source_extracts.sql`, public): `v_source_counts` (figures_total, articles_total,
   last_row_at per source — gauges have no source id, so no gauge count), `v_source_figures_recent` (row_number ≤ 40
   per source by as_of then fetched_at), `v_source_articles_recent` (≤ 8). The RAW tables stay revoked for anon;
   `db/tests/test_views.py::test_source_extract_views_public_and_raw_denied` checks both sides.
2. **Row** — `components/blocks/SourceExtract.tsx` renders the row and, when open, a second `<tr>` spanning all
   columns: derived sources show their "computed from" note; "this site" shows its holds line; others fetch once via
   `fetchSourceExtract()` (`lib/queries.ts`) and list metric · scope · value · as-of · link (+ note) and the headline
   titles. Empty → the dashed empty state with the cadence. The counts line under "What it holds" is server-rendered.
3. **Phones (below `md`)** — no table: each source is a card (`SourceExtract layout="card"`, same data and the same
   panel body as the row) — grade circle · name · last-fetched in the staleness colour · what it holds · counts line ·
   visit · a 44 px ▸ that opens the extract panel full-width under the card. The table (`hidden md:block`) is what
   renders from `md` up. `tests/e2e/sources-cards.spec.ts` asserts cards at 390 px, ≥44 px toggles, two open panels,
   `scrollWidth === innerWidth` and Latin digits; long figure lists scroll vertically inside the panel (max 360 px).
4. **Adding a source** changes nothing here: any normaliser that writes `figures`/`articles` with its `source_id`
   appears automatically.
