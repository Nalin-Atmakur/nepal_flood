"use client";

import type { ReactNode } from "react";

/**
 * "Useful to include — tap to add" chip (Component Sheet §05). White until inserted, amber fill after.
 * Always a real button, ≥ 36px tall (38 on desktop), so it is a valid tap target.
 */
export default function Chip({
  active = false,
  onClick,
  children,
  className = "",
  ariaLabel,
}: {
  active?: boolean;
  onClick?: () => void;
  children: ReactNode;
  className?: string;
  ariaLabel?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      aria-label={ariaLabel}
      className={[
        "inline-flex items-center min-h-[36px] md:min-h-[38px] px-[14px] md:px-4 pt-[2px] rounded-pill b-ink-2 font-semibold text-[13px] md:text-[13.5px] cursor-pointer select-none transition-colors",
        active ? "bg-amber-fill text-ink" : "bg-card text-ink hover:bg-ground",
        className,
      ].join(" ")}
    >
      {children}
    </button>
  );
}
