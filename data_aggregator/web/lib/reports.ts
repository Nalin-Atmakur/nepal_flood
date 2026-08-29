/**
 * Every database WRITE the browser makes, in one file — the contract with the ARCHIVE zone
 * (db/migrations/001_archive.sql, 004_rls.sql). An anonymous authenticated user may:
 *   insert reports_archive (own user_id, status stays 'received'), select own rows,
 *   update own rows only to set withdrawn_at (a trigger forces everything else back),
 *   insert submissions_log, and update the own `users` row (lang, contact). Nothing else.
 *
 * Reads live in lib/queries.ts; the rate limiter in lib/ratelimit.ts.
 */
import type { SupabaseClient } from "@supabase/supabase-js";
import type { RespondentType } from "./config";
import type { Lang } from "./i18n";

export { checkRateLimit, recordSend, type RateLimitResult } from "./ratelimit";

const FP_KEY = "nft_fp";

function randomId(): string {
  try {
    if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") return crypto.randomUUID().replace(/-/g, "");
  } catch {
    // fall through
  }
  return `${Math.random().toString(16).slice(2)}${Date.now().toString(16)}`;
}

/**
 * sha256 hex of UA + screen size + timezone + language. A recovery / dedup hint, never authentication.
 * Falls back to a random id persisted in localStorage when crypto.subtle is unavailable (http, old WebViews).
 */
export async function fingerprint(): Promise<string> {
  if (typeof window === "undefined") return "";
  let tz = "";
  try {
    tz = Intl.DateTimeFormat().resolvedOptions().timeZone ?? "";
  } catch {
    tz = "";
  }
  const raw = [navigator.userAgent, `${window.screen?.width ?? 0}x${window.screen?.height ?? 0}`, tz, navigator.language].join("|");
  try {
    const subtle = typeof crypto !== "undefined" ? crypto.subtle : undefined;
    if (subtle) {
      const buf = await subtle.digest("SHA-256", new TextEncoder().encode(raw));
      return Array.from(new Uint8Array(buf))
        .map((b) => b.toString(16).padStart(2, "0"))
        .join("");
    }
  } catch {
    // subtle present but failed (insecure context) — use the persisted random id below
  }
  try {
    const existing = window.localStorage.getItem(FP_KEY);
    if (existing) return existing;
    const id = randomId();
    window.localStorage.setItem(FP_KEY, id);
    return id;
  } catch {
    return randomId();
  }
}

export type NewReport = {
  userId: string;
  lang: Lang;
  respondentType: RespondentType;
  text: string;
  placeId: string | null;
  contact: string | null;
  supersedes: string | null;
};

export type InsertResult = { id: string } | { error: string };

/** Insert one verbatim report. Returns the new row id, or an error string (never rendered — the UI shows report.err_failed). */
export async function insertReport(sb: SupabaseClient, r: NewReport): Promise<InsertResult> {
  const text = r.text.trim();
  if (!text) return { error: "empty" };
  const fp = await fingerprint();
  const contact = r.contact?.trim() || null;
  const { data, error } = await sb
    .from("reports_archive")
    .insert({
      user_id: r.userId,
      lang: r.lang,
      respondent_type: r.respondentType,
      text: text.slice(0, 20000),
      place_id: r.placeId || null,
      contact,
      fingerprint: fp || null,
      supersedes: r.supersedes || null,
    })
    .select("id")
    .single();
  if (error) return { error: error.message || "insert_failed" };
  const id = (data as { id?: unknown } | null)?.id;
  return typeof id === "string" && id ? { id } : { error: "no_id" };
}

/** Public, PII-free counter row. Never throws; a failure here must not block the report. */
export async function logSubmission(sb: SupabaseClient, respondentType: RespondentType, lang: Lang): Promise<void> {
  try {
    await sb.from("submissions_log").insert({ respondent_type: respondentType, lang });
  } catch {
    // counters are best-effort
  }
}

/** Soft withdraw: sets withdrawn_at; the DB trigger sets status = 'withdrawn' and rejects any other change. */
export async function withdrawReport(sb: SupabaseClient, id: string): Promise<boolean> {
  try {
    const { data, error } = await sb
      .from("reports_archive")
      .update({ withdrawn_at: new Date().toISOString() })
      .eq("id", id)
      .select("id");
    return !error && Array.isArray(data) && data.length > 0;
  } catch {
    return false;
  }
}

/** "Keep this folder": store an email / phone on the own users row. Empty string clears it. */
export async function saveContact(sb: SupabaseClient, userId: string, contact: string): Promise<boolean> {
  try {
    const value = contact.trim() || null;
    const { data, error } = await sb.from("users").update({ contact: value }).eq("id", userId).select("id");
    return !error && Array.isArray(data) && data.length > 0;
  } catch {
    return false;
  }
}
