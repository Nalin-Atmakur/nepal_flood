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
import { useShareNumbers } from "@/lib/use-share-numbers";
import ShareMenu from "./ShareMenu";

/**
 * "Your part" — the first block under the header on every tab (Home · Numbers · Places · Latest news; owner's
 * request, 30 Aug): this device's own contribution count, worded to prompt the visitor, the big "Add what you
 * know" button, and one slim row of the site's live counters (people here now · added in 10 min · today · since
 * the last data pull · auto-refresh cadence) from lib/use-live-counts.ts. The own count comes from the device's
 * rows (RLS) when a session already exists; a fresh visitor is not signed in just to count.
 * See web/docs/05-home-blocks.md.
 */
/** The wave left the barrier lake at 08:37 NPT on 26 Aug 2026 — the clock every ask is measured against. */
const WAVE_START = Date.parse("2026-08-26T08:37:00+05:45");

export default function YourPart({ lang, live = null, compact = false }: { lang: Lang; live?: LiveCounts | null; compact?: boolean }) {
  const [count, setCount] = useState<number | null>(null); // null = unknown / not yet loaded → zero-state copy
  const { counts, here, hereHidden, now } = useLiveCounts(live);
  const numbers = useShareNumbers();
  // the urgency clock: time since the wave, ticking every 30 s (owner, 30 Aug: "induce a sense of urgency within the page")
  const [tick, setTick] = useState(() => Date.now());
  useEffect(() => {
    const id = setInterval(() => setTick(Date.now()), 30_000);
    return () => clearInterval(id);
  }, []);
  const sinceMs = Math.max(0, tick - WAVE_START);
  const sinceD = Math.floor(sinceMs / 86_400_000);
  const sinceH = Math.floor((sinceMs % 86_400_000) / 3_600_000);
  const sinceM = Math.floor((sinceMs % 3_600_000) / 60_000);

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
      <div className={compact ? "" : "grid grid-cols-1 md:grid-cols-[2fr_3fr] gap-3 md:gap-4 items-stretch"}>
      {/* the three goals — their own simple card first, Your part beside it (owner, 30 Aug 13:26 / 14:15 "swap them"); About has the long version */}
      {compact ? null : (
        <aside className="b-ink rounded-r2 shadow-hard-3 md:shadow-hard-4 bg-card px-4 py-4 md:px-5 md:py-5 flex flex-col gap-3" data-testid="yours-goals" aria-labelledby="sec-goals">
          <div>
            <div className="arcade text-[8px] md:text-[9px] tracking-wide text-muted mb-1">{t(lang, "yours.goals_label")}</div>
            <h2 id="sec-goals" className="font-extrabold text-[16px] md:text-[18px] lh-tight m-0">{t(lang, "yours.goals")}</h2>
            <p className="m-0 mt-1 font-semibold text-[12.5px] text-amber-text lh-body">{t(lang, "yours.goals_sub")}</p>
          </div>
          <ol className="list-none m-0 p-0 flex flex-col gap-2 flex-1">
            {(["1", "2", "3"] as const).map((k) => (
              <li key={k} className="flex items-start gap-[10px] font-medium text-[13px] md:text-[13.5px] lh-body">
                <span className="arcade text-[9px] text-white bg-ink rounded-full w-[22px] h-[22px] inline-grid place-items-center flex-none mt-[2px]" aria-hidden="true">
                  {k}
                </span>
                <span>{t(lang, "yours.goal_" + k)}</span>
              </li>
            ))}
          </ol>
          <div className="flex flex-col gap-2 border-t-[2px] border-rule pt-3">
            <span className="font-bold text-[12.5px] text-muted">{t(lang, "yours.goal_share")}</span>
            <ShareMenu lang={lang} size="cta" label={t(lang, "yours.share_cta")} />
          </div>
        </aside>
      )}
      <div className={["b-ink rounded-r2 shadow-hard-3 md:shadow-hard-4 flex flex-col md:flex-row md:flex-wrap md:items-center gap-3 md:gap-x-6 md:gap-y-0", compact ? "px-4 py-3 md:px-5 md:py-3" : "px-4 py-4 md:px-6 md:py-5", has ? "bg-confirmed-fill" : "bg-amber-fill"].join(" ")} data-compact={compact || undefined}>
        <div className="flex-1 min-w-0">
          <div className="arcade text-[8px] md:text-[9px] tracking-wide text-amber-text mb-1">{t(lang, "yours.label")}</div>
          <h2 id="sec-yours" className={["font-extrabold lh-tight m-0 num", compact ? "text-[15px] md:text-[17px]" : "text-[18px] md:text-[22px]"].join(" ")} data-testid="yours-title">
            {has ? t(lang, "yours.some", { n: String(n) }) : t(lang, "yours.none")}
          </h2>
          {compact ? null : <p className="font-medium text-[13px] md:text-[14px] lh-body m-0 mt-1">{has ? t(lang, "yours.some_sub") : t(lang, "yours.none_sub", { cadence: fmtCadence(lang) })}</p>}
          {/* urgency: who is still missing, and for how long — live, ticking */}
          <p className={["m-0 flex flex-wrap items-center gap-x-2 gap-y-1 font-bold text-[12.5px] md:text-[13px] text-live", compact ? "mt-1" : "mt-2"].join(" ")} data-testid="yours-urgent" suppressHydrationWarning>
            <Led size={9} />
            <span suppressHydrationWarning>{numbers?.missing !== null && numbers?.missing !== undefined ? t(lang, "yours.urgent_missing", { n: fmtInt(numbers.missing) }) : t(lang, "yours.urgent_nonum")}</span>
            <span className="text-ink/70 font-semibold whitespace-nowrap" suppressHydrationWarning>
              {t(lang, "yours.urgent_since", { d: String(sinceD), h: String(sinceH), m: String(sinceM) })}
            </span>
            <span className="text-ink font-extrabold">{t(lang, "yours.urgent_every")}</span>
          </p>
        </div>
        <div className={["flex flex-col sm:flex-row md:flex-col gap-2 md:items-stretch flex-none", compact ? "mb-1 md:mb-2" : ""].join(" ")}>
          <Button href={href(lang, "/report")} variant="primary" size={compact ? "md" : "lg"} shadow={compact ? 3 : 4} className={compact ? "min-h-[44px] px-5 leading-none" : "min-h-[52px] px-7 leading-none"} data-testid="yours-add">
            {t(lang, "nav.add")}
          </Button>
          {has ? (
            <Link href={href(lang, "/me")} className="inline-flex items-center justify-center min-h-[44px] px-4 rounded-r2 b-ink-2 bg-card font-bold text-[13.5px] text-ink no-underline hover:bg-ground">
              {t(lang, "yours.see")}
            </Link>
          ) : null}
        </div>
        {/* the site's live counters — one slim row, Press Start 2P digits (docs/09) */}
        <div className={["md:basis-full border-t-[2px] border-ink/25 pt-[10px] md:pt-3 flex flex-wrap items-center gap-x-[14px] gap-y-[6px] font-semibold text-[11.5px] md:text-[12px] text-ink/80", compact ? "md:mt-2" : ""].join(" ")} data-testid="yours-live" aria-label={t(lang, "live.right_now")}>
          <Led size={9} />
          {!hereHidden ? (
            <span className="inline-flex items-baseline gap-[6px] whitespace-nowrap">
              <span className="arcade text-[11px] num" suppressHydrationWarning>
                {here === null ? "—" : fmtInt(here)}
              </span>
              {t(lang, "live.here_now")}
            </span>
          ) : null}
          {counts && counts.submissions_10m > 0 ? (
            <span className="inline-flex items-baseline gap-[6px] whitespace-nowrap">
              <span className="arcade text-[11px] num" suppressHydrationWarning>
                {fmtInt(counts.submissions_10m)}
              </span>
              {t(lang, "live.last_10_m")}
            </span>
          ) : null}
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
            <span title={`Auto-refresh ${refreshLabel(PULL_INTERVAL_MINUTES)}`}>{lastPull ? t(lang, "live.since_pull_m") : t(lang, "live.no_pull")}</span>
          </span>

        </div>
      </div>

      </div>
    </section>
  );
}
