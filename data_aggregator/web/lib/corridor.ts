/**
 * Data shaping for the 3D corridor (section 01) and the compact place list. See web/docs/10-3d-corridor.md.
 * The scene itself is components/three/corridor-3d.ts (ported from the design); this file turns
 * v_place_status_latest ⋈ places into the marker list the scene expects.
 */
import { fmtDayTime } from "./format";
import { localised, type Lang } from "./i18n";
import type { PlaceRef, PlaceStatusRow } from "./queries";

/** One marker on the corridor. `km` is corridor chainage (Gyirong ≈ −3 … Bharatpur ≈ 110). */
export type CorridorPlace = {
  id: string;
  name: string;
  km: number;
  /** lateral offset from the river in scene units (±0.3…0.7 on the channel; larger when off-channel) */
  side: number;
  /** off-channel places (Langtang) sit further from the river and are not scaled ×2.2 */
  off?: boolean;
  reported: number;
  confirmed: number;
  unknown: number;
  /** already formatted for display, or null */
  last: string | null;
  /** unknown / reported > 0.4 → amber marker */
  heavy: boolean;
};

/** A real bridge (HOT OSM survey) placed on the path by the simulation. */
export type RealBridge = { id: string; name: string; km: number; status: "washed out" | "damaged" };

/** Ledger tone for a place: amber "mostly unknown", green "mostly reached", or no data. */
export function statusTone(row: Pick<PlaceStatusRow, "status_label" | "expected" | "unknown"> | null | undefined): "unknown" | "reached" | "none" {
  if (!row) return "none";
  if (row.status_label === "mostly_unknown") return "unknown";
  if (row.status_label === "mostly_reached") return "reached";
  if (row.status_label === "no_data") return "none";
  if (!row.expected) return "none";
  return row.unknown / Math.max(1, row.expected) > 0.4 ? "unknown" : "reached";
}

/** Deterministic small hash so the same place always sits on the same bank. */
function hash(s: string): number {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) h = Math.imul(h ^ s.charCodeAt(i), 16777619);
  return (h >>> 0) / 4294967295;
}

/**
 * Join the ledger with the gazetteer. Places without a km are left out of the scene (they still appear
 * in the tables). Rows are sorted by km so the 3D scene draws upstream → downstream.
 */
export function toCorridorPlaces(statuses: PlaceStatusRow[] | null | undefined, refs: PlaceRef[] | null | undefined, lang: Lang): CorridorPlace[] {
  if (!statuses || !statuses.length) return [];
  const byId = new Map((refs ?? []).map((r) => [r.id, r]));
  const out: CorridorPlace[] = [];
  for (const s of statuses) {
    const ref = byId.get(s.place_id);
    const km = s.km ?? ref?.km ?? null;
    if (km === null || km === undefined || !Number.isFinite(km)) continue;
    const inChannel = ref?.in_channel ?? true;
    const r = hash(s.place_id);
    const sign = r < 0.5 ? -1 : 1;
    const side = inChannel ? sign * (0.3 + (r % 0.5) * 0.8) : sign * (3 + (r % 0.5) * 8);
    const reported = Number(s.expected ?? 0);
    const unknown = Number(s.unknown ?? 0);
    out.push({
      id: s.place_id,
      name: localised(s as unknown as Record<string, unknown>, "name", lang) || s.name_en,
      km,
      side,
      off: !inChannel || undefined,
      reported,
      confirmed: Number(s.confirmed_reached ?? 0),
      unknown,
      last: s.last_contact_at ? fmtDayTime(s.last_contact_at, lang) : null,
      heavy: unknown / Math.max(1, reported) > 0.4,
    });
  }
  return out.sort((a, b) => a.km - b.km);
}
