import { sparkPoints } from "@/lib/trends";

/**
 * Tiny dependency-free sparkline (Arcade ledger: ink stroke, amber last point). Server-renderable SVG.
 * Renders nothing with fewer than two points. See web/docs/05-home-blocks.md §04.
 */
export default function Sparkline({ values, width = 64, height = 18, label, className = "" }: { values: number[]; width?: number; height?: number; label?: string; className?: string }) {
  if (values.length < 2) return null;
  const pts = sparkPoints(values, width, height);
  const last = pts.split(" ").pop() ?? "";
  const [lx, ly] = last.split(",").map(Number);
  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} className={className} role="img" aria-label={label} data-testid="sparkline">
      <polyline points={pts} fill="none" stroke="#1a1a1a" strokeWidth={1.6} strokeLinejoin="round" strokeLinecap="round" />
      <circle cx={lx} cy={ly} r={2.4} fill="#ffb800" stroke="#1a1a1a" strokeWidth={1} />
    </svg>
  );
}
