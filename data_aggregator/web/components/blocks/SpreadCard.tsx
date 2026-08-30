"use client";

import { t, type Lang } from "@/lib/i18n";
import ShareMenu from "./ShareMenu";

/**
 * The carrier's ask (web/docs/22-home-v4.md). Most visitors arrive from a forwarded link and are not themselves
 * affected: they will pass it on or they will not. "Share this" is a vague good deed; naming *who* to send it to
 * turns it into a search of their own contacts, which is what actually spreads.
 */
export default function SpreadCard({ lang }: { lang: Lang }) {
  return (
    <section data-block="spread" className="max-w-[1280px] mx-auto px-4 md:px-7 mt-6" aria-labelledby="spread-title">
      {/* the decoration is clipped, the card is not — an overflow-hidden card cut the share menu off (owner, 30 Aug) */}
      <div className="b-ink rounded-r2 shadow-hard-3 md:shadow-hard-4 bg-board text-white relative px-4 py-4 md:px-7 md:py-6">
        <span className="absolute inset-0 overflow-hidden rounded-r2 pointer-events-none" aria-hidden="true">
          <span className="amber-quarter" style={{ width: 170, height: 170, left: -55, bottom: -55 }} />
        </span>
        <div className="relative flex flex-col md:flex-row md:items-center gap-3 md:gap-6">
          <div className="min-w-0 flex-1">
            <h2 id="spread-title" className="font-extrabold text-[18px] md:text-[24px] lh-tight m-0 [text-wrap:balance]">
              {t(lang, "spread.title")}
            </h2>
            <p className="font-medium text-[13px] md:text-[14.5px] lh-body m-0 mt-1 text-board-text max-w-[54ch]">{t(lang, "spread.body")}</p>
          </div>
          <div className="flex-none w-full md:w-auto">
            <ShareMenu lang={lang} size="cta" label={t(lang, "yours.share_cta")} />
          </div>
        </div>
      </div>
    </section>
  );
}
