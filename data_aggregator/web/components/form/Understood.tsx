"use client";

import { useEffect, useState } from "react";
import ShareBar from "@/components/blocks/ShareBar";
import { CheckCircle } from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import { UNDERSTOOD_POLL } from "@/lib/config";
import { fmtCadence } from "@/lib/format";
import { href, t, type Lang } from "@/lib/i18n";
import { getOwnReport } from "@/lib/queries";
import { browserClient } from "@/lib/supabase";

/**
 * Screen 4: "Thank you." + the "We understood:" check. Polls the own row for summary_public
 * (written by process_data) every UNDERSTOOD_POLL.everyMs for UNDERSTOOD_POLL.forMs, then gives up
 * with a pointer to My folder. An empty id (honeypot "success") shows the received line and never polls.
 */
export default function Understood({
  lang,
  id,
  files = null,
  onCorrect,
  onAddMore,
}: {
  lang: Lang;
  id: string;
  files?: { attached: number; failed: number } | null;
  onCorrect: () => void;
  onAddMore: () => void;
}) {
  const [summary, setSummary] = useState<string | null>(null);
  const [timedOut, setTimedOut] = useState(false);
  const cadence = fmtCadence(lang);

  useEffect(() => {
    if (!id) return;
    const sb = browserClient();
    if (!sb) return;
    let done = false;
    let interval: ReturnType<typeof setInterval> | null = null;

    const stop = () => {
      done = true;
      if (interval) clearInterval(interval);
      interval = null;
    };
    const check = async () => {
      if (done) return;
      const row = await getOwnReport(sb, id);
      if (done) return;
      const s = row?.summary_public?.trim();
      if (s) {
        setSummary(s);
        stop();
      }
    };

    void check();
    interval = setInterval(() => void check(), UNDERSTOOD_POLL.everyMs);
    const timeout = setTimeout(() => {
      if (!done) {
        stop();
        setTimedOut(true);
      }
    }, UNDERSTOOD_POLL.forMs);

    return () => {
      stop();
      clearTimeout(timeout);
    };
  }, [id]);

  const chips = summary
    ? summary
        .split(" · ")
        .map((s) => s.trim())
        .filter(Boolean)
    : [];

  const btn = "flex-1 inline-flex items-center justify-center min-h-[44px] px-3 bg-card b-ink-2 rounded-r2 font-bold text-[13.5px] text-ink cursor-pointer hover:bg-ground";

  return (
    <div data-testid="understood" data-step="sent" className="max-w-[560px]">
      <CheckCircle size={46} />
      <h1 className="font-extrabold text-[26px] md:text-[32px] lh-tight mt-[14px]">{t(lang, "report.thanks")}</h1>
      <p className="font-medium text-[14.5px] md:text-[15px] lh-body mt-[6px] max-w-[320px] md:max-w-[440px]">{t(lang, "report.thanks_sub", { cadence })}</p>
      {files && (files.attached > 0 || files.failed > 0) ? (
        <p className="font-semibold text-[13px] lh-body mt-2 num" data-testid="understood-files">
          {files.attached > 0 ? t(lang, "report.attached", { n: String(files.attached) }) : null}
          {files.failed > 0 ? (
            <span className="text-amber-text"> {t(lang, "report.attach_failed", { n: String(files.failed) })}</span>
          ) : null}
        </p>
      ) : null}

      <div className="bg-card b-ink rounded-r2 shadow-hard-3 p-[14px] md:p-4 mt-[18px]">
        <div className="font-bold text-[13px]">{t(lang, "report.understood")}</div>
        {chips.length ? (
          <ul className="flex flex-wrap gap-[7px] mt-[9px] list-none m-0 p-0" aria-live="polite">
            {chips.map((c, i) => (
              <li key={`${i}-${c}`} className="inline-flex items-center min-h-[32px] px-3 pt-[2px] b-ink-2 rounded-pill bg-amber-fill text-ink font-semibold text-[12.5px]">
                {c}
              </li>
            ))}
          </ul>
        ) : (
          <p className="font-medium text-[13px] text-muted lh-body mt-2" aria-live="polite">
            {t(lang, timedOut ? "report.received_timeout" : "report.received_wait", { cadence })}
          </p>
        )}
        <div className="flex gap-2 mt-3">
          <button type="button" className={btn} onClick={onCorrect}>
            {t(lang, "report.correct")}
          </button>
          <button type="button" className={btn} onClick={onAddMore}>
            {t(lang, "report.add_more")}
          </button>
        </div>
      </div>

      <div className="mt-[18px]">
        <ShareBar lang={lang} path="/" variant="compact" />
      </div>

      <Button href={href(lang, "/me")} variant="primary" size="md" shadow={3} block className="mt-4">
        {t(lang, "report.see_added")}
      </Button>
    </div>
  );
}
