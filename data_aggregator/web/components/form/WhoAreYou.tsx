"use client";

import { ArrowCircle } from "@/components/ui/Badge";
import { RESPONDENT_TYPES, type RespondentType } from "@/lib/config";
import { t, type Lang } from "@/lib/i18n";

/**
 * Screen 1 of the one-box report flow (Report v2 artboard): "Who are you?" and four CTA cards.
 * A column on mobile, a 2×2 grid on md+. Each card is a real button with the type's arrow circle.
 */
export default function WhoAreYou({ lang, onSelect }: { lang: Lang; onSelect: (type: RespondentType) => void }) {
  return (
    <div data-step="who">
      <h1 className="font-extrabold text-[24px] md:text-[32px] lh-tight">{t(lang, "report.who")}</h1>
      <p className="font-medium text-[14px] md:text-[15px] text-muted lh-body mt-1">{t(lang, "report.who_sub")}</p>
      <div className="flex flex-col md:grid md:grid-cols-2 gap-3 md:gap-4 mt-[18px] md:mt-6">
        {RESPONDENT_TYPES.map((rt) => (
          <button
            key={rt.id}
            type="button"
            data-testid="who-card"
            data-type={rt.id}
            onClick={() => onSelect(rt.id)}
            className="bg-card b-ink rounded-r2 shadow-hard-3 press-3 p-4 min-h-[56px] md:min-h-[64px] flex items-center gap-3 text-left text-ink cursor-pointer w-full"
          >
            <span className="font-extrabold text-[15px] md:text-[17px] lh-snug">{t(lang, `cta.${rt.id}`)}</span>
            <span className="ml-auto flex-none">
              <ArrowCircle bg={rt.bg} fg={rt.fg} size={30} />
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}
