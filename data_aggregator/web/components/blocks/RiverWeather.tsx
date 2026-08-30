import { FLYING_METRIC, FLYING_SITES, GAUGE_STATIONS } from "@/lib/config";
import { fmtDay, fmtDayTime, fmtTime, hostOf } from "@/lib/format";
import { t, type Lang } from "@/lib/i18n";
import type { FigureLatest, GaugeRow } from "@/lib/queries";
import { colors } from "@/lib/tokens";
import { Dot } from "@/components/ui/Badge";
import EmptyState from "@/components/ui/EmptyState";
import SectionHead from "@/components/ui/SectionHead";

/**
 * Section 07 — River & weather: seven gauge tiles (alive/dead dot, level or "—", note) matched by station-name
 * substring from v_gauges_latest, and flying-window bars for Dhunche / Langtang from figures_latest
 * (metric flying_window_quality*, scope place:<id>…, value 0–1, note good|fair|poor, as_of = the day).
 */
export default function RiverWeather({ lang, gauges, windows }: { lang: Lang; gauges: GaugeRow[] | null; windows: FigureLatest[] | null }) {
  const tiles = GAUGE_STATIONS.map((name) => {
    const g = (gauges ?? []).find((row) => (row.station_name ?? row.station_id).toLowerCase().includes(name.toLowerCase()));
    return { name, g };
  });

  const sites = FLYING_SITES.map((site) => {
    const rows = (windows ?? [])
      .filter((w) => w.metric.startsWith(FLYING_METRIC) && w.scope.startsWith(`place:${site.placeId}`))
      .sort((a, b) => (a.as_of ?? "").localeCompare(b.as_of ?? ""))
      .slice(0, 3);
    return { ...site, rows };
  });
  const anyWindows = sites.some((s) => s.rows.length > 0);
  const src = (windows ?? []).find((w) => w.url || w.publisher);

  return (
    <section data-block="river" data-n="07" className="max-w-[1280px] mx-auto px-4 md:px-7 mt-7" aria-labelledby="sec-river">
      <SectionHead n="07" title={<span id="sec-river">{t(lang, "sec.river")}</span>} />
      <ul className="flex gap-2 md:gap-3 mt-[10px] md:mt-[14px] overflow-x-auto md:overflow-visible pb-[6px] md:pb-0 list-none m-0 p-0 scroll-x">
        {tiles.map(({ name, g }) => {
          const alive = !!g && g.alive !== false && g.level !== null;
          const dot = !g ? colors.deadDot : alive ? colors.confirmed : colors.deadDot;
          const value = g && g.level !== null && alive ? `${Number(g.level).toFixed(2)} m` : "—";
          const note = !g
            ? t(lang, "sec.gauge_nodata")
            : alive
              ? t(lang, "sec.gauge_alive", { t: fmtTime(g.observed_at) })
              : t(lang, "sec.gauge_dead", { t: fmtDayTime(g.observed_at, lang) });
          return (
            <li key={name} className="flex-none w-[118px] md:flex-1 md:w-auto bg-card b-ink rounded-r2 px-[10px] py-[10px] md:px-3 md:pt-3 md:pb-[10px]">
              <div className="flex items-center gap-[5px] md:gap-[6px] font-bold text-[11px] md:text-[12px]">
                <Dot color={dot} size={9} />
                {name}
              </div>
              <div className={["font-extrabold text-[17px] md:text-[20px] leading-none mt-[6px] md:mt-[7px] num", alive ? "text-ink" : "text-dead"].join(" ")}>{value}</div>
              <div className="font-medium text-[9px] md:text-[10px] lh-body text-muted mt-[3px] md:mt-1">{note}</div>
            </li>
          );
        })}
      </ul>
      <div className="font-medium text-[10.5px] text-muted mt-2">{t(lang, "sec.gauge_source")}</div>

      <div className="flex flex-wrap gap-6 md:gap-9 mt-[18px] items-end">
        {anyWindows ? (
          sites.map((s) =>
            s.rows.length ? (
              <div key={s.placeId}>
                <div className="font-bold text-[13px] mb-[6px]">{t(lang, "sec.fly_title", { site: t(lang, s.labelKey) })}</div>
                <div className="flex gap-2 items-end" role="img" aria-label={s.rows.map((r) => `${fmtDay(r.as_of, lang)} ${qualityLabel(lang, r)}`).join(", ")}>
                  {s.rows.map((r) => {
                    const q = qualityOf(r);
                    const h = 8 + Math.round(q * 32);
                    return (
                      <div key={r.scope + (r.as_of ?? "")} className="w-[70px]">
                        <div className="b-ink-2 rounded-t-r2" style={{ height: h, background: q >= 0.66 ? colors.confirmedFill : colors.amberFill }} />
                        <div className="font-semibold text-[10.5px] mt-[3px] num">
                          {fmtDay(r.as_of, lang)} · {qualityLabel(lang, r)}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ) : null,
          )
        ) : (
          <EmptyState className="w-full md:max-w-[560px]">{t(lang, "sec.fly_empty")}</EmptyState>
        )}
        {anyWindows && src ? (
          <div className="font-medium text-[12px] lh-body text-muted max-w-[280px]">
            {t(lang, "sec.fly_source", { src: src.url ? hostOf(src.url) : src.publisher, t: fmtDayTime(src.computed_at ?? src.as_of, lang) })}
          </div>
        ) : null}
      </div>
    </section>
  );
}

function qualityOf(r: FigureLatest): number {
  const v = Number(r.value);
  if (Number.isFinite(v)) return Math.max(0, Math.min(1, v > 1 ? v / 100 : v));
  return 0;
}

function qualityLabel(lang: Lang, r: FigureLatest): string {
  const n = (r.note ?? "").toLowerCase();
  if (n.includes("good")) return t(lang, "sec.fly_good");
  if (n.includes("fair")) return t(lang, "sec.fly_fair");
  if (n.includes("poor")) return t(lang, "sec.fly_poor");
  const q = qualityOf(r);
  return q >= 0.66 ? t(lang, "sec.fly_good") : q >= 0.33 ? t(lang, "sec.fly_fair") : t(lang, "sec.fly_poor");
}
