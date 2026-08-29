import { STAT_CARDS } from "@/lib/config";
import { fmtCadence, fmtDay, hostOf } from "@/lib/format";
import { localised, t, type Lang } from "@/lib/i18n";
import type { StatRow } from "@/lib/queries";
import Card from "@/components/ui/Card";
import EmptyState from "@/components/ui/EmptyState";
import SectionHead from "@/components/ui/SectionHead";

/**
 * Section 02 — What happened, in numbers: six tilted stat cards from the `stats` table
 * (wave_time_to_port, wave_speed, galchhi_rise, bodies_downstream_km, missing_counts_divergence, reports_total).
 * Every card carries its caption in the current language and a source link with the as-of day.
 */
export default function StrikingStats({ lang, stats }: { lang: Lang; stats: StatRow[] | null }) {
  const rows = (stats ?? []).map((s) => ({ ...s, rot: STAT_CARDS.find((c) => c.id === s.id)?.rot ?? 0 }));
  return (
    <section data-block="stats" data-n="02" className="max-w-[1280px] mx-auto px-4 md:px-7 mt-7" aria-labelledby="sec-stats">
      <SectionHead n="02" title={<span id="sec-stats">{t(lang, "sec.stats")}</span>} />
      {rows.length ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-[18px] md:gap-[22px] mt-4">
          {rows.map((s) => {
            const caption = localised(s as unknown as Record<string, unknown>, "caption", lang);
            const label = s.source_url ? `${hostOf(s.source_url)}${s.as_of ? ` · ${fmtDay(s.as_of, lang)}` : ""}` : s.id === "reports_total" ? t(lang, "sec.stats_source_live") : s.as_of ? fmtDay(s.as_of, lang) : "";
            return (
              <Card key={s.id} shadow={4} tilt={s.rot} padding="px-5 py-[26px] md:py-[22px]" as="article">
                <div className="font-extrabold text-[46px] md:text-[44px] leading-none tracking-[-0.01em] num">{s.value}</div>
                <p className="font-medium text-[14px] lh-body mt-2 mb-0 [text-wrap:pretty]">{caption}</p>
                {s.source_url ? (
                  <a href={s.source_url} target="_blank" rel="noopener noreferrer" className="font-semibold text-[11px] text-amber-link hover:text-amber-text">
                    {label}
                  </a>
                ) : (
                  <span className="font-semibold text-[11px] text-muted">{label}</span>
                )}
              </Card>
            );
          })}
        </div>
      ) : (
        <div className="mt-4">
          <EmptyState>{t(lang, "sec.stats_empty", { cadence: fmtCadence(lang) })}</EmptyState>
        </div>
      )}
    </section>
  );
}
