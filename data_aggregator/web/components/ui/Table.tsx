import type { ComponentProps, ReactNode } from "react";

/**
 * Table primitives from the artboards: white box with 2.5px ink border, #e2e7ff head row,
 * 2.5px ink rule under the head, 2px #e7e9f0 rules between rows.
 */
export function TableBox({ children, shadow = 4, className = "" }: { children: ReactNode; shadow?: 4 | 0; className?: string }) {
  return (
    <div className={["bg-card b-ink rounded-r2 overflow-hidden", shadow === 4 ? "shadow-hard-4" : "", className].join(" ")}>{children}</div>
  );
}

export function Table({ children, className = "", minWidth }: { children: ReactNode; className?: string; minWidth?: number }) {
  return (
    <table className={["w-full border-collapse font-baloo text-[14px]", className].join(" ")} style={minWidth ? { minWidth } : undefined}>
      {children}
    </table>
  );
}

export function THead({ children }: { children: ReactNode }) {
  return (
    <thead>
      <tr className="bg-thead">{children}</tr>
    </thead>
  );
}

export function Th({ children, align = "left", className = "", sticky, ...rest }: { children?: ReactNode; align?: "left" | "right"; className?: string; sticky?: boolean } & ComponentProps<"th">) {
  return (
    <th
      scope="col"
      className={[
        "font-bold text-[12.5px] py-[11px] b-ink-b whitespace-nowrap",
        align === "right" ? "text-right px-3" : "text-left px-4",
        sticky ? "sticky left-0 bg-thead z-10" : "",
        className,
      ].join(" ")}
      {...rest}
    >
      {children}
    </th>
  );
}

export function Td({ children, align = "left", className = "", sticky, ...rest }: { children?: ReactNode; align?: "left" | "right"; className?: string; sticky?: boolean } & ComponentProps<"td">) {
  return (
    <td
      className={["py-[11px] b-rule align-top", align === "right" ? "text-right px-3 num" : "text-left px-4", sticky ? "sticky left-0 bg-card z-10" : "", className].join(" ")}
      {...rest}
    >
      {children}
    </td>
  );
}
