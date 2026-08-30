import { fmtDay, fmtDayTime, hostOf } from "@/lib/format";
import { t, type Lang } from "@/lib/i18n";
import type { DigestRow } from "@/lib/queries";
import { digestKindColors } from "@/lib/tokens";

/**
 * "What changed today" — un-numbered dark card directly under the scoreboard (HOW IT WORKS style):
 * arcade label + day, headline (Baloo 800), bullets with a kind badge and an optional source link,
 * and "as of <computed_at> NPT". Renders nothing when there is no digest row for the latest day
 * (in the current language, else EN) — carriers must never read "nothing changed".
 * See web/docs/13-story-and-digest.md.
 */
export default function Digest({ lang, digest }: { lang: Lang; digest: DigestRow | null }) {
  if (!digest) return null;
  const fallback = digest.lang !== lang;

  return (
    <section data-block="digest" className="max-w-[1280px] mx-auto px-4 md:px-7 mt-[14px] md:mt-5" aria-labelledby="sec-digest">
      <div className="bg-board b-ink rounded-r2 shadow-hard-3 md:shadow-hard-4 relative overflow-hidden text-white px-4 py-[14px] md:px-6 md:py-5" lang={fallback ? "en" : undefined}>
        <span className="amber-quarter" style={{ width: 150, height: 150, right: -46, top: -46 }} />
        <div className="flex items-center gap-3 flex-wrap relative">
          <span className="arcade text-amber" style={{ fontSize: 7, lineHeight: 1 }}>
            {t(lang, "digest.label")}
          </span>
          <span className="font-semibold text-[11px] text-board-text num">{fmtDay(digest.day, lang)}</span>
          {fallback ? <span className="font-semibold text-[11px] text-board-text">{t(lang, "digest.fallback_en")}</span> : null}
        </div>
        {digest.headline ? (
          <h2 id="sec-digest" className="font-extrabold text-[20px] md:text-[26px] lh-tight text-white mt-2 max-w-[900px] [text-wrap:balance] relative">
            {digest.headline}
          </h2>
        ) : (
          <h2 id="sec-digest" className="sr-only">
            {t(lang, "digest.label")}
          </h2>
        )}
        {digest.bullets.length ? (
          <ul className="list-none m-0 p-0 mt-3 grid gap-2 md:grid-cols-2 md:gap-x-6 relative">
            {digest.bullets.map((b, i) => {
              const c = digestKindColors[b.kind] ?? digestKindColors.news;
              return (
                <li key={i} data-digest-bullet={b.kind} className="flex gap-2 items-start">
                  <span className="rounded-pill font-bold text-[9.5px] px-[7px] pt-[3px] pb-[1px] flex-none mt-[3px] lh-tight whitespace-nowrap" style={{ background: c.bg, color: c.fg }}>
                    {t(lang, `digest.kind.${b.kind}`)}
                  </span>
                  <span className="font-medium text-[13px] md:text-[13.5px] lh-body text-board-body">
                    {b.text}
                    {b.source_url ? (
                      <>
                        {" "}
                        <a href={b.source_url} target="_blank" rel="noopener noreferrer" className="text-footer-link hover:text-white font-semibold text-[11px] whitespace-nowrap">
                          {hostOf(b.source_url)} ↗
                        </a>
                      </>
                    ) : null}
                  </span>
                </li>
              );
            })}
          </ul>
        ) : null}
        <div className="font-semibold text-[11px] text-board-text mt-3 num relative">{t(lang, "digest.as_of", { t: fmtDayTime(digest.computed_at, lang) })}</div>
      </div>
    </section>
  );
}
