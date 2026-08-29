import type { Metadata } from "next";
import { SITE_URL } from "./config";
import { LANGS, LANG_TAGS, t, type Lang } from "./i18n";
import { pageUrl } from "./share";

/** Per-page metadata: title, description, OG/Twitter image (/api/og?lang=…), hreflang alternates. */
export function pageMetadata(lang: Lang, opts: { title?: string; description?: string; path?: string } = {}): Metadata {
  const site = t(lang, "site.name");
  const title = opts.title ? `${opts.title} · ${site}` : site;
  const description = opts.description ?? t(lang, "site.description");
  const path = opts.path ?? "/";
  const url = pageUrl(lang, path);
  const og = `${SITE_URL}/api/og?lang=${lang}`;
  const languages: Record<string, string> = {};
  for (const l of LANGS) languages[LANG_TAGS[l]] = pageUrl(l, path);
  languages["x-default"] = pageUrl("en", path);
  return {
    metadataBase: new URL(SITE_URL),
    title,
    description,
    alternates: { canonical: url, languages },
    openGraph: {
      title,
      description,
      url,
      siteName: site,
      locale: LANG_TAGS[lang].replace("-", "_"),
      type: "website",
      images: [{ url: og, width: 1200, height: 630, alt: site }],
    },
    twitter: { card: "summary_large_image", title, description, images: [og] },
  };
}
