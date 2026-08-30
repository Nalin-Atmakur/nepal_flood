"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { statusTone } from "@/lib/corridor";
import { fmtInt } from "@/lib/format";
import { href, localised, t, type Lang } from "@/lib/i18n";
import { clampTransform, coverSize, fitTransform, fractionBounds, isInView, projectToFraction, zoomAbout, type Point, type Size } from "@/lib/map-projection";
import { CORRIDOR_VIEW } from "@/lib/map-view";
import type { PlaceRef, PlaceStatusRow } from "@/lib/queries";
import { colors } from "@/lib/tokens";

/**
 * Where the places actually are (web/docs/21-places-map.md): the pre-rendered corridor basemap with one pin per
 * gazetteer place, positioned by lat/lon through `lib/map-projection`, coloured by the same legend as the
 * corridor simulation and sized by how many people are reported there. Drag to pan, wheel/pinch to zoom, tap a
 * pin for its numbers and a link to the place page. No tile server, no map library, no API key — one static
 * image (© OpenStreetMap contributors) and some arithmetic.
 */
type Pin = {
  id: string;
  name: string;
  f: Point;
  tone: "unknown" | "reached" | "none";
  reported: number;
  confirmed: number;
  unknown: number;
  district: string | null;
  inChannel: boolean;
};

const IMG = { src: "/corridor-map.webp", small: "/corridor-map-sm.webp", w: CORRIDOR_VIEW.width, h: CORRIDOR_VIEW.height };
const IMG_SIZE: Size = { w: CORRIDOR_VIEW.width, h: CORRIDOR_VIEW.height };

/** What the map frames by default: the places on the flood's channel, else everything plotted. */
function corridorBounds(pins: Pin[]) {
  const channel = pins.filter((p) => p.inChannel).map((p) => p.f);
  return fractionBounds(channel.length ? channel : pins.map((p) => p.f));
}
const PIN_MIN = 5;
const PIN_MAX = 12;
/** tap area around each dot (px on screen, constant at every zoom) */
const HIT = 36;

function toneColour(tone: Pin["tone"]): string {
  return tone === "unknown" ? colors.markerUnknown : tone === "reached" ? colors.confirmed : colors.deadDot;
}

export default function PlacesMap({ lang, refs, statuses }: { lang: Lang; refs: PlaceRef[] | null; statuses: PlaceStatusRow[] | null }) {
  const boxRef = useRef<HTMLDivElement>(null);
  const [box, setBox] = useState<Size>({ w: 0, h: 0 });
  const [view, setView] = useState({ scale: 1, tx: 0, ty: 0 });
  const [selected, setSelected] = useState<string | null>(null);
  const fitted = useRef(false);

  const { pins, offMap } = useMemo(() => {
    const byId = new Map((statuses ?? []).map((s) => [s.place_id, s]));
    const all: Pin[] = [];
    let off = 0;
    for (const r of refs ?? []) {
      if (r.lat === null || r.lon === null) continue;
      const f = projectToFraction(r.lat, r.lon, CORRIDOR_VIEW);
      if (!isInView(f)) {
        off++;
        continue;
      }
      const s = byId.get(r.id) ?? null;
      all.push({
        id: r.id,
        name: localised(r as unknown as Record<string, unknown>, "name", lang) || r.name_en,
        f,
        tone: statusTone(s),
        reported: s?.expected ?? 0,
        confirmed: s?.confirmed_reached ?? 0,
        unknown: s?.unknown ?? 0,
        district: r.district,
        inChannel: r.in_channel,
      });
    }
    // biggest first so the small pins draw on top and stay clickable
    all.sort((a, b) => b.reported - a.reported);
    return { pins: all, offMap: off };
  }, [refs, statuses, lang]);

  // measure the box; frame the flood corridor the first time we know how big we are
  useEffect(() => {
    const el = boxRef.current;
    if (!el) return;
    const measure = () => {
      const next = { w: el.clientWidth, h: el.clientHeight };
      setBox(next);
      if (!fitted.current && next.w > 0 && next.h > 0) {
        const b = corridorBounds(pins);
        if (b) {
          setView(fitTransform(b, coverSize(IMG_SIZE, next), next, { pad: 0.16, maxScale: 3 }));
          fitted.current = true;
        }
      }
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, [pins]);

  const content = useMemo(() => coverSize(IMG_SIZE, box), [box]);

  const fit = useCallback(() => {
    const b = corridorBounds(pins);
    if (b && box.w) setView(fitTransform(b, content, box, { pad: 0.16, maxScale: 3 }));
    setSelected(null);
  }, [pins, box, content]);

  const zoomBy = useCallback(
    (factor: number, px?: number, py?: number) => {
      if (!box.w) return;
      setView((v) => zoomAbout(v, px ?? box.w / 2, py ?? box.h / 2, factor, content, box));
    },
    [box, content],
  );

  // ---- pointer: drag to pan, two fingers to pinch, wheel to zoom ------------------------------------------
  const drag = useRef<{ id: number; x: number; y: number; tx: number; ty: number } | null>(null);
  const pinch = useRef<Map<number, { x: number; y: number }>>(new Map());
  const pinchStart = useRef<{ dist: number; scale: number } | null>(null);

  const onPointerDown = (e: React.PointerEvent) => {
    pinch.current.set(e.pointerId, { x: e.clientX, y: e.clientY });
    if (pinch.current.size === 2) {
      const [a, b] = Array.from(pinch.current.values());
      pinchStart.current = { dist: Math.hypot(a.x - b.x, a.y - b.y), scale: view.scale };
      drag.current = null;
      return;
    }
    // no pointer capture: it would swallow the click that selects a pin (the buttons are children of this box)
    drag.current = { id: e.pointerId, x: e.clientX, y: e.clientY, tx: view.tx, ty: view.ty };
  };
  const onPointerMove = (e: React.PointerEvent) => {
    if (pinch.current.has(e.pointerId)) pinch.current.set(e.pointerId, { x: e.clientX, y: e.clientY });
    if (pinch.current.size === 2 && pinchStart.current) {
      const [a, b] = Array.from(pinch.current.values());
      const dist = Math.hypot(a.x - b.x, a.y - b.y);
      const rect = boxRef.current?.getBoundingClientRect();
      if (!rect || dist < 1) return;
      const mx = (a.x + b.x) / 2 - rect.left;
      const my = (a.y + b.y) / 2 - rect.top;
      const target = (pinchStart.current.scale * dist) / pinchStart.current.dist;
      setView((v) => zoomAbout(v, mx, my, target / v.scale, content, box));
      return;
    }
    const d = drag.current;
    if (!d || d.id !== e.pointerId || !box.w) return;
    setView((v) => clampTransform({ scale: v.scale, tx: d.tx + (e.clientX - d.x), ty: d.ty + (e.clientY - d.y) }, content, box));
  };
  const onPointerUp = (e: React.PointerEvent) => {
    pinch.current.delete(e.pointerId);
    if (pinch.current.size < 2) pinchStart.current = null;
    if (drag.current?.id === e.pointerId) drag.current = null;
  };
  const onWheel = (e: React.WheelEvent) => {
    if (!box.w) return;
    e.preventDefault();
    const rect = boxRef.current?.getBoundingClientRect();
    setView((v) => zoomAbout(v, e.clientX - (rect?.left ?? 0), e.clientY - (rect?.top ?? 0), 1 - e.deltaY * 0.0015, content, box));
  };

  const chosen = selected ? (pins.find((p) => p.id === selected) ?? null) : null;
  const cardPos = chosen && box.w ? { left: Math.max(8, Math.min(chosen.f.x * content.w * view.scale + view.tx - 110, box.w - 236)), top: Math.max(8, Math.min(chosen.f.y * content.h * view.scale + view.ty + 14, box.h - 150)) } : null;

  return (
    <div className="mt-3" data-block="places-map">
      <div
        ref={boxRef}
        className="relative w-full h-[58vh] min-h-[320px] max-h-[560px] md:h-[520px] b-ink rounded-r2 shadow-hard-3 overflow-hidden bg-ground touch-none select-none cursor-grab active:cursor-grabbing"
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
        onWheel={onWheel}
        data-testid="places-map"
      >
        <div className="absolute top-0 left-0 origin-top-left will-change-transform" style={{ width: content.w, height: content.h, transform: `translate(${view.tx}px, ${view.ty}px) scale(${view.scale})` }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={IMG.src}
            srcSet={`${IMG.small} ${Math.round(IMG.w / 2)}w, ${IMG.src} ${IMG.w}w`}
            sizes="(max-width: 767px) 100vw, 1200px"
            width={IMG.w}
            height={IMG.h}
            alt={t(lang, "sec.map_alt")}
            className="absolute inset-0 w-full h-full pointer-events-none"
            draggable={false}
            loading="lazy"
            decoding="async"
          />
          {pins.map((p) => {
            const r = Math.round(Math.max(PIN_MIN, Math.min(PIN_MAX, PIN_MIN + Math.sqrt(Math.max(0, p.reported)) * 0.55)));
            const isOn = p.id === selected;
            return (
              <button
                key={p.id}
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setSelected(isOn ? null : p.id);
                }}
                // the hit area is a finger, the dot is the map mark: a 5–12 px dot would be untappable
                className="absolute grid place-items-center bg-transparent cursor-pointer"
                style={{
                  left: `${p.f.x * 100}%`,
                  top: `${p.f.y * 100}%`,
                  width: HIT,
                  height: HIT,
                  marginLeft: -HIT / 2,
                  marginTop: -HIT / 2,
                  transform: `scale(${1 / view.scale})`,
                  zIndex: isOn ? 3 : 2,
                }}
                aria-label={`${p.name}: ${fmtInt(p.unknown)} ${t(lang, "word.unknown")}`}
                data-pin={p.id}
                data-tap-ok="marker"
              >
                <span
                  className="block rounded-full b-ink-2 pointer-events-none"
                  style={{
                    width: r * 2,
                    height: r * 2,
                    background: toneColour(p.tone),
                    boxShadow: isOn ? "0 0 0 3px #fff" : "0 0 0 2px rgba(255,255,255,0.75)",
                    transform: isOn ? "scale(1.35)" : undefined,
                  }}
                />
              </button>
            );
          })}
        </div>

        {chosen && cardPos ? (
          <div className="absolute z-10 w-[228px] bg-card b-ink-2 rounded-r2 shadow-hard-2 p-3 font-baloo text-[12px] text-ink lh-body" style={cardPos} role="dialog" aria-label={chosen.name} data-testid="map-card">
            <div className="font-extrabold text-[13.5px] leading-tight">{chosen.name}</div>
            {chosen.district ? <div className="text-muted text-[11px]">{chosen.district}</div> : null}
            <div className="num mt-1">
              {fmtInt(chosen.reported)} {t(lang, "word.reported")} ·{" "}
              <span className="text-confirmed-text font-semibold">
                {fmtInt(chosen.confirmed)} {t(lang, "word.confirmed")}
              </span>{" "}
              ·{" "}
              <span className="text-amber-text font-semibold">
                {fmtInt(chosen.unknown)} {t(lang, "word.unknown")}
              </span>
            </div>
            <Link href={href(lang, `/places/${chosen.id}`)} className="inline-block mt-1.5 font-semibold underline underline-offset-3">
              {t(lang, "sec.corridor_card_link")}
            </Link>
          </div>
        ) : null}

        {/* controls */}
        <div className="absolute bottom-6 right-2 z-10 flex flex-col gap-[6px]">
          <button type="button" onClick={() => zoomBy(1.6)} className="inline-grid place-items-center w-10 h-10 bg-card b-ink-2 rounded-r2 font-extrabold text-[16px] shadow-hard-2 cursor-pointer" aria-label={t(lang, "map.zoom_in")}>
            +
          </button>
          <button type="button" onClick={() => zoomBy(1 / 1.6)} className="inline-grid place-items-center w-10 h-10 bg-card b-ink-2 rounded-r2 font-extrabold text-[16px] shadow-hard-2 cursor-pointer" aria-label={t(lang, "map.zoom_out")}>
            −
          </button>
          <button type="button" onClick={fit} className="inline-grid place-items-center w-10 h-10 bg-card b-ink-2 rounded-r2 font-bold text-[13px] shadow-hard-2 cursor-pointer" aria-label={t(lang, "map.fit")} data-testid="map-fit">
            ⌂
          </button>
        </div>
        <div className="absolute bottom-0 left-0 z-10 bg-card/85 px-2 py-[3px] rounded-tr-r2 font-medium text-[10px] text-muted pointer-events-none">{t(lang, "map.attribution")}</div>
      </div>

      <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 font-semibold text-[12px]">
        <span className="inline-flex items-center gap-[6px]">
          <span className="inline-block w-3 h-3 rounded-full b-ink-2" style={{ background: colors.markerUnknown }} aria-hidden="true" />
          {t(lang, "sec.legend_unknown")}
        </span>
        <span className="inline-flex items-center gap-[6px]">
          <span className="inline-block w-3 h-3 rounded-full b-ink-2" style={{ background: colors.confirmed }} aria-hidden="true" />
          {t(lang, "sec.legend_reached")}
        </span>
        <span className="inline-flex items-center gap-[6px]">
          <span className="inline-block w-3 h-3 rounded-full b-ink-2" style={{ background: colors.deadDot }} aria-hidden="true" />
          {t(lang, "map.legend_none")}
        </span>
        <span className="text-muted font-medium">{t(lang, "map.hint")}</span>
        {offMap > 0 ? <span className="text-muted font-medium">{t(lang, "map.off_map", { n: String(offMap) })}</span> : null}
      </div>
    </div>
  );
}
