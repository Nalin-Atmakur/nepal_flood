import type { ReactNode } from "react";
import { NumberBadge } from "./Badge";

/**
 * Section head: numbered circle (01…08) + 28px title + optional muted subtitle + right-aligned slot.
 * On mobile the number badge is hidden and the title drops to 20px, matching the mobile artboard.
 */
export default function SectionHead({
  n,
  title,
  sub,
  children,
  align = "baseline",
  id,
}: {
  n?: string;
  title: ReactNode;
  sub?: ReactNode;
  children?: ReactNode;
  align?: "baseline" | "center";
  id?: string;
}) {
  return (
    <div className={["flex flex-wrap gap-x-[14px] gap-y-2", align === "center" ? "items-center" : "items-baseline"].join(" ")} id={id}>
      {n ? (
        <span className="hidden md:inline-flex self-center">
          <NumberBadge n={n} />
        </span>
      ) : null}
      <h2 className="font-extrabold text-[20px] md:text-[28px] lh-tight m-0">{title}</h2>
      {sub ? <span className="font-semibold text-[13px] text-muted lh-body">{sub}</span> : null}
      {children ? <div className="md:ml-auto flex items-center gap-[14px] w-full md:w-auto">{children}</div> : null}
    </div>
  );
}
