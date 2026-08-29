/** The logo circle from the header: ultramarine disc, ink border, two waves and a peak. */
export default function Logo({ size = 42, className = "" }: { size?: number; className?: string }) {
  const icon = Math.round(size * 0.57);
  return (
    <span
      className={["inline-grid place-items-center rounded-full bg-ultra b-ink flex-none", className].join(" ")}
      style={{ width: size, height: size }}
      aria-hidden="true"
    >
      <svg width={icon} height={icon} viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.4" strokeLinecap="round">
        <path d="M3 14c2-2.5 4-2.5 6 0s4 2.5 6 0 4-2.5 6 0" />
        <path d="M3 19c2-2.5 4-2.5 6 0s4 2.5 6 0 4-2.5 6 0" />
        <path d="M12 4l3 5H9l3-5z" fill="#fff" />
      </svg>
    </span>
  );
}
