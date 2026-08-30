"use client";

import { useEffect, useState } from "react";
import type { ShareNumbers } from "./share";

/**
 * The headline numbers for the share message, fetched once per page from /api/share-numbers when a share UI
 * mounts (popovers mount on open, so a visitor who never shares never fetches). Module-level cache; null until
 * known or when unavailable — the share text then falls back to the plain description.
 */
let cache: ShareNumbers | null = null;
let inflight: Promise<ShareNumbers | null> | null = null;

export function useShareNumbers(): ShareNumbers | null {
  const [n, setN] = useState<ShareNumbers | null>(cache);
  useEffect(() => {
    if (cache) return;
    inflight ??= fetch("/api/share-numbers")
      .then((r) => (r.ok ? (r.json() as Promise<ShareNumbers>) : null))
      .then((v) => {
        cache = v;
        return v;
      })
      .catch(() => null);
    let alive = true;
    void inflight.then((v) => {
      if (alive) setN(v);
    });
    return () => {
      alive = false;
    };
  }, []);
  return n;
}
