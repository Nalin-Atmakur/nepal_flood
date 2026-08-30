import type { Metadata } from "next";
import FirstHours from "@/components/blocks/FirstHours";
import SideBySide from "@/components/blocks/SideBySide";
import StrikingStats from "@/components/blocks/StrikingStats";
import { asLang, t } from "@/lib/i18n";
import { pageMetadata } from "@/lib/metadata";
import { getEventTimeline, getHeadlineSeries, getLiveCounts, getNationalFigures, getStats } from "@/lib/queries";

/** /numbers — the numbers side by side (+ sparklines), what happened in numbers, the first hours (docs/17). */
export const revalidate = 300;

export async function generateMetadata({ params }: { params: Promise<{ lang: string }> }): Promise<Metadata> {
  const lang = asLang((await params).lang);
  return pageMetadata(lang, { title: t(lang, "tabs.numbers"), path: "/numbers" });
}

export default async function NumbersPage({ params }: { params: Promise<{ lang: string }> }) {
  const lang = asLang((await params).lang);
  const [live, figures, series, stats, events] = await Promise.all([getLiveCounts(), getNationalFigures(), getHeadlineSeries(), getStats(), getEventTimeline()]);
  return (
    <main data-page="numbers" className="pt-2 md:pt-3 pb-[30px]">
      <h1 className="sr-only">{t(lang, "tabs.numbers")}</h1>
      <SideBySide lang={lang} figures={figures} lastAttempt={live?.last_pull_at ?? null} series={series} />
      <StrikingStats lang={lang} stats={stats} />
      <FirstHours lang={lang} events={events} />
    </main>
  );
}
