import Link from "next/link";
import type { ReactNode } from "react";

/**
 * Empty = dashed border, always with the one action that fills it (Component Sheet §07).
 * Errors state the time and the retry rule — no spinners without words.
 */
export default function EmptyState({
  children,
  action,
  href,
  external,
  center = false,
  className = "",
}: {
  children: ReactNode;
  action?: ReactNode;
  href?: string;
  external?: boolean;
  center?: boolean;
  className?: string;
}) {
  return (
    <div className={["b-dashed rounded-r2 bg-card px-4 py-[14px] font-semibold text-[12.5px] md:text-[13px] text-muted lh-body", center ? "text-center" : "", className].join(" ")}>
      {children}
      {action && href ? (
        <>
          {" "}
          {external ? (
            <a href={href} target="_blank" rel="noopener noreferrer">
              {action}
            </a>
          ) : (
            <Link href={href}>{action}</Link>
          )}
        </>
      ) : null}
    </div>
  );
}
