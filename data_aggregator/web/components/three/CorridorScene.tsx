"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import type { CorridorPlace } from "@/lib/corridor";
import { fmtInt } from "@/lib/format";
import { href, t, type Lang } from "@/lib/i18n";
import type { CorridorHandle } from "./corridor-3d";

/**
 * The 3D corridor panel (Component Sheet §06). 480px tall on desktop, 400px on mobile; the parent
 * block owns the chunky frame, the legend and the caption. three.js is loaded after first paint and
 * only on a fast connection; on 2G/3G, Save-Data or any WebGL failure the pre-rendered PNG swaps in.
 */
type Props = { places: CorridorPlace[]; lang: Lang; fallbackSrc: string };

type Mode = "loading" | "3d" | "fallback";
type Pick = { place: CorridorPlace; x: number; y: number };

type NetInfo = { saveData?: boolean; effectiveType?: string };
const SLOW = new Set(["slow-2g", "2g", "3g"]);

function slowConnection(): boolean {
  if (typeof navigator === "undefined") return false;
  const conn = (navigator as Navigator & { connection?: NetInfo }).connection;
  if (!conn) return false;
  return !!conn.saveData || SLOW.has(conn.effectiveType ?? "");
}

export default function CorridorScene({ places, lang, fallbackSrc }: Props) {
  const boxRef = useRef<HTMLDivElement>(null);
  const hostRef = useRef<HTMLDivElement>(null);
  const handleRef = useRef<CorridorHandle | null>(null);
  const placesRef = useRef<CorridorPlace[]>(places);
  const [mode, setMode] = useState<Mode>("loading");
  const [pick, setPick] = useState<Pick | null>(null);

  const onPick = useCallback((place: CorridorPlace | null, x: number, y: number) => {
    if (!place) {
      setPick(null);
      return;
    }
    const box = boxRef.current;
    const w = box?.clientWidth ?? 0;
    const h = box?.clientHeight ?? 0;
    setPick({ place, x: Math.max(8, Math.min(x, w - 210)), y: Math.max(8, Math.min(y, h - 120)) });
  }, []);

  // Keep the scene's markers in sync with the ledger.
  useEffect(() => {
    placesRef.current = places;
    handleRef.current?.setPlaces(places);
  }, [places]);

  // Boot after first paint; fall back on slow networks or any WebGL failure.
  useEffect(() => {
    let cancelled = false;
    let idleId = 0;
    let timer: ReturnType<typeof setTimeout> | undefined;

    const boot = async () => {
      if (cancelled) return;
      if (slowConnection()) {
        setMode("fallback");
        return;
      }
      try {
        const mod = await import("./corridor-3d");
        const host = hostRef.current;
        if (cancelled || !host) return;
        handleRef.current = mod.mountCorridor(host, { places: placesRef.current, onPick });
        setMode("3d");
      } catch {
        if (!cancelled) setMode("fallback");
      }
    };

    if (typeof window.requestIdleCallback === "function") {
      idleId = window.requestIdleCallback(() => void boot(), { timeout: 1500 });
    } else {
      timer = setTimeout(() => void boot(), 120);
    }

    return () => {
      cancelled = true;
      if (idleId && typeof window.cancelIdleCallback === "function") window.cancelIdleCallback(idleId);
      if (timer) clearTimeout(timer);
      handleRef.current?.dispose();
      handleRef.current = null;
    };
  }, [onPick]);

  const cardLink = t(lang, "sec.corridor_card_link");

  return (
    <div ref={boxRef} className="relative h-[400px] md:h-[480px] w-full bg-scene overflow-hidden" aria-label="3D corridor">
      {mode === "fallback" ? (
        <>
          {/* Hand-optimised palette PNG (< 60 KB) served as-is; the image optimiser would only re-encode it. */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={fallbackSrc} alt={t(lang, "sec.corridor_fallback_alt")} className="w-full h-full object-cover" width={1280} height={480} />
          <div className="absolute bottom-0 inset-x-0 bg-card/90 px-3 py-1.5 font-semibold text-[12px] text-muted lh-body">
            {t(lang, "sec.corridor_unavailable")}
          </div>
        </>
      ) : (
        <div ref={hostRef} className="absolute inset-0" />
      )}

      {mode === "loading" ? (
        <div className="absolute inset-0 grid place-items-center text-muted font-bold text-[13px]" aria-live="polite">
          {t(lang, "sec.corridor_loading")}
        </div>
      ) : null}

      {mode === "3d" && pick ? (
        <div
          className="absolute z-10 min-w-[180px] bg-card b-ink-2 rounded-r2 shadow-hard-2 p-3 font-baloo text-[12px] text-ink lh-body"
          style={{ left: pick.x, top: pick.y }}
          role="dialog"
          aria-label={pick.place.name}
        >
          <div className="font-extrabold text-[13px] mb-1">{pick.place.name}</div>
          <div className="num">
            {fmtInt(pick.place.reported)} {t(lang, "word.reported")} ·{" "}
            <span className="text-confirmed-text font-semibold">
              {fmtInt(pick.place.confirmed)} {t(lang, "word.confirmed")}
            </span>{" "}
            ·{" "}
            <span className="text-amber-text font-semibold">
              {fmtInt(pick.place.unknown)} {t(lang, "word.unknown")}
            </span>
          </div>
          <div className="text-muted mt-0.5">{t(lang, "sec.corridor_last", { t: pick.place.last ?? "—" })}</div>
          <Link href={href(lang, "/places/" + pick.place.id)} className="inline-block mt-1.5 font-semibold underline underline-offset-3">
            {cardLink}
          </Link>
        </div>
      ) : null}

      {/* Keyboard / screen-reader route to the same places. */}
      <ul className="sr-only">
        {places.map((p) => (
          <li key={p.id}>
            <Link href={href(lang, "/places/" + p.id)}>
              {p.name}: {fmtInt(p.reported)} {t(lang, "word.reported")}, {fmtInt(p.confirmed)} {t(lang, "word.confirmed")}, {fmtInt(p.unknown)}{" "}
              {t(lang, "word.unknown")}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
