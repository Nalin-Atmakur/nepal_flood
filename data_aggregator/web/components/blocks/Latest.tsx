import { fmtCadence, fmtDayTime, fmtWhen } from "@/lib/format";
import { t, type Lang } from "@/lib/i18n";
import type { ArticleRow } from "@/lib/queries";
import EmptyState from "@/components/ui/EmptyState";
import SectionHead from "@/components/ui/SectionHead";

/** Section 08 — Latest: 12 headlines from v_articles_recent (time · title · source). */
export default function Latest({ lang, articles, lastAttempt }: { lang: Lang; articles: ArticleRow[] | null; lastAttempt: string | null }) {
  const rows = (articles ?? []).filter((a) => a.title);
  return (
    <section data-block="latest" data-n="08" className="max-w-[1280px] mx-auto px-4 md:px-7 mt-7" aria-labelledby="sec-latest">
      <SectionHead n="08" title={<span id="sec-latest">{t(lang, "sec.latest")}</span>} />
      {rows.length ? (
        <ul className="mt-[10px] md:mt-3 bg-card b-ink rounded-r2 overflow-hidden list-none m-0 p-0">
          {rows.map((a) => (
            <li key={a.id} className="b-rule">
              {/* one anchor for both layouts: row on desktop, stacked on mobile — the title appears once in the markup */}
              <a href={a.url} target="_blank" rel="noopener noreferrer" className="flex flex-col md:flex-row md:gap-4 md:items-baseline px-[14px] md:px-[18px] py-[9px] md:py-[10px] text-ink hover:text-ink no-underline md:hover:bg-ground">
                <span className="hidden md:inline font-bold text-[11.5px] text-muted w-11 flex-none num">{fmtWhen(a.published_at, lang)}</span>
                <span className="font-semibold text-[13px] md:text-[14.5px] lh-body" lang={a.lang ?? undefined}>
                  {a.title}
                </span>
                <span className="font-medium text-[10.5px] md:text-[11.5px] text-muted mt-[2px] md:mt-0 md:ml-auto flex-none num">
                  <span className="md:hidden">{a.publisher ?? a.source_id} · {fmtWhen(a.published_at, lang)}</span>
                  <span className="hidden md:inline">{a.publisher ?? a.source_id}</span>
                </span>
              </a>
            </li>
          ))}
        </ul>
      ) : (
        <div className="mt-3">
          <EmptyState>{t(lang, "sec.latest_empty", { t: lastAttempt ? fmtDayTime(lastAttempt, lang) : "—", cadence: fmtCadence(lang) })}</EmptyState>
        </div>
      )}
    </section>
  );
}
