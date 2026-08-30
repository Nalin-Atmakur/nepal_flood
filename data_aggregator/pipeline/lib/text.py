"""
lib/text.py — text normalisation, transliteration and hashing used by every normaliser and step.
See docs/pull_external_data/04-normalising.md (PII stripping, keys) and docs/process_data/01-resolve-places.md.

Functions
  nfc(s)                    unicode NFC
  strip_diacritics(s)       remove combining marks (Latin only; Devanagari is left intact)
  nepali_digits(s)          '२,४९८' → '2,498'   (also Hindi = same block; Chinese full-width digits)
  to_int(s) / to_number(s)  tolerant number parsing after digit mapping ('1३' mixed digits ok)
  script_of(s)              'deva' | 'latn' | 'hans' | 'mixed' | 'none'
  lang_of(s)                'ne' | 'en' | 'zh' | 'hi'? (hi only when the caller says the source is Hindi)
  dev_to_latin(s)           Devanagari → Latin (IAST-ish, no diacritics) good enough for matching
  latin_to_dev(s)           crude Latin → Devanagari (for symmetric alias generation only)
  match_key(s, skeleton)    script-independent key: 'Syabrubesi' == 'स्याफ्रुबेसी' == 'Shyaprubesi'
  slugify(s)                'Bhote Koshi at Shyaprubesi' → 'bhote_koshi_at_shyaprubesi'
  normalise_phone(s)        Nepali/Indian numbers → '+9779841234567' / '+919812345678' | None
  person_key(...)           sha256 of phone, else of (name key + age band + nationality)
  group_key(...)            sha256 of normalised operator / project / group text
  jaro_winkler(a, b)        similarity 0..1 for dedup scoring
"""
from __future__ import annotations

import hashlib
import re
import unicodedata

# ─── unicode basics ──────────────────────────────────────────────────────────

def nfc(s: str | None) -> str:
    return unicodedata.normalize("NFC", s or "")


def strip_diacritics(s: str | None) -> str:
    """Remove Latin combining marks (é→e). Devanagari matras are *not* combining-stripped here."""
    out = []
    for ch in unicodedata.normalize("NFD", s or ""):
        cat = unicodedata.category(ch)
        if cat == "Mn" and not (0x0900 <= ord(ch) <= 0x097F):
            continue
        out.append(ch)
    return unicodedata.normalize("NFC", "".join(out))


_DIGIT_MAP = {}
for _base in (0x0966, 0x09E6, 0xFF10):  # Devanagari, Bengali, full-width
    for _i in range(10):
        _DIGIT_MAP[chr(_base + _i)] = str(_i)


def nepali_digits(s: str | None) -> str:
    return "".join(_DIGIT_MAP.get(ch, ch) for ch in (s or ""))


_NUM_RE = re.compile(r"-?\d[\d,]*\.?\d*")


def to_number(s: str | None) -> float | None:
    if s is None:
        return None
    t = nepali_digits(str(s)).replace(" ", "")
    m = _NUM_RE.search(t)
    if not m:
        return None
    try:
        return float(m.group(0).replace(",", ""))
    except ValueError:
        return None


def to_int(s: str | None) -> int | None:
    n = to_number(s)
    return int(round(n)) if n is not None else None


# ─── script / language ───────────────────────────────────────────────────────

_DEVA = re.compile(r"[ऀ-ॿ]")
_CJK = re.compile(r"[一-鿿㐀-䶿]")
_LATN = re.compile(r"[A-Za-z]")


def script_of(s: str | None) -> str:
    s = s or ""
    d, c, l = bool(_DEVA.search(s)), bool(_CJK.search(s)), bool(_LATN.search(s))
    n = sum([d, c, l])
    if n == 0:
        return "none"
    if n > 1:
        # dominant script by character count
        counts = {"deva": len(_DEVA.findall(s)), "hans": len(_CJK.findall(s)), "latn": len(_LATN.findall(s))}
        best = max(counts, key=counts.get)  # type: ignore[arg-type]
        return best if counts[best] >= 0.6 * sum(counts.values()) else "mixed"
    return "deva" if d else "hans" if c else "latn"


_HINDI_HINTS = re.compile(r"(है|हैं|था|थे|की|के|का|में|और|से|को|पर|भारतीय|बाढ़|हुआ|हुई|गया|गए)")
_NEPALI_HINTS = re.compile(r"(छ|छन्|हो|भएको|गरेको|को|का|मा|र |बाढी|पुग्यो|भेटिए|गरिएको|लाई|हरू)")


def lang_of(s: str | None, hint: str | None = None) -> str:
    """'ne' | 'hi' | 'en' | 'zh'. Devanagari text is 'ne' unless Hindi markers dominate or hint='hi'."""
    sc = script_of(s)
    if sc == "hans":
        return "zh"
    if sc == "deva" or (sc == "mixed" and _DEVA.search(s or "")):
        if hint == "hi":
            return "hi"
        h = len(_HINDI_HINTS.findall(s or ""))
        n = len(_NEPALI_HINTS.findall(s or ""))
        return "hi" if h > n and h >= 2 else "ne"
    return hint or "en"


# ─── transliteration (Devanagari ↔ Latin), matching-grade ────────────────────

_VOWELS = {
    "अ": "a", "आ": "aa", "इ": "i", "ई": "ii", "उ": "u", "ऊ": "uu", "ऋ": "ri", "ए": "e", "ऐ": "ai",
    "ओ": "o", "औ": "au", "ऍ": "e", "ऑ": "o",
}
_MATRAS = {
    "ा": "aa", "ि": "i", "ी": "ii", "ु": "u", "ू": "uu", "ृ": "ri", "े": "e", "ै": "ai", "ो": "o", "ौ": "au",
    "ॅ": "e", "ॉ": "o",
}
_CONS = {
    "क": "k", "ख": "kh", "ग": "g", "घ": "gh", "ङ": "ng", "च": "ch", "छ": "chh", "ज": "j", "झ": "jh", "ञ": "n",
    "ट": "t", "ठ": "th", "ड": "d", "ढ": "dh", "ण": "n", "त": "t", "थ": "th", "द": "d", "ध": "dh", "न": "n",
    "प": "p", "फ": "ph", "ब": "b", "भ": "bh", "म": "m", "य": "y", "र": "r", "ल": "l", "व": "v", "श": "sh",
    "ष": "sh", "स": "s", "ह": "h", "ळ": "l", "क़": "q", "ख़": "kh", "ग़": "g", "ज़": "z", "ड़": "r", "ढ़": "rh",
    "फ़": "f", "य़": "y",
}
_VIRAMA = "्"
_ANUSVARA = "ं"
_CHANDRABINDU = "ँ"
_VISARGA = "ः"
_NUKTA = "़"


def dev_to_latin(s: str | None) -> str:
    """Devanagari → Latin without diacritics. Inherent 'a' is kept except word-finally (schwa deletion)."""
    s = nfc(s)
    out: list[str] = []
    i, n = 0, len(s)
    while i < n:
        ch = s[i]
        nxt = s[i + 1] if i + 1 < n else ""
        if ch in _CONS:
            base = _CONS[ch]
            if nxt == _NUKTA:  # nukta forms
                i += 1
                nxt = s[i + 1] if i + 1 < n else ""
            out.append(base)
            if nxt == _VIRAMA:
                i += 2
                continue
            if nxt in _MATRAS:
                out.append(_MATRAS[nxt])
                i += 2
                continue
            # inherent vowel unless at word end
            at_end = (i + 1 >= n) or not (s[i + 1] in _CONS or s[i + 1] in _VOWELS or s[i + 1] in _MATRAS
                                           or s[i + 1] in (_ANUSVARA, _CHANDRABINDU, _VISARGA))
            if not at_end:
                out.append("a")
            i += 1
            continue
        if ch in _VOWELS:
            out.append(_VOWELS[ch]); i += 1; continue
        if ch in _MATRAS:
            out.append(_MATRAS[ch]); i += 1; continue
        if ch in (_ANUSVARA, _CHANDRABINDU):
            out.append("n"); i += 1; continue
        if ch == _VISARGA:
            out.append("h"); i += 1; continue
        if ch == _VIRAMA or ch == _NUKTA or ch == "‍" or ch == "‌":
            i += 1; continue
        if ch in "।॥":
            out.append(". "); i += 1; continue
        out.append(_DIGIT_MAP.get(ch, ch)); i += 1
    return "".join(out)


_L2D = [
    ("chh", "छ"), ("kh", "ख"), ("gh", "घ"), ("ng", "ङ"), ("ch", "च"), ("jh", "झ"), ("th", "थ"), ("dh", "ध"),
    ("ph", "फ"), ("bh", "भ"), ("sh", "श"), ("k", "क"), ("g", "ग"), ("c", "च"), ("j", "ज"), ("t", "त"),
    ("d", "द"), ("n", "न"), ("p", "प"), ("f", "फ"), ("b", "ब"), ("m", "म"), ("y", "य"), ("r", "र"), ("l", "ल"),
    ("v", "व"), ("w", "व"), ("s", "स"), ("h", "ह"), ("z", "ज"), ("q", "क"), ("x", "क्स"),
]
_L2D_VOWEL_INIT = {"aa": "आ", "a": "अ", "ii": "ई", "ee": "ई", "i": "इ", "uu": "ऊ", "oo": "ऊ", "u": "उ",
                   "ai": "ऐ", "au": "औ", "e": "ए", "o": "ओ"}
_L2D_MATRA = {"aa": "ा", "a": "", "ii": "ी", "ee": "ी", "i": "ि", "uu": "ू", "oo": "ू", "u": "ु",
              "ai": "ै", "au": "ौ", "e": "े", "o": "ो"}


def latin_to_dev(s: str | None) -> str:
    """Crude Latin → Devanagari; used only to widen alias generation, never for display."""
    s = strip_diacritics(s).lower()
    out: list[str] = []
    i, n = 0, len(s)
    prev_cons = False
    while i < n:
        matched = False
        for pat, dev in _L2D:
            if s.startswith(pat, i):
                if prev_cons:
                    out.append(_VIRAMA)
                out.append(dev)
                i += len(pat)
                prev_cons = True
                matched = True
                break
        if matched:
            continue
        for length in (2, 1):
            v = s[i:i + length]
            if v and v in _L2D_VOWEL_INIT:
                out.append(_L2D_MATRA[v] if prev_cons else _L2D_VOWEL_INIT[v])
                i += length
                prev_cons = False
                matched = True
                break
        if matched:
            continue
        if prev_cons and s[i] in " -_,./":
            out.append(_VIRAMA)
        out.append(s[i])
        prev_cons = False
        i += 1
    if prev_cons:
        out.append(_VIRAMA)
    return "".join(out)


_COLLAPSE = [
    ("chh", "c"), ("ch", "c"), ("kh", "k"), ("gh", "g"), ("jh", "j"), ("th", "t"), ("dh", "d"),
    ("ph", "p"), ("bh", "b"), ("sh", "s"), ("ee", "i"), ("oo", "u"), ("aa", "a"), ("ii", "i"), ("uu", "u"),
    ("x", "ks"), ("q", "k"), ("z", "j"), ("w", "b"), ("v", "b"), ("f", "p"), ("c", "k"),
]


def match_key(s: str | None, skeleton: bool = True) -> str:
    """
    Script-independent comparison key. `skeleton=True` also drops vowels (except a leading one)
    and maps p→b, so 'Syabrubesi' / 'Syaphrubesi' / 'Shyaprubesi' / 'स्याफ्रुबेसी' all give 'sybrbs'.
    Chinese text is returned NFC-lowercased with spaces removed (matched by substring elsewhere).
    """
    s = nfc(s)
    if not s:
        return ""
    if script_of(s) == "hans":
        return re.sub(r"\s+", "", s.lower())
    if _DEVA.search(s):
        s = dev_to_latin(s)
    s = strip_diacritics(s).lower()
    s = re.sub(r"[^a-z0-9]+", "", s)
    for a, b in _COLLAPSE:
        s = s.replace(a, b)
    s = re.sub(r"(.)\1+", r"\1", s)
    if skeleton:
        s = s.replace("p", "b")
        if s:
            s = s[0] + re.sub(r"[aeiou]", "", s[1:])
        s = re.sub(r"(.)\1+", r"\1", s)
    return s


def slugify(s: str | None) -> str:
    s = nfc(s)
    if _DEVA.search(s):
        s = dev_to_latin(s)
    s = strip_diacritics(s).lower()
    s = re.sub(r"[^a-z0-9]+", "_", s).strip("_")
    return s[:60] or "unknown"


# ─── phones & keys ───────────────────────────────────────────────────────────

_PHONE_CHARS = re.compile(r"[^\d+]")


def normalise_phone(s: str | None) -> str | None:
    """
    Nepal / India numbers to E.164-ish. Accepts '98XXXXXXXX', '+977 98…', '0098…', '9779…',
    Indian '+91 98…' / '09876543210' / '9876543210'. Returns None when it does not look like one.
    Ambiguous 10-digit numbers starting with 9 are Nepali if they start with 97/98 (mobile) and
    Indian otherwise (Indian mobiles start 6–9; Nepali mobiles are 97x/98x).
    """
    if not s:
        return None
    t = nepali_digits(str(s))
    t = _PHONE_CHARS.sub("", t)
    if t.startswith("00"):
        t = "+" + t[2:]
    digits = t.lstrip("+")
    if len(digits) < 7 or len(digits) > 15:
        return None
    if t.startswith("+977") and len(digits) == 13:
        return "+" + digits
    if t.startswith("+91") and len(digits) == 12:
        return "+" + digits
    if t.startswith("+"):
        return "+" + digits
    if digits.startswith("977") and len(digits) == 13:
        return "+" + digits
    if digits.startswith("91") and len(digits) == 12 and digits[2] in "6789":
        return "+" + digits
    if len(digits) == 11 and digits[0] == "0":
        digits = digits[1:]
    if len(digits) == 10:
        if digits.startswith(("97", "98")):
            return "+977" + digits
        if digits[0] in "6789":
            return "+91" + digits
        if digits[0] == "0":
            return "+977" + digits[1:]
    if 7 <= len(digits) <= 9 and digits[0] in "01":  # Nepali landline w/ area code
        return "+977" + digits.lstrip("0")
    return None


def age_band(age: int | float | str | None) -> str | None:
    a = to_int(str(age)) if age is not None else None
    if a is None or a < 0 or a > 120:
        return None
    return "0-17" if a < 18 else "18-39" if a < 40 else "40-64" if a < 65 else "65+"


def sha256(s: str) -> str:
    return hashlib.sha256(s.encode("utf-8")).hexdigest()


def name_key(name: str | None) -> str:
    """Non-skeleton match key for a person name, tokens sorted so 'Ram Bahadur' == 'Bahadur Ram'."""
    toks = [match_key(t, skeleton=False) for t in re.split(r"[\s,.-]+", nfc(name)) if t]
    toks = [t for t in toks if t]
    return " ".join(sorted(toks))


def person_key(*, phone: str | None = None, passport: str | None = None, name: str | None = None,
               age: int | float | str | None = None, nationality: str | None = None) -> str | None:
    """
    sha256 of the strongest identifier available (never stored raw):
      phone  → 'phone:' + E.164     passport → 'passport:' + upper alnum
      name   → 'name:' + name_key + '|' + age_band + '|' + nationality key
    """
    p = normalise_phone(phone)
    if p:
        return sha256("phone:" + p)
    if passport:
        pp = re.sub(r"[^A-Z0-9]", "", passport.upper())
        if len(pp) >= 6:
            return sha256("passport:" + pp)
    nk = name_key(name)
    if nk:
        return sha256(f"name:{nk}|{age_band(age) or ''}|{match_key(nationality or '', skeleton=False)}")
    return None


def group_key(*parts: str | None) -> str | None:
    toks = [match_key(p, skeleton=False) for p in parts if p]
    toks = [t for t in toks if t]
    if not toks:
        return None
    return sha256("group:" + "|".join(sorted(toks)))


# ─── similarity ──────────────────────────────────────────────────────────────

def jaro_winkler(a: str, b: str, prefix_scale: float = 0.1) -> float:
    if not a or not b:
        return 0.0
    if a == b:
        return 1.0
    la, lb = len(a), len(b)
    win = max(la, lb) // 2 - 1
    if win < 0:
        win = 0
    ma = [False] * la
    mb = [False] * lb
    matches = 0
    for i in range(la):
        lo, hi = max(0, i - win), min(lb, i + win + 1)
        for j in range(lo, hi):
            if not mb[j] and a[i] == b[j]:
                ma[i] = mb[j] = True
                matches += 1
                break
    if matches == 0:
        return 0.0
    t = 0
    k = 0
    for i in range(la):
        if ma[i]:
            while not mb[k]:
                k += 1
            if a[i] != b[k]:
                t += 1
            k += 1
    t //= 2
    jaro = (matches / la + matches / lb + (matches - t) / matches) / 3
    prefix = 0
    for i in range(min(4, la, lb)):
        if a[i] == b[i]:
            prefix += 1
        else:
            break
    return jaro + prefix * prefix_scale * (1 - jaro)


_PHONE_IN_TEXT = re.compile(r"(?<![\w])(?:\+?\d[\d\-\s().]{6,}\d)(?![\w])")
_EMAIL_IN_TEXT = re.compile(r"[\w.+-]+@[\w-]+\.[\w.-]+")
_PASSPORT_IN_TEXT = re.compile(r"\b[A-Z]{1,2}\s?\d{6,8}\b")


def redact_pii(text: str | None, names: list[str] | None = None) -> str:
    """Belt-and-braces redaction applied to every free-text field before it leaves ⓪."""
    t = nfc(text)
    t = _EMAIL_IN_TEXT.sub("[email]", t)
    t = _PHONE_IN_TEXT.sub("[phone]", t)
    t = _PASSPORT_IN_TEXT.sub("[id]", t)
    for nm in names or []:
        nm = nfc(nm).strip()
        if len(nm) >= 3:
            t = re.sub(re.escape(nm), "[name]", t, flags=re.I)
            for tok in re.split(r"\s+", nm):
                if len(tok) >= 4:
                    t = re.sub(r"\b" + re.escape(tok) + r"\b", "[name]", t, flags=re.I)
    return t
