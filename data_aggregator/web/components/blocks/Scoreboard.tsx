"use client";

import { useEffect, useRef, useState } from "react";
import { PULL_INTERVAL_MINUTES, SCOREBOARD_POLL_MS, STALE_AFTER_MINUTES, refreshLabel } from "@/lib/config";
import { fmtInt, fmtSinceArcade, minutesSince } from "@/lib/format";
import { t, type Lang } from "@/lib/i18n";
import { joinPresence, watchSubmissions } from "@/lib/presence";
import { getLiveCounts, type LiveCounts } from "@/lib/queries";
import { browserClient, supabaseConfigured } from "@/lib/supabase";
import { Led } from "@/components/ui/LiveChip";

/**
 * Live scoreboard (Home v3): people here now · contributions last 10 min · today · minutes since last pull ·
 * "AUTO-REFRESH EVERY 4 H". Client island: Presence channel `site` (hidden if it errors), Realtime INSERTs on
 * submissions_log, v_live_counts polled every 60 s. Press Start 2P digits. See web/docs/09-live-scoreboard.md.
 */
export default function Scoreboard({ lang, initial }: { lang: Lang; initial: LiveCounts | null }) {
  const [counts, setCounts] = useState<LiveCounts | null>(initial);
  const [here, setHere] = useState<number | null>(null);
  const [hereHidden, setHereHidden] = useState<boolean>(() => !supabaseConfigured);
  const [now, setNow] = useState<number>(() => Date.now());
  const local = useRef<number[]>([]); // timestamps of inserts seen since the last poll

  useEffect(() => {
    const sb = browserClient();
    if (!sb) return;
    const presence = joinPresence(
      sb,
      (n) => setHere(n),
      () => setHereHidden(true),
    );
    const watcher = watchSubmissions(sb, () => {
      local.current.push(Date.now());
      setCounts((c) =>
        c
          ? { ...c, submissions_10m: c.submissions_10m + 1, submissions_today: c.submissions_today + 1, submissions_total: c.submissions_total + 1 }
          : { submissions_10m: 1, submissions_today: 1, submissions_total: 1, last_pull_at: null, last_processed_at: null },
      );
    });
    const poll = setInterval(async () => {
      const fresh = await getLiveCounts(sb);
      if (fresh) {
        local.current = [];
        setCounts(fresh);
      }
    }, SCOREBOARD_POLL_MS);
    const tick = setInterval(() => setNow(Date.now()), 30000);
    return () => {
      presence.leave();
      watcher.stop();
      clearInterval(poll);
      clearInterval(tick);
    };
  }, []);

  const lastPull = counts?.last_pull_at ?? null;
  // `now` is captured at render time, so the server's (ISR) label and the client's differ by design; the Cell
  // suppresses the hydration warning for that text and the 30 s tick keeps it honest.
  const mins = minutesSince(lastPull, new Date(now));
  const since = lastPull ? fmtSinceArcade(lastPull, new Date(now)) : "—";
  const sinceColor = mins === null ? "text-board-text" : mins > STALE_AFTER_MINUTES ? "text-amber" : "text-live-green";
  const ten = counts ? fmtInt(counts.submissions_10m) : "—";
  const today = counts ? fmtInt(counts.submissions_today) : "—";
  const hereText = here === null ? "—" : fmtInt(here);
  const showHere = !hereHidden;

  return (
    <section data-block="scoreboard" aria-label={t(lang, "live.right_now")} className="max-w-[1280px] mx-auto px-4 md:px-7 mt-[14px] md:mt-5">
      {/* desktop strip */}
      <div className="hidden md:flex bg-board b-ink rounded-r2 shadow-hard-4 px-6 py-[18px] items-center gap-8 relative overflow-hidden">
        <span className="amber-quarter" style={{ width: 150, height: 150, right: -46, top: -46 }} />
        <Led size={12} />
        {showHere ? (
          <>
            <Cell value={hereText} label={t(lang, "live.here_now")} />
            <Divider />
          </>
        ) : null}
        <Cell value={ten} label={t(lang, "live.last_10")} />
        <Divider />
        <Cell value={today} label={t(lang, "live.today")} />
        <Divider />
        <Cell value={since} label={lastPull ? t(lang, "live.since_pull") : t(lang, "live.no_pull")} color={sinceColor} />
        <div className="ml-auto arcade text-board-dim text-right" style={{ fontSize: 8, lineHeight: 1.8 }} aria-label={`Auto-refresh ${refreshLabel(PULL_INTERVAL_MINUTES)}`}>
          AUTO-REFRESH
          <br />
          {refreshLabel(PULL_INTERVAL_MINUTES)}
        </div>
      </div>
      {/* mobile card */}
      <div className="md:hidden bg-board b-ink rounded-r2 shadow-hard-3 px-4 py-[14px] relative overflow-hidden">
        <span className="amber-quarter" style={{ width: 110, height: 110, right: -34, top: -34 }} />
        <div className="flex items-center gap-2 arcade text-board-dim" style={{ fontSize: 7, lineHeight: 1 }}>
          <Led size={9} />
          {t(lang, "live.right_now")}
        </div>
        <div className="grid grid-cols-2 gap-3 mt-3">
          {showHere ? <Cell value={hereText} label={t(lang, "live.here_now")} small /> : null}
          <Cell value={ten} label={t(lang, "live.last_10_m")} small />
          <Cell value={today} label={t(lang, "live.today_m")} small />
          <Cell value={since} label={lastPull ? t(lang, "live.since_pull_m") : t(lang, "live.no_pull")} color={sinceColor} small />
        </div>
        <div className="arcade text-board-dim mt-3" style={{ fontSize: 7, lineHeight: 1.8 }}>
          AUTO-REFRESH {refreshLabel(PULL_INTERVAL_MINUTES)}
        </div>
      </div>
    </section>
  );
}

function Cell({ value, label, color = "text-amber", small = false }: { value: string; label: string; color?: string; small?: boolean }) {
  return (
    <div>
      <div className={["arcade num", color].join(" ")} style={{ fontSize: small ? 13 : 15, lineHeight: small ? 1 : 1.4 }} aria-live="polite" suppressHydrationWarning>
        {value}
      </div>
      <div className={["font-semibold text-board-text", small ? "text-[10.5px] mt-[5px]" : "text-[12px] mt-[6px]"].join(" ")}>{label}</div>
    </div>
  );
}

function Divider() {
  return <div className="w-[2px] self-stretch bg-white/15" aria-hidden="true" />;
}
