import type { Metadata, Viewport } from "next";
import { Analytics } from "@vercel/analytics/next";
import { Baloo_2, Press_Start_2P } from "next/font/google";
import { notFound } from "next/navigation";
import "../globals.css";
import { STALE_AFTER_MINUTES } from "@/lib/config";
import { fmtAgo, minutesSince } from "@/lib/format";
import { isLang, LANGS, LANG_TAGS, t, type Lang } from "@/lib/i18n";
import { pageMetadata } from "@/lib/metadata";
import { getLiveCounts } from "@/lib/queries";
import { colors } from "@/lib/tokens";
import Footer from "@/components/blocks/Footer";
import Header from "@/components/blocks/Header";
import OfficialChannels from "@/components/blocks/OfficialChannels";
import TabBar from "@/components/blocks/TabBar";
import StaleBanner from "@/components/ui/StaleBanner";

/**
 * Root layout for /[lang]: fonts (Baloo 2 with Devanagari, Press Start 2P), header, tab row (desktop) / bottom
 * tab bar (phones), official-channels bar,
 * stale banner (when the last processed run is older than PULL_INTERVAL_MINUTES × 1.5), page, dark footer,
 * anonymous-auth bootstrap and Vercel Analytics. See web/docs/01-architecture.md.
 */
const baloo = Baloo_2({
  subsets: ["latin", "devanagari"],
  weight: ["400", "500", "600", "700", "800"],
  display: "swap",
  variable: "--font-baloo",
});

const arcade = Press_Start_2P({
  subsets: ["latin"],
  weight: "400",
  display: "swap",
  variable: "--font-arcade",
});

export const revalidate = 300;

export function generateStaticParams() {
  return LANGS.map((lang) => ({ lang }));
}

export async function generateMetadata({ params }: { params: Promise<{ lang: string }> }): Promise<Metadata> {
  const { lang } = await params;
  return pageMetadata(isLang(lang) ? lang : "en");
}

export const viewport: Viewport = {
  themeColor: colors.ground,
  width: "device-width",
  initialScale: 1,
};

export default async function LangLayout({ children, params }: { children: React.ReactNode; params: Promise<{ lang: string }> }) {
  const { lang: raw } = await params;
  if (!isLang(raw)) notFound();
  const lang: Lang = raw;

  const live = await getLiveCounts();
  const processedMins = minutesSince(live?.last_processed_at ?? null);
  const stale = live ? processedMins === null || processedMins > STALE_AFTER_MINUTES : false;

  return (
    <html lang={LANG_TAGS[lang]} className={`${baloo.variable} ${arcade.variable}`}>
      <body className="font-baloo bg-ground text-ink antialiased">
        <a href="#main" className="sr-only-focusable bg-card b-ink rounded-r2 px-3 py-2 font-bold">
          {t(lang, "nav.skip")}
        </a>
        <Header lang={lang} />
        <TabBar lang={lang} variant="top" />
        <OfficialChannels lang={lang} />
        {stale ? (
          <StaleBanner>
            {live?.last_processed_at ? t(lang, "stale.banner", { ago: fmtAgo(live.last_processed_at, lang) }) : t(lang, "stale.none")}
          </StaleBanner>
        ) : null}
        <div id="main">{children}</div>
        <Footer lang={lang} lastUpdated={live?.last_processed_at ?? live?.last_pull_at ?? null} />
        {/* phones: the fixed bottom tab bar; the spacer keeps the footer reachable above it */}
        <div className="h-[72px] md:hidden" aria-hidden="true" />
        <TabBar lang={lang} variant="bottom" />
        <Analytics />
      </body>
    </html>
  );
}
