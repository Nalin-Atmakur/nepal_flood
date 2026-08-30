import type { Metadata } from "next";
import Corridor from "@/components/blocks/Corridor";
import HeroEvent from "@/components/blocks/HeroEvent";
import SpreadCard from "@/components/blocks/SpreadCard";
import YourPart from "@/components/blocks/YourPart";
import { asLang, t } from "@/lib/i18n";
import { pageMetadata } from "@/lib/metadata";
import { splitDistricts } from "@/lib/places-split";
import { getDigest, getLakeVolumeM3, getLiveCounts, getLostBridges, getNationalFigures, getPlaces, getPlaceStatuses } from "@/lib/queries";

/**
 * Home (web/docs/22-home-v4.md, live 30 Aug).
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
  return pageMetadata(lang, { path: "/" });
}

export default async function Home({ params }: { params: Promise<{ lang: string }> }) {
  const lang = asLang((await params).lang);
  const [live, figures, digest, statuses, refs, lakeVolumeM3, lostBridges] = await Promise.all([
    getLiveCounts(),
    getNationalFigures(),
    getDigest(lang),
    getPlaceStatuses(),
    getPlaces(),
    getLakeVolumeM3(),
    getLostBridges(),
  ]);
  const { places: placeRows } = splitDistricts(statuses);

  return (
    <main>
      <HeroEvent lang={lang} figures={figures} digest={digest} />
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
