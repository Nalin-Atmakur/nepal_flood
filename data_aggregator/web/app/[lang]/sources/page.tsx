import type { Metadata } from "next";
import { SOURCE_GROUPS, SOURCE_OK_MINUTES } from "@/lib/config";
import { fmtAgo, fmtCadence, fmtDayTime, fmtInt, minutesSince, prettySourceName } from "@/lib/format";
import { asLang, t, type Lang } from "@/lib/i18n";
import { pageMetadata } from "@/lib/metadata";
import { getLiveCounts, getSources, type SourceStatusRow } from "@/lib/queries";
import { GradeCircle, NumberBadge } from "@/components/ui/Badge";
import EmptyState from "@/components/ui/EmptyState";
import SectionHead from "@/components/ui/SectionHead";
import { Table, TableBox, Td, Th, THead } from "@/components/ui/Table";

/**
 * /sources — every source we pull, grouped (Government, UN/humanitarian, Geospatial, Signals, News, Community),
 * with reliability circles A–E, last fetched coloured by staleness (green < 2 × PULL_INTERVAL, amber otherwise),
 * a link, the grade legend, and the dashed empty state.
 */
export const revalidate = 300;

export async function generateMetadata({ params }: { params: Promise<{ lang: string }> }): Promise<Metadata> {
  const lang = asLang((await params).lang);
  return pageMetadata(lang, { title: t(lang, "nav.sources"), path: "/sources" });
}

export default async function SourcesPage({ params }: { params: Promise<{ lang: string }> }) {
  const lang = asLang((await params).lang);
  const [sources, live] = await Promise.all([getSources(), getLiveCounts()]);
  const cadence = fmtCadence(lang);
  const groups = SOURCE_GROUPS.map((g) => ({ ...g, rows: (sources ?? []).filter((s) => (s.grp ?? "").toLowerCase() === g.grp) }));
  const known = new Set(SOURCE_GROUPS.map((g) => g.grp));
  const other = (sources ?? []).filter((s) => !known.has((s.grp ?? "").toLowerCase()));
  if (other.length) groups.push({ grp: "other", badge: "O", labelKey: "sources.group.community", rows: other });
  const lastAttempt = live?.last_pull_at ?? null;

  return (
    <main data-page="sources" className="max-w-[1280px] mx-auto px-4 md:px-7 pt-6 pb-8">
      <SectionHead title={<span id="sources-title">{t(lang, "sources.title")}</span>} sub={t(lang, "sources.sub", { cadence })} />

      {!sources || sources.length === 0 ? (
        <div className="mt-5">
          <EmptyState>{t(lang, "sources.empty_all")}</EmptyState>
        </div>
      ) : (
        groups.map((g) => (
          <section key={g.grp} className="mt-5" aria-labelledby={`grp-${g.grp}`}>
            <div className="flex items-center gap-[10px]">
              <NumberBadge n={g.badge} size={28} />
              <h2 id={`grp-${g.grp}`} className="font-extrabold text-[17px]">
                {t(lang, g.labelKey)}
              </h2>
            </div>
            {g.rows.length ? (
              <TableBox shadow={0} className="mt-[10px]">
                <div className="scroll-x">
                  <Table minWidth={720} className="text-[13.5px]">
                    <THead>
                      <Th className="w-[260px]">{t(lang, "sources.col.source")}</Th>
                      <Th>{t(lang, "sources.col.holds")}</Th>
                      <Th className="w-[110px]">{t(lang, "sources.col.reliability")}</Th>
                      <Th className="w-[150px]">{t(lang, "sources.col.last")}</Th>
                      <Th className="w-[80px]">{t(lang, "sources.col.link")}</Th>
                    </THead>
                    <tbody>
                      {g.rows.map((s) => (
                        <SourceRow key={s.id} s={s} lang={lang} live={live?.submissions_total ?? 0} lastAttempt={lastAttempt} />
                      ))}
                    </tbody>
                  </Table>
                </div>
              </TableBox>
            ) : (
              <div className="mt-[10px]">
                <EmptyState>{t(lang, "sources.empty_group")}</EmptyState>
              </div>
            )}
          </section>
        ))
      )}

      <div className="flex flex-wrap gap-[14px] mt-5 items-center">
        <span className="font-bold text-[13px]">{t(lang, "sources.grades")}</span>
        {(["A", "B", "C", "D", "E"] as const).map((g) => (
          <span key={g} className="inline-flex items-center gap-[7px] font-medium text-[12.5px]">
            <GradeCircle grade={g} size={24} />
            {t(lang, `sources.grade.${g}`)}
          </span>
        ))}
      </div>
      <div className="mt-4">
        <EmptyState>{t(lang, "sources.empty", { t: lastAttempt ? fmtDayTime(lastAttempt, lang) : "—", cadence })}</EmptyState>
      </div>
    </main>
  );
}

/** A source that is computed from other sources' rows and never fetched itself (sources.yaml: url "(derived …)"). */
export function isDerivedSource(s: Pick<SourceStatusRow, "url" | "family">): boolean {
  return s.family === "derived" || !s.url || s.url.trim().startsWith("(");
}

function SourceRow({ s, lang, live, lastAttempt }: { s: SourceStatusRow; lang: Lang; live: number; lastAttempt: string | null }) {
  const isSite = s.id === "site_reports" || s.family === "site";
  const derived = isDerivedSource(s);
  const mins = minutesSince(s.last_fetched_at);
  const ok = s.last_fetched_at !== null && s.last_ok !== false && mins !== null && mins < SOURCE_OK_MINUTES;
  let fetched: string;
  if (isSite) fetched = t(lang, "sources.live");
  else if (derived) fetched = t(lang, "sources.derived");
  else if (!s.last_fetched_at) fetched = lastAttempt ? t(lang, "sources.empty", { t: fmtDayTime(lastAttempt, lang), cadence: fmtCadence(lang) }).split(".")[0] : t(lang, "sources.never");
  else if (s.last_ok === false) fetched = t(lang, "sources.failed", { ago: fmtAgo(s.last_fetched_at, lang) });
  else fetched = fmtAgo(s.last_fetched_at, lang);
  const colour = isSite || ok ? "text-confirmed" : derived ? "text-muted" : "text-amber-text";
  const name = isSite ? t(lang, "sources.this_site") : prettySourceName(s.name, s.id);
  const holds = isSite ? t(lang, "sources.this_site_holds", { n: fmtInt(live) }) : (s.holds ?? s.family);
  return (
    <tr>
      <Td className="font-bold text-[13.5px] py-[9px]">{name}</Td>
      <Td className="text-muted-2 py-[9px]">{holds}</Td>
      <Td className="py-[9px]">
        <GradeCircle grade={s.reliability} />
      </Td>
      <Td className={["font-semibold py-[9px] whitespace-nowrap num", colour].join(" ")} title={s.last_fetched_at ? fmtDayTime(s.last_fetched_at, lang) : undefined}>
        {fetched}
      </Td>
      <Td className="py-[9px]">
        {s.url && !derived ? (
          <a href={s.url} target="_blank" rel="noopener noreferrer">
            {t(lang, "sources.visit")}
          </a>
        ) : (
          "—"
        )}
      </Td>
    </tr>
  );
}
