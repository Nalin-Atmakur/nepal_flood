/**
 * Number and time formatting. Numbers are always Latin digits (design rule), times are Nepal time.
 * See web/docs/02-design-system.md and web/docs/03-i18n.md.
 */
import { PULL_INTERVAL_MINUTES, TIME_ZONE, cadenceParts } from "./config";
import { t, type Lang } from "./i18n";

/** "4 hours" / "15 minutes" / "1 hour" — the pipeline cadence in body copy, localised. */
export function fmtCadence(lang: Lang = "en", minutes: number = PULL_INTERVAL_MINUTES): string {
  const { n, unit } = cadenceParts(minutes);
  if (unit === "hours") return n === 1 ? t(lang, "time.cadence_hour_1", { n }) : t(lang, "time.cadence_hours", { n });
  return t(lang, "time.cadence_minutes", { n });
}

const MONTHS: Record<Lang, string[]> = {
  en: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"],
  ne: ["जन", "फेब", "मार्च", "अप्रिल", "मे", "जुन", "जुलाई", "अग", "सेप्ट", "अक्टो", "नोभे", "डिसे"],
  hi: ["जन", "फ़र", "मार्च", "अप्रैल", "मई", "जून", "जुल", "अग", "सित", "अक्टू", "नव", "दिस"],
};

/** 2498 → "2,498". Latin digits in every language. */
export function fmtInt(n: number | string | null | undefined): string {
  if (n === null || n === undefined || n === "") return "—";
  const v = typeof n === "string" ? Number(n) : n;
  if (!Number.isFinite(v)) return String(n);
  return new Intl.NumberFormat("en-US", { maximumFractionDigits: 2 }).format(v);
}

type Parts = { day: number; month: number; year: number; hour: string; minute: string };

function parts(iso: string | Date): Parts | null {
  const d = typeof iso === "string" ? new Date(iso) : iso;
  if (Number.isNaN(d.getTime())) return null;
  const f = new Intl.DateTimeFormat("en-GB", {
    timeZone: TIME_ZONE,
    day: "numeric",
    month: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
  const p: Record<string, string> = {};
  for (const x of f.formatToParts(d)) p[x.type] = x.value;
  return {
    day: Number(p.day),
    month: Number(p.month),
    year: Number(p.year),
    hour: p.hour === "24" ? "00" : p.hour,
    minute: p.minute,
  };
}

/** "2026-08-26" — the Nepal-time calendar day of an instant (groups the event timeline by day). */
export function nptDay(iso: string | Date | null | undefined): string | null {
  if (!iso) return null;
  const p = parts(iso);
  if (!p) return null;
  return `${p.year}-${String(p.month).padStart(2, "0")}-${String(p.day).padStart(2, "0")}`;
}

/** "29 Aug" */
export function fmtDay(iso: string | Date | null | undefined, lang: Lang = "en"): string {
  if (!iso) return "—";
  const p = parts(iso);
  if (!p) return "—";
  return `${p.day} ${MONTHS[lang][p.month - 1]}`;
}

/** "18:30" */
export function fmtTime(iso: string | Date | null | undefined): string {
  if (!iso) return "—";
  const p = parts(iso);
  return p ? `${p.hour}:${p.minute}` : "—";
}

/** "29 Aug 18:30" */
export function fmtDayTime(iso: string | Date | null | undefined, lang: Lang = "en"): string {
  if (!iso) return "—";
  const p = parts(iso);
  if (!p) return "—";
  return `${p.day} ${MONTHS[lang][p.month - 1]} ${p.hour}:${p.minute}`;
}

/** "as of 29 Aug 18:30" — every number carries this. */
export function fmtAsOf(iso: string | Date | null | undefined, lang: Lang = "en"): string {
  if (!iso) return t(lang, "time.as_of_unknown");
  return t(lang, "time.as_of", { t: fmtDayTime(iso, lang) });
}

/** Same calendar day in Nepal time? */
export function isSameDay(a: string | Date, b: string | Date = new Date()): boolean {
  const pa = parts(a), pb = parts(b);
  return !!pa && !!pb && pa.day === pb.day && pa.month === pb.month && pa.year === pb.year;
}

/** Headline time: "17:42" if today, else "29 Aug". */
export function fmtWhen(iso: string | Date | null | undefined, lang: Lang = "en", now: Date = new Date()): string {
  if (!iso) return "—";
  return isSameDay(iso, now) ? fmtTime(iso) : fmtDay(iso, lang);
}

export function minutesSince(iso: string | Date | null | undefined, now: Date = new Date()): number | null {
  if (!iso) return null;
  const d = typeof iso === "string" ? new Date(iso) : iso;
  if (Number.isNaN(d.getTime())) return null;
  return Math.max(0, Math.round((now.getTime() - d.getTime()) / 60000));
}

/** "4 min ago" / "1 h 20 min ago" / "3 h ago" / "2 days ago" — localised. */
export function fmtAgo(iso: string | Date | null | undefined, lang: Lang = "en", now: Date = new Date()): string {
  const m = minutesSince(iso, now);
  if (m === null) return t(lang, "time.never");
  if (m < 1) return t(lang, "time.just_now");
  if (m < 60) return t(lang, "time.min_ago", { n: m });
  const h = Math.floor(m / 60), r = m % 60;
  if (h < 24) return r ? t(lang, "time.h_min_ago", { h, m: r }) : t(lang, "time.h_ago", { h });
  return t(lang, "time.days_ago", { n: Math.floor(h / 24) });
}

/** Scoreboard: "4 MIN" / "2 H 14 MIN" — Latin only, set in Press Start 2P. */
export function fmtSinceArcade(iso: string | Date | null | undefined, now: Date = new Date()): string {
  const m = minutesSince(iso, now);
  if (m === null) return "—";
  if (m < 60) return `${m} MIN`;
  const h = Math.floor(m / 60), r = m % 60;
  return r ? `${h} H ${r} MIN` : `${h} H`;
}

/** "Opmcm Stats" → "OPMCM stats"; keeps known acronyms upper-case. */
const ACRONYMS = new Set([
  "opmcm", "ndrrma", "mofa", "dhm", "bipad", "ifrc", "gdacs", "hdx", "hot", "dor", "nesra", "ntc", "cdse",
  "hf", "oam", "stac", "rss", "s3", "api", "apis", "mwr", "mfa", "us", "heoc", "dao", "udb", "emsr927", "unosat",
  "rimes", "un", "ocha", "usgs", "fdsn", "taan", "nma", "neoc", "npt",
]);
export function prettySourceName(name: string | null | undefined, id?: string): string {
  const raw = (name && name.trim()) || (id ?? "").replace(/_/g, " ");
  return raw
    .split(/\s+/)
    .map((w, i) => {
      const lw = w.toLowerCase();
      if (ACRONYMS.has(lw)) return lw.toUpperCase();
      return i === 0 ? w.charAt(0).toUpperCase() + w.slice(1) : lw;
    })
    .join(" ");
}

/** Hostname of a URL for link labels: "https://bipadportal.gov.np/x" → "bipadportal.gov.np" */
export function hostOf(url: string | null | undefined): string {
  if (!url) return "";
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return url;
  }
}

/** Diacritic-insensitive, case-insensitive key for alias search. Works for Latin and Devanagari. */
export function normaliseKey(s: string): string {
  return s
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[़॑-॔]/g, "")
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\s]/gu, " ")
    .replace(/\s+/g, " ")
    .trim();
}
