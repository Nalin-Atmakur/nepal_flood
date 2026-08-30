import { STAT_CARD_COUNT, STAT_CARDS, STAT_ROTATIONS } from "./config";
import type { StatRow } from "./queries";

/**
 * Pick the stat cards to show: walk STAT_CARDS in rank order, keep rows that exist and whose `numeric`
 * meets the candidate's `min` (rows without a numeric always pass), stop at STAT_CARD_COUNT.
 * Pure; tested in tests/stats-pick.test.ts.
 */
export function pickStatCards(rows: StatRow[] | null | undefined, count = STAT_CARD_COUNT): (StatRow & { rot: number })[] {
  const byId = new Map((rows ?? []).map((r) => [r.id, r]));
  const out: (StatRow & { rot: number })[] = [];
  for (const c of STAT_CARDS) {
    const r = byId.get(c.id);
    if (!r) continue;
    if (c.min !== undefined && (r.numeric === null || r.numeric === undefined || Number(r.numeric) < c.min)) continue;
    out.push({ ...r, rot: STAT_ROTATIONS[out.length % STAT_ROTATIONS.length] });
    if (out.length >= count) break;
  }
  return out;
}
