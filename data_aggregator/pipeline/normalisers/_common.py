"""Small helpers shared by normalisers (not a normaliser itself: leading underscore = not registered)."""
from __future__ import annotations

import html as _html
import re
from datetime import datetime, timezone
from typing import Any

from dateutil import parser as dtparser

from lib import config
from lib.text import nfc, nepali_digits, to_int


def parse_dt(s: str | None, default_tz=timezone.utc) -> datetime | None:
    if not s:
        return None
    try:
        dt = dtparser.parse(str(s))
    except (ValueError, OverflowError, TypeError):
        return None
    if dt.tzinfo is None:
        dt = dt.replace(tzinfo=default_tz)
    return dt.astimezone(timezone.utc)


def strip_tags(s: str | None) -> str:
    t = re.sub(r"<script.*?</script>|<style.*?</style>", " ", s or "", flags=re.S | re.I)
    t = re.sub(r"<br\s*/?>|</p>|</div>|</li>|</tr>|</h\d>", "\n", t, flags=re.I)
    t = re.sub(r"<[^>]+>", " ", t)
    t = _html.unescape(t)
    t = re.sub(r"[ \t\r\f\v]+", " ", t)
    t = re.sub(r"\n\s*\n+", "\n", t)
    return nfc(t).strip()


def num(s: Any) -> int | None:
    return to_int(str(s)) if s is not None else None


# ---- Bikram Sambat (2083 only, the event year) ------------------------------------------------
# Month starts for 2083 BS in AD. Bhadra 1 = 2026-08-17 (verified: "13 Bhadra" = 29 Aug in the
# sitreps). Lengths follow the published 2083 calendar; only months 4–7 matter for this event.
_BS_2083_STARTS = {
    4: datetime(2026, 7, 17, tzinfo=config.KTM),   # Shrawan
    5: datetime(2026, 8, 17, tzinfo=config.KTM),   # Bhadra
    6: datetime(2026, 9, 17, tzinfo=config.KTM),   # Asoj
    7: datetime(2026, 10, 17, tzinfo=config.KTM),  # Kartik
}
_BS_MONTHS = {
    "बैशाख": 1, "वैशाख": 1, "जेठ": 2, "जेष्ठ": 2, "असार": 3, "आषाढ": 3, "साउन": 4, "श्रावण": 4, "भदौ": 5, "भाद्र": 5,
    "असोज": 6, "आश्विन": 6, "कात्तिक": 7, "कार्तिक": 7, "मंसिर": 8, "मङ्सिर": 8, "पुस": 9, "पौष": 9, "माघ": 10,
    "फागुन": 11, "फाल्गुन": 11, "चैत": 12, "चैत्र": 12,
}
_BS_TEXT_RE = re.compile(r"(२०८३|2083)?\s*(" + "|".join(_BS_MONTHS) + r")\s*([०-९0-9]{1,2})")
_BS_NUM_RE = re.compile(r"(?:२०८३|2083)[./\-](०?[०-९]|0?\d)[./\-]([०-९0-9]{1,2})")
_TIME_RE = re.compile(r"(बिहान|दिउँसो|दिउसो|साँझ|बेलुका|राति|राती)?\s*([०-९0-9]{1,2})\s*[ःः:.]?\s*([०-९0-9]{2})?\s*बजे")


def bs_to_ad(month: int, day: int) -> datetime | None:
    start = _BS_2083_STARTS.get(month)
    if not start or day < 1 or day > 32:
        return None
    from datetime import timedelta
    return start + timedelta(days=day - 1)


def parse_bs_datetime(text: str) -> datetime | None:
    """Find a 2083-BS date (text or numeric form) and an optional Nepali clock time → UTC."""
    t = nfc(text)
    m = _BS_TEXT_RE.search(t)
    month = day = None
    if m:
        month, day = _BS_MONTHS[m.group(2)], int(nepali_digits(m.group(3)))
    else:
        m2 = _BS_NUM_RE.search(t)
        if m2:
            month, day = int(nepali_digits(m2.group(1))), int(nepali_digits(m2.group(2)))
    if month is None or day is None:
        return None
    base = bs_to_ad(month, day)
    if base is None:
        return None
    hour, minute = 0, 0
    tm = _TIME_RE.search(t)
    if tm:
        period, h, mi = tm.group(1), int(nepali_digits(tm.group(2))), int(nepali_digits(tm.group(3) or "0"))
        if period in ("दिउँसो", "दिउसो", "साँझ", "बेलुका", "राति", "राती") and h < 12:
            h += 12
        hour, minute = h % 24, mi % 60
    return base.replace(hour=hour, minute=minute).astimezone(timezone.utc)


def clean_scope(s: str) -> str:
    from lib.text import slugify
    return slugify(s)
