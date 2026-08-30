import en from "@/messages/en.json";
import ne from "@/messages/ne.json";
import hi from "@/messages/hi.json";
import zh from "@/messages/zh.json";

/** See web/docs/03-i18n.md. */
export const LANGS = ["en", "ne", "hi", "zh"] as const;
export type Lang = (typeof LANGS)[number];
export const DEFAULT_LANG: Lang = "en";

export const LANG_LABELS: Record<Lang, string> = {
  en: "EN",
  ne: "नेपाली",
  hi: "हिन्दी",
  zh: "中文",
};

export const LANG_NAMES: Record<Lang, string> = {
  en: "English",
  ne: "नेपाली",
  hi: "हिन्दी",
  zh: "中文",
};

/** BCP-47 tags for <html lang>, hreflang and the Web Speech API. */
export const LANG_TAGS: Record<Lang, string> = { en: "en", ne: "ne-NP", hi: "hi-IN", zh: "zh-CN" };

type Dict = Record<string, string>;
const dictionaries: Record<Lang, Dict> = { en, ne, hi, zh };

export function isLang(x: string | undefined | null): x is Lang {
  return !!x && (LANGS as readonly string[]).includes(x);
}

/** Coerce anything to a Lang, defaulting to English. */
export function asLang(x: string | undefined | null): Lang {
  return isLang(x) ? x : DEFAULT_LANG;
}

export type Vars = Record<string, string | number>;

function interpolate(s: string, vars?: Vars): string {
  if (!vars) return s;
  return s.replace(/\{(\w+)\}/g, (m, k: string) => (k in vars ? String(vars[k]) : m));
}

/** Message lookup with EN fallback, then the key itself. `{name}` placeholders are interpolated. */
export function t(lang: Lang, key: string, vars?: Vars): string {
  const s = dictionaries[lang]?.[key] ?? dictionaries.en[key] ?? key;
  return interpolate(s, vars);
}

/** A bound translator for a page: `const tr = tr(lang); tr("home.title")`. */
export function translator(lang: Lang) {
  return (key: string, vars?: Vars) => t(lang, key, vars);
}

/** Pick a localised column from a row (name_en / name_ne / name_hi …) with EN fallback. */
export function localised<T extends Record<string, unknown>>(row: T, base: string, lang: Lang): string {
  const v = row[`${base}_${lang}`];
  if (typeof v === "string" && v.length) return v;
  const fallback = row[`${base}_en`];
  return typeof fallback === "string" ? fallback : "";
}

/** Does a key exist in the EN dictionary (used to translate DB enums safely)? */
export function hasKey(key: string): boolean {
  return key in dictionaries.en;
}

/** Translate a DB enum value if a `prefix.value` key exists, else show the raw value. */
export function tEnum(lang: Lang, prefix: string, value: string | null | undefined, empty = "—"): string {
  if (!value) return empty;
  const key = `${prefix}.${value}`;
  return hasKey(key) ? t(lang, key) : value;
}

/**
 * The language prefix, built from LANGS so it can never fall behind them again: a hard-coded (en|ne|hi) meant
 * that switching away from Chinese produced /ne/zh and a 404 (owner, 30 Aug).
 */
const LANG_PREFIX = new RegExp(`^/(${LANGS.join("|")})(?=/|$)`);

/** Strip the language prefix from a pathname: /ne/places/timure → /places/timure */
export function stripLang(pathname: string): string {
  return pathname.replace(LANG_PREFIX, "") || "/";
}

/** The language a pathname is under: /zh/places → "zh"; anything else → English. */
export function langFromPath(pathname: string): Lang {
  return asLang(LANG_PREFIX.exec(pathname)?.[1]);
}

/** Build a localised href: href("ne", "/places/timure") → /ne/places/timure */
export function href(lang: Lang, path: string = "/"): string {
  const p = path.startsWith("/") ? path : `/${path}`;
  return p === "/" ? `/${lang}` : `/${lang}${p}`;
}

export const dictionariesForTests = dictionaries;
