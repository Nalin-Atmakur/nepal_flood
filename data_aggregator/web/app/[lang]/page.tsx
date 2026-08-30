import type { Metadata } from "next";
import Corridor from "@/components/blocks/Corridor";
import RightNow from "@/components/blocks/RightNow";
import YourPart from "@/components/blocks/YourPart";
import { asLang, t } from "@/lib/i18n";
import { pageMetadata } from "@/lib/metadata";
import { splitDistricts } from "@/lib/places-split";
import { getDigest, getLakeVolumeM3, getLiveCounts, getLostBridges, getNationalFigures, getPlaces, getPlaceStatuses } from "@/lib/queries";

/**
 * Home — three things and nothing else (web/docs/17-information-architecture.md): Right now (the headline numbers
 * and today's line) → the corridor simulation → Your part (the ask). Everything deeper lives in the tabs
 * (Numbers · Places · Latest · More). ISR every 5 minutes.
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
      <h1 className="sr-only">{t(lang, "site.name")}</h1>
      <RightNow lang={lang} figures={figures} digest={digest} live={live} />
      <Corridor lang={lang} statuses={placeRows} refs={refs} lakeVolumeM3={lakeVolumeM3} lostBridges={lostBridges} />
      <YourPart lang={lang} />
    </main>
  );
}
