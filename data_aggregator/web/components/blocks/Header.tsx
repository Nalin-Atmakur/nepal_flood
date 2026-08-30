import Link from "next/link";
import { Suspense } from "react";
import { LANGS, LANG_LABELS, href, t, type Lang } from "@/lib/i18n";
import Logo from "@/components/ui/Logo";
import LiveChip from "@/components/ui/LiveChip";
import LangToggle from "./LangToggle";
import ShareMenu from "./ShareMenu";

/**
 * Site header (Home v3 desktop 1280 / mobile 390, nav revised 30 Aug): logo circle, name, "Volunteer-run · not an
 * official source", LIVE chip, EN/नेपाली/हिन्दी pill toggle, then Sources · About · Share. "Add what you know" moved
 * to the "Your part" block at the top of the home page (owner's request). Same header on every page.
 */
const NAV = "inline-flex items-center justify-center min-h-[44px] px-4 rounded-r2 b-ink-2 bg-card font-bold text-[14px] text-ink no-underline hover:bg-ground";
const NAV_SM = "inline-flex items-center justify-center min-h-[40px] px-3 rounded-r2 b-ink-2 bg-card font-bold text-[12.5px] text-ink no-underline hover:bg-ground";

/**
 * Server-rendered stand-in for the toggle while the client one (which needs the query string) hydrates —
 * so the language pills are in the first paint instead of appearing a beat later.
 */
function ToggleFallback({ lang, size = "md" }: { lang: Lang; size?: "sm" | "md" }) {
  const pad = size === "sm" ? "pt-[7px] pb-[5px] px-[14px] text-[12.5px]" : "pt-2 pb-[6px] px-[18px] text-[14px]";
  return (
    <nav aria-label={t(lang, "nav.language")} className="inline-flex b-ink rounded-pill overflow-hidden bg-card">
      {LANGS.map((l, i) => (
        <Link
          key={l}
          href={`/${l}`}
          hrefLang={l}
          lang={l}
          className={[
            "inline-flex items-center leading-none no-underline min-h-[36px]",
            pad,
            i > 0 ? "border-l-[2.5px] border-ink" : "",
            l === lang ? "bg-ultra text-white hover:text-white font-extrabold" : "text-ink hover:text-ink hover:bg-ground font-semibold",
          ].join(" ")}
        >
          {LANG_LABELS[l]}
        </Link>
      ))}
    </nav>
  );
}

export default function Header({ lang }: { lang: Lang }) {
  return (
    <header className="bg-ground b-ink-b">
      {/* desktop */}
      <div className="hidden md:flex max-w-[1280px] mx-auto px-7 py-4 items-center gap-5">
        <div className="flex items-center gap-3 mr-auto">
          <Link href={href(lang, "/")} className="flex items-center gap-3 no-underline text-ink hover:text-ink" aria-label={t(lang, "site.name")}>
            <Logo size={42} />
            <span>
              <span className="block font-extrabold text-[21px] lh-tight">{t(lang, "site.name")}</span>
              <span className="block font-semibold text-[12px] lh-snug text-muted">{t(lang, "site.tagline")}</span>
            </span>
          </Link>
          <LiveChip className="ml-2" />
        </div>
        <Suspense fallback={<ToggleFallback lang={lang} />}>
          <LangToggle lang={lang} />
        </Suspense>
        <nav aria-label={t(lang, "nav.label")} className="flex items-center gap-2">
          <Link href={href(lang, "/sources")} className={NAV}>
            {t(lang, "nav.sources")}
          </Link>
          <Link href={href(lang, "/about")} className={NAV}>
            {t(lang, "nav.about")}
          </Link>
          <ShareMenu lang={lang} />
        </nav>
      </div>
      {/* mobile */}
      <div className="md:hidden px-4 pt-[14px] pb-[14px]">
        <div className="flex items-center gap-[10px]">
          <Link href={href(lang, "/")} className="flex items-center gap-[10px] mr-auto no-underline text-ink hover:text-ink min-w-0" aria-label={t(lang, "site.name")}>
            <Logo size={34} />
            <span className="min-w-0">
              <span className="block font-extrabold text-[16px] lh-tight truncate">{t(lang, "site.name")}</span>
              <span className="block font-semibold text-[10px] lh-snug text-muted">{t(lang, "site.tagline_short")}</span>
            </span>
          </Link>
          <LiveChip size="sm" />
        </div>
        <div className="flex gap-2 mt-3 items-center">
          <Suspense fallback={<ToggleFallback lang={lang} size="sm" />}>
            <LangToggle lang={lang} size="sm" />
          </Suspense>
          <nav aria-label={t(lang, "nav.label")} className="ml-auto flex items-center gap-[6px]">
            <Link href={href(lang, "/sources")} className={NAV_SM}>
              {t(lang, "nav.sources")}
            </Link>
            <Link href={href(lang, "/about")} className={NAV_SM}>
              {t(lang, "nav.about")}
            </Link>
            <ShareMenu lang={lang} size="sm" />
          </nav>
        </div>
      </div>
    </header>
  );
}
