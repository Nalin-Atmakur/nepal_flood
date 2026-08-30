"use client";

import { ArrowCircle } from "@/components/ui/Badge";
import { RESPONDENT_TYPES, type RespondentType } from "@/lib/config";
import { t, type Lang } from "@/lib/i18n";

/**
 * "Who are you?" — an inline selector that sits ABOVE the box on the same page (docs/06-report-flow.md §2).
 * One tap picks the respondent type, which only changes the chip set; nothing else is gated behind it.
 * Four cards: a column on mobile, one row on md+. The selected card is raised (hard shadow) and its arrow
 * circle is filled; unselected cards are flat. Each card is a real button (keyboard + screen reader).
 */
export default function WhoAreYou({ lang, value, onSelect }: { lang: Lang; value: RespondentType; onSelect: (type: RespondentType) => void }) {
  return (
    <fieldset data-step="who" className="border-0 p-0 m-0 min-w-0">
      <legend className="font-extrabold text-[20px] md:text-[24px] lh-tight">{t(lang, "report.who")}</legend>
      <p className="font-medium text-[13px] md:text-[14px] text-muted lh-body mt-1">{t(lang, "report.who_sub")}</p>
      <div role="radiogroup" aria-label={t(lang, "report.who")} className="flex flex-col md:grid md:grid-cols-4 gap-2.5 md:gap-3 mt-3 md:mt-4">
        {RESPONDENT_TYPES.map((rt) => {
          const selected = rt.id === value;
          return (
            <button
              key={rt.id}
              type="button"
              role="radio"
              aria-checked={selected}
              data-testid="who-card"
              data-type={rt.id}
              data-selected={selected ? "true" : "false"}
              onClick={() => onSelect(rt.id)}
              className={
                "b-ink rounded-r2 p-3 md:p-3.5 min-h-[52px] flex items-center gap-3 text-left text-ink cursor-pointer w-full " +
                (selected ? "bg-card shadow-hard-3 press-3" : "bg-ground hover:bg-card")
              }
            >
              <span className="font-extrabold text-[14px] md:text-[15px] lh-snug">{t(lang, `cta.${rt.id}`)}</span>
              <span className="ml-auto flex-none">
                <ArrowCircle bg={selected ? rt.bg : "#ffffff"} fg={selected ? rt.fg : "#1a1a1a"} size={28} />
              </span>
            </button>
          );
        })}
      </div>
    </fieldset>
  );
}
