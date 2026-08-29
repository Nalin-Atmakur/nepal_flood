import Link from "next/link";
import type { ComponentProps, ReactNode } from "react";

/**
 * Pills (Component Sheet §05): share pills (white, shadow 2), status pills (green / grey / amber),
 * the unknown badge (amber fill, amber text). Curves are the contrast against the sharp rectangles.
 */
export type PillVariant = "share" | "done" | "wait" | "matched" | "unknown" | "plain" | "dark" | "withdrawn";

const variants: Record<PillVariant, string> = {
  share: "bg-card text-ink hover:text-ink b-ink press-2 min-h-[44px] px-4 pt-[1px] text-[13px] font-bold",
  done: "bg-confirmed text-white b-ink-2 min-h-[30px] px-3 pt-[2px] text-[12px] font-bold",
  wait: "bg-card text-muted border-2 border-dashed-none border-[#b8bcc7] min-h-[30px] px-3 pt-[2px] text-[12px] font-bold",
  matched: "bg-amber-fill text-amber-text b-ink-2 min-h-[30px] px-3 pt-[2px] text-[12px] font-bold",
  withdrawn: "bg-rule text-muted b-ink-2 min-h-[30px] px-3 pt-[2px] text-[12px] font-bold line-through",
  unknown: "bg-amber-fill text-amber-text b-ink-2 min-h-[30px] px-[14px] pt-[2px] text-[12.5px] font-bold",
  plain: "bg-ground text-ink b-ink-2 min-h-[38px] px-[18px] pt-[2px] text-[12px] font-bold",
  dark: "bg-board text-white b-ink-2 min-h-[30px] px-3 pt-[2px] text-[12px] font-bold",
};

type Props = {
  variant?: PillVariant;
  className?: string;
  children: ReactNode;
  href?: string;
  external?: boolean;
} & Omit<ComponentProps<"span">, "className" | "children">;

export default function Pill({ variant = "plain", className = "", children, href, external, ...rest }: Props) {
  const cls = ["inline-flex items-center justify-center gap-[7px] rounded-pill no-underline whitespace-nowrap", variants[variant], className].join(" ");
  if (href && external) {
    return (
      <a href={href} className={cls} target="_blank" rel="noopener noreferrer">
        {children}
      </a>
    );
  }
  if (href) {
    return (
      <Link href={href} className={cls}>
        {children}
      </Link>
    );
  }
  return (
    <span className={cls} {...rest}>
      {children}
    </span>
  );
}

/** The amber "unknown" number badge used in tables: ⟨ 67 ⟩. */
export function UnknownBadge({ children, size = "md" }: { children: ReactNode; size?: "md" | "lg" }) {
  return (
    <span
      className={[
        "inline-block rounded-pill bg-amber-fill text-amber-text b-ink-2 text-center num font-extrabold",
        size === "lg" ? "px-[9px] pt-[2px] text-[16px]" : "min-w-[44px] px-2 pt-[2px] text-[15px]",
      ].join(" ")}
    >
      {children}
    </span>
  );
}
