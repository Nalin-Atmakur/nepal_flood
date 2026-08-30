import Link from "next/link";
import { AGENCIES } from "@/lib/config";
import { fmtAsOf, fmtCadence, fmtDayTime, fmtInt } from "@/lib/format";
import { href, t, type Lang } from "@/lib/i18n";
import { pickFigure, type FigureLatest, type SeriesPoint } from "@/lib/queries";
import { deltaSinceYesterday, fmtDelta, seriesFor } from "@/lib/trends";
import Sparkline from "@/components/ui/Sparkline";
import EmptyState from "@/components/ui/EmptyState";
import SectionHead from "@/components/ui/SectionHead";
import { Table, TableBox, Td, Th, THead } from "@/components/ui/Table";

/**
 * Section 04 — The numbers, side by side: figures_latest pivoted to
 * columns NDRRMA · Nepal Police · MoFA · Dept of Tourism · OPMCM portal × rows Dead · Missing/out of contact · Rescued.
 * Each cell = value + note + as-of; "—" when absent. The NDRRMA cells also carry a sparkline of the last days
 * (figure_series) with "+N since yesterday". Mobile: horizontal scroll with a sticky first column.
 */
export default function SideBySide({ lang, figures, lastAttempt, series = null }: { lang: Lang; figures: FigureLatest[] | null; lastAttempt: string | null; series?: SeriesPoint[] | null }) {
  const rows: { key: "dead" | "missing" | "rescued"; labelKey: string }[] = [
    { key: "dead", labelKey: "row.dead" },
    { key: "missing", labelKey: "row.missing" },
    { key: "rescued", labelKey: "row.rescued" },
  ];
  const any = !!figures && figures.length > 0;

  const headerUrl = (a: (typeof AGENCIES)[number]) => {
    const pubs = a.publishers.map((x) => x.toLowerCase());
    const withUrl = (figures ?? []).find((f) => pubs.includes(f.publisher.toLowerCase()) && f.url);
    return withUrl?.url ?? a.url;
  };

  return (
    <section data-block="side" data-n="04" className="max-w-[1280px] mx-auto px-4 md:px-7 mt-7" aria-labelledby="sec-side">
      <SectionHead n="04" title={<span id="sec-side">{t(lang, "sec.side")}</span>} sub={<span className="hidden md:inline">{t(lang, "sec.side_sub")}</span>} />
      {any ? (
        <TableBox className="mt-[14px]">
          <div className="scroll-x">
            <Table minWidth={640}>
              <THead>
                <Th sticky className="w-[190px]">
                  <span className="sr-only">{t(lang, "word.source")}</span>
                </Th>
                {AGENCIES.map((a) => (
                  <Th key={a.key}>
                    <a href={headerUrl(a)} target="_blank" rel="noopener noreferrer" className="text-ink hover:text-ink">
                      {t(lang, a.labelKey)}
                    </a>
                  </Th>
                ))}
              </THead>
              <tbody>
                {rows.map((r) => (
                  <tr key={r.key}>
                    <Td sticky className="font-extrabold text-[13px] md:text-[15px] whitespace-nowrap py-[10px] md:py-[14px]">
                      {t(lang, r.labelKey)}
                    </Td>
                    {AGENCIES.map((a) => {
                      const f = pickFigure(figures, a.publishers, a[r.key]);
                      const note = f?.note || (r.key !== "dead" && a.noteKey ? t(lang, a.noteKey) : "");
                      const pts = a.key === "ndrrma" && f ? seriesFor(series, "NDRRMA", f.metric) : [];
                      const delta = deltaSinceYesterday(pts);
                      return (
                        <Td key={a.key} className="py-[10px] md:py-[14px] px-3 md:px-4">
                          <div className="font-extrabold text-[17px] md:text-[22px] leading-none num">{f ? fmtInt(f.value) : "—"}</div>
                          {pts.length >= 2 ? (
                            <div className="flex items-center gap-[6px] mt-[4px]" data-testid="trend">
                              <Sparkline values={pts.map((p) => Number(p.value))} label={t(lang, "trend.days", { d: pts.length })} />
                              {delta !== null ? (
                                <span className={["arcade text-[8px] num whitespace-nowrap", delta > 0 && r.key !== "rescued" ? "text-amber-text" : "text-muted"].join(" ")}>
                                  {t(lang, "trend.since_yesterday", { n: fmtDelta(delta) })}
                                </span>
                              ) : null}
                            </div>
                          ) : null}
                          <div className="font-medium text-[9.5px] md:text-[10.5px] text-muted mt-[3px] whitespace-nowrap">
                            {f ? (
                              <>
                                {note ? `${note} ` : ""}
                                {f.url ? (
                                  <a href={f.url} target="_blank" rel="noopener noreferrer" className="text-muted hover:text-ink" title={fmtDayTime(f.as_of, lang)}>
                                    {fmtAsOf(f.as_of, lang)}
                                  </a>
                                ) : (
                                  fmtAsOf(f.as_of, lang)
                                )}
                              </>
                            ) : (
                              ""
                            )}
                          </div>
                        </Td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </Table>
          </div>
        </TableBox>
      ) : (
        <div className="mt-[14px]">
          <EmptyState>{t(lang, "sec.side_empty", { t: lastAttempt ? fmtDayTime(lastAttempt, lang) : "—", cadence: fmtCadence(lang) })}</EmptyState>
        </div>
      )}
      <p className="hidden md:block font-medium text-[13.5px] lh-body text-muted-3 mt-3 mb-0 max-w-[960px]">
        {t(lang, "sec.side_explainer")}{" "}
        <Link href={href(lang, "/about")} className="text-amber-link hover:text-amber-text">
          {t(lang, "sec.side_more")}
        </Link>
      </p>
      <p className="md:hidden font-medium text-[12px] lh-body text-muted-3 mt-2 mb-0">
        {t(lang, "sec.side_explainer_m")}{" "}
        <Link href={href(lang, "/about")} className="text-amber-link hover:text-amber-text">
          {t(lang, "sec.side_why")}
        </Link>
      </p>
    </section>
  );
}
