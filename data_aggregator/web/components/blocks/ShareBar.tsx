"use client";

import { useState } from "react";
import { t, type Lang } from "@/lib/i18n";
import { pageUrl, shareLinks, shareText, type ShareTarget } from "@/lib/share";
import { useShareNumbers } from "@/lib/use-share-numbers";

/**
 * Share pills: WhatsApp · X · LinkedIn · Telegram · Copy link (+ "More…" = the device's own share sheet where it
 * exists). Home v3 bottom, More menu, header popover, Report success screen. "full" = "Share this page" label +
 * pills; "compact" = pills only.
 *
 * WhatsApp always goes through wa.me: that opens WhatsApp's composer with the message in it, and the composer is
 * what builds the link preview. The device share sheet is offered as "More…" and is given the URL alone (a URL
 * item previews; a text item with a URL in it does not) — see docs/19 #10.
 */
export default function ShareBar({ lang, path = "/", variant = "full" }: { lang: Lang; path?: string; variant?: "full" | "compact" }) {
  const [copied, setCopied] = useState(false);
  const numbers = useShareNumbers();
  const url = pageUrl(lang, path);
  const links = shareLinks({ url, lang, numbers });
  const canNative = typeof navigator !== "undefined" && typeof (navigator as Navigator & { share?: unknown }).share === "function";

  async function copy(u: string) {
    try {
      await navigator.clipboard.writeText(`${shareText(lang, numbers)} ${u}`);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard unavailable: fall back to a prompt so the URL can still be copied by hand.
      window.prompt(t(lang, "share.copy"), u);
    }
  }
  async function native() {
    const nav = navigator as Navigator & { share?: (d: { title?: string; url?: string }) => Promise<void> };
    try {
      await nav.share?.({ title: t(lang, "site.name"), url: links.find((l) => l.id === "copy")?.url ?? url });
    } catch {
      /* cancelled */
    }
  }

  const pill = "inline-flex items-center justify-center min-h-[44px] px-4 md:px-[18px] pt-[1px] bg-card b-ink rounded-pill font-bold text-[13px] md:text-[13.5px] text-ink hover:text-ink no-underline press-3 whitespace-nowrap";

  return (
    <div data-block="share" id="share" className="flex flex-wrap items-center gap-2 md:gap-3">
      {variant === "full" ? <span className="font-extrabold text-[16px] mr-[6px] w-full md:w-auto">{t(lang, "share.title")}</span> : null}
      {links.map((l) =>
        l.id === ("copy" as ShareTarget) ? (
          <button key={l.id} type="button" className={pill} onClick={() => copy(l.url)} aria-live="polite">
            {copied ? t(lang, "share.copied") : t(lang, l.labelKey)}
          </button>
        ) : (
          <a key={l.id} href={l.href} className={[pill, l.id === "whatsapp" ? "bg-confirmed-fill" : ""].join(" ")} target="_blank" rel="noopener noreferrer" data-share={l.id}>
            {l.id === "whatsapp" ? "💬 " : ""}
            {t(lang, l.labelKey)}
          </a>
        ),
      )}
      {canNative ? (
        <button type="button" className={pill} onClick={native} data-share="native">
          {t(lang, "share.more")}
        </button>
      ) : null}
    </div>
  );
}
