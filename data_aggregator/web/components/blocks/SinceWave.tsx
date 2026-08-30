"use client";

import { useEffect, useState } from "react";
import { t, type Lang } from "@/lib/i18n";

/** The wave left the barrier lake at 08:37 NPT on 26 August 2026. */
const WAVE_START = Date.parse("2026-08-26T08:37:00+05:45");

/** "4 d 14 h 12 min since the wave · Every hour matters." — ticks every 30 s, client-only to avoid a hydration gap. */
export default function SinceWave({ lang, className = "" }: { lang: Lang; className?: string }) {
  // the first value is computed at render (the server's clock is within a minute of the client's; the span is
  // suppressHydrationWarning), then it ticks — setting state inside the effect body would cascade renders
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 30_000);
    return () => clearInterval(id);
  }, []);
  const ms = Math.max(0, now - WAVE_START);
  const d = Math.floor(ms / 86_400_000);
  const h = Math.floor((ms % 86_400_000) / 3_600_000);
  const m = Math.floor((ms % 3_600_000) / 60_000);
  return (
    <span className={className} suppressHydrationWarning>
      {t(lang, "yours.urgent_since", { d: String(d), h: String(h), m: String(m) })} · <strong>{t(lang, "yours.urgent_every")}</strong>
    </span>
  );
}
