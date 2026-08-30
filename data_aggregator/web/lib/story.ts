/**
 * Pure helpers for the story blocks — "The first hours" (event_timeline) and "What changed today" (digest).
 * No I/O here: lib/queries.ts reads, these shape. See web/docs/13-story-and-digest.md.
 */
import { EVENT_DATE_ISO } from "./config";
import { nptDay } from "./format";
import type { Lang } from "./i18n";
import type { DigestBullet, DigestRow, EventTimelineRow } from "./queries";

export const EVENT_KINDS = ["trigger", "wave", "gauge", "warning", "impact", "response"] as const;
export type EventKind = (typeof EVENT_KINDS)[number];

export const DIGEST_KINDS = ["figure", "place", "gauge", "news"] as const;
export type DigestKind = (typeof DIGEST_KINDS)[number];

export function isEventKind(x: unknown): x is EventKind {
  return typeof x === "string" && (EVENT_KINDS as readonly string[]).includes(x);
}

/** Kinds whose time label is set amber-on-dark (the alarms); everything else is ink on the card. */
export function isAlarmKind(kind: string): boolean {
  return kind === "trigger" || kind === "warning";
}

/**
 * Split the timeline into the event day (Nepal-time calendar day = EVENT_DATE_ISO) and everything after,
 * both sorted by `at`. Rows before the event day are kept in `first` (they are the lead-up).
 */
export function splitTimeline(rows: EventTimelineRow[] | null | undefined, eventDay: string = EVENT_DATE_ISO): { first: EventTimelineRow[]; later: EventTimelineRow[] } {
  const sorted = (rows ?? []).slice().sort((a, b) => a.at.localeCompare(b.at) || a.id.localeCompare(b.id));
  const first: EventTimelineRow[] = [];
  const later: EventTimelineRow[] = [];
  for (const r of sorted) {
    const day = nptDay(r.at);
    if (day && day > eventDay) later.push(r);
    else first.push(r);
  }
  return { first, later };
}

/** Coerce whatever the pipeline wrote into `digest.bullets` to a clean list; unknown kinds become "news". */
export function normaliseBullets(raw: unknown): DigestBullet[] {
  if (!Array.isArray(raw)) return [];
  const out: DigestBullet[] = [];
  for (const item of raw) {
    if (!item || typeof item !== "object") continue;
    const o = item as Record<string, unknown>;
    const text = typeof o.text === "string" ? o.text.trim() : "";
    if (!text) continue;
    const kind = typeof o.kind === "string" && (DIGEST_KINDS as readonly string[]).includes(o.kind) ? (o.kind as DigestKind) : "news";
    const source_url = typeof o.source_url === "string" && /^https?:\/\//.test(o.source_url) ? o.source_url : null;
    out.push({ text, kind, source_url });
  }
  return out;
}

/**
 * Pick the digest to show: the row for the latest day in the requested language, else that day's EN row,
 * else null (the block hides itself — carriers must never read "nothing changed").
 */
export function pickDigest(rows: DigestRow[] | null | undefined, lang: Lang): DigestRow | null {
  const usable = (rows ?? []).filter((r) => r.bullets.length > 0 || (r.headline ?? "").trim().length > 0);
  if (!usable.length) return null;
  const latestDay = usable.map((r) => r.day).sort().at(-1)!;
  const sameDay = usable.filter((r) => r.day === latestDay);
  return sameDay.find((r) => r.lang === lang) ?? sameDay.find((r) => r.lang === "en") ?? null;
}
