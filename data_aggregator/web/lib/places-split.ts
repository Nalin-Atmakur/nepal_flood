import type { PlaceStatusRow } from "./queries";

/**
 * The per-place ledger (place_status) also carries district-kind rows (Rasuwa, Nuwakot, Sindhupalchok …)
 * because the OPMCM registry projects many reports at district resolution. Those totals are real but they
 * swamp the settlement-level picture the corridor table is for, so the site shows them separately
 * (web/docs/05-home-blocks.md §05, web/docs/08-places.md). Pure helper, unit-tested in tests/places-split.test.ts.
 */
export const DISTRICT_KINDS = new Set(["district"]);

export function isDistrictRow(row: Pick<PlaceStatusRow, "kind">): boolean {
  return DISTRICT_KINDS.has(row.kind);
}

export function splitDistricts<T extends Pick<PlaceStatusRow, "kind">>(rows: T[] | null | undefined): { places: T[]; districts: T[] } {
  const places: T[] = [];
  const districts: T[] = [];
  for (const r of rows ?? []) (isDistrictRow(r) ? districts : places).push(r);
  return { places, districts };
}
