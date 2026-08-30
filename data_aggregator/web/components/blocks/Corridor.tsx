import Link from "next/link";
import { CORRIDOR_HEIGHT_EXAGGERATION, CORRIDOR_LENGTH_KM } from "@/lib/config";
import { statusTone, toCorridorPlaces, type RealBridge } from "@/lib/corridor";
import { fmtInt } from "@/lib/format";
import { href, localised, t, type Lang } from "@/lib/i18n";
import type { LostBridge, PlaceRef, PlaceStatusRow } from "@/lib/queries";
import { colors } from "@/lib/tokens";
import { Dot } from "@/components/ui/Badge";
import { Frame } from "@/components/ui/Card";
import EmptyState from "@/components/ui/EmptyState";
import SectionHead from "@/components/ui/SectionHead";
import CorridorIsland from "./CorridorIsland";
import FloodVideos from "./FloodVideos";

/**
 * Section 01 — The corridor. Server block: section head, legend, the framed 3D island (client, lazy) with the
 * three featured real clips (FloodVideos) first, then the flood simulation with its controls and caption, plus,
 * on mobile, the compact place list under the panel.
 * See web/docs/10-3d-corridor.md and web/docs/14-flood-sim.md.
 */
export default function Corridor({
  lang,
  statuses,
  refs,
  lakeVolumeM3 = null,
  lostBridges = [],
  heading,
}: {
  lang: Lang;
  statuses: PlaceStatusRow[] | null;
  refs: PlaceRef[] | null;
  /** China MWR barrier-lake volume in m³ (figures_latest), seeds the simulation's slider */
  lakeVolumeM3?: number | null;
  /** HOT OSM washed-out / damaged bridges; placed on the path where they stood */
  lostBridges?: LostBridge[];
  /** override the section head (the redesigned home calls this "Follow the flood's path") */
  heading?: { title: string; sub: string };
}) {
  const places = toCorridorPlaces(statuses, refs, lang);
  const bridges = toRealBridges(lostBridges, refs);
  const compact = (statuses ?? []).slice().sort((a, b) => b.unknown - a.unknown).slice(0, 8);

  return (
    <section data-block="corridor" className="max-w-[1280px] mx-auto px-4 md:px-7 mt-6" aria-labelledby="sec-corridor">
      {/* the real footage leads, everywhere (owner, 30 Aug): a first-time viewer understands the clips instantly,
          and the simulation reads as the explanation of what they just saw */}
      <div className="flex flex-col gap-3">
        {/* the clips come first; the title and legend introduce the simulation, directly above it */}
        <div className="order-2">
          <SectionHead title={<span id="sec-corridor">{heading?.title ?? t(lang, "sec.corridor")}</span>} sub={heading?.sub ?? t(lang, "sec.corridor_sub", { km: CORRIDOR_LENGTH_KM, x: CORRIDOR_HEIGHT_EXAGGERATION })}>
            <Legend lang={lang} />
          </SectionHead>
        </div>
        <div className="order-3">
          <Frame>
            {places.length ? (
              <CorridorIsland places={places} lang={lang} lakeVolumeM3={lakeVolumeM3} bridges={bridges} />
            ) : (
              <div className="h-[400px] md:h-[480px] bg-scene grid place-items-center p-6">
                <EmptyState center action={t(lang, "sec.places_empty_action")} href={href(lang, "/report")}>
                  {t(lang, "sec.corridor_empty")}
                </EmptyState>
              </div>
            )}
          </Frame>
          <p className="font-medium text-[12px] text-muted mt-2 mb-0">{t(lang, "sec.corridor_caption")}</p>
        </div>
        {/* real footage of the day (docs/18) */}
        <div className="order-1">
          <FloodVideos lang={lang} refs={refs} />
        </div>
      </div>

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

const MIN_BRIDGE_GAP_KM = 3;

/** Bridges with a chainage (one per place, washed-out first, ≥ 3 km apart, at most 10) — the sim's pre-placed real objects. */
export function toRealBridges(lost: LostBridge[] | null | undefined, refs: PlaceRef[] | null | undefined): RealBridge[] {
  if (!lost?.length) return [];
  const km = new Map((refs ?? []).map((r) => [r.id, r.km]));
  const seen = new Set<string>();
  const out: RealBridge[] = [];
  for (const b of [...lost].sort((a, b) => (a.status === b.status ? 0 : a.status === "washed out" ? -1 : 1))) {
    const k = km.get(b.placeId);
    if (k === null || k === undefined || !Number.isFinite(k) || seen.has(b.placeId)) continue;
    // keep them spread out (≥ 3 km apart) so the path does not read as a train of slabs
    if (out.some((o) => Math.abs(o.km - k) < MIN_BRIDGE_GAP_KM)) continue;
    seen.add(b.placeId);
    out.push({ id: b.placeId, name: b.name, km: k, status: b.status });
    if (out.length >= 10) break;
  }
  return out.sort((a, b) => a.km - b.km);
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
