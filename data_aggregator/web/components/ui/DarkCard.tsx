import type { ReactNode } from "react";

/**
 * Dark scoreboard-coloured card with a tiny Press Start 2P amber label and the quarter-circle amber overlay
 * ("HOW IT WORKS", "PRIVACY", "ON THE CORRIDOR", "FOR AGENCIES & NGOS"). Label is Latin only.
 */
export default function DarkCard({
  label,
  children,
  className = "",
  padding = "p-4",
  overlay = 110,
}: {
  label: string;
  children: ReactNode;
  className?: string;
  padding?: string;
  overlay?: number;
}) {
  return (
    <div className={["bg-board b-ink rounded-r2 relative overflow-hidden text-white", padding, className].join(" ")}>
      <span className="amber-quarter" style={{ width: overlay, height: overlay, right: -overlay * 0.31, top: -overlay * 0.31 }} />
      <div className="arcade text-amber" style={{ fontSize: 7, lineHeight: 1 }}>
        {label}
      </div>
      <div className="font-medium text-[12.5px] md:text-[13px] lh-loose text-board-body mt-2">{children}</div>
    </div>
  );
}
