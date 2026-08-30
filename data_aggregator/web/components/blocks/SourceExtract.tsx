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
 * `layout="card"` renders the same source as a stacked card (phones: no sideways-scrolling table, nothing clipped);
 * the page renders cards below `md` and rows from `md` up.
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

type Props = { lang: Lang; cells: SourceRowCells; counts: SourceCounts | null; grade: ReactNode; layout?: "row" | "card" };

const COLS = 6;

export default function SourceExtract({ lang, cells, counts, grade, layout = "row" }: Props) {
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

  const panelBody = cells.derived ? (
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
    <ExtractLists lang={lang} data={data} counts={counts} />
  );

  const toggleButton = (
    <button
      type="button"
      onClick={() => void toggle()}
      aria-expanded={open}
      aria-controls={panelId}
      aria-label={open ? t(lang, "sources.close") : t(lang, "sources.open", { name: cells.name })}
      data-testid="source-toggle"
      className={[
        "inline-grid place-items-center min-w-[44px] min-h-[44px] rounded-r2 b-ink-2 font-extrabold text-[14px] cursor-pointer transition-transform",
        open ? "bg-amber-fill rotate-90" : "bg-card hover:bg-ground",
      ].join(" ")}
    >
      ▸
    </button>
  );

  if (layout === "card") {
    return (
      <article className="bg-card b-ink rounded-r2 shadow-hard-2 overflow-hidden" data-testid="source-card">
        <div className="flex items-start gap-3 px-3 py-3">
          <div className="flex-none pt-[2px]">{grade}</div>
          <div className="min-w-0 flex-1">
            <h3 className="m-0 font-extrabold text-[14.5px] lh-snug break-words">{cells.name}</h3>
            <div className={["font-semibold text-[12px] num mt-[2px]", cells.fetchedClass].join(" ")} title={cells.fetchedTitle}>
              {cells.fetched}
            </div>
            <p className="m-0 mt-[6px] font-medium text-[12.5px] text-muted-2 lh-body break-words">{cells.holds}</p>
            {cells.isSite ? null : <div className="font-medium text-[11px] text-muted num mt-[2px]">{countsLine}</div>}
            {cells.url && !cells.derived ? (
              <a href={cells.url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center min-h-[44px] font-semibold text-[13px]">
                {t(lang, "sources.visit")}
              </a>
            ) : null}
          </div>
          <div className="flex-none">{toggleButton}</div>
        </div>
        {open ? (
          <div id={panelId} data-testid="source-panel" className="bg-ground border-t-[2px] border-ink px-3 py-3">
            {panelBody}
          </div>
        ) : null}
      </article>
    );
  }

  return (
    <>
      <tr>
        <Td className="py-[6px] pr-0 w-[44px]">{toggleButton}</Td>
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
            <div className="bg-ground border-t-[2px] border-ink px-3 py-3 md:px-4 md:py-4">{panelBody}</div>
          </td>
        </tr>
      ) : null}
    </>
  );
}

/** The newest figures and headlines lists (shared by the row panel and the card panel). */
function ExtractLists({ lang, data, counts }: { lang: Lang; data: Extract; counts: SourceCounts | null }) {
  return (
    <div className="grid md:grid-cols-[1fr_minmax(0,380px)] gap-4">
      {data.figures.length ? (
        <div className="min-w-0">
          <div className="font-extrabold text-[13px] mb-2">{t(lang, "sources.figures_title")}</div>
          <ul className="list-none m-0 p-0 flex flex-col gap-[4px] max-h-[360px] overflow-y-auto pr-1">
            {data.figures.map((f, i) => (
              <li key={`${f.metric}-${f.scope}-${f.as_of}-${i}`} className="flex flex-wrap items-baseline gap-x-2 gap-y-0 bg-card b-ink-2 rounded-r2 px-[10px] py-[5px] text-[12.5px]">
                <span className="font-bold break-all">{f.metric}</span>
                <span className="text-muted break-all">{f.scope}</span>
                <span className="font-extrabold num ml-auto">{fmtInt(f.value)}</span>
                <span className="font-medium text-[11px] text-muted num whitespace-nowrap">{f.as_of ? fmtDayTime(f.as_of, lang) : fmtDayTime(f.fetched_at, lang)}</span>
                {f.url ? (
                  <a href={f.url} target="_blank" rel="noopener noreferrer" className="font-semibold text-[11px]">
                    ↗
                  </a>
                ) : null}
                {f.note ? <span className="basis-full font-medium text-[11px] text-muted lh-body break-words">{f.note}</span> : null}
              </li>
            ))}
          </ul>
          {counts && counts.figures_total > data.figures.length ? (
            <p className="m-0 mt-2 font-medium text-[11px] text-muted num">{t(lang, "sources.more_figures", { n: fmtInt(data.figures.length), total: fmtInt(counts.figures_total) })}</p>
          ) : null}
        </div>
      ) : null}
      {data.articles.length ? (
        <div className="min-w-0">
          <div className="font-extrabold text-[13px] mb-2">{t(lang, "sources.articles_title")}</div>
          <ul className="list-none m-0 p-0 flex flex-col gap-[6px]">
            {data.articles.map((a) => (
              <li key={a.url} className="text-[12.5px] lh-body break-words">
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
  );
}
