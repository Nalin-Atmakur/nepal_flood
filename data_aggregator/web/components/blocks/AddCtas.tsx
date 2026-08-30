import Link from "next/link";
import { RESPONDENT_TYPES } from "@/lib/config";
import { href, t, type Lang } from "@/lib/i18n";
import { ArrowCircle } from "@/components/ui/Badge";
import SectionHead from "@/components/ui/SectionHead";

/** Section 06 — Add what you know: four CTA cards → /[lang]/report?type=… with the design's colours. */
export default function AddCtas({ lang }: { lang: Lang }) {
  return (
    <section data-block="add" data-n="06" className="max-w-[1280px] mx-auto px-4 md:px-7 mt-7" aria-labelledby="sec-add">
      <SectionHead n="06" title={<span id="sec-add">{t(lang, "sec.add")}</span>} />
      <p className="hidden md:block font-medium text-[15px] mt-2 mb-0 max-w-[560px]">{t(lang, "sec.add_lead")}</p>
      <p className="md:hidden font-medium text-[13.5px] lh-body mt-[6px] mb-0">{t(lang, "sec.add_lead_m")}</p>
      <ul className="grid grid-cols-1 md:grid-cols-4 gap-3 md:gap-[18px] mt-3 md:mt-4 list-none m-0 p-0">
        {RESPONDENT_TYPES.map((r) => (
          <li key={r.id}>
            <Link
              href={href(lang, `/report?type=${r.id}`)}
              className="flex md:block items-center gap-3 bg-card b-ink rounded-r2 press-4 md:press-4 px-4 py-[15px] md:px-[18px] md:py-5 min-h-[44px] text-ink hover:text-ink no-underline shadow-hard-3 md:shadow-hard-4"
            >
              <span className="font-extrabold text-[15px] md:text-[17px] lh-snug block">{t(lang, `cta.${r.id}`)}</span>
              <span className="hidden md:block font-medium text-[12.5px] lh-body mt-2 text-ink/75">{t(lang, `cta.${r.id}_d`)}</span>
              <span className="ml-auto md:ml-0 md:mt-[14px] md:block">
                <ArrowCircle bg={r.bg} fg={r.fg} size={30} />
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
