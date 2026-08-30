"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import Button from "@/components/ui/Button";
import { fmtCadence } from "@/lib/format";
import { href, t, type Lang } from "@/lib/i18n";
import { getOwnReports } from "@/lib/queries";
import { browserClient } from "@/lib/supabase";

/**
 * "Your part" — the first thing under the header on the home page (owner's request, 30 Aug): this device's own
 * contribution count, worded to prompt the visitor, with the big "Add what you know" button beside it. Counts come
 * from the device's own rows (RLS) when a session already exists; a fresh visitor is not signed in just to count.
 * See web/docs/05-home-blocks.md.
 */
export default function YourPart({ lang }: { lang: Lang }) {
  const [count, setCount] = useState<number | null>(null); // null = unknown / not yet loaded → zero-state copy

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

  return (
    <section data-block="yours" className="max-w-[1280px] mx-auto px-4 md:px-7 mt-4 md:mt-5" aria-labelledby="sec-yours">
      <div className={["b-ink rounded-r2 shadow-hard-3 md:shadow-hard-4 px-4 py-4 md:px-6 md:py-5 flex flex-col md:flex-row md:items-center gap-3 md:gap-6", has ? "bg-confirmed-fill" : "bg-amber-fill"].join(" ")}>
        <div className="flex-1 min-w-0">
          <div className="arcade text-[8px] md:text-[9px] tracking-wide text-amber-text mb-1">{t(lang, "yours.label")}</div>
          <h2 id="sec-yours" className="font-extrabold text-[18px] md:text-[22px] lh-tight m-0 num" data-testid="yours-title">
            {has ? t(lang, "yours.some", { n: String(n) }) : t(lang, "yours.none")}
          </h2>
          <p className="font-medium text-[13px] md:text-[14px] lh-body m-0 mt-1">{has ? t(lang, "yours.some_sub") : t(lang, "yours.none_sub", { cadence: fmtCadence(lang) })}</p>
        </div>
        <div className="flex flex-col sm:flex-row md:flex-col gap-2 md:items-stretch flex-none">
          <Button href={href(lang, "/report")} variant="primary" size="lg" shadow={4} className="min-h-[52px] px-7 leading-none" data-testid="yours-add">
            {t(lang, "nav.add")}
          </Button>
          {has ? (
            <Link href={href(lang, "/me")} className="inline-flex items-center justify-center min-h-[44px] px-4 rounded-r2 b-ink-2 bg-card font-bold text-[13.5px] text-ink no-underline hover:bg-ground">
              {t(lang, "yours.see")}
            </Link>
          ) : null}
        </div>
      </div>
    </section>
  );
}
