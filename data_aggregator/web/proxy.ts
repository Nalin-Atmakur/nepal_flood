import { NextResponse, type NextRequest } from "next/server";

/**
 * Locale redirect (Next 16 "proxy" convention — the renamed middleware file).
 * Every page path lives under /{lang}. Unprefixed paths redirect to the visitor's preferred
 * language from Accept-Language (ne → Nepali, hi → Hindi), else English.
 * See web/docs/03-i18n.md.
 */
const LANGS = ["en", "ne", "hi"] as const;

export function pickLang(acceptLanguage: string | null | undefined): (typeof LANGS)[number] {
  const accept = (acceptLanguage ?? "").toLowerCase();
  // Honour q-ordered preference: first tag whose primary subtag we support.
  const tags = accept
    .split(",")
    .map((part) => {
      const [tag, ...params] = part.trim().split(";");
      const q = params.find((p) => p.trim().startsWith("q="));
      return { tag: tag.trim(), q: q ? Number(q.split("=")[1]) : 1 };
    })
    .filter((x) => x.tag)
    .sort((a, b) => b.q - a.q);
  for (const { tag } of tags) {
    const primary = tag.split("-")[0];
    if ((LANGS as readonly string[]).includes(primary)) return primary as (typeof LANGS)[number];
  }
  return "en";
}

export function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;
  if (LANGS.some((l) => pathname === `/${l}` || pathname.startsWith(`/${l}/`))) return NextResponse.next();

  const preferred = pickLang(req.headers.get("accept-language"));
  const url = req.nextUrl.clone();
  url.pathname = `/${preferred}${pathname === "/" ? "" : pathname}`;
  return NextResponse.redirect(url);
}

export const config = {
  // Everything except Next internals, API routes, the hidden admin routes and static files.
  matcher: ["/((?!api|admin|_next|.*\\..*).*)"],
};
