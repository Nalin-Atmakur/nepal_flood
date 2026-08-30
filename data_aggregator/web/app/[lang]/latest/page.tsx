import type { Metadata } from "next";
import Digest from "@/components/blocks/Digest";
import Latest from "@/components/blocks/Latest";
import RiverWeather from "@/components/blocks/RiverWeather";
import YourPart from "@/components/blocks/YourPart";
import { asLang, t } from "@/lib/i18n";
import { pageMetadata } from "@/lib/metadata";
import { getArticles, getDigest, getFlyingWindows, getGauges, getLiveCounts } from "@/lib/queries";

/** /latest ("Latest news") — Your part with the live counters, what changed today in full, the latest headlines, river & weather (docs/17). */
export const revalidate = 300;

export async function generateMetadata({ params }: { params: Promise<{ lang: string }> }): Promise<Metadata> {
  const lang = asLang((await params).lang);
  return pageMetadata(lang, { title: t(lang, "tabs.latest"), path: "/latest" });
}

export default async function LatestPage({ params }: { params: Promise<{ lang: string }> }) {
  const lang = asLang((await params).lang);
  const [live, digest, articles, gauges, windows] = await Promise.all([getLiveCounts(), getDigest(lang), getArticles(20), getGauges(), getFlyingWindows()]);
  return (
    <main data-page="latest" className="pt-2 md:pt-3 pb-[30px]">
      <h1 className="sr-only">{t(lang, "tabs.latest")}</h1>
      <YourPart lang={lang} live={live} />
      <Digest lang={lang} digest={digest} />
      <Latest lang={lang} articles={articles} lastAttempt={live?.last_pull_at ?? null} />
      <RiverWeather lang={lang} gauges={gauges} windows={windows} />
    </main>
  );
}
