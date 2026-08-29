import type { ReactNode } from "react";
import { gradeColors } from "@/lib/tokens";

/**
 * Circle badges (Component Sheet §03/§05): numbered section badge (ultramarine, Press Start 2P),
 * reliability grade circles A–E, numbered item badges on My folder, status dots.
 */

/** 31px ultramarine circle with "01" in Press Start 2P — section heads. */
export function NumberBadge({ n, size = 31, className = "" }: { n: string; size?: number; className?: string }) {
  return (
    <span
      className={["arcade inline-grid place-items-center rounded-full bg-ultra text-white b-ink-2 flex-none box-border", className].join(" ")}
      style={{ width: size, height: size, fontSize: size >= 31 ? 8 : 7, lineHeight: 1 }}
      aria-hidden="true"
    >
      {n}
    </span>
  );
}

/** Reliability grade circle A–E. */
export function GradeCircle({ grade, size = 26, className = "" }: { grade: string | null | undefined; size?: number; className?: string }) {
  const g = (grade ?? "E").toUpperCase() as keyof typeof gradeColors;
  const c = gradeColors[g] ?? gradeColors.E;
  return (
    <span
      className={["inline-grid place-items-center rounded-full b-ink-2 font-extrabold flex-none", className].join(" ")}
      style={{ width: size, height: size, background: c.bg, color: c.fg, fontSize: size >= 26 ? 13 : 12 }}
      title={`Grade ${g}`}
    >
      {g}
    </span>
  );
}

/** Numbered circle on My folder items, coloured by respondent type. */
export function ItemBadge({ n, bg, fg, size = 26 }: { n: number | string; bg: string; fg: string; size?: number }) {
  return (
    <span
      className="inline-grid place-items-center rounded-full b-ink-2 font-extrabold flex-none num self-center"
      style={{ width: size, height: size, background: bg, color: fg, fontSize: size >= 28 ? 13 : 12 }}
    >
      {n}
    </span>
  );
}

/** Small status dot with 1.5px ink border (gauges, legends, compact lists). */
export function Dot({ color, size = 9, className = "" }: { color: string; size?: number; className?: string }) {
  return (
    <span
      className={["inline-block rounded-full b-ink-1 flex-none", className].join(" ")}
      style={{ width: size, height: size, background: color }}
      aria-hidden="true"
    />
  );
}

/** Green check circle (success screen, About "data handling"). */
export function CheckCircle({ size = 46, strokeWidth = 3 }: { size?: number; strokeWidth?: number }) {
  const icon = Math.round(size * 0.48);
  return (
    <span
      className="inline-grid place-items-center rounded-full bg-confirmed b-ink flex-none"
      style={{ width: size, height: size, borderWidth: size >= 40 ? 2.5 : 2 }}
      aria-hidden="true"
    >
      <svg width={icon} height={icon} viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round">
        <path d="M4 12l5 5L20 6" />
      </svg>
    </span>
  );
}

/** Arrow circle on CTA cards (→). */
export function ArrowCircle({ bg, fg, size = 34 }: { bg: string; fg: string; size?: number }) {
  return (
    <span
      className="inline-grid place-items-center rounded-full b-ink-2 font-extrabold flex-none"
      style={{ width: size, height: size, background: bg, color: fg, fontSize: size >= 34 ? 16 : 14 }}
      aria-hidden="true"
    >
      →
    </span>
  );
}

/** Status pill for "mostly unknown / mostly reached / no data". */
export function StatusPill({ label, tone, size = "md" }: { label: ReactNode; tone: "unknown" | "reached" | "none"; size?: "md" | "sm" }) {
  const toneCls =
    tone === "unknown" ? "bg-amber-fill text-amber-text b-ink-2" : tone === "reached" ? "bg-confirmed text-white b-ink-2" : "bg-card text-muted border-2 border-dashed";
  return (
    <span
      className={[
        "inline-flex items-center rounded-pill font-bold whitespace-nowrap",
        size === "md" ? "min-h-[30px] px-[14px] pt-[2px] text-[12.5px]" : "min-h-[28px] px-3 pt-[2px] text-[12px]",
        toneCls,
      ].join(" ")}
    >
      {label}
    </span>
  );
}
