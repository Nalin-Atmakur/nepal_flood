"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import Button from "@/components/ui/Button";
import { Led } from "@/components/ui/LiveChip";
import { PULL_INTERVAL_MINUTES, STALE_AFTER_MINUTES, refreshLabel } from "@/lib/config";
import { fmtCadence, fmtInt, fmtSinceArcade, minutesSince } from "@/lib/format";
import { href, t, type Lang } from "@/lib/i18n";
import { getOwnReports, type LiveCounts } from "@/lib/queries";
import { browserClient } from "@/lib/supabase";
import { useLiveCounts } from "@/lib/use-live-counts";
import ShareMenu from "./ShareMenu";

/**
 * "Your part" — the first block under the header on every tab (Home · Numbers · Places · Latest news; owner's
 * request, 30 Aug): this device's own contribution count, worded to prompt the visitor, the big "Add what you
 * know" button, and one slim row of the site's live counters (people here now · added in 10 min · today · since
 * the last data pull · auto-refresh cadence) from lib/use-live-counts.ts. The own count comes from the device's
 * rows (RLS) when a session already exists; a fresh visitor is not signed in just to count.
 * See web/docs/05-home-blocks.md.
 */
export default function YourPart({ lang, live = null, compact = false }: { lang: Lang; live?: LiveCounts | null; compact?: boolean }) {
  const [count, setCount] = useState<number | null>(null); // null = unknown / not yet loaded → zero-state copy
  const { counts, here, hereHidden, now } = useLiveCounts(live);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const sb = browserClient();
      if (!sb) return;
      try {
        const { data } = await sb.auth.getSession();
        if (!data.session) {
          if (!cancelled) setCount(0);
          return;
        }
        const rows = await getOwnReports(sb);
        if (!cancelled) setCount((rows ?? []).filter((r) => r.status !== "withdrawn" && !r.withdrawn_at).length);
      } catch {
        if (!cancelled) setCount(0);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const n = count ?? 0;
  const has = n > 0;
  const lastPull = counts?.last_pull_at ?? null;
  const mins = minutesSince(lastPull, new Date(now));
  const since = lastPull ? fmtSinceArcade(lastPull, new Date(now)) : "—";
  const sinceColor = mins === null ? "text-muted" : mins > STALE_AFTER_MINUTES ? "text-amber-text" : "text-confirmed-text";

  return (
    <section data-block="yours" className="max-w-[1280px] mx-auto px-4 md:px-7 mt-4 md:mt-5" aria-labelledby="sec-yours">
      <div className={["b-ink rounded-r2 shadow-hard-3 md:shadow-hard-4 flex flex-col md:flex-row md:flex-wrap md:items-center gap-3 md:gap-x-6 md:gap-y-0", compact ? "px-4 py-3 md:px-5 md:py-3" : "px-4 py-4 md:px-6 md:py-5", has ? "bg-confirmed-fill" : "bg-amber-fill"].join(" ")} data-compact={compact || undefined}>
        <div className="flex-1 min-w-0">
          <div className="arcade text-[8px] md:text-[9px] tracking-wide text-amber-text mb-1">{t(lang, "yours.label")}</div>
          <h2 id="sec-yours" className={["font-extrabold lh-tight m-0 num", compact ? "text-[15px] md:text-[17px]" : "text-[18px] md:text-[22px]"].join(" ")} data-testid="yours-title">
            {has ? t(lang, "yours.some", { n: String(n) }) : t(lang, "yours.none")}
          </h2>
          {compact ? null : <p className="font-medium text-[13px] md:text-[14px] lh-body m-0 mt-1">{has ? t(lang, "yours.some_sub") : t(lang, "yours.none_sub", { cadence: fmtCadence(lang) })}</p>}
        </div>
        <div className="flex flex-col sm:flex-row md:flex-col gap-2 md:items-stretch flex-none">
          <Button href={href(lang, "/report")} variant="primary" size={compact ? "md" : "lg"} shadow={compact ? 3 : 4} className={compact ? "min-h-[44px] px-5 leading-none" : "min-h-[52px] px-7 leading-none"} data-testid="yours-add">
            {t(lang, "nav.add")}
          </Button>
          {has ? (
            <Link href={href(lang, "/me")} className="inline-flex items-center justify-center min-h-[44px] px-4 rounded-r2 b-ink-2 bg-card font-bold text-[13.5px] text-ink no-underline hover:bg-ground">
              {t(lang, "yours.see")}
            </Link>
          ) : null}
        </div>
        {/* the three goals (owner, 30 Aug 12:26): on the front page so a visitor sees why sharing matters — #3 is them */}
        {compact ? null : (
          <ol className="md:basis-full list-none m-0 p-0 border-t-[2px] border-ink/25 pt-[10px] md:pt-3 grid grid-cols-1 md:grid-cols-3 gap-x-5 gap-y-2" data-testid="yours-goals" aria-label={t(lang, "yours.goals")}>
            {(["1", "2", "3"] as const).map((k) => (
              <li key={k} className="flex items-start gap-2 font-medium text-[12.5px] md:text-[13px] lh-body">
                <span className="arcade text-[9px] text-white bg-ink rounded-full w-[22px] h-[22px] inline-grid place-items-center flex-none mt-[2px]" aria-hidden="true">
                  {k}
                </span>
                <span>
                  {t(lang, "yours.goal_" + k)}
                  {k === "3" ? (
                    <span className="inline-block ml-2 align-middle">
                      <ShareMenu lang={lang} size="sm" />
                    </span>
                  ) : null}
                </span>
              </li>
            ))}
          </ol>
        )}
        {/* the site's live counters — one slim row, Press Start 2P digits (docs/09) */}
        <div className="md:basis-full border-t-[2px] border-ink/25 pt-[10px] md:pt-3 flex flex-wrap items-center gap-x-[14px] gap-y-[6px] font-semibold text-[11.5px] md:text-[12px] text-ink/80" data-testid="yours-live" aria-label={t(lang, "live.right_now")}>
          <Led size={9} />
          {!hereHidden ? (
            <span className="inline-flex items-baseline gap-[6px] whitespace-nowrap">
              <span className="arcade text-[11px] num" suppressHydrationWarning>
                {here === null ? "—" : fmtInt(here)}
              </span>
              {t(lang, "live.here_now")}
            </span>
          ) : null}
          <span className="inline-flex items-baseline gap-[6px] whitespace-nowrap">
            <span className="arcade text-[11px] num" suppressHydrationWarning>
              {counts ? fmtInt(counts.submissions_10m) : "—"}
            </span>
            {t(lang, "live.last_10_m")}
          </span>
          <span className="inline-flex items-baseline gap-[6px] whitespace-nowrap">
            <span className="arcade text-[11px] num" suppressHydrationWarning>
              {counts ? fmtInt(counts.submissions_today) : "—"}
            </span>
            {t(lang, "live.today_m")}
          </span>
          <span className="inline-flex items-baseline gap-[6px] whitespace-nowrap">
            <span className={["arcade text-[11px] num", sinceColor].join(" ")} suppressHydrationWarning>
              {since}
            </span>
            {lastPull ? t(lang, "live.since_pull_m") : t(lang, "live.no_pull")}
          </span>
          <span className="arcade text-[8px] text-muted whitespace-nowrap ml-auto" aria-label={`Auto-refresh ${refreshLabel(PULL_INTERVAL_MINUTES)}`}>
            AUTO-REFRESH {refreshLabel(PULL_INTERVAL_MINUTES)}
          </span>
        </div>
      </div>
    </section>
  );
}
