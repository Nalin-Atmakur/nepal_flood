/**
 * Pure helpers for the side-by-side sparklines (web/docs/05-home-blocks.md §04). No React, no DOM.
 */
import type { SeriesPoint } from "./queries";

/** Points for one publisher×metric, sorted by day, deduplicated on day (last wins). */
export function seriesFor(rows: SeriesPoint[] | null | undefined, publisher: string, metric: string): SeriesPoint[] {
  const byDay = new Map<string, SeriesPoint>();
  for (const r of rows ?? []) {
    if (r.publisher.toLowerCase() !== publisher.toLowerCase() || r.metric !== metric) continue;
    byDay.set(r.day, r);
  }
  return [...byDay.values()].sort((a, b) => (a.day < b.day ? -1 : a.day > b.day ? 1 : 0));
}

/** Change between the last two days, or null with fewer than two points. */
export function deltaSinceYesterday(points: SeriesPoint[]): number | null {
  if (points.length < 2) return null;
  return Number(points[points.length - 1].value) - Number(points[points.length - 2].value);
}

/** "+12" / "−3" / "0" with Latin digits and a real minus sign. */
export function fmtDelta(n: number): string {
  const abs = Math.abs(Math.round(n)).toLocaleString("en-US");
  return n > 0 ? `+${abs}` : n < 0 ? `−${abs}` : "0";
}

/** SVG polyline points for the values, scaled into w×h with `pad` px of headroom; a flat series draws mid-height. */
export function sparkPoints(values: number[], w: number, h: number, pad = 2): string {
  if (!values.length) return "";
  const min = Math.min(...values);
  const max = Math.max(...values);
  const span = max - min || 1;
  const n = values.length;
  return values
    .map((v, i) => {
      const x = n === 1 ? w / 2 : pad + (i / (n - 1)) * (w - 2 * pad);
      const y = max === min ? h / 2 : pad + (1 - (v - min) / span) * (h - 2 * pad);
      return `${x.toFixed(1)},${y.toFixed(1)}`;
    })
    .join(" ");
}
