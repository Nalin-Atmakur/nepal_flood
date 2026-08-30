/**
 * Client-side place search over the gazetteer: any alias, any script, diacritic- and case-insensitive.
 * Used by the PlacePicker (report box) and the Places table filter. See web/docs/08-places.md.
 */
import { normaliseKey } from "./format";
import { localised, type Lang } from "./i18n";
import type { PlaceRef } from "./queries";

export type SearchablePlace = {
  id: string;
  label: string;
  sub: string;
  keys: string[];
};

/** Precompute normalised keys once per page. */
export function buildPlaceIndex(refs: PlaceRef[] | null | undefined, lang: Lang): SearchablePlace[] {
  if (!refs) return [];
  return refs.map((p) => {
    const names = [p.name_en, p.name_ne, p.name_hi, p.name_zh, ...(p.aliases ?? []), p.id.replace(/_/g, " ")].filter(
      (x): x is string => typeof x === "string" && x.length > 0,
    );
    const keys = Array.from(new Set(names.map(normaliseKey).filter(Boolean)));
    const label = localised(p, "name", lang) || p.name_en;
    const others = [p.name_en, p.name_ne, p.name_hi].filter((x): x is string => !!x && x !== label);
    const sub = [others.join(" · "), p.district].filter(Boolean).join(" · ");
    return { id: p.id, label, sub, keys };
  });
}

/** How well a place matches: 0 exact name · 1 a name starts with the query · 2 a word does · 3 substring · 4 none. */
function matchRank(p: SearchablePlace, q: string): number {
  let best = 4;
  for (const k of p.keys) {
    if (k === q) return 0;
    if (k.startsWith(q)) best = Math.min(best, 1);
    else if (k.split(" ").some((w) => w.startsWith(q))) best = Math.min(best, 2);
    else if (k.includes(q)) best = Math.min(best, 3);
  }
  return best;
}

/**
 * Rank: exact name, then names starting with the query, then words starting with it, then substrings; within a
 * rank the shorter label wins, so "Dhunche" comes before "Dhunche Army relief camp". Empty query → [].
 */
export function searchPlaces(index: SearchablePlace[], query: string, limit = 8): SearchablePlace[] {
  const q = normaliseKey(query);
  if (!q) return [];
  const hits: { p: SearchablePlace; rank: number }[] = [];
  for (const p of index) {
    const rank = matchRank(p, q);
    if (rank < 4) hits.push({ p, rank });
  }
  hits.sort((a, b) => a.rank - b.rank || a.p.label.length - b.p.label.length);
  return hits.slice(0, limit).map((h) => h.p);
}

/** True when the row matches the query (table filtering keeps the caller's order). */
export function placeMatches(keys: string[], query: string): boolean {
  const q = normaliseKey(query);
  if (!q) return true;
  return keys.some((k) => k.includes(q));
}
