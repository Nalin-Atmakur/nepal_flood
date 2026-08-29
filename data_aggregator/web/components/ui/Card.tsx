import Link from "next/link";
import type { CSSProperties, ReactNode } from "react";

/**
 * Rectangles from Component Sheet §03: "rect · r2 · s4" (2.5px border, 4px shadow) and
 * "card · r2 · s3" (2px border, 3px shadow). Optional sticker tilt (±0.6deg) for stat cards.
 */
export type CardTone = "card" | "amber" | "dark" | "ground" | "dashed";

type Props = {
  tone?: CardTone;
  shadow?: 6 | 4 | 3 | 2 | 0;
  border?: 2.5 | 2;
  tilt?: number;
  padding?: string;
  className?: string;
  style?: CSSProperties;
  children: ReactNode;
  href?: string;
  press?: boolean;
  as?: "div" | "article" | "section" | "li";
};

const tones: Record<CardTone, string> = {
  card: "bg-card text-ink",
  amber: "bg-amber-fill text-ink",
  dark: "bg-board text-white relative overflow-hidden",
  ground: "bg-ground text-ink",
  dashed: "bg-card text-muted",
};

export default function Card({
  tone = "card",
  shadow = 0,
  border = 2.5,
  tilt,
  padding = "p-4",
  className = "",
  style,
  children,
  href,
  press,
  as = "div",
}: Props) {
  const b = tone === "dashed" ? "b-dashed" : border === 2 ? "b-ink-2" : "b-ink";
  const sh =
    press && shadow === 4
      ? "press-4"
      : press && shadow === 3
        ? "press-3"
        : press && shadow === 2
          ? "press-2"
          : press
            ? "press-0"
            : shadow === 6
              ? "shadow-hard-6"
              : shadow === 4
                ? "shadow-hard-4"
                : shadow === 3
                  ? "shadow-hard-3"
                  : shadow === 2
                    ? "shadow-hard-2"
                    : "";
  const cls = ["rounded-r2 block", b, tones[tone], sh, padding, className].join(" ");
  const st: CSSProperties = { ...(style ?? {}), ...(tilt ? { transform: `rotate(${tilt}deg)` } : {}) };

  if (href) {
    return (
      <Link href={href} className={cls + " no-underline text-ink hover:text-ink"} style={st}>
        {children}
      </Link>
    );
  }
  const Tag = as;
  return (
    <Tag className={cls} style={st}>
      {children}
    </Tag>
  );
}

/** The framed 3D panel / any outer frame: 2.5px border, 4px radius, hard shadow, clipped. */
export function Frame({ children, className = "", shadow = 4 }: { children: ReactNode; className?: string; shadow?: 4 | 3 }) {
  return (
    <div className={["b-ink rounded-r2 overflow-hidden relative", shadow === 4 ? "shadow-hard-4" : "shadow-hard-3", className].join(" ")}>
      {children}
    </div>
  );
}
