"use client";

import ShareBar from "@/components/blocks/ShareBar";
import { CheckCircle } from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import { href, t, type Lang } from "@/lib/i18n";

/**
 * Screen 4: an immediate storage receipt. Family reports are archive-only: there is no
 * extraction summary to poll, and nothing from this report enters the public data pipeline.
 */
export default function Understood({
  lang,
  files = null,
  onCorrect,
  onAddMore,
}: {
  lang: Lang;
  files?: { attached: number; failed: number } | null;
  onCorrect: () => void;
  onAddMore: () => void;
}) {
  const btn = "flex-1 inline-flex items-center justify-center min-h-[44px] px-3 bg-card b-ink-2 rounded-r2 font-bold text-[13.5px] text-ink cursor-pointer hover:bg-ground";

  return (
    <div data-testid="understood" data-step="sent" className="max-w-[560px]">
      <CheckCircle size={46} />
      <h1 className="font-extrabold text-[26px] md:text-[32px] lh-tight mt-[14px]">{t(lang, "report.thanks")}</h1>
      <p className="font-medium text-[14.5px] md:text-[15px] lh-body mt-[6px] max-w-[320px] md:max-w-[440px]">{t(lang, "report.thanks_sub")}</p>
      {files && (files.attached > 0 || files.failed > 0) ? (
        <p className="font-semibold text-[13px] lh-body mt-2 num" data-testid="understood-files">
          {files.attached > 0 ? t(lang, "report.attached", { n: String(files.attached) }) : null}
          {files.failed > 0 ? (
            <span className="text-amber-text"> {t(lang, "report.attach_failed", { n: String(files.failed) })}</span>
          ) : null}
        </p>
      ) : null}

      <div className="bg-card b-ink rounded-r2 shadow-hard-3 p-[14px] md:p-4 mt-[18px]">
        <div className="font-bold text-[13px]">{t(lang, "report.stored_title")}</div>
        <p className="font-medium text-[13px] text-muted lh-body mt-2" aria-live="polite">
          {t(lang, "report.stored_body")}
        </p>
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
