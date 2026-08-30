import type { Metadata } from "next";
import Link from "next/link";
import { asLang, href, t } from "@/lib/i18n";
import { pageMetadata } from "@/lib/metadata";
import { SITE_URL } from "@/lib/config";

/**
 * "Share this run" landing (web/docs/14-flood-sim.md §1.8). The corridor's share button links here with the run's
 * numbers so the link preview (OG card) says "I watched N things and M real bridges go"; people are sent straight on
 * to the home page. Dynamic on purpose (reads the query), tiny, and disallowed for crawlers' indexes via robots.
 */
export const dynamic = "force-dynamic";

type Search = Promise<{ swept?: string; bridges?: string }>;

function counts(sp: { swept?: string; bridges?: string }): { swept: number; bridges: number } {
  const n = (v: string | undefined) => Math.max(0, Math.min(999, Number.parseInt(v ?? "0", 10) || 0));
  return { swept: n(sp.swept), bridges: n(sp.bridges) };
}

export async function generateMetadata({ params, searchParams }: { params: Promise<{ lang: string }>; searchParams: Search }): Promise<Metadata> {
  const lang = asLang((await params).lang);
  const { swept, bridges } = counts(await searchParams);
  return {
    ...pageMetadata(lang, {
      title: t(lang, "run.title", { n: String(swept), b: String(bridges) }),
      description: t(lang, "run.description"),
      path: "/",
      image: `${SITE_URL}/api/og?lang=${lang}&swept=${swept}&bridges=${bridges}`,
    }),
    // a share landing, not a page to index (robots.txt disallows crawling; this stops a linked URL being indexed)
    robots: { index: false, follow: false },
  };
}

export default async function RunPage({ params, searchParams }: { params: Promise<{ lang: string }>; searchParams: Search }) {
  const lang = asLang((await params).lang);
  const { swept, bridges } = counts(await searchParams);
  const home = href(lang, "/");
  return (
    <main className="max-w-[640px] mx-auto px-4 py-10 font-baloo text-ink">
      {/* people go straight on; crawlers only need the metadata above */}
      <meta httpEquiv="refresh" content={`0;url=${home}`} />
      <h1 className="font-extrabold text-[22px] m-0 mb-2">{t(lang, "run.title", { n: String(swept), b: String(bridges) })}</h1>
      <p className="m-0 mb-4 lh-body">{t(lang, "run.description")}</p>
      <Link href={home} className="font-bold underline underline-offset-3">
        {t(lang, "run.go")}
      </Link>
    </main>
  );
}
