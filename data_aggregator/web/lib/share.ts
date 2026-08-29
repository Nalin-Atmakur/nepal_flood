/**
 * Share links with per-language text and utm_source per network. See web/docs/11-og-and-share.md.
 * Pure functions — unit-tested in tests/share.test.ts.
 */
import { SITE_URL } from "./config";
import { t, type Lang } from "./i18n";

export type ShareTarget = "whatsapp" | "x" | "linkedin" | "telegram" | "copy";
export const SHARE_TARGETS: ShareTarget[] = ["whatsapp", "x", "linkedin", "telegram", "copy"];

/** Add utm parameters to a page URL. Keeps existing query params and hash. */
export function withUtm(url: string, source: ShareTarget, lang: Lang): string {
  const u = new URL(url, SITE_URL);
  u.searchParams.set("utm_source", source);
  u.searchParams.set("utm_medium", "share");
  u.searchParams.set("utm_campaign", `nft_${lang}`);
  return u.toString();
}

/** Canonical absolute URL for a localised path: pageUrl("ne", "/places/timure") */
export function pageUrl(lang: Lang, path: string = "/"): string {
  const p = path.startsWith("/") ? path : `/${path}`;
  return `${SITE_URL}/${lang}${p === "/" ? "" : p}`;
}

export type ShareLink = { id: ShareTarget; labelKey: string; href: string; url: string };

/** Build every share link for a page. `copy` carries the plain URL (with utm) for the clipboard. */
export function shareLinks({ url, lang, text }: { url: string; lang: Lang; text?: string }): ShareLink[] {
  const msg = text ?? t(lang, "share.text");
  return SHARE_TARGETS.map((id) => {
    const target = withUtm(url, id, lang);
    let href = target;
    switch (id) {
      case "whatsapp":
        href = `https://wa.me/?text=${encodeURIComponent(`${msg} ${target}`)}`;
        break;
      case "x":
        href = `https://twitter.com/intent/tweet?text=${encodeURIComponent(msg)}&url=${encodeURIComponent(target)}`;
        break;
      case "linkedin":
        href = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(target)}`;
        break;
      case "telegram":
        href = `https://t.me/share/url?url=${encodeURIComponent(target)}&text=${encodeURIComponent(msg)}`;
        break;
      case "copy":
        href = target;
        break;
    }
    return { id, labelKey: `share.${id}`, href, url: target };
  });
}
