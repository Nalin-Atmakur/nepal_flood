import Link from "next/link";
import { href, localised, t, type Lang } from "@/lib/i18n";
import type { PlaceRef } from "@/lib/queries";
import { FEATURED_VIDEOS } from "@/lib/videos";
import VideoTile from "./VideoTile";

/**
 * Real footage directly under the simulation (web/docs/18-flood-videos.md): the three featured clips as
 * click-to-play tiles — a swipe row on phones, three across on desktop — headed by one line and ended by the
 * "Have footage? Add it" link into the report form. Rendered inside the corridor section by Corridor.tsx.
 */
export default function FloodVideos({ lang, refs }: { lang: Lang; refs: PlaceRef[] | null }) {
  const names = new Map((refs ?? []).map((r) => [r.id, localised(r as unknown as Record<string, unknown>, "name", lang) || r.name_en]));
  if (!FEATURED_VIDEOS.length) return null;
  return (
    <div className="mt-3" data-testid="corridor-clips">
      <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
        <h3 className="font-extrabold text-[15px] md:text-[17px] lh-tight m-0">{t(lang, "corridor.clips")}</h3>
        <Link href={href(lang, "/report")} className="inline-flex items-center min-h-[40px] px-3 rounded-r2 b-ink-2 bg-amber-fill font-bold text-[12.5px] text-ink no-underline hover:bg-amber" data-testid="videos-add">
          {t(lang, "corridor.clips_more")}
        </Link>
      </div>
      <div className="mt-2 -mx-4 px-4 md:mx-0 md:px-0 flex md:grid md:grid-cols-3 gap-3 md:gap-4 overflow-x-auto md:overflow-visible snap-x snap-mandatory pb-2 md:pb-0" data-testid="videos-row">
        {FEATURED_VIDEOS.map((v) => (
          <VideoTile key={v.id} v={v} lang={lang} placeName={v.placeId ? (names.get(v.placeId) ?? null) : null} />
        ))}
      </div>
      <p className="font-medium text-[11px] text-muted mt-1 mb-0 lh-body">{t(lang, "sec.videos_sub")}</p>
    </div>
  );
}
