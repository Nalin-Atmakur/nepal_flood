import Link from "next/link";
import { fmtDayTime } from "@/lib/format";
import { href, t, type Lang } from "@/lib/i18n";

/** Dark footer (Home v3): "Last updated 29 Aug 18:52 NPT · Sources · About · Share — Not a substitute for official reporting." */
export default function Footer({ lang, lastUpdated }: { lang: Lang; lastUpdated: string | null }) {
  const stamp = lastUpdated ? t(lang, "footer.last_updated", { t: fmtDayTime(lastUpdated, lang) }) : t(lang, "footer.no_update");
  const link = "text-footer-link hover:text-white no-underline hover:underline";
  return (
    <footer className="bg-ink text-footer-text mt-7">
      {/* desktop */}
      <div className="hidden md:flex max-w-[1280px] mx-auto px-7 py-[14px] gap-5 font-medium text-[12.5px] items-center">
        <span className="num">{stamp}</span>
        <Link href={href(lang, "/numbers")} className={link}>
          {t(lang, "tabs.numbers")}
        </Link>
        <Link href={href(lang, "/places")} className={link}>
          {t(lang, "tabs.places")}
        </Link>
        <Link href={href(lang, "/latest")} className={link}>
          {t(lang, "tabs.latest")}
        </Link>
        <Link href={href(lang, "/sources")} className={link}>
          {t(lang, "nav.sources")}
        </Link>
        <Link href={href(lang, "/about")} className={link}>
          {t(lang, "nav.about")}
        </Link>
        <Link href={href(lang, "/me")} className={link}>
          {t(lang, "nav.me")}
        </Link>
        <span className="ml-auto">{t(lang, "official.not_substitute_short")}</span>
      </div>
      {/* mobile */}
      <div className="md:hidden px-4 py-3 font-medium text-[11.5px] lh-loose">
        <span className="num">{stamp}</span> ·{" "}
        <Link href={href(lang, "/sources")} className={link}>
          {t(lang, "nav.sources")}
        </Link>{" "}
        ·{" "}
        <Link href={href(lang, "/about")} className={link}>
          {t(lang, "nav.about")}
        </Link>
        <br />
        {t(lang, "official.not_substitute_short")}
      </div>
    </footer>
  );
}
