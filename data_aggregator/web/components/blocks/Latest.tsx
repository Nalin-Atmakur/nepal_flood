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
              {/* desktop row */}
              <a href={a.url} target="_blank" rel="noopener noreferrer" className="hidden md:flex gap-4 items-baseline px-[18px] py-[10px] text-ink hover:text-ink no-underline hover:bg-ground">
                <span className="font-bold text-[11.5px] text-muted w-11 flex-none num">{fmtWhen(a.published_at, lang)}</span>
                <span className="font-semibold text-[14.5px] lh-body" lang={a.lang ?? undefined}>
                  {a.title}
                </span>
                <span className="font-medium text-[11.5px] text-muted ml-auto flex-none">{a.publisher ?? a.source_id}</span>
              </a>
              {/* mobile row */}
              <a href={a.url} target="_blank" rel="noopener noreferrer" className="md:hidden block px-[14px] py-[9px] text-ink hover:text-ink no-underline">
                <div className="font-semibold text-[13px] lh-body" lang={a.lang ?? undefined}>
                  {a.title}
                </div>
                <div className="font-medium text-[10.5px] text-muted mt-[2px] num">
                  {a.publisher ?? a.source_id} · {fmtWhen(a.published_at, lang)}
                </div>
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
