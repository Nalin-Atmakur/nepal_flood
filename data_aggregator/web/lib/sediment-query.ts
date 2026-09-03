import { createClient } from "@supabase/supabase-js";

export interface SedimentReading {
  dh_m: number;
  uncertainty_m: number | null;
  distance_m: number;
}

// [lon, lat, dh_m, uncertainty_m | null]
type LocalPoint = [number, number, number, number | null];

let _localPoints: LocalPoint[] | null = null;
async function getLocalPoints(): Promise<LocalPoint[]> {
  if (_localPoints) return _localPoints;
  const res = await fetch("/stereo_dh.json");
  _localPoints = await res.json();
  return _localPoints!;
}

/** Nearest-neighbour search in lon/lat space (degrees ≈ metres at this scale). */
function nearestLocal(points: LocalPoint[], lat: number, lon: number, maxDistDeg: number): SedimentReading | null {
  let bestD = Infinity, best: LocalPoint | null = null;
  for (const p of points) {
    const d = (p[0] - lon) ** 2 + (p[1] - lat) ** 2;
    if (d < bestD) { bestD = d; best = p; }
  }
  if (!best || bestD > maxDistDeg ** 2) return null;
  const distM = Math.sqrt(bestD) * 111_000;
  return { dh_m: best[2], uncertainty_m: best[3], distance_m: distM };
}

const useSupabase =
  !!process.env.NEXT_PUBLIC_SUPABASE_URL &&
  !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

const supabase = useSupabase
  ? createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )
  : null;

/**
 * Returns the nearest sediment measurement within 150 m of the given
 * WGS-84 coordinate, or null if none exists.
 * Uses Supabase PostGIS in production; local JSON in dev.
 */
export async function queryDepthAtCoordinate(
  lat: number,
  lon: number
): Promise<SedimentReading | null> {
  if (supabase) {
    const { data, error } = await supabase.rpc("get_sediment_depth", {
      p_lat: lat,
      p_lon: lon,
      max_dist_m: 150,
    });
    if (error || !data || data.length === 0) return null;
    const row = data[0];
    return { dh_m: row.dh_m, uncertainty_m: row.uncertainty_m ?? null, distance_m: row.distance_m };
  }

  // Local fallback: stereo_dh.json (~40 m spacing, 150 m max = ~0.00135°)
  const points = await getLocalPoints();
  return nearestLocal(points, lat, lon, 0.00135);
}
