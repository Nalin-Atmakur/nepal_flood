/**
 * LIVE chip: Press Start 2P + pulsing red LED (Component Sheet §05). Latin only, never translated.
 */
export default function LiveChip({ size = "md", className = "", label = "LIVE" }: { size?: "sm" | "md" | "lg"; className?: string; label?: string }) {
  const s =
    size === "lg"
      ? { pad: "pt-[10px] pb-2 px-[18px]", font: 12, led: 11, gap: "gap-[9px]" }
      : size === "sm"
        ? { pad: "pt-[5px] pb-1 px-[9px]", font: 7, led: 6, gap: "gap-[5px]" }
        : { pad: "pt-[6px] pb-[5px] px-3", font: 8, led: 8, gap: "gap-[7px]" };
  return (
    <span
      className={["arcade inline-flex items-center rounded-pill bg-ink text-white whitespace-nowrap", s.pad, s.gap, className].join(" ")}
      style={{ fontSize: s.font, lineHeight: 1 }}
      aria-label={label === "LIVE" ? "Live" : label}
    >
      <Led size={s.led} />
      {label}
    </span>
  );
}

/** The red LED dot with pulse. */
export function Led({ size = 8, fast = false }: { size?: number; fast?: boolean }) {
  return (
    <span
      className={["inline-block rounded-full bg-live flex-none", fast ? "animate-ledpulse-fast" : "animate-ledpulse"].join(" ")}
      style={{ width: size, height: size }}
      aria-hidden="true"
    />
  );
}
