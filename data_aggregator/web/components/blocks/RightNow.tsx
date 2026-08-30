import Link from "next/link";
import { AGENCIES } from "@/lib/config";
import { fmtAsOf, fmtCadence, fmtDay, fmtDayTime, fmtInt } from "@/lib/format";
import { href, t, type Lang } from "@/lib/i18n";
import { pickFigure, type DigestRow, type FigureLatest, type LiveCounts } from "@/lib/queries";
import EmptyState from "@/components/ui/EmptyState";

/**
 * "Right now" — the first thing on the home page (web/docs/17-information-architecture.md): the three headline
 * numbers a carrier can repeat (NDRRMA dead · out of contact · rescued, with as-of), today's one-line headline from
 * the digest (→ /latest), two tiny live counters, and a plain-words link to add what you know. No jargon.
 */
export default function RightNow({ lang, figures, digest, live }: { lang: Lang; figures: FigureLatest[] | null; digest: DigestRow | null; live: LiveCounts | null }) {
  const ndrrma = AGENCIES[0];
  const dead = pickFigure(figures, ndrrma.publishers, ndrrma.dead);
  const missing = pickFigure(figures, ndrrma.publishers, ndrrma.missing);
  const rescued = pickFigure(figures, ndrrma.publishers, ndrrma.rescued);
  const asOf = dead?.as_of ?? missing?.as_of ?? rescued?.as_of ?? null;
  const cadence = fmtCadence(lang);
  const none = !dead && !missing && !rescued;

  return (
    <section data-block="right-now" className="max-w-[1280px] mx-auto px-4 md:px-7 mt-[14px] md:mt-5" aria-labelledby="sec-right-now">
      <div className="bg-board text-white b-ink rounded-r2 shadow-hard-3 md:shadow-hard-4 relative overflow-hidden px-4 py-[14px] md:px-6 md:py-5">
        <span className="amber-quarter" style={{ width: 150, height: 150, right: -46, top: -46 }} />
        <div className="flex items-center gap-3 flex-wrap relative">
          <span className="arcade text-amber" style={{ fontSize: 7, lineHeight: 1 }}>
            {t(lang, "live.right_now")}
          </span>
          <span className="font-semibold text-[11px] text-board-text num">{digest ? fmtDay(digest.day, lang) : asOf ? fmtDay(asOf, lang) : ""}</span>
          <span className="ml-auto flex items-center gap-3 font-semibold text-[11px] text-board-text num">
            <span title={t(lang, "live.today")}>
              <span className="text-amber font-extrabold">{fmtInt(live?.submissions_today ?? 0)}</span> {t(lang, "live.today_m")}
            </span>
            <span title={t(lang, "live.since_pull")}>
              {live?.last_processed_at ? t(lang, "rightnow.updated", { t: fmtDayTime(live.last_processed_at, lang) }) : t(lang, "live.no_pull")}
            </span>
          </span>
        </div>
        <h2 id="sec-right-now" className="sr-only">
          {t(lang, "live.right_now")}
        </h2>

        {none ? (
          <div className="mt-3">
            <EmptyState>{t(lang, "sec.side_empty", { t: live?.last_pull_at ? fmtDayTime(live.last_pull_at, lang) : "—", cadence })}</EmptyState>
          </div>
        ) : (
          <div className="grid grid-cols-3 gap-3 md:gap-6 mt-3 relative" data-testid="right-now-figures">
            <Figure value={dead?.value ?? null} label={t(lang, "og.dead")} tone="white" />
            <Figure value={missing?.value ?? null} label={t(lang, "og.out_of_contact")} tone="amber" />
            <Figure value={rescued?.value ?? null} label={t(lang, "og.rescued")} tone="green" />
          </div>
        )}
        {asOf ? (
          <div className="font-semibold text-[11px] text-board-text mt-2 num relative">
            NDRRMA · {fmtAsOf(asOf, lang)}
            {dead?.url ? (
              <>
                {" "}
                <a href={dead.url} target="_blank" rel="noopener noreferrer" className="text-footer-link hover:text-white">
                  ↗
                </a>
              </>
            ) : null}
          </div>
        ) : null}

        {digest?.headline ? (
          <Link href={href(lang, "/latest")} className="block mt-3 no-underline text-white hover:text-white relative group">
            <span className="font-extrabold text-[16px] md:text-[19px] lh-tight [text-wrap:balance] group-hover:underline">{digest.headline}</span>
            <span className="block font-semibold text-[12px] text-footer-link mt-1">{t(lang, "rightnow.more")}</span>
          </Link>
        ) : null}

        <p className="m-0 mt-3 font-medium text-[12.5px] md:text-[13px] text-board-body lh-body relative">
          {t(lang, "rightnow.ask")}{" "}
          <Link href={href(lang, "/report")} className="font-bold text-amber hover:text-white">
            {t(lang, "nav.add")}
          </Link>
        </p>
      </div>
    </section>
  );
}

function Figure({ value, label, tone }: { value: number | null; label: string; tone: "white" | "amber" | "green" }) {
  const c = tone === "amber" ? "text-amber" : tone === "green" ? "text-live-green" : "text-white";
  return (
    <div>
      <div className={["font-extrabold text-[26px] md:text-[36px] leading-none num", c].join(" ")}>{value === null ? "—" : fmtInt(value)}</div>
      <div className="font-semibold text-[11px] md:text-[12.5px] text-board-body mt-1">{label}</div>
    </div>
  );
}
