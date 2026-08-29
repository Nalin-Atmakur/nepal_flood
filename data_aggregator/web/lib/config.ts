/**
 * Site-wide constants. One place for everything that must stay truthful across
 * copy, stale thresholds and links. See web/docs/01-architecture.md.
 */

/** Pipeline cadence in minutes. Drives "AUTO-REFRESH EVERY …" and the stale banner. */
export const PULL_INTERVAL_MINUTES = 240;

/** The stale banner appears when the last processed run is older than this. */
export const STALE_AFTER_MINUTES = PULL_INTERVAL_MINUTES * 1.5;

/** /sources colours "last fetched" green below this, amber above. */
export const SOURCE_OK_MINUTES = PULL_INTERVAL_MINUTES * 2;

export const SITE_URL = "https://nepalfloodtracker.com";
export const SITE_HOST = "nepalfloodtracker.com";
export const CONTACT_EMAIL = "contact@nepalfloodtracker.com";

/** All times on the site are shown in Nepal time. */
export const TIME_ZONE = "Asia/Kathmandu";
export const TIME_ZONE_LABEL = "NPT";

/** The event. */
export const EVENT_DATE_ISO = "2026-08-26";
export const EVENT_DATE_BS = "10 Bhadra 2083";

/** Corridor geometry used by the 3D panel and the place page. */
export const CORRIDOR_LENGTH_KM = 72;
export const CORRIDOR_HEIGHT_EXAGGERATION = 1.5;

/** Official channels — exact text from the design's official-channels bar. */
export type OfficialChannel = {
  id: string;
  label: string;
  number?: string;
  tel?: string;
  email?: string;
  short: string;
};
export const OFFICIAL_CHANNELS: OfficialChannel[] = [
  { id: "police", label: "Police", number: "1155", tel: "1155", short: "Police 1155" },
  { id: "tourist_police", label: "Tourist Police", number: "1144", tel: "1144", short: "Tourist Police 1144" },
  {
    id: "mofa",
    label: "MoFA Emergency Control Room",
    number: "+977-9744441227",
    tel: "+9779744441227",
    email: "emergency@mofa.gov.np",
    short: "MoFA ECR",
  },
  { id: "red_cross", label: "Nepal Red Cross", number: "1130", tel: "1130", short: "Red Cross 1130" },
  { id: "neoc", label: "NEOC", number: "1149", tel: "1149", short: "NEOC 1149" },
];

/** Section 03 columns, in design order, mapped to `figures_latest.publisher`. */
export type Agency = {
  key: string;
  publisher: string;
  /** i18n key for the column header */
  labelKey: string;
  url: string;
  /** metric candidates per row, first match wins */
  dead: string[];
  missing: string[];
  rescued: string[];
  /** i18n key for a note prefix on the missing/rescued cells ("foreigners ·") */
  noteKey?: string;
};
export const AGENCIES: Agency[] = [
  {
    key: "ndrrma",
    publisher: "NDRRMA",
    labelKey: "agency.ndrrma",
    url: "https://bipadportal.gov.np/",
    dead: ["dead"],
    missing: ["missing", "out_of_contact"],
    rescued: ["rescued"],
  },
  {
    key: "police",
    publisher: "Nepal Police",
    labelKey: "agency.police",
    url: "https://www.nepalpolice.gov.np/",
    dead: ["dead"],
    missing: ["missing", "out_of_contact"],
    rescued: ["rescued"],
  },
  {
    key: "mofa",
    publisher: "MoFA",
    labelKey: "agency.mofa",
    url: "https://mofa.gov.np/",
    dead: ["dead", "foreigners_dead"],
    missing: ["foreigners_missing", "missing", "out_of_contact"],
    rescued: ["foreigners_found", "rescued", "found"],
    noteKey: "agency.note.foreigners",
  },
  {
    key: "dot",
    publisher: "DoT",
    labelKey: "agency.dot",
    url: "https://www.tourism.gov.np/",
    dead: ["dead", "tourists_dead"],
    missing: ["tourists_out_of_contact", "tourists_missing", "missing", "out_of_contact"],
    rescued: ["tourists_found", "tourists_rescued", "rescued", "found"],
    noteKey: "agency.note.tourists",
  },
  {
    key: "opmcm",
    publisher: "OPMCM",
    labelKey: "agency.opmcm",
    url: "https://rescue.opmcm.gov.np/",
    dead: ["dead"],
    missing: ["lost_open", "missing", "out_of_contact"],
    rescued: ["found", "rescued"],
    noteKey: "agency.note.open_reports",
  },
];

/** Section 06 gauge tiles, in design order; matched by name substring on v_gauges_latest. */
export const GAUGE_STATIONS = [
  "Rasuwagadhi",
  "Syabrubesi",
  "Betrawati",
  "Dhunche",
  "Galchhi",
  "Kali Khola",
  "Devghat",
] as const;

/** Flying-window sites (figures_latest scope prefix → i18n label key). */
export const FLYING_SITES: { placeId: string; labelKey: string }[] = [
  { placeId: "dhunche", labelKey: "place.dhunche" },
  { placeId: "langtang_village", labelKey: "place.langtang" },
];
export const FLYING_METRIC = "flying_window_quality";

/** Section 02 stat ids in design order, with the sticker rotation per card. */
export const STAT_CARDS: { id: string; rot: number }[] = [
  { id: "wave_time_to_port", rot: -0.6 },
  { id: "wave_speed", rot: 0.5 },
  { id: "galchhi_rise", rot: -0.4 },
  { id: "bodies_downstream_km", rot: 0.6 },
  { id: "missing_counts_divergence", rot: -0.5 },
  { id: "reports_total", rot: 0.4 },
];

/** Respondent types, in design order, with the CTA card colours from the artboards. */
export type RespondentType = "family" | "survivor" | "rescuer" | "agency";
export const RESPONDENT_TYPES: { id: RespondentType; bg: string; fg: string }[] = [
  { id: "family", bg: "#2438e8", fg: "#ffffff" },
  { id: "survivor", bg: "#ffb800", fg: "#1a1a1a" },
  { id: "rescuer", bg: "#148a4e", fg: "#ffffff" },
  { id: "agency", bg: "#141419", fg: "#ffffff" },
];
export function isRespondentType(x: unknown): x is RespondentType {
  return x === "family" || x === "survivor" || x === "rescuer" || x === "agency";
}

/** /sources group order and the letter in the circle badge. */
export const SOURCE_GROUPS: { grp: string; badge: string; labelKey: string }[] = [
  { grp: "government", badge: "G", labelKey: "sources.group.government" },
  { grp: "humanitarian", badge: "U", labelKey: "sources.group.humanitarian" },
  { grp: "geospatial", badge: "S", labelKey: "sources.group.geospatial" },
  { grp: "signals", badge: "SG", labelKey: "sources.group.signals" },
  { grp: "news", badge: "N", labelKey: "sources.group.news" },
  { grp: "community", badge: "C", labelKey: "sources.group.community" },
];

/** Client-side rate limit for the report box. */
export const RATE_LIMIT = { minGapSeconds: 20, perHour: 20 };

/** How long the "We understood" screen polls for a summary, and how often. */
export const UNDERSTOOD_POLL = { everyMs: 5000, forMs: 90000 };

/** Scoreboard refresh cadence (v_live_counts poll). */
export const SCOREBOARD_POLL_MS = 60000;

/** Web Speech API language per route language. */
export const SPEECH_LANG: Record<"en" | "ne" | "hi", string> = {
  en: "en-US",
  ne: "ne-NP",
  hi: "hi-IN",
};

/**
 * "AUTO-REFRESH EVERY 4 H" / "EVERY 15 MIN" — Latin only (set in Press Start 2P).
 */
export function refreshLabel(minutes: number = PULL_INTERVAL_MINUTES): string {
  if (minutes >= 60 && minutes % 60 === 0) return `EVERY ${minutes / 60} H`;
  return `EVERY ${minutes} MIN`;
}

/** Human cadence for body copy: "4 hours" / "15 minutes" (English fragment; see messages for localised forms). */
export function cadenceParts(minutes: number = PULL_INTERVAL_MINUTES): { n: number; unit: "hours" | "minutes" } {
  if (minutes >= 60 && minutes % 60 === 0) return { n: minutes / 60, unit: "hours" };
  return { n: minutes, unit: "minutes" };
}
