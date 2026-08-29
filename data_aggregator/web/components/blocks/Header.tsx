import Link from "next/link";
import { Suspense } from "react";
import { href, t, type Lang } from "@/lib/i18n";
import Logo from "@/components/ui/Logo";
import LiveChip from "@/components/ui/LiveChip";
import Button from "@/components/ui/Button";
import LangToggle from "./LangToggle";

/**
 * Site header (Home v3 desktop 1280 / mobile 390): logo circle, name, "Volunteer-run · not an official source",
 * LIVE chip, EN/नेपाली/हिन्दी pill toggle, "Add what you know →". Same header on every page.
 */
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
        <Suspense fallback={null}>
          <LangToggle lang={lang} />
        </Suspense>
        <Button href={href(lang, "/report")} variant="primary" size="md" className="min-h-[44px] pt-[11px] pb-[9px] px-[22px] leading-none">
          {t(lang, "nav.add")}
        </Button>
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
          <Suspense fallback={null}>
            <LangToggle lang={lang} size="sm" />
          </Suspense>
          <Button href={href(lang, "/report")} variant="primary" size="sm" shadow={3} className="ml-auto min-h-[44px] px-[14px] text-[12.5px] leading-none">
            {t(lang, "nav.add_short")}
          </Button>
        </div>
      </div>
    </header>
  );
}
