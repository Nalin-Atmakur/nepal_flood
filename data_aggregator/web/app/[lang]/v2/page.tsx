import type { Metadata } from "next";
import Corridor from "@/components/blocks/Corridor";
import HeroEvent from "@/components/blocks/HeroEvent";
import SpreadCard from "@/components/blocks/SpreadCard";
import YourPart from "@/components/blocks/YourPart";
import { asLang, t } from "@/lib/i18n";
import { pageMetadata } from "@/lib/metadata";
import { splitDistricts } from "@/lib/places-split";
import { getLakeVolumeM3, getLiveCounts, getLostBridges, getNationalFigures, getPlaces, getPlaceStatuses } from "@/lib/queries";

/**
 * PREVIEW of the redesigned home page (web/docs/22-home-v4.md). Not linked from anywhere; `/[lang]/v2` exists so
 * the ordering can be judged on a real phone with real data before it replaces `/[lang]`.
 *
 * The order answers the questions a stranger actually arrives with, in the order they arrive:
 *   1 what happened, how bad          HeroEvent   (event → three numbers → still out of contact, ticking)
 *   2 pass it on                      SpreadCard  (named recipients, not "share this" — while the shock is fresh)
 *   3 show me                         Corridor    (real footage first, then the replay of the path)
 *   4 what do I do if it's my people  YourPart    (the ask + what happens to a submission)
 * Everything deeper stays in the tabs.
 */
export const revalidate = 300;

export async function generateMetadata({ params }: { params: Promise<{ lang: string }> }): Promise<Metadata> {
  const lang = asLang((await params).lang);
  return { ...pageMetadata(lang, { path: "/v2" }), robots: { index: false, follow: false } };
}

export default async function HomeV2({ params }: { params: Promise<{ lang: string }> }) {
  const lang = asLang((await params).lang);
  const [live, figures, statuses, refs, lakeVolumeM3, lostBridges] = await Promise.all([
    getLiveCounts(),
    getNationalFigures(),
    getPlaceStatuses(),
    getPlaces(),
    getLakeVolumeM3(),
    getLostBridges(),
  ]);
  const { places: placeRows } = splitDistricts(statuses);

  return (
    <main data-page="home-v2">
      <HeroEvent lang={lang} figures={figures} />
      <SpreadCard lang={lang} />
      <Corridor
        lang={lang}
        statuses={placeRows}
        refs={refs}
        lakeVolumeM3={lakeVolumeM3}
        lostBridges={lostBridges}
        heading={{ title: t(lang, "hero.path_title"), sub: t(lang, "hero.path_sub") }}
      />
      <YourPart lang={lang} live={live} />
    </main>
  );
}
