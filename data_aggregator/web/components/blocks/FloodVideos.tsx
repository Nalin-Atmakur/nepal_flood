import Link from "next/link";
import { href, localised, t, type Lang } from "@/lib/i18n";
import type { PlaceRef } from "@/lib/queries";
import { FLOOD_VIDEOS } from "@/lib/videos";
import SectionHead from "@/components/ui/SectionHead";
import VideoTile from "./VideoTile";

/**
 * Section 02 — What it looked like: real footage of 26 August under the simulation (web/docs/18-flood-videos.md).
 * Server block: section head, a scroll-snap row on phones / 3-column grid on desktop of click-to-play tiles, the
 * fact-check note, and the "Have footage?" card that sends people into the report form (attachments go to the
 * record). The list lives in lib/videos.ts.
 */
export default function FloodVideos({ lang, refs }: { lang: Lang; refs: PlaceRef[] | null }) {
  const names = new Map((refs ?? []).map((r) => [r.id, localised(r as unknown as Record<string, unknown>, "name", lang) || r.name_en]));
  if (!FLOOD_VIDEOS.length) return null;
  return (
    <section data-block="videos" data-n="02" className="max-w-[1280px] mx-auto px-4 md:px-7 mt-8" aria-labelledby="sec-videos">
      <SectionHead n="02" title={<span id="sec-videos">{t(lang, "sec.videos")}</span>} sub={t(lang, "sec.videos_sub")} />
      <div className="mt-3 -mx-4 px-4 md:mx-0 md:px-0 flex md:grid md:grid-cols-3 gap-3 md:gap-4 overflow-x-auto md:overflow-visible snap-x snap-mandatory pb-2 md:pb-0" data-testid="videos-row">
        {FLOOD_VIDEOS.map((v) => (
          <VideoTile key={v.id} v={v} lang={lang} placeName={v.placeId ? (names.get(v.placeId) ?? null) : null} />
        ))}
      </div>
      <p className="font-medium text-[12px] text-muted mt-2 mb-0 lh-body">{t(lang, "sec.videos_note")}</p>
      <div className="mt-3 bg-amber-fill b-ink rounded-r2 shadow-hard-3 p-4 flex flex-wrap items-center gap-3" data-testid="videos-add">
        <div className="min-w-0 flex-1">
          <div className="font-extrabold text-[16px] lh-tight">{t(lang, "sec.videos_add")}</div>
          <div className="font-medium text-[12.5px] text-amber-text lh-body mt-1">{t(lang, "sec.videos_add_sub")}</div>
        </div>
        <Link href={href(lang, "/report")} className="inline-flex items-center justify-center min-h-[46px] px-5 rounded-r2 b-ink-2 bg-ultra text-white font-extrabold text-[13.5px] shadow-hard-3 press-3 no-underline">
          {t(lang, "sec.videos_add_cta")} →
        </Link>
      </div>
    </section>
  );
}
