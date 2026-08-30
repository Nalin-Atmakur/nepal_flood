"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { href, t, type Lang } from "@/lib/i18n";
import { videoEmbed, videoThumb, videoWatch, type FloodVideo } from "@/lib/videos";

/**
 * One clip (web/docs/18-flood-videos.md). Three states:
 *   poster  — YouTube's thumbnail + ▶; nothing from YouTube is loaded
 *   auto    — the tile is ≥ 60 % in view: the embed plays muted, looping (browsers only allow silent autoplay);
 *             a small "muted" badge says why; scrolling it out of view returns it to the poster
 *   play    — the visitor tapped the poster: the embed plays with sound and stays
 * Autoplay is skipped for reduced-motion and Save-Data visitors.
 */
type Mode = "poster" | "auto" | "play";
const IN_VIEW = 0.6;

function autoplayAllowed(): boolean {
  if (typeof window === "undefined") return false;
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return false;
  const conn = (navigator as Navigator & { connection?: { saveData?: boolean } }).connection;
  return !conn?.saveData;
}

export default function VideoTile({ v, lang, placeName }: { v: FloodVideo; lang: Lang; placeName: string | null }) {
  const [mode, setMode] = useState<Mode>("poster");
  const ref = useRef<HTMLElement>(null);
  const caption = v.caption[lang];

  useEffect(() => {
    const el = ref.current;
    if (!el || typeof IntersectionObserver !== "function" || !autoplayAllowed()) return;
    const io = new IntersectionObserver(
      (entries) => {
        const on = entries.some((e) => e.isIntersecting);
        setMode((m) => (m === "play" ? m : on ? "auto" : "poster"));
      },
      { threshold: IN_VIEW },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  const src = mode === "play" ? videoEmbed(v.id) : `${videoEmbed(v.id)}&mute=1&loop=1&playlist=${v.id}`;
  return (
    <article ref={ref} className="snap-start flex-none w-[78vw] max-w-[360px] md:w-auto md:max-w-none bg-card b-ink-2 rounded-r2 shadow-hard-3 overflow-hidden" data-video={v.id} data-mode={mode}>
      <div className="relative aspect-video bg-board">
        {mode !== "poster" ? (
          <>
            <iframe
              key={mode}
              src={src}
              title={caption}
              className="absolute inset-0 w-full h-full border-0"
              allow="autoplay; encrypted-media; picture-in-picture"
              allowFullScreen
            />
            {mode === "auto" ? (
              <span className="absolute top-2 right-2 pointer-events-none arcade text-[8px] bg-card/90 text-ink b-ink-2 rounded-r2 px-2 py-1" aria-hidden="true">
                {t(lang, "sec.videos_muted")}
              </span>
            ) : null}
          </>
        ) : (
          <button type="button" onClick={() => setMode("play")} className="absolute inset-0 w-full h-full cursor-pointer group" aria-label={`${t(lang, "sec.videos_play")}: ${caption}`}>
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
