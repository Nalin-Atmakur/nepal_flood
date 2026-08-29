/**
 * Client-side rate limit for the report box (lib/config.ts RATE_LIMIT: 20 s between sends, 20 per hour).
 * Send times live in localStorage under "nft_sends" as epoch milliseconds; entries older than an hour are
 * pruned on every read. Every localStorage access is wrapped, so a blocked storage never breaks sending.
 */
import { RATE_LIMIT } from "./config";

const KEY = "nft_sends";
const HOUR_MS = 60 * 60 * 1000;

export type RateLimitResult = { ok: true } | { ok: false; waitSeconds: number } | { ok: false; hourly: true };

function read(): number[] {
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return [];
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter((x): x is number => typeof x === "number" && Number.isFinite(x));
  } catch {
    return [];
  }
}

function write(list: number[]): void {
  try {
    window.localStorage.setItem(KEY, JSON.stringify(list));
  } catch {
    // storage unavailable (private mode, quota, disabled) — the limiter simply does not persist
  }
}

/** Keep only sends from the last hour (and drop anything from a clock that ran ahead). */
function prune(list: number[], now: number): number[] {
  return list.filter((ts) => ts <= now && now - ts < HOUR_MS);
}

export function checkRateLimit(now: number = Date.now()): RateLimitResult {
  const sends = prune(read(), now);
  if (sends.length >= RATE_LIMIT.perHour) return { ok: false, hourly: true };
  if (sends.length) {
    const last = Math.max(...sends);
    const gapMs = RATE_LIMIT.minGapSeconds * 1000;
    const since = now - last;
    if (since < gapMs) return { ok: false, waitSeconds: Math.max(1, Math.ceil((gapMs - since) / 1000)) };
  }
  return { ok: true };
}

export function recordSend(now: number = Date.now()): void {
  write([...prune(read(), now), now]);
}
