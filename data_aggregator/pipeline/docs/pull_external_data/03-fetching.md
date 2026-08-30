# 03 — fetching: `lib/http.py`, url expansion, pagination, `raw_pulls` + `pulls`

```
   source.url ──▶ requests_for(src) ──▶ [{url, method, json, paged, verify}]
        │            │  list → each · "{a|b|c}" alternatives (nested ok) · openmeteo_corridor → config.OPENMETEO_SITES
        │            │  post_api family → POST (bodies in POST_BODIES) · unresolved "{slug}" → skipped
        ▼            ▼
   fetch_source ─▶ lib.http.get / post ─▶ Fetched(url, status, body, headers, etag, last_modified, sha256,
        │                                        fetched_at, elapsed_s, not_modified, error)
        │            single url, not paged, not --force → If-None-Match / If-Modified-Since from _state.json
        │            "{n}" → page=1,2,… or offset=0,limit,2·limit,… until empty / non-200 / MAX_PAGES=60
        │            bipad_river_stations → follow "next" until empty page or BIPAD_MAX_PAGES=10
        ▼
   parts: [Part(url, status, body, last_modified, error)]  ─▶ prestore() ─▶ raw bytes
        │            1 part → body as-is · n parts → envelope {"__parts__":[…]}
        ▼
   sha256(raw) == state.body_hash ? unchanged=true : store body
        │            body ≤ INLINE_BODY_MAX (2 MiB) → raw_pulls.body · larger → Storage raw/<id>/<date>/<ts>.<ext>
        ▼
   raw_pulls row (returning id) ─▶ pulls row (ok, unchanged, http_status, bytes, raw_pull_id, error)
```

## HTTP (`lib/http.py`)

| setting | value | constant |
|---|---|---|
| User-Agent | Chrome-like desktop UA + `nepalfloodtracker/1.0` | `config.USER_AGENT` |
| timeout | 20 s | `HTTP_TIMEOUT_S` |
| retries | 2, backoff 1.5 s × attempt, on connection errors / 429 / 5xx | `HTTP_RETRIES`, `HTTP_BACKOFF_S` |
| body cap | 25 MiB (`Content-Length` or actual) → `error="body too large"` | `MAX_BODY_BYTES` |
| conditional | `If-None-Match` / `If-Modified-Since` → 304 → `Fetched.not_modified=True`, empty body | |
| TLS | `verify=False` only when `auth` in sources.yaml mentions `self-signed` (police_udb) | |
| IPv4 | `lib/net.force_ipv4()` at import — DNS64 IPv6 addresses hang this laptop | |

`get()`/`post()` never raise; problems land in `Fetched.error` (`http 404`, `ConnectionError`,
`ReadTimeout`, …) and `http.failed` is logged.

## Threads (§5)

`session()` keeps one `requests.Session` per thread (`threading.local`), so the puller's fetch pool
(02-scheduling, `PULL_WORKERS=6`) never shares a connection pool between threads. Normalisers that fetch
sub-resources through `Context.fetch` run on the main thread and get its session. Nothing in this module
writes shared state.

## URL forms in `sources.yaml` and what the puller does

| form | example | result |
|---|---|---|
| plain string | `https://rescue.opmcm.gov.np/api/stats` | one GET |
| list | `outlet_rss_set` (13 feeds) | one part per url, enveloped |
| `{a\|b\|c}` | `dhm.gov.np/mfd/api/{three-days-forecast-latest\|country-forecast\|weather\|mountain/all-info}` | 4 GETs |
| nested | `ndrrma.gov.np/api/v1/rescues/{rescued-persons/?limit=500&offset={n} \| status-counts/ \| …}` | 5 endpoints, first paginated by offset (step = `limit`) |
| `{n}` with `page=` | `person-reports?type={lost\|found\|rescued}&limit=200&page={n}` | 3 × pages 1..60 until an empty `items`/`results` |
| `post_api` | `dhm_riverwatch_post` (empty POST), `china_search_apis` (JSON bodies from `POST_BODIES`) | POST |
| special | `openmeteo_corridor` | one url per site in `config.OPENMETEO_SITES` (Dhunche 28.11/85.30, Langtang 28.21/85.51), 4 forecast days, Asia/Kathmandu |
| unresolved template | `heoc_sitreps` `{sitrep-slug}`, `ntc_restoration_articles` `(derived …)` | skipped (`pull.skip_no_url` or no requests) |

`_page_empty()` stops pagination when the JSON has an empty `results` / `items` / `features` /
`data` list (also inside `data`), or when a DRF `next` is null.

## `raw_pulls` and `pulls`

| column | value |
|---|---|
| `raw_pulls.body` | decoded text of the single body or of the envelope; `null` when `unchanged` or when stored in Storage |
| `raw_pulls.storage_path` | `raw/<id>/<YYYY-MM-DD>/<ts>.<ext>` when body > 2 MiB (`ext` from `format`: json / xml / html / txt) |
| `raw_pulls.unchanged` | sha256 of the stored bytes equals `_state.json` `body_hash` (never with `--force`) |
| `raw_pulls.projected_at` | set by process_data ⓪ for `opmcm_person_reports` |
| `pulls` | one row per attempt: `ok`, `unchanged`, `http_status` (max over parts; 304 for not-modified), `bytes`, `raw_pull_id`, `error` (≤ 500 chars) |

The hash is computed **after** `prestore()`, so a PII source whose only change is a photo URL
still counts as unchanged. In local mode the same bytes go to `snapshots/<id>/<ts>.<ext>` and
no `pulls` row exists.

## Failure behaviour

- all parts failed → `pulls.ok=false`, error = first three part errors, no `raw_pulls` row
- some parts failed → stored; the normaliser sees `Part.ok=False` and reports it in `notes`
  (`pull.note` lines)
- 304 → `pulls.ok=true, unchanged=true, http_status=304`, nothing else touched
- body too large / decode problems → part error, handled as above
