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

/** Rank: prefix matches on any key first, then substring matches. Empty query → []. */
export function searchPlaces(index: SearchablePlace[], query: string, limit = 8): SearchablePlace[] {
  const q = normaliseKey(query);
  if (!q) return [];
  const prefix: SearchablePlace[] = [];
  const inside: SearchablePlace[] = [];
  for (const p of index) {
    if (p.keys.some((k) => k.startsWith(q) || k.split(" ").some((w) => w.startsWith(q)))) prefix.push(p);
    else if (p.keys.some((k) => k.includes(q))) inside.push(p);
  }
  return [...prefix, ...inside].slice(0, limit);
}

/** True when the row matches the query (table filtering keeps the caller's order). */
export function placeMatches(keys: string[], query: string): boolean {
  const q = normaliseKey(query);
  if (!q) return true;
  return keys.some((k) => k.includes(q));
}
