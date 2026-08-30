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

/** The three headline numbers the share message opens with (null = not known → the plain text is used). */
export type ShareNumbers = { dead: number | null; missing: number | null; rescued: number | null };

/**
 * The share message (docs/19 #9): with the live numbers it is a hook — "675 dead · 2,498 out of contact · 7,514
 * rescued …" — and one ask; without them, the plain description. The link is appended by the network builders.
 */
export function shareText(lang: Lang, n?: ShareNumbers | null): string {
  if (n && n.dead !== null && n.missing !== null && n.rescued !== null) {
    const f = (v: number) => new Intl.NumberFormat("en-US").format(v);
    return t(lang, "share.hook", { dead: f(n.dead), missing: f(n.missing), rescued: f(n.rescued) });
  }
  return t(lang, "share.text");
}

/** Build every share link for a page. `copy` carries the plain URL (with utm) for the clipboard. The message and the link are separated by a blank line. */
export function shareLinks({ url, lang, text, numbers }: { url: string; lang: Lang; text?: string; numbers?: ShareNumbers | null }): ShareLink[] {
  const msg = text ?? shareText(lang, numbers);
  return SHARE_TARGETS.map((id) => {
    const target = withUtm(url, id, lang);
    let href = target;
    switch (id) {
      case "whatsapp":
        href = `https://wa.me/?text=${encodeURIComponent(`${msg}\n\n${target}`)}`;
        break;
      case "x":
        // the link goes inside the text after a blank line (X keeps the line break; the separate url param would not)
        href = `https://twitter.com/intent/tweet?text=${encodeURIComponent(`${msg}\n\n${target}`)}`;
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
