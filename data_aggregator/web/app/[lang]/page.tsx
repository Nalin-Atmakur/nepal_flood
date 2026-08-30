import type { Metadata } from "next";
import { asLang, t } from "@/lib/i18n";
import { pageMetadata } from "@/lib/metadata";
import { getArticles, getDigest, getEventTimeline, getFlyingWindows, getGauges, getLakeVolumeM3, getLiveCounts, getNationalFigures, getPlaces, getPlaceStatuses, getStats } from "@/lib/queries";
import AddCtas from "@/components/blocks/AddCtas";
import Corridor from "@/components/blocks/Corridor";
import Digest from "@/components/blocks/Digest";
import FirstHours from "@/components/blocks/FirstHours";
import Latest from "@/components/blocks/Latest";
import PlacesTable from "@/components/blocks/PlacesTable";
import { splitDistricts } from "@/lib/places-split";
import RiverWeather from "@/components/blocks/RiverWeather";
import Scoreboard from "@/components/blocks/Scoreboard";
import ShareBar from "@/components/blocks/ShareBar";
import SideBySide from "@/components/blocks/SideBySide";
import StrikingStats from "@/components/blocks/StrikingStats";
import SectionHead from "@/components/ui/SectionHead";

/**
 * Home — composes the blocks in design order: scoreboard → what changed today (dark card, hidden without a
 * digest) → 01 corridor → 02 numbers → 03 the first hours → 04 side by side → 05 places → 06 add →
 * 07 river & weather → 08 latest → share. ISR every 5 minutes. See web/docs/05-home-blocks.md.
 */
export const revalidate = 300;

export async function generateMetadata({ params }: { params: Promise<{ lang: string }> }): Promise<Metadata> {
  const lang = asLang((await params).lang);
  return pageMetadata(lang, { path: "/" });
}

export default async function Home({ params }: { params: Promise<{ lang: string }> }) {
  const lang = asLang((await params).lang);
  const [live, statuses, refs, stats, figures, gauges, windows, articles, events, digest, lakeVolumeM3] = await Promise.all([
    getLiveCounts(),
    getPlaceStatuses(),
    getPlaces(),
    getStats(),
    getNationalFigures(),
    getGauges(),
    getFlyingWindows(),
    getArticles(12),
    getEventTimeline(),
    getDigest(lang),
    getLakeVolumeM3(),
  ]);
  const { places: placeRows } = splitDistricts(statuses);
  const lastAttempt = live?.last_pull_at ?? null;

  return (
    <main>
      <h1 className="sr-only">{t(lang, "site.name")}</h1>
      <Scoreboard lang={lang} initial={live} />
      <Digest lang={lang} digest={digest} />
      <Corridor lang={lang} statuses={placeRows} refs={refs} lakeVolumeM3={lakeVolumeM3} />
      <StrikingStats lang={lang} stats={stats} />
      <FirstHours lang={lang} events={events} />
      <SideBySide lang={lang} figures={figures} lastAttempt={lastAttempt} />
      <section data-block="places" data-n="05" className="max-w-[1280px] mx-auto px-4 md:px-7 mt-7" aria-labelledby="sec-places">
        <SectionHead n="05" title={<span id="sec-places">{t(lang, "sec.places")}</span>} sub={<span className="hidden md:inline">{t(lang, "sec.places_sub")}</span>} align="center" />
        <PlacesTable lang={lang} statuses={placeRows} refs={refs} />
      </section>
      <AddCtas lang={lang} />
      <RiverWeather lang={lang} gauges={gauges} windows={windows} />
      <Latest lang={lang} articles={articles} lastAttempt={lastAttempt} />
      <div className="max-w-[1280px] mx-auto px-4 md:px-7 mt-5 md:mt-7">
        <ShareBar lang={lang} path="/" />
      </div>
    </main>
  );
}
