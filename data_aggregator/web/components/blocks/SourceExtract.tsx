"use client";

import { useState, type ReactNode } from "react";
import { fmtCadence, fmtDayTime, fmtInt } from "@/lib/format";
import { t, type Lang } from "@/lib/i18n";
import { fetchSourceExtract, type SourceCounts, type SourceExtract as Extract } from "@/lib/queries";
import { browserClient } from "@/lib/supabase";
import { Td } from "@/components/ui/Table";

/**
 * One /sources table row with a "▸" disclosure that opens exactly what we extracted from that source
 * (web/docs/15-sources-page.md): counts server-rendered from v_source_counts, the newest figures and headlines
 * fetched on first expand from v_source_figures_recent / v_source_articles_recent (anon key, cached in state).
 * Derived sources (computed from other sources) show what they derive from instead of a fetch.
 */
export type SourceRowCells = {
  id: string;
  name: string;
  holds: string;
  fetched: string;
  fetchedClass: string;
  fetchedTitle?: string;
  url: string | null;
  derived: boolean;
  isSite: boolean;
};

type Props = { lang: Lang; cells: SourceRowCells; counts: SourceCounts | null; grade: ReactNode };

const COLS = 6;

export default function SourceExtract({ lang, cells, counts, grade }: Props) {
  const [open, setOpen] = useState(false);
  const [data, setData] = useState<Extract | null>(null);
  const [loading, setLoading] = useState(false);
  const [failed, setFailed] = useState(false);
  const panelId = `src-${cells.id}`;
  const total = (counts?.figures_total ?? 0) + (counts?.articles_total ?? 0);

  async function toggle() {
    const next = !open;
    setOpen(next);
    if (!next || data || cells.derived || cells.isSite) return;
    const sb = browserClient();
    if (!sb) {
      setFailed(true);
      return;
    }
    setLoading(true);
    try {
      setData(await fetchSourceExtract(sb, cells.id));
    } catch {
      setFailed(true);
    } finally {
      setLoading(false);
    }
  }

  const countsLine = counts && total > 0
    ? t(lang, "sources.counts", { f: fmtInt(counts.figures_total), a: fmtInt(counts.articles_total), t: counts.last_row_at ? fmtDayTime(counts.last_row_at, lang) : "—" })
    : t(lang, "sources.counts_none");

  return (
    <>
      <tr>
        <Td className="py-[6px] pr-0 w-[44px]">
          <button
            type="button"
            onClick={() => void toggle()}
            aria-expanded={open}
            aria-controls={panelId}
            aria-label={open ? t(lang, "sources.close") : t(lang, "sources.open", { name: cells.name })}
            data-testid="source-toggle"
            className={[
              "inline-grid place-items-center w-10 h-10 rounded-r2 b-ink-2 font-extrabold text-[14px] cursor-pointer transition-transform",
              open ? "bg-amber-fill rotate-90" : "bg-card hover:bg-ground",
            ].join(" ")}
          >
            ▸
          </button>
        </Td>
        <Td className="font-bold text-[13.5px] py-[9px]">{cells.name}</Td>
        <Td className="text-muted-2 py-[9px]">
          {cells.holds}
          <div className="font-medium text-[11px] text-muted num mt-[2px]">{cells.isSite ? "" : countsLine}</div>
        </Td>
        <Td className="py-[9px]">{grade}</Td>
        <Td className={["font-semibold py-[9px] whitespace-nowrap num", cells.fetchedClass].join(" ")} title={cells.fetchedTitle}>
          {cells.fetched}
        </Td>
        <Td className="py-[9px]">
          {cells.url && !cells.derived ? (
            <a href={cells.url} target="_blank" rel="noopener noreferrer">
              {t(lang, "sources.visit")}
            </a>
          ) : (
            "—"
          )}
        </Td>
      </tr>
      {open ? (
        <tr id={panelId} data-testid="source-panel">
          <td colSpan={COLS} className="p-0">
            {/* sticky + capped width: the table scrolls sideways on phones, the panel must stay within the viewport */}
            <div className="bg-ground border-t-[2px] border-ink px-3 py-3 md:px-4 md:py-4 sticky left-0" style={{ maxWidth: "calc(100vw - 2rem - 5px)" }}>
              {cells.derived ? (
                <p className="m-0 font-medium text-[13px] lh-body">{t(lang, "sources.derived_note", { holds: cells.holds })}</p>
              ) : cells.isSite ? (
                <p className="m-0 font-medium text-[13px] lh-body">{cells.holds}</p>
              ) : loading ? (
                <p className="m-0 font-semibold text-[13px] text-muted" role="status">
                  {t(lang, "sources.loading")}
                </p>
              ) : failed || !data || (data.figures.length === 0 && data.articles.length === 0) ? (
                <div className="border-[2px] border-dashed border-ink rounded-r2 px-3 py-3 font-medium text-[13px] text-muted lh-body">
                  {t(lang, "sources.extract_empty", { cadence: fmtCadence(lang) })}
                </div>
              ) : (
                <div className="grid md:grid-cols-[1fr_minmax(0,380px)] gap-4">
                  {data.figures.length ? (
                    <div>
                      <div className="font-extrabold text-[13px] mb-2">{t(lang, "sources.figures_title")}</div>
                      <ul className="list-none m-0 p-0 flex flex-col gap-[4px] max-h-[360px] overflow-y-auto pr-1">
                        {data.figures.map((f, i) => (
                          <li key={`${f.metric}-${f.scope}-${f.as_of}-${i}`} className="flex flex-wrap items-baseline gap-x-2 gap-y-0 bg-card b-ink-2 rounded-r2 px-[10px] py-[5px] text-[12.5px]">
                            <span className="font-bold">{f.metric}</span>
                            <span className="text-muted">{f.scope}</span>
                            <span className="font-extrabold num ml-auto">{fmtInt(f.value)}</span>
                            <span className="font-medium text-[11px] text-muted num whitespace-nowrap">
                              {f.as_of ? fmtDayTime(f.as_of, lang) : fmtDayTime(f.fetched_at, lang)}
                            </span>
                            {f.url ? (
                              <a href={f.url} target="_blank" rel="noopener noreferrer" className="font-semibold text-[11px]">
                                ↗
                              </a>
                            ) : null}
                            {f.note ? <span className="basis-full font-medium text-[11px] text-muted lh-body">{f.note}</span> : null}
                          </li>
                        ))}
                      </ul>
                      {counts && counts.figures_total > data.figures.length ? (
                        <p className="m-0 mt-2 font-medium text-[11px] text-muted num">
                          {t(lang, "sources.more_figures", { n: fmtInt(data.figures.length), total: fmtInt(counts.figures_total) })}
                        </p>
                      ) : null}
                    </div>
                  ) : null}
                  {data.articles.length ? (
                    <div>
                      <div className="font-extrabold text-[13px] mb-2">{t(lang, "sources.articles_title")}</div>
                      <ul className="list-none m-0 p-0 flex flex-col gap-[6px]">
                        {data.articles.map((a) => (
                          <li key={a.url} className="text-[12.5px] lh-body">
                            <a href={a.url} target="_blank" rel="noopener noreferrer" className="font-semibold">
                              {a.title || a.url}
                            </a>
                            <span className="font-medium text-[11px] text-muted num"> · {a.published_at ? fmtDayTime(a.published_at, lang) : fmtDayTime(a.fetched_at, lang)}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ) : null}
                </div>
              )}
            </div>
          </td>
        </tr>
      ) : null}
    </>
  );
}
