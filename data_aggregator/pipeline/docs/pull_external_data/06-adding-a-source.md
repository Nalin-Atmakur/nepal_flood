# 06 — adding a source (numbered steps)

```
   sources.yaml ─▶ normalisers/<id>.py ─▶ tests/fixtures/<id>.<ext> ─▶ tests/test_normalisers.py ─▶ sources table ─▶ --only <id>
```

1. **Register it in `../sources.yaml`** under `sources:`:
   ```yaml
   - id: my_source                # stable slug = module name = sources.id in the DB
     family: json_api             # json_api | post_api | rss | html | s3 | gcs | stac | pdf | fdsn | mediawiki
     url: https://example.org/api/things?page={n}     # string, list, {a|b} alternatives, {n} paging
     auth: none                   # none | key | account | browser_ua | "none (self-signed TLS …)"
     cadence: 60m                 # 10m 30m 60m 2h 6h daily "2/day (…)" "static (fetch once)"
     format: json
     holds: one line on what it holds
     pii: false                   # true → you MUST write prestore()
     parser: notes for the normaliser
     catalogue: X1
     verified: C
   ```
   Wave-2 sources may stop here: the puller stores `raw_pulls` + `pulls` without a normaliser.
2. **Write `normalisers/my_source.py`** from the template in [../../normalisers/README.md](../../normalisers/README.md):
   `SOURCE_ID`, `PUBLISHER`, `normalise(raw, fetched_at, source, ctx=None)`; use `parts(raw)`,
   `NormalisedRows.figure()/article()/gauge()/hint()`, `ctx.resolve()` for `place:` scopes,
   `_common.parse_dt` / `parse_bs_datetime` for times. Give every figure an `as_of` the publisher
   stated (else it defaults to `fetched_at`). If `pii: true`, add `prestore(parts, ctx)` that
   removes identifiers and adds `person_key` via `lib.text.person_key` **before** anything is
   stored. Module docstring cites `docs/pull_external_data/05-sources.md §my_source`.
3. **Capture a fixture** from the live endpoint into a scratch directory (curl with a browser UA),
   then add a block to `tests/build_fixtures.py` and run
   `.venv/bin/python tests/build_fixtures.py <capture_dir>`. Anonymise: pass PII sources through
   your `prestore()`, replace real names with `EXAMPLE-PERSON-n`, phones with `98XXXXXXXX`
   (`scrub()`), drop photos/base64. Multi-url sources are stored as an envelope
   (`make_envelope([Part(url=…, body=…), …])`). Keep it small (trim lists to ≤ 30 rows).
4. **Add a test** in `tests/test_normalisers.py`: register the fixture name in `FIXTURES` (this
   automatically runs the PII sweep `test_no_pii_in_output` for it) and write
   `test_my_source(ctx, now)` asserting a few concrete values (a metric, a scope, an `as_of`,
   an article title). Run `.venv/bin/python -m pytest tests -q`.
5. **Seed the `sources` table** so the `pulls.source_id` foreign key accepts the id: regenerate
   `../db/seed/sources.sql` with `../db/seed/gen_sources.py` and apply it with `../db/apply.py`
   (the other lane's tooling). Without this row every `pulls` insert for the source fails with
   a foreign-key error (`pull.log_failed` in the log).
6. **Dry-run it live**: `.venv/bin/python pull_external_data.py --only my_source --dry-run --verbose`
   and read the `pull.source` / `pull.note` lines; then `--only my_source` for real and check
   `select * from v_sources_status where id = 'my_source'` and the RAW tables.
7. **Document it**: a section in `05-sources.md` (endpoint, shape, quirks, metrics/scopes,
   fixture) and, if it feeds a processing step, the relevant `docs/process_data/*.md`.
