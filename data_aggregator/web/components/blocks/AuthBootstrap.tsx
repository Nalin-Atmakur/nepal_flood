"use client";

import { useEffect } from "react";
import { browserClient, ensureSession } from "@/lib/supabase";
import type { Lang } from "@/lib/i18n";

/**
 * Silently gives every visitor a stable identity: Supabase anonymous sign-in on first visit
 * (persisted by the client library), then an upsert into `users` with the current language, so the
 * folder (/me) and every report are tied to auth.uid(). Never shows UI. See web/docs/04-auth-and-identity.md.
 */
export default function AuthBootstrap({ lang }: { lang: Lang }) {
  useEffect(() => {
    const sb = browserClient();
    if (!sb) return;
    let cancelled = false;
    ensureSession(sb, lang).catch(() => undefined).then(() => {
      if (cancelled) return;
    });
    return () => {
      cancelled = true;
    };
  }, [lang]);

  return null;
}
