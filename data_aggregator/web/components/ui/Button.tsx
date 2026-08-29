import Link from "next/link";
import type { ComponentProps, ReactNode } from "react";

/**
 * Buttons from Component Sheet §05: primary (ultramarine), dark (scoreboard), secondary (white, no shadow).
 * Press = translate + shadow shrink (press-4 / press-3). Minimum height 44px on mobile, 48px default.
 */
export type ButtonVariant = "primary" | "dark" | "secondary" | "outline";
export type ButtonSize = "sm" | "md" | "lg";

type Common = {
  variant?: ButtonVariant;
  size?: ButtonSize;
  shadow?: 4 | 3 | 2 | 0;
  block?: boolean;
  className?: string;
  children: ReactNode;
};

type AsLink = Common & { href: string; external?: boolean } & Omit<ComponentProps<typeof Link>, "href" | "className" | "children">;
type AsButton = Common & { href?: undefined } & Omit<ComponentProps<"button">, "className" | "children">;

const base =
  "inline-flex items-center justify-center gap-2 rounded-r2 b-ink font-baloo no-underline select-none whitespace-nowrap disabled:opacity-50 disabled:pointer-events-none";

const variants: Record<ButtonVariant, string> = {
  primary: "bg-ultra text-white hover:text-white font-extrabold",
  dark: "bg-board text-white hover:text-white font-extrabold",
  secondary: "bg-card text-ink hover:text-ink font-bold",
  outline: "bg-card text-ink hover:text-ink font-bold border-2",
};

const sizes: Record<ButtonSize, string> = {
  sm: "min-h-[40px] px-[18px] pt-[2px] text-[13px]",
  md: "min-h-[48px] px-6 pt-[2px] text-[15px]",
  lg: "min-h-[52px] px-6 pt-[2px] text-[17px]",
};

export default function Button(props: AsLink | AsButton) {
  const { variant = "primary", size = "md", shadow, block, className = "", children } = props;
  const sh = shadow ?? (variant === "secondary" || variant === "outline" ? 0 : 4);
  const press = sh === 4 ? "press-4" : sh === 3 ? "press-3" : sh === 2 ? "press-2" : "press-0";
  const cls = [base, variants[variant], sizes[size], press, block ? "flex w-full" : "", className].join(" ");

  if ("href" in props && props.href !== undefined) {
    // Strip the styling props so they never reach the DOM or override className.
    const { href, external, variant: _v, size: _s, shadow: _sh, block: _b, className: _c, children: _ch, ...linkRest } = props as AsLink;
    void _v; void _s; void _sh; void _b; void _c; void _ch;
    if (external) {
      return (
        <a href={href} className={cls} target="_blank" rel="noopener noreferrer">
          {children}
        </a>
      );
    }
    return (
      <Link href={href} className={cls} {...linkRest}>
        {children}
      </Link>
    );
  }
  const { href: _h, variant: _v, size: _s, shadow: _sh, block: _b, className: _c, children: _ch, type = "button", ...buttonRest } = props as AsButton;
  void _h; void _v; void _s; void _sh; void _b; void _c; void _ch;
  return (
    <button type={type} className={cls} {...buttonRest}>
      {children}
    </button>
  );
}
