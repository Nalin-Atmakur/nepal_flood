import { OFFICIAL_CHANNELS } from "@/lib/config";
import { t, type Lang } from "@/lib/i18n";

/**
 * The official-channels bar under the header (Home v3): exact text from the design.
 * Desktop: "Police 1155 · Tourist Police 1144 · MoFA Emergency Control Room +977-9744441227 · emergency@mofa.gov.np ·
 * Nepal Red Cross 1130 · Disaster hotline 1234 (NEOC) — This page is not a substitute for official reporting."
 * Mobile: short labels on one line, then the disclaimer.
 */
export default function OfficialChannels({ lang }: { lang: Lang }) {
  const [police, tourist, mofa, redCross, neoc] = OFFICIAL_CHANNELS;
  return (
    <div className="bg-[#e8f6ec] b-ink-b">
      {/* desktop */}
      <div className="hidden md:flex max-w-[1280px] mx-auto px-7 py-[9px] flex-wrap gap-x-[18px] gap-y-1 items-baseline font-medium text-[13px] lh-loose">
        <span>
          <strong>
            <a href={`tel:${police.tel}`} className="text-ink hover:text-ink no-underline">
              {police.label} {police.number}
            </a>
          </strong>
        </span>
        <span>
          <strong>
            <a href={`tel:${tourist.tel}`} className="text-ink hover:text-ink no-underline">
              {tourist.label} {tourist.number}
            </a>
          </strong>
        </span>
        <span>
          <strong>{mofa.label}</strong>{" "}
          <a href={`tel:${mofa.tel}`} className="text-ink hover:text-ink no-underline">
            {mofa.number}
          </a>{" "}
          ·{" "}
          <a href={`mailto:${mofa.email}`} className="text-ink hover:text-ink no-underline">
            {mofa.email}
          </a>
        </span>
        <span>
          <strong>
            <a href={`tel:${redCross.tel}`} className="text-ink hover:text-ink no-underline">
              {redCross.label} {redCross.number}
            </a>
          </strong>
        </span>
        <span>
          <strong>
            <a href={`tel:${neoc.tel}`} className="text-ink hover:text-ink no-underline">
              {neoc.label} {neoc.number}
            </a>
          </strong>
        </span>
        <span className="text-muted ml-auto">{t(lang, "official.not_substitute")}</span>
      </div>
      {/* mobile */}
      <div className="md:hidden px-4 py-2 font-medium text-[11px] lh-loose">
        <strong>
          <a href={`tel:${police.tel}`} className="inline-flex items-center min-h-[36px] px-[2px] text-ink no-underline">
            {police.short}
          </a>
        </strong>{" "}
        ·{" "}
        <strong>
          <a href={`tel:${tourist.tel}`} className="inline-flex items-center min-h-[36px] px-[2px] text-ink no-underline">
            {tourist.short}
          </a>
        </strong>{" "}
        · <strong>{mofa.short}</strong>{" "}
        <a href={`tel:${mofa.tel}`} className="inline-flex items-center min-h-[36px] px-[2px] text-ink no-underline">
          {mofa.number}
        </a>{" "}
        ·{" "}
        <strong>
          <a href={`tel:${redCross.tel}`} className="inline-flex items-center min-h-[36px] px-[2px] text-ink no-underline">
            {redCross.short}
          </a>
        </strong>{" "}
        ·{" "}
        <strong>
          <a href={`tel:${neoc.tel}`} className="inline-flex items-center min-h-[36px] px-[2px] text-ink no-underline">
            {neoc.short}
          </a>
        </strong>
        <div className="text-muted">{t(lang, "official.not_substitute_short")}</div>
      </div>
    </div>
  );
}
