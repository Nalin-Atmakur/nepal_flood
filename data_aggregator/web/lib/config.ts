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
/** The team mailbox (owner, 30 Aug 16:30; D-070). */
export const CONTACT_EMAIL = "nepalfloodrescuers@gmail.com";

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
  { id: "neoc", label: "Disaster hotline (NEOC)", number: "1234", tel: "1234", short: "Disaster line 1234" },
];

/** Section 03 columns, in design order, mapped to `figures_latest.publisher`. */
export type Agency = {
  key: string;
  /**
   * `figures_latest.publisher` candidates, first one with a matching metric wins. The pipeline names publishers
   * precisely ("Nepal Police (via press)" when the number was quoted by a newspaper, "Nepal Police (UDB)" when it came
   * from the unidentified-bodies register), so a column lists every spelling it may draw from, best first.
   */
  publishers: string[];
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
    publishers: ["NDRRMA"],
    labelKey: "agency.ndrrma",
    url: "https://bipadportal.gov.np/",
    dead: ["dead"],
    missing: ["missing", "out_of_contact"],
    rescued: ["rescued"],
  },
  {
    key: "police",
    publishers: ["Nepal Police", "Nepal Police (via press)", "Nepal Police (UDB)"],
    labelKey: "agency.police",
    url: "https://www.nepalpolice.gov.np/",
    dead: ["dead", "bodies_recorded"],
    missing: ["missing", "out_of_contact", "missing_recorded"],
    rescued: ["rescued"],
  },
  {
    key: "mofa",
    publishers: ["MoFA"],
    labelKey: "agency.mofa",
    url: "https://mofa.gov.np/",
    dead: ["dead", "foreigners_dead"],
    missing: ["foreigners_missing", "missing", "out_of_contact"],
    rescued: ["foreigners_found", "rescued", "found"],
    noteKey: "agency.note.foreigners",
  },
  {
    key: "dot",
    publishers: ["DoT", "Dept of Tourism (via press)", "NTB (via press)", "NTB"],
    labelKey: "agency.dot",
    url: "https://www.tourism.gov.np/",
    dead: ["dead", "tourists_dead"],
    missing: ["tourists_out_of_contact", "tourists_missing", "missing", "out_of_contact"],
    rescued: ["tourists_found", "tourists_rescued", "rescued", "found"],
    noteKey: "agency.note.tourists",
  },
  {
    key: "opmcm",
    publishers: ["OPMCM portal", "OPMCM"],
    labelKey: "agency.opmcm",
    url: "https://rescue.opmcm.gov.np/",
    dead: ["dead"],
    missing: ["lost_open", "missing", "out_of_contact"],
    rescued: ["found", "rescued"],
    noteKey: "agency.note.open_reports",
  },
];

/** Section 06 gauge tiles, in design order; matched by name substring on v_gauges_latest. */
/**
 * The seven corridor gauge tiles (design §07), matched against v_gauges_latest.station_name with a pattern
 * because the DHM/BIPAD spellings differ from ours ("Bhotekoshi at Rasuwagadi", "Bhote Koshi at Shyaprubesi",
 * "Trishuli at Galchi"); the rainfall station "Trishuli at Kali Khola (Rainfall)" must not win over the river one.
 * When several rows match, the most recently observed row is shown.
 */
export const GAUGE_STATIONS: { label: string; pattern: RegExp }[] = [
  { label: "Rasuwagadhi", pattern: /rasuwagad/i },
  { label: "Syabrubesi", pattern: /bhote ?koshi at (shyapru|syabru|syaphru|syafru)/i },
  { label: "Betrawati", pattern: /^trishuli at betrawati/i },
  { label: "Dhunche", pattern: /dhunche/i },
  { label: "Galchhi", pattern: /galch/i },
  { label: "Kali Khola", pattern: /kali khola(?!.*rainfall)/i },
  { label: "Devghat", pattern: /devghat/i },
];

/** Flying-window sites (figures_latest scope prefix → i18n label key). */
export const FLYING_SITES: { placeId: string; labelKey: string }[] = [
  { placeId: "dhunche", labelKey: "place.dhunche" },
  { placeId: "langtang_village", labelKey: "place.langtang" },
];
export const FLYING_METRIC = "flying_window_quality";

/**
 * Section 02 stat cards — a RANKED candidate list; the page shows the first STAT_CARD_COUNT that exist in
 * `stats` and pass `min` (numeric ≥ min). This keeps the six cards striking on day one (no "0 people have
 * added…" card until at least 5 people have) while letting live facts from process_data ⑤ surface as they
 * appear. Sticker rotation alternates by position, not by id. See web/docs/05-home-blocks.md §02.
 */
export const STAT_CARD_COUNT = 6;
export const STAT_CARDS: { id: string; min?: number }[] = [
  { id: "wave_time_to_port" },
  { id: "wave_speed" },
  { id: "galchhi_rise" },
  { id: "bodies_downstream_km" },
  { id: "personnel_deployed", min: 1 },
  { id: "missing_hydropower", min: 1 },
  { id: "towers_restored_pct", min: 1 },
  { id: "heli_flights", min: 1 },
  { id: "missing_counts_divergence", min: 2 },
  { id: "rescued_per_day", min: 1 },
  { id: "duplicates_merged", min: 50 },
  // fallback when the percentage row is missing (same fact, "145 of 198")
  { id: "towers_restored", min: 1 },
];
export const STAT_ROTATIONS = [-0.6, 0.5, -0.4, 0.6, -0.5, 0.4];

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
