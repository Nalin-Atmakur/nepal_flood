/**
 * "People here now": Supabase Realtime Presence on the `site` channel. Degrades gracefully — on error,
 * timeout or the free-tier connection cap the caller hides that cell and keeps the other counters.
 * See web/docs/09-live-scoreboard.md.
 */
import type { RealtimeChannel, SupabaseClient } from "@supabase/supabase-js";

export type PresenceHandle = { leave(): void };

function visitorKey(): string {
  try {
    const k = sessionStorage.getItem("nft_presence_key");
    if (k) return k;
    const fresh = typeof crypto !== "undefined" && "randomUUID" in crypto ? crypto.randomUUID() : `${Date.now()}-${Math.random()}`;
    sessionStorage.setItem("nft_presence_key", fresh);
    return fresh;
  } catch {
    return `${Date.now()}-${Math.random()}`;
  }
}

/**
 * Join the presence channel and report the number of distinct keys on every sync.
 * onError fires once if the channel errors out, times out or closes unexpectedly.
 */
export function joinPresence(
  sb: SupabaseClient,
  onCount: (n: number) => void,
  onError: (reason: string) => void,
  channelName = "site",
): PresenceHandle {
  let channel: RealtimeChannel | null = null;
  let errored = false;
  const fail = (reason: string) => {
    if (errored) return;
    errored = true;
    onError(reason);
  };
  try {
    channel = sb.channel(channelName, { config: { presence: { key: visitorKey() } } });
    channel
      .on("presence", { event: "sync" }, () => {
        const state = channel!.presenceState();
        onCount(Object.keys(state).length);
      })
      .subscribe(async (status) => {
        if (status === "SUBSCRIBED") {
          try {
            await channel!.track({ at: new Date().toISOString() });
          } catch {
            fail("track");
          }
        } else if (status === "CHANNEL_ERROR" || status === "TIMED_OUT" || status === "CLOSED") {
          fail(status);
        }
      });
  } catch {
    fail("exception");
  }
  return {
    leave() {
      if (channel) {
        try {
          sb.removeChannel(channel);
        } catch {
          /* already gone */
        }
      }
    },
  };
}

/** Subscribe to INSERTs on the public, PII-free submissions_log for the live counters. */
export function watchSubmissions(sb: SupabaseClient, onInsert: () => void, onError?: (reason: string) => void): { stop(): void } {
  let channel: RealtimeChannel | null = null;
  try {
    channel = sb
      .channel("submissions_log_inserts")
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "submissions_log" }, () => onInsert())
      .subscribe((status) => {
        if ((status === "CHANNEL_ERROR" || status === "TIMED_OUT") && onError) onError(status);
      });
  } catch {
    onError?.("exception");
  }
  return {
    stop() {
      if (channel) {
        try {
          sb.removeChannel(channel);
        } catch {
          /* ignore */
        }
      }
    },
  };
}
