"use client";

import { useState } from "react";
import { t, type Lang } from "@/lib/i18n";
import { pageUrl, shareLinks, type ShareTarget } from "@/lib/share";

/**
 * Share pills: WhatsApp · X · LinkedIn · Telegram · Copy link (Home v3 bottom, Report success screen).
 * "full" = "Share this page" label + pills (home); "compact" = pills only (report success, mobile).
 * See web/docs/11-og-and-share.md.
 */
export default function ShareBar({ lang, path = "/", variant = "full" }: { lang: Lang; path?: string; variant?: "full" | "compact" }) {
  const [copied, setCopied] = useState(false);
  const links = shareLinks({ url: pageUrl(lang, path), lang });

  async function copy(url: string) {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard unavailable: fall back to a prompt so the URL can still be copied by hand.
      window.prompt(t(lang, "share.copy"), url);
    }
  }

  const pill = "inline-flex items-center justify-center min-h-[44px] px-4 md:px-[18px] pt-[1px] bg-card b-ink rounded-pill font-bold text-[13px] md:text-[13.5px] text-ink hover:text-ink no-underline press-3 whitespace-nowrap";

  return (
    <div
      data-block="share"
      id="share"
      className={["flex flex-wrap items-center gap-2 md:gap-3", variant === "full" ? "" : ""].join(" ")}
    >
      {variant === "full" ? <span className="font-extrabold text-[16px] mr-[6px] w-full md:w-auto">{t(lang, "share.title")}</span> : null}
      {links.map((l) =>
        l.id === ("copy" as ShareTarget) ? (
          <button key={l.id} type="button" className={pill} onClick={() => copy(l.url)} aria-live="polite">
            {copied ? t(lang, "share.copied") : t(lang, l.labelKey)}
          </button>
        ) : (
          <a key={l.id} href={l.href} className={pill} target="_blank" rel="noopener noreferrer">
            {t(lang, l.labelKey)}
          </a>
        ),
      )}
    </div>
  );
}
