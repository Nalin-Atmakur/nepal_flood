"use client";

import Link from "next/link";
import { useState } from "react";
import { href, t, type Lang } from "@/lib/i18n";
import { videoEmbed, videoThumb, videoWatch, type FloodVideo } from "@/lib/videos";

/**
 * One clip: a poster (YouTube's thumbnail) with a play button; the iframe only exists after the tap, so nine
 * clips cost nine images, not nine players (web/docs/18-flood-videos.md). Below the poster: kind badge, our
 * caption, the place chip, and the credit linking to the channel.
 */
export default function VideoTile({ v, lang, placeName }: { v: FloodVideo; lang: Lang; placeName: string | null }) {
  const [playing, setPlaying] = useState(false);
  const caption = v.caption[lang];
  return (
    <article className="snap-start flex-none w-[78vw] max-w-[360px] md:w-auto md:max-w-none bg-card b-ink-2 rounded-r2 shadow-hard-3 overflow-hidden" data-video={v.id}>
      <div className="relative aspect-video bg-board">
        {playing ? (
          <iframe
            src={videoEmbed(v.id)}
            title={caption}
            className="absolute inset-0 w-full h-full border-0"
            allow="autoplay; encrypted-media; picture-in-picture"
            allowFullScreen
            loading="lazy"
          />
        ) : (
          <button type="button" onClick={() => setPlaying(true)} className="absolute inset-0 w-full h-full cursor-pointer group" aria-label={`${t(lang, "sec.videos_play")}: ${caption}`}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={videoThumb(v.id)} alt="" className="w-full h-full object-cover" loading="lazy" decoding="async" width={480} height={360} />
            <span className="absolute inset-0 grid place-items-center">
              <span className="inline-grid place-items-center w-[58px] h-[58px] rounded-full bg-live text-white b-ink-2 shadow-hard-3 text-[22px] pl-1 transition-transform group-hover:scale-105" aria-hidden="true">
                ▶
              </span>
            </span>
            <span className="absolute top-2 left-2 arcade text-[8px] bg-card text-ink b-ink-2 rounded-r2 px-2 py-1">{t(lang, "video.kind." + v.kind)}</span>
            {v.lang === "ne" ? <span className="absolute top-2 right-2 font-bold text-[10px] bg-amber-fill text-amber-text b-ink-2 rounded-r2 px-2 py-[3px]">{t(lang, "video.lang_ne")}</span> : null}
          </button>
        )}
      </div>
      <div className="p-3 flex flex-col gap-[6px]">
        <p className="m-0 font-extrabold text-[13.5px] lh-tight">{caption}</p>
        <div className="flex flex-wrap items-center gap-x-2 gap-y-1 font-medium text-[11.5px] text-muted lh-body">
          {v.placeId && placeName ? (
            <Link href={href(lang, "/places/" + v.placeId)} className="inline-flex items-center min-h-[26px] px-2 rounded-pill b-ink-2 bg-ground text-ink font-semibold no-underline hover:bg-amber-fill">
              📍 {placeName}
            </Link>
          ) : null}
          <span>
            <a href={v.creditUrl} target="_blank" rel="noopener noreferrer" className="font-semibold text-ink">
              {v.credit}
            </a>{" "}
            ·{" "}
            <a href={videoWatch(v.id)} target="_blank" rel="noopener noreferrer">
              {t(lang, "sec.videos_source")}
            </a>
          </span>
        </div>
      </div>
    </article>
  );
}
