/**
 * Every database read the website makes, in one file — this is the contract with the DERIVED zone
 * and the public reference tables (db/migrations/003_derived.sql, 004_rls.sql).
 *
 * Server functions use the anon server client and return null when Supabase is not configured or the
 * query fails, so every block renders an EmptyState instead of crashing. The two "own rows" reads at
 * the bottom take a browser client because they depend on the visitor's anonymous session (RLS).
 *
 * Public reads only: figures_latest, place_status (+ v_place_status_latest), stats, report_counts,
 * place_timeline, places, sources (+ v_sources_status), gauges (+ v_gauges_latest), v_live_counts,
 * v_articles_recent, submissions_log, event_timeline, digest. Own-row reads: users, reports_archive.
 * Nothing else, ever.
 *
 * See web/docs/01-architecture.md, web/docs/05-home-blocks.md and web/docs/13-story-and-digest.md.
 */
import type { SupabaseClient } from "@supabase/supabase-js";
import { serverClient } from "./supabase";
import { FLYING_METRIC, STAT_CARDS } from "./config";
import { normaliseBullets, pickDigest } from "./story";

// ---------------------------------------------------------------------------
// Row types
// ---------------------------------------------------------------------------

export type LiveCounts = {
  submissions_10m: number;
  submissions_today: number;
  submissions_total: number;
  last_pull_at: string | null;
  last_processed_at: string | null;
};

export type FigureLatest = {
  publisher: string;
  metric: string;
  scope: string;
  value: number;
  as_of: string | null;
  url: string | null;
  note: string | null;
  computed_at?: string;
};

export type StatRow = {
  id: string;
  value: string;
  numeric: number | null;
  caption_en: string | null;
  caption_ne: string | null;
  caption_hi: string | null;
  source_url: string | null;
  as_of: string | null;
  computed_at?: string;
};

export type PlaceRef = {
  id: string;
  name_en: string;
  name_ne: string | null;
  name_hi: string | null;
  name_zh: string | null;
  aliases: string[];
  kind: string;
  district: string | null;
  municipality: string | null;
  lat: number | null;
  lon: number | null;
  elev_m: number | null;
  km: number | null;
  side: "NP" | "CN";
  in_channel: boolean;
  below_barrier_lakes: boolean;
  notes: string | null;
};

/** One row per place from v_place_status_latest (place_status ⋈ places). */
export type PlaceStatusRow = {
  place_id: string;
  as_of: string;
  expected: number;
  confirmed_reached: number;
  unknown: number;
  reports_count: number;
  last_contact_at: string | null;
  telecom_restored: boolean | null;
  phones: string | null;
  access: string | null;
  hazard: string | null;
  nearest_gauge: string | null;
  shelter: string | null;
  km: number | null;
  status_label: string | null;
  note: string | null;
  name_en: string;
  name_ne: string | null;
  name_hi: string | null;
  kind: string;
  district: string | null;
  lat: number | null;
  lon: number | null;
  side: "NP" | "CN";
};

export type PlaceTimelineRow = {
  place_id: string;
  day: string;
  what_en: string;
  what_ne: string | null;
  what_hi: string | null;
  dot: string;
  source_url: string | null;
};

export type GaugeRow = {
  station_id: string;
  station_name: string | null;
  river: string | null;
  lat: number | null;
  lon: number | null;
  level: number | null;
  warning: number | null;
  danger: number | null;
  observed_at: string;
  fetched_at: string;
  alive: boolean | null;
};

export type ArticleRow = {
  id: number;
  source_id: string | null;
  url: string;
  title: string | null;
  publisher: string | null;
  lang: string | null;
  published_at: string | null;
  places: string[];
};

export type SourceStatusRow = {
  id: string;
  name: string | null;
  grp: string | null;
  family: string;
  url: string | null;
  reliability: string | null;
  holds: string | null;
  pii: boolean;
  cadence: string | null;
  last_fetched_at: string | null;
  last_ok: boolean | null;
  last_unchanged: boolean | null;
  last_error: string | null;
};

/** The visitor's own archive rows (RLS: user_id = auth.uid()). Never rendered for anyone else. */
export type OwnReport = {
  id: string;
  created_at: string;
  lang: string;
  respondent_type: "family" | "survivor" | "rescuer" | "agency";
  text: string;
  place_id: string | null;
  contact: string | null;
  supersedes: string | null;
  withdrawn_at: string | null;
  summary_public: string | null;
  anonymised_at: string | null;
  status: "received" | "anonymised" | "processed" | "matched" | "withdrawn" | "spam";
};

export type OwnUser = { id: string; lang: string; contact: string | null; created_at: string };

/** One reconstructed event from event_timeline (db/migrations/006_story_and_digest.sql), joined to places for the name. */
export type EventTimelineRow = {
  id: string;
  at: string;
  at_label: string;
  place_id: string | null;
  km: number | null;
  what_en: string;
  what_ne: string | null;
  what_hi: string | null;
  kind: string;
  source: string | null;
  source_url: string | null;
  place_name_en: string | null;
  place_name_ne: string | null;
  place_name_hi: string | null;
};

export type DigestBullet = {
  text: string;
  kind: "figure" | "place" | "gauge" | "news";
  source_url: string | null;
};

/** One digest row (day × lang) with bullets already normalised by lib/story.ts. */
export type DigestRow = {
  day: string;
  lang: "en" | "ne" | "hi";
  headline: string | null;
  bullets: DigestBullet[];
  computed_at: string;
};

// ---------------------------------------------------------------------------
// Live counters
// ---------------------------------------------------------------------------

export async function getLiveCounts(sb: SupabaseClient | null = serverClient()): Promise<LiveCounts | null> {
  if (!sb) return null;
  const { data, error } = await sb.from("v_live_counts").select("*").maybeSingle();
  if (error || !data) return null;
  const d = data as Record<string, unknown>;
  return {
    submissions_10m: Number(d.submissions_10m ?? 0),
    submissions_today: Number(d.submissions_today ?? 0),
    submissions_total: Number(d.submissions_total ?? 0),
    last_pull_at: (d.last_pull_at as string | null) ?? null,
    last_processed_at: (d.last_processed_at as string | null) ?? null,
  };
}

// ---------------------------------------------------------------------------
// Figures (section 03, OG card)
// ---------------------------------------------------------------------------

/** All national figures, latest per publisher × metric. */
export async function getNationalFigures(): Promise<FigureLatest[] | null> {
  const sb = serverClient();
  if (!sb) return null;
  const { data, error } = await sb
    .from("figures_latest")
    .select("publisher, metric, scope, value, as_of, url, note, computed_at")
    .eq("scope", "national")
    .order("publisher");
  return error ? null : (data as FigureLatest[]);
}

/**
 * First matching metric for a publisher, in candidate order. `publisher` may be a list of spellings
 * (see `AGENCIES[].publishers`): publishers are tried in order and the first one with a matching metric wins.
 */
export function pickFigure(rows: FigureLatest[] | null, publisher: string | string[], metrics: string[]): FigureLatest | null {
  if (!rows) return null;
  for (const pub of Array.isArray(publisher) ? publisher : [publisher]) {
    const mine = rows.filter((r) => r.publisher.toLowerCase() === pub.toLowerCase());
    for (const m of metrics) {
      const hit = mine.find((r) => r.metric === m);
      if (hit) return hit;
    }
  }
  return null;
}

/** The first barrier lake's volume in m³ as last published (China MWR, scope place:barrier_lake_site), or null. */
export async function getLakeVolumeM3(): Promise<number | null> {
  const sb = serverClient();
  if (!sb) return null;
  const { data, error } = await sb
    .from("figures_latest")
    .select("value")
    .eq("metric", "barrier_lake_volume_m3")
    .order("as_of", { ascending: false })
    .limit(1);
  if (error || !data?.length) return null;
  const v = Number((data[0] as { value: number }).value);
  return Number.isFinite(v) && v > 0 ? v : null;
}

/** A bridge HOT OSM's damage survey recorded as washed out or damaged, keyed to a gazetteer place. */
export type LostBridge = { placeId: string; name: string; status: "washed out" | "damaged" };

/**
 * Bridges on the corridor that the HOT OSM survey marks washed out / damaged (figures_latest metric `bridge_status`,
 * scope `place:<id>`, note "<status> · <name> · <adm3>"). The flood simulation puts them back where they stood.
 */
export async function getLostBridges(): Promise<LostBridge[]> {
  const sb = serverClient();
  if (!sb) return [];
  const { data, error } = await sb.from("figures_latest").select("scope, note").eq("metric", "bridge_status").like("scope", "place:%");
  if (error || !data) return [];
  const out: LostBridge[] = [];
  for (const r of data as { scope: string; note: string | null }[]) {
    const [status, name] = (r.note ?? "").split(" · ");
    const st = (status ?? "").trim().toLowerCase();
    if (st !== "washed out" && st !== "damaged") continue;
    const placeId = r.scope.slice("place:".length).split("|")[0];
    if (!placeId) continue;
    out.push({ placeId, name: (name ?? "").trim() || placeId, status: st });
  }
  return out;
}

/** Flying-window forecast rows (metric = flying_window_quality, scope starts with place:<id>). */
export async function getFlyingWindows(): Promise<FigureLatest[] | null> {
  const sb = serverClient();
  if (!sb) return null;
  const { data, error } = await sb
    .from("figures_latest")
    .select("publisher, metric, scope, value, as_of, url, note, computed_at")
    .like("metric", `${FLYING_METRIC}%`)
    .like("scope", "place:%")
    .order("as_of", { ascending: true });
  return error ? null : (data as FigureLatest[]);
}

// ---------------------------------------------------------------------------
// Stats (section 02)
// ---------------------------------------------------------------------------

export async function getStats(ids: string[] = STAT_CARDS.map((s) => s.id)): Promise<StatRow[] | null> {
  const sb = serverClient();
  if (!sb) return null;
  const { data, error } = await sb.from("stats").select("*").in("id", ids);
  if (error) return null;
  const rows = data as StatRow[];
  return ids.map((id) => rows.find((r) => r.id === id)).filter((r): r is StatRow => !!r);
}

// ---------------------------------------------------------------------------
// Places (gazetteer + ledger)
// ---------------------------------------------------------------------------

const PLACE_COLS =
  "id, name_en, name_ne, name_hi, name_zh, aliases, kind, district, municipality, lat, lon, elev_m, km, side, in_channel, below_barrier_lakes, notes";

export async function getPlaces(sb: SupabaseClient | null = serverClient()): Promise<PlaceRef[] | null> {
  if (!sb) return null;
  const { data, error } = await sb.from("places").select(PLACE_COLS).order("km", { ascending: true, nullsFirst: false });
  return error ? null : (data as PlaceRef[]);
}

export async function getPlace(id: string): Promise<PlaceRef | null> {
  const sb = serverClient();
  if (!sb) return null;
  const { data, error } = await sb.from("places").select(PLACE_COLS).eq("id", id).maybeSingle();
  return error ? null : ((data as PlaceRef | null) ?? null);
}

export async function getPlaceStatuses(): Promise<PlaceStatusRow[] | null> {
  const sb = serverClient();
  if (!sb) return null;
  const { data, error } = await sb.from("v_place_status_latest").select("*").order("unknown", { ascending: false });
  return error ? null : (data as PlaceStatusRow[]);
}

export async function getPlaceStatus(id: string): Promise<PlaceStatusRow | null> {
  const sb = serverClient();
  if (!sb) return null;
  const { data, error } = await sb.from("v_place_status_latest").select("*").eq("place_id", id).maybeSingle();
  return error ? null : ((data as PlaceStatusRow | null) ?? null);
}

export async function getPlaceTimeline(id: string): Promise<PlaceTimelineRow[] | null> {
  const sb = serverClient();
  if (!sb) return null;
  const { data, error } = await sb
    .from("place_timeline")
    .select("place_id, day, what_en, what_ne, what_hi, dot, source_url")
    .eq("place_id", id)
    .order("day", { ascending: true });
  return error ? null : (data as PlaceTimelineRow[]);
}

// ---------------------------------------------------------------------------
// Gauges (section 06)
// ---------------------------------------------------------------------------

export async function getGauges(): Promise<GaugeRow[] | null> {
  const sb = serverClient();
  if (!sb) return null;
  const { data, error } = await sb.from("v_gauges_latest").select("*");
  return error ? null : (data as GaugeRow[]);
}

// ---------------------------------------------------------------------------
// Articles (section 07, place page)
// ---------------------------------------------------------------------------

const ARTICLE_COLS = "id, source_id, url, title, publisher, lang, published_at, places";

export async function getArticles(limit = 12): Promise<ArticleRow[] | null> {
  const sb = serverClient();
  if (!sb) return null;
  const { data, error } = await sb.from("v_articles_recent").select(ARTICLE_COLS).limit(limit);
  return error ? null : (data as ArticleRow[]);
}

export async function getArticlesForPlace(placeId: string, limit = 8): Promise<ArticleRow[] | null> {
  const sb = serverClient();
  if (!sb) return null;
  const { data, error } = await sb
    .from("v_articles_recent")
    .select(ARTICLE_COLS)
    .contains("places", [placeId])
    .limit(limit);
  return error ? null : (data as ArticleRow[]);
}

// ---------------------------------------------------------------------------
// Story: event timeline (section 03) and daily digest (dark card under the scoreboard)
// ---------------------------------------------------------------------------

type EventTimelineRaw = Omit<EventTimelineRow, "place_name_en" | "place_name_ne" | "place_name_hi"> & {
  places: { name_en: string; name_ne: string | null; name_hi: string | null } | null;
};

/** Every event, oldest first, with the place name in three languages (null when place_id is null). */
export async function getEventTimeline(): Promise<EventTimelineRow[] | null> {
  const sb = serverClient();
  if (!sb) return null;
  const { data, error } = await sb
    .from("event_timeline")
    .select("id, at, at_label, place_id, km, what_en, what_ne, what_hi, kind, source, source_url, places(name_en, name_ne, name_hi)")
    .order("at", { ascending: true });
  if (error) return null;
  return (data as unknown as EventTimelineRaw[]).map(({ places, ...r }) => ({
    ...r,
    place_name_en: places?.name_en ?? null,
    place_name_ne: places?.name_ne ?? null,
    place_name_hi: places?.name_hi ?? null,
  }));
}

/**
 * The latest day's digest in `lang`, else that day's EN row, else null. Only the two candidate languages
 * are fetched; the choice is made by lib/story.ts pickDigest so it can be unit-tested.
 */
export async function getDigest(lang: "en" | "ne" | "hi"): Promise<DigestRow | null> {
  const sb = serverClient();
  if (!sb) return null;
  const langs = lang === "en" ? ["en"] : [lang, "en"];
  const { data, error } = await sb
    .from("digest")
    .select("day, lang, headline, bullets, computed_at")
    .in("lang", langs)
    .order("day", { ascending: false })
    .order("computed_at", { ascending: false })
    .limit(langs.length * 2);
  if (error || !data) return null;
  const rows: DigestRow[] = (data as Record<string, unknown>[]).map((d) => ({
    day: String(d.day),
    lang: d.lang as DigestRow["lang"],
    headline: (d.headline as string | null) ?? null,
    bullets: normaliseBullets(d.bullets),
    computed_at: String(d.computed_at),
  }));
  return pickDigest(rows, lang);
}

// ---------------------------------------------------------------------------
// Sources (/sources)
// ---------------------------------------------------------------------------

export async function getSources(): Promise<SourceStatusRow[] | null> {
  const sb = serverClient();
  if (!sb) return null;
  const { data, error } = await sb.from("v_sources_status").select("*").order("id");
  return error ? null : (data as SourceStatusRow[]);
}

// ---------------------------------------------------------------------------
// OG card numbers (app/api/og)
// ---------------------------------------------------------------------------

export type OgNumbers = {
  dead: FigureLatest | null;
  missing: FigureLatest | null;
  rescued: FigureLatest | null;
  policeMissing: FigureLatest | null;
  submissionsTotal: number;
  /** v_live_counts.last_processed_at — the card's "updated N min ago" line; null = no processed run yet. */
  lastProcessedAt: string | null;
};

export async function getOgNumbers(): Promise<OgNumbers> {
  const [figures, live] = await Promise.all([getNationalFigures(), getLiveCounts()]);
  return {
    dead: pickFigure(figures, "NDRRMA", ["dead"]),
    missing: pickFigure(figures, "NDRRMA", ["missing", "out_of_contact"]),
    rescued: pickFigure(figures, "NDRRMA", ["rescued"]),
    policeMissing: pickFigure(figures, ["Nepal Police", "Nepal Police (via press)"], ["missing", "out_of_contact"]),
    submissionsTotal: live?.submissions_total ?? 0,
    lastProcessedAt: live?.last_processed_at ?? null,
  };
}

// ---------------------------------------------------------------------------
// Own rows (browser only — need the visitor's anonymous session)
// ---------------------------------------------------------------------------

const OWN_COLS =
  "id, created_at, lang, respondent_type, text, place_id, contact, supersedes, withdrawn_at, summary_public, anonymised_at, status";

export async function getOwnReports(sb: SupabaseClient): Promise<OwnReport[] | null> {
  const { data, error } = await sb.from("reports_archive").select(OWN_COLS).order("created_at", { ascending: false });
  return error ? null : (data as OwnReport[]);
}

export async function getOwnReport(sb: SupabaseClient, id: string): Promise<OwnReport | null> {
  const { data, error } = await sb.from("reports_archive").select(OWN_COLS).eq("id", id).maybeSingle();
  return error ? null : ((data as OwnReport | null) ?? null);
}

export async function getOwnUser(sb: SupabaseClient, id: string): Promise<OwnUser | null> {
  const { data, error } = await sb.from("users").select("id, lang, contact, created_at").eq("id", id).maybeSingle();
  return error ? null : ((data as OwnUser | null) ?? null);
}
