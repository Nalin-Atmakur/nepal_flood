"""
lib/config.py — every constant the pipeline reads, in one place.
Documented in docs/pull_external_data/02-scheduling.md (cadence, PULL_INTERVAL_MINUTES)
and docs/process_data/08-llm-budget.md (LLM caps).

Environment is loaded from pipeline/.env by `load_env()` (a tiny loader: KEY=VALUE lines,
`#` comments, optional quotes). Secrets are never printed.
"""
from __future__ import annotations

import os
import re
from datetime import datetime, timedelta, timezone
from pathlib import Path

PIPELINE_DIR = Path(__file__).resolve().parent.parent
ROOT_DIR = PIPELINE_DIR.parent                      # data_aggregator/
SOURCES_YAML = ROOT_DIR / "sources.yaml"
GAZETTEER_CSV = ROOT_DIR / "gazetteer" / "places.csv"
STATE_PATH = PIPELINE_DIR / "_state.json"
SNAPSHOT_DIR = PIPELINE_DIR / "snapshots"
FIXTURE_DIR = PIPELINE_DIR / "tests" / "fixtures"
RUN_LOG = PIPELINE_DIR / "run.log"

# The cron cadence. The website reads the same number for "AUTO-REFRESH EVERY N MIN" and
# for its stale-banner threshold (see plan: "PULL_INTERVAL_MINUTES constant drives copy").
PULL_INTERVAL_MINUTES = int(os.environ.get("PULL_INTERVAL_MINUTES", "240"))
STALE_AFTER_MINUTES = PULL_INTERVAL_MINUTES + 45

# HTTP (docs/pull_external_data/03-fetching.md)
USER_AGENT = (
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 "
    "(KHTML, like Gecko) Chrome/126.0 Safari/537.36 nepalfloodtracker/1.0"
)
HTTP_TIMEOUT_S = 20
HTTP_RETRIES = 2
HTTP_BACKOFF_S = 1.5
MAX_PAGES = 60                      # hard cap for any paginated source
MAX_BODY_BYTES = 25 * 1024 * 1024   # refuse bodies above this

# Source cadence strings in sources.yaml → minutes (docs/pull_external_data/02-scheduling.md)
STATIC_MINUTES = 10 ** 9            # "static (fetch once)": due only when never fetched
PULL_WORKERS = int(os.environ.get("PULL_WORKERS", "6"))          # concurrent fetchers (normalise + writes stay on the main thread)
BACKOFF_CAP_MINUTES = 24 * 60       # a failing source is retried after cadence × 2^failures, never later than this
DEFAULT_CADENCE_MINUTES = 60


def cadence_minutes(cadence: str | None) -> int:
    """'30m' → 30 · '2h' → 120 · 'daily' → 1440 · '2/day …' → 720 · 'static …' → STATIC_MINUTES."""
    if not cadence:
        return DEFAULT_CADENCE_MINUTES
    c = cadence.strip().lower()
    if c.startswith("static"):
        return STATIC_MINUTES
    if c.startswith("daily"):
        return 1440
    m = re.match(r"(\d+)\s*/\s*day", c)
    if m:
        return max(1, 1440 // int(m.group(1)))
    m = re.match(r"(\d+)\s*(m|min|h|hr|d)", c)
    if m:
        n, unit = int(m.group(1)), m.group(2)[0]
        return n if unit == "m" else n * 60 if unit == "h" else n * 1440
    return DEFAULT_CADENCE_MINUTES


# Event constants
KTM = timezone(timedelta(hours=5, minutes=45))
EVENT_START_UTC = datetime(2026, 8, 26, 2, 55, tzinfo=timezone.utc)   # 08:40 NPT collapse
GAUGE_ALIVE_HOURS = 2               # gauges.alive = observed within this many hours of fetch

# Open-Meteo corridor sites (sources.yaml lists Dhunche; Langtang is in its comment)
OPENMETEO_SITES = {
    "dhunche": (28.11, 85.30),
    "langtang_village": (28.21, 85.51),
}
OPENMETEO_HOURS = 72
FLYING_WINDOW_HOURS_LOCAL = (6, 11)       # morning window, NPT
FLYING_GOOD_MAX_LOW_CLOUD_PCT = 40.0
FLYING_GOOD_MAX_PRECIP_MM = 3.0

# Corridor gauges, matched on BIPAD `title` (BIPAD ids differ from DHM ids). Order = display order.
CORRIDOR_GAUGES = [
    ("Bhotekoshi at Rasuwagadi", "rasuwagadhi", "Rasuwagadhi"),
    ("Bhote Koshi at Shyaprubesi", "syabrubesi", "Syabrubesi"),
    ("Langtang Khola at Shyaprubesi", "syabrubesi", "Langtang Khola"),
    ("Trishuli at Betrawati", "betrawati", "Betrawati"),
    ("Phalakhu Khola at Betrawati", "betrawati", "Phalakhu"),
    ("Trishuli Khola at Dhunche", "dhunche", "Dhunche"),
    ("Trishuli at Galchi", "galchhi", "Galchhi"),
    ("Trishuli at Furke Khola(Malekhu)", "malekhu", "Malekhu"),
    ("Trishuli River at Kali Khola", "kali_khola", "Kali Khola"),
    ("Narayani at Devghat", "devghat", "Devghat"),
    ("Trishuli River at Bhorle", "bhorle", "Bhorle"),
]

# OPMCM person-reports
OPMCM_TYPES = ("lost", "found", "rescued")
OPMCM_PAGE_LIMIT = 200

# NDRRMA publications: PII lists — store the PDF, never extract (docs/pull_external_data/05-sources.md)
NDRRMA_PII_PUBLICATION_IDS = {373, 377, 380, 381, 383, 384}
NDRRMA_PII_TITLE_RE = re.compile(r"list|विवरण|नामावली", re.I)
STORAGE_BUCKET = "raw"

# LLM (docs/process_data/08-llm-budget.md)
LLM_MODEL = "gpt-4o-mini"
LLM_PRICE_PER_M_INPUT_USD = 0.15
LLM_PRICE_PER_M_OUTPUT_USD = 0.60
LLM_MAX_CALLS_PER_RUN = 40
LLM_MAX_INPUT_CHARS = 6000
LLM_CORRIDOR_KEYWORDS = re.compile(
    r"rasuwa|nuwakot|trishuli|trisuli|bhote ?koshi|bhotekoshi|langtang|rasuwagadhi|timure|syabru|"
    r"dhunche|betrawati|gyirong|kerung|kyirong|mailung|galchhi|galchi|malekhu|devighat|"
    r"रसुवा|नुवाकोट|त्रिशूली|त्रिशुली|भोटेकोशी|लाङटाङ|रसुवागढी|टिमुरे|स्याफ्रु|धुन्चे|बेत्रावती|केरुङ|मैलुङ|गल्छी|मलेखु",
    re.I,
)

# Article relevance gate (docs/pull_external_data/04-normalising.md §relevance). An article is kept only
# if title+summary matches this list OR resolves to a gazetteer place (normalisers/_rss.is_relevant).
ARTICLE_RELEVANCE_KEYWORDS = re.compile(
    r"flood|flash[- ]?flood|glacier|glacial|GLOF|landslide|mudslide|rescue|missing|unaccounted|out of contact|"
    r"rasuwa|rasuwagad|timure|syabru|syaphru|langtang|dhunche|bhote ?koshi|bhotekoshi|trishuli|trisuli|betrawati|"
    r"nuwakot|gyirong|kerung|kyirong|kailash|pilgrim|hydropower|tunnel|NDRRMA|barrier lake|dam burst|"
    r"heavy rain|heavy rainfall|body bag|bodies recovered|unreached|foreign nationals|MoFA|NEOC|"
    r"बाढी|बाढि|रसुवा|भोटेकोशी|त्रिशूली|त्रिशुली|बेपत्ता|सम्पर्कविहीन|सम्पर्कबाहिर|उद्धार|लाङटाङ|लाङ्टाङ|धुन्चे|टिमुरे|"
    r"स्याफ्रु|हिमताल|पहिरो|केरुङ|रसुवागढी|भारी वर्षा|शव|"
    r"बाढ़|लापता|बचाव|रसुवा|भोटेकोशी|त्रिशूली|हिमस्खलन|"
    r"吉隆|洪水|泥石流|尼泊尔|樟木|失联|救援",
    re.I,
)

# Dedup (docs/process_data/02-dedup.md)
DEDUP_MERGE_THRESHOLD = 0.9
DEDUP_QUEUE_THRESHOLD = 0.6

# Processing
REPORT_WITHDRAW_GRACE_MINUTES = 15
ARTICLE_LOOKBACK_DAYS = 14


def load_env(path: Path | None = None) -> dict[str, str]:
    """Load KEY=VALUE pairs from pipeline/.env into os.environ (existing values win)."""
    p = path or (PIPELINE_DIR / ".env")
    loaded: dict[str, str] = {}
    if not p.exists():
        return loaded
    for line in p.read_text(encoding="utf-8").splitlines():
        s = line.strip()
        if not s or s.startswith("#") or "=" not in s:
            continue
        k, v = s.split("=", 1)
        k, v = k.strip(), v.strip()
        if len(v) >= 2 and v[0] == v[-1] and v[0] in "\"'":
            v = v[1:-1]
        if k and k not in os.environ:
            os.environ[k] = v
        loaded[k] = v
    return loaded


def env(key: str, default: str | None = None) -> str | None:
    return os.environ.get(key, default)


def openai_budget_usd() -> float:
    try:
        return float(os.environ.get("OPENAI_BUDGET_USD", "20"))
    except ValueError:
        return 20.0


def family_report_processing_enabled() -> bool:
    """Whether private questionnaire rows may enter the automated pipeline.

    Read this at runtime because ``process_data.py`` loads ``pipeline/.env`` after
    importing this module. Missing, empty, and unrecognised values fail closed.
    """
    return os.environ.get("FAMILY_REPORT_PROCESSING_ENABLED", "false").strip().lower() in {
        "1", "true", "yes", "on",
    }
