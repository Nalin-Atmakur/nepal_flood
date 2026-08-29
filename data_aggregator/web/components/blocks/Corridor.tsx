import Link from "next/link";
import { CORRIDOR_HEIGHT_EXAGGERATION, CORRIDOR_LENGTH_KM } from "@/lib/config";
import { statusTone, toCorridorPlaces } from "@/lib/corridor";
import { fmtInt } from "@/lib/format";
import { href, localised, t, type Lang } from "@/lib/i18n";
import type { PlaceRef, PlaceStatusRow } from "@/lib/queries";
import { colors } from "@/lib/tokens";
import { Dot } from "@/components/ui/Badge";
import { Frame } from "@/components/ui/Card";
import EmptyState from "@/components/ui/EmptyState";
import SectionHead from "@/components/ui/SectionHead";
import CorridorIsland from "./CorridorIsland";

/**
 * Section 01 — The corridor. Server block: section head, legend, the framed 3D island (client, lazy),
 * caption, and on mobile the compact place list under the panel. See web/docs/10-3d-corridor.md.
 */
export default function Corridor({ lang, statuses, refs }: { lang: Lang; statuses: PlaceStatusRow[] | null; refs: PlaceRef[] | null }) {
  const places = toCorridorPlaces(statuses, refs, lang);
  const compact = (statuses ?? []).slice().sort((a, b) => b.unknown - a.unknown).slice(0, 8);

  return (
    <section data-block="corridor" data-n="01" className="max-w-[1280px] mx-auto px-4 md:px-7 mt-6" aria-labelledby="sec-corridor">
      <SectionHead n="01" title={<span id="sec-corridor">{t(lang, "sec.corridor")}</span>} sub={t(lang, "sec.corridor_sub", { km: CORRIDOR_LENGTH_KM, x: CORRIDOR_HEIGHT_EXAGGERATION })}>
        <Legend lang={lang} />
      </SectionHead>
      <div className="mt-3">
        <Frame>
          {places.length ? (
            <CorridorIsland places={places} lang={lang} />
          ) : (
            <div className="h-[400px] md:h-[480px] bg-scene grid place-items-center p-6">
              <EmptyState center action={t(lang, "sec.places_empty_action")} href={href(lang, "/report")}>
                {t(lang, "sec.corridor_empty")}
              </EmptyState>
            </div>
          )}
        </Frame>
      </div>
      <p className="font-medium text-[12px] text-muted mt-2 mb-0">{t(lang, "sec.corridor_caption")}</p>

      {/* mobile: compact place list under the panel */}
      {compact.length ? (
        <ul className="md:hidden mt-[10px] bg-card b-ink rounded-r2 overflow-hidden list-none m-0 p-0">
          {compact.map((p) => {
            const tone = statusTone(p);
            const dot = tone === "unknown" ? colors.markerUnknown : tone === "reached" ? colors.confirmed : colors.deadDot;
            return (
              <li key={p.place_id} className="b-rule">
                <Link href={href(lang, `/places/${p.place_id}`)} className="flex items-center gap-[9px] px-[14px] py-2 min-h-[44px] font-semibold text-[13px] text-ink hover:text-ink no-underline">
                  <Dot color={dot} size={9} />
                  <span className="truncate">{localised(p as unknown as Record<string, unknown>, "name", lang) || p.name_en}</span>
                  <span className="ml-auto font-extrabold text-[15px] text-amber-text num">{fmtInt(p.unknown)}</span>
                  <span className="font-medium text-[10px] text-muted">{t(lang, "place.compact_unknown")}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      ) : null}
    </section>
  );
}

function Legend({ lang }: { lang: Lang }) {
  return (
    <ul className="flex flex-wrap gap-[14px] font-semibold text-[12px] list-none m-0 p-0" aria-label="Legend">
      <li className="inline-flex items-center gap-[6px]">
        <span className="inline-block w-3 h-3 rounded-full b-ink-2" style={{ background: colors.markerUnknown }} aria-hidden="true" />
        {t(lang, "sec.legend_unknown")}
      </li>
      <li className="inline-flex items-center gap-[6px]">
        <span className="inline-block w-3 h-3 rounded-full b-ink-2" style={{ background: colors.confirmed }} aria-hidden="true" />
        {t(lang, "sec.legend_reached")}
      </li>
      <li className="inline-flex items-center gap-[6px]">
        <span className="inline-block w-3 h-3 rounded-full b-ink-2" style={{ background: colors.floodPath }} aria-hidden="true" />
        {t(lang, "sec.legend_flood")}
      </li>
    </ul>
  );
}
