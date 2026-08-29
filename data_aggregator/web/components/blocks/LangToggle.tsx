"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { LANGS, LANG_LABELS, LANG_NAMES, stripLang, t, type Lang } from "@/lib/i18n";

/**
 * The pill toggle EN · नेपाली · हिन्दी (Component Sheet §05). Route-based so shared links keep their language.
 * Active segment is ultramarine; segments are separated by 2.5px ink rules.
 */
export default function LangToggle({ lang, size = "md" }: { lang: Lang; size?: "sm" | "md" }) {
  const pathname = usePathname() || "/";
  const search = useSearchParams();
  const rest = stripLang(pathname);
  const qs = search?.toString();
  const suffix = (rest === "/" ? "" : rest) + (qs ? `?${qs}` : "");

  const pad = size === "sm" ? "pt-[7px] pb-[5px] px-[14px] text-[12.5px]" : "pt-2 pb-[6px] px-[18px] text-[14px]";

  return (
    <nav aria-label={t(lang, "nav.language")} className="inline-flex b-ink rounded-pill overflow-hidden bg-card">
      {LANGS.map((l, i) => (
        <Link
          key={l}
          href={`/${l}${suffix}`}
          hrefLang={l}
          lang={l}
          aria-current={l === lang ? "page" : undefined}
          title={LANG_NAMES[l]}
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
