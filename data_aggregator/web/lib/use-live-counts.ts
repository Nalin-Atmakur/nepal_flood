"use client";

import { useEffect, useRef, useState } from "react";
import { SCOREBOARD_POLL_MS } from "@/lib/config";
import { joinPresence, watchSubmissions } from "@/lib/presence";
import { getLiveCounts, type LiveCounts } from "@/lib/queries";
import { browserClient, supabaseConfigured } from "@/lib/supabase";

/**
 * The live counters every surface shares (web/docs/09-live-scoreboard.md): Presence channel `site` for
 * "people here now" (hidden if it errors), Realtime INSERTs on submissions_log bumping the counts at once,
 * v_live_counts re-polled every SCOREBOARD_POLL_MS, and a 30 s tick so "since last pull" stays honest.
 * `initial` comes from the page's ISR render; the client takes over after mount.
 */
export function useLiveCounts(initial: LiveCounts | null): { counts: LiveCounts | null; here: number | null; hereHidden: boolean; now: number } {
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

  return { counts, here, hereHidden, now };
}
