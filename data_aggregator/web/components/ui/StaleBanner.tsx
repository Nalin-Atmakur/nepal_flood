import type { ReactNode } from "react";

/** Stale = amber banner, never red (Component Sheet §07). Full-width, under the official-channels bar. */
export default function StaleBanner({ children }: { children: ReactNode }) {
  return (
    <div role="status" className="bg-amber-fill text-amber-text b-ink-b font-bold text-[13px] md:text-[14px] lh-body">
      <div className="max-w-[1280px] mx-auto px-4 md:px-7 py-[9px]">{children}</div>
    </div>
  );
}
