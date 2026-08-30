"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import type { CorridorPlace, RealBridge } from "@/lib/corridor";
import { DEFAULT_SCENARIO, LAKE_MM3_MAX, LAKE_MM3_MIN, type Scenario } from "@/lib/flood-sim";
import { fmtInt } from "@/lib/format";
import { href, t, type Lang } from "@/lib/i18n";
import { CATALOGUE, type ObjectKind } from "@/lib/object-catalogue";
import { pageUrl, shareLinks } from "@/lib/share";
import Chip from "@/components/ui/Chip";
import type { CorridorHandle, Phase, RunState } from "./corridor-3d";

/**
 * The 3D corridor panel + controls (web/docs/16-corridor-v2-plan.md §1). The canvas is the scene; on phones every
 * story element (reached places, phase captions, "swept" pops) goes into a feed UNDER the canvas so nothing covers
 * the view; on desktop the feed is an overlay column bottom-left. The parent block owns the frame and the caption.
 * three.js is loaded after first paint and only on a fast connection; on 2G/3G, Save-Data or any WebGL failure
 * the pre-rendered PNG swaps in (no controls).
 */
type Props = { places: CorridorPlace[]; lang: Lang; fallbackSrc: string; lakeVolumeM3?: number | null; bridges?: RealBridge[] };

type Mode = "loading" | "3d" | "fallback";
type Pick = { place: CorridorPlace; x: number; y: number };
type FeedItem = { key: number; kind: "reached" | "phase" | "swept" | "placed"; title: string; sub?: string; clock?: string; tone: "amber" | "ink" | "red" | "ultra" };
type Pop = { key: number; text: string; x: number; y: number; tone: "red" | "ultra" };

type NetInfo = { saveData?: boolean; effectiveType?: string };
const SLOW = new Set(["slow-2g", "2g", "3g"]);
const FEED_MAX = 12;
/** how many story rows show at once: 3 on the smallest panels, up to 6 when the screen permits (owner, 30 Aug) */
const FEED_MIN = 3;
const FEED_MAX_VISIBLE = 6;
const FEED_ROW_PX = 50;
const POP_MS = 1600;
const NAMES_KEY = "nft.corridor.names";

function slowConnection(): boolean {
  if (typeof navigator === "undefined") return false;
  const conn = (navigator as Navigator & { connection?: NetInfo }).connection;
  if (!conn) return false;
  return !!conn.saveData || SLOW.has(conn.effectiveType ?? "");
}
function reducedMotion(): boolean {
  return typeof window !== "undefined" && typeof window.matchMedia === "function" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}
function isMobile(): boolean {
  return typeof window !== "undefined" && typeof window.matchMedia === "function" && window.matchMedia("(max-width: 767px)").matches;
}

const BREACH_OPTIONS: { key: "fast" | "slow"; seconds: number }[] = [
  { key: "fast", seconds: 4 },
  { key: "slow", seconds: 12 },
];

export default function CorridorScene({ places, lang, fallbackSrc, lakeVolumeM3, bridges = [] }: Props) {
  const boxRef = useRef<HTMLDivElement>(null);
  const hostRef = useRef<HTMLDivElement>(null);
  const handleRef = useRef<CorridorHandle | null>(null);
  const placesRef = useRef<CorridorPlace[]>(places);
  const bridgesRef = useRef<RealBridge[]>(bridges);
  const seq = useRef(0);
  const [mode, setMode] = useState<Mode>("loading");
  const [pick, setPick] = useState<Pick | null>(null);
  const [feed, setFeed] = useState<FeedItem[]>([]);
  const [pops, setPops] = useState<Pop[]>([]);
  const [runState, setRunState] = useState<RunState>("idle");
  const [clock, setClock] = useState("08:37");
  const [swept, setSwept] = useState(0);
  const [sweptReal, setSweptReal] = useState(0);
  const [flash, setFlash] = useState(false);
  const [armed, setArmed] = useState<ObjectKind | null>(null);
  const [xray, setXray] = useState(0);
  const [names, setNames] = useState(true);
  const [feedCap, setFeedCap] = useState(FEED_MIN);
  const seedMm3 = lakeVolumeM3 && lakeVolumeM3 > 0 ? Math.min(LAKE_MM3_MAX, Math.max(LAKE_MM3_MIN, lakeVolumeM3 / 1e6)) : DEFAULT_SCENARIO.lakeMm3;
  // the breach starts on "slow" (owner, 30 Aug 12:30): the wave builds instead of appearing
  const [scenario, setScenario] = useState<Scenario>({ lakeMm3: seedMm3, breachSeconds: BREACH_OPTIONS[1].seconds });

  const push = useCallback((item: Omit<FeedItem, "key">) => {
    const key = ++seq.current;
    setFeed((prev) => [{ key, ...item }, ...prev].slice(0, FEED_MAX));
  }, []);
  const pop = useCallback((text: string, x: number, y: number, tone: Pop["tone"]) => {
    const key = ++seq.current;
    const box = boxRef.current;
    const w = box?.clientWidth ?? 0;
    const h = box?.clientHeight ?? 0;
    setPops((prev) => {
      const kept = prev.slice(-3);
      // stagger so simultaneous pops never sit on top of each other
      const lift = kept.filter((p) => Math.abs(p.x - x) < 90 && Math.abs(p.y - y) < 60).length * 30;
      return [...kept, { key, text, x: Math.max(8, Math.min(x - 40, w - 120)), y: Math.max(8, Math.min(y - 24 - lift, h - 40)), tone }];
    });
    setTimeout(() => setPops((prev) => prev.filter((p) => p.key !== key)), POP_MS);
  }, []);

  const clampToBox = useCallback((x: number, y: number, w = 210, h = 120) => {
    const box = boxRef.current;
    const bw = box?.clientWidth ?? 0;
    const bh = box?.clientHeight ?? 0;
    return { x: Math.max(8, Math.min(x, bw - w)), y: Math.max(8, Math.min(y, bh - h)) };
  }, []);

  const onPick = useCallback(
    (place: CorridorPlace | null, x: number, y: number) => {
      if (!place) {
        setPick(null);
        return;
      }
      setPick({ place, ...clampToBox(x, y) });
    },
    [clampToBox],
  );

  useEffect(() => {
    placesRef.current = places;
    handleRef.current?.setPlaces(places);
  }, [places]);
  useEffect(() => {
    handleRef.current?.setScenario(scenario);
  }, [scenario]);

  // the feed shows as many rows as the panel has room for (desktop overlay: by canvas height; phones: five under it)
  useEffect(() => {
    const measure = () => {
      const h = boxRef.current?.clientHeight ?? 0;
      const cap = isMobile() ? 5 : Math.floor((h - 150) / FEED_ROW_PX);
      setFeedCap(Math.max(FEED_MIN, Math.min(FEED_MAX_VISIBLE, cap)));
    };
    measure();
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, []);

  // Boot after first paint; fall back on slow networks or any WebGL failure; autoplay unless reduced motion.
  useEffect(() => {
    let cancelled = false;
    let idleId = 0;
    let timer: ReturnType<typeof setTimeout> | undefined;
    let autoplay: ReturnType<typeof setTimeout> | undefined;
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
        const h = mod.mountCorridor(host, {
          places: placesRef.current,
          bridges: bridgesRef.current,
          mobile: isMobile(),
          reducedMotion: reducedMotion(),
          onPick,
          onReached: (place, clk) => push({ kind: "reached", title: place.name, sub: `${fmtInt(place.reported)} ${t(lang, "word.reported")} · ${fmtInt(place.unknown)} ${t(lang, "word.unknown")}`, clock: clk, tone: "amber" }),
          onSwept: (kind, total, real, x, y, clk) => {
            setSwept(total);
            setSweptReal(real);
            setFlash(true);
            setTimeout(() => setFlash(false), 500);
            pop(`${t(lang, "corridor.swept_pop")} ${clk}`, x, y, "red");
            push({ kind: "swept", title: t(lang, "corridor.swept_feed", { obj: t(lang, "corridor.obj." + kind) }), clock: clk, tone: "red" });
          },
          onPlaced: (kind, x, y) => {
            pop(t(lang, "corridor.placed_pop", { obj: t(lang, "corridor.obj." + kind) }), x, y, "ultra");
            push({ kind: "placed", title: t(lang, "corridor.placed_feed", { obj: t(lang, "corridor.obj." + kind) }), sub: t(lang, "corridor.move_hint"), tone: "ultra" });
          },
          onClock: setClock,
          onState: setRunState,
          onPhase: (p: Phase) => {
            if (p !== "after") push({ kind: "phase", title: t(lang, "corridor.phase_" + p), tone: "ink" });
          },
          onXray: setXray,
          objectLabel: (kind) => t(lang, "corridor.obj." + kind),
        });
        handleRef.current = h;
        try {
          if (window.localStorage.getItem(NAMES_KEY) === "0") {
            h.setLabels(false);
            setNames(false);
          }
        } catch {
          /* storage unavailable */
        }
        if (window.location.search.includes("debug=1")) (window as unknown as { __corridor?: CorridorHandle }).__corridor = h;
        setMode("3d");
        if (!reducedMotion()) autoplay = setTimeout(() => handleRef.current?.play(), 700);
      } catch {
        if (!cancelled) setMode("fallback");
      }
    };
    if (typeof window.requestIdleCallback === "function") idleId = window.requestIdleCallback(() => void boot(), { timeout: 1500 });
    else timer = setTimeout(() => void boot(), 120);
    return () => {
      cancelled = true;
      if (idleId && typeof window.cancelIdleCallback === "function") window.cancelIdleCallback(idleId);
      if (timer) clearTimeout(timer);
      if (autoplay) clearTimeout(autoplay);
      handleRef.current?.dispose();
      handleRef.current = null;
    };
  }, [onPick, push, pop, lang]);

  // Escape disarms
  useEffect(() => {
    if (!armed) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setArmed(null);
        handleRef.current?.arm(null);
      }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [armed]);

  /** On phones the controls sit under the canvas: bring the scene back into view when a run starts or an object lands. */
  const showScene = () => {
    if (isMobile()) boxRef.current?.scrollIntoView({ block: "start", behavior: "smooth" });
  };
  const play = () => {
    showScene();
    setPick(null);
    setSwept(0);
    setSweptReal(0);
    setFeed([]);
    setArmed(null);
    handleRef.current?.arm(null);
    handleRef.current?.play();
  };
  /** Cinematic: same as play, but the camera opens on the lake and chases the front (docs/19 #5). */
  const cinematic = () => {
    showScene();
    setPick(null);
    setSwept(0);
    setSweptReal(0);
    setFeed([]);
    setArmed(null);
    handleRef.current?.arm(null);
    handleRef.current?.cinematic();
  };
  const reset = () => {
    setPick(null);
    setFeed([]);
    setPops([]);
    setSwept(0);
    setSweptReal(0);
    setArmed(null);
    handleRef.current?.arm(null);
    handleRef.current?.reset();
  };
  const arm = (kind: ObjectKind) => {
    showScene();
    setPick(null);
    // tapping the armed chip again drops another of the same kind; a different chip switches kind
    setArmed(kind);
    handleRef.current?.arm(kind);
  };
  const disarm = () => {
    setArmed(null);
    handleRef.current?.arm(null);
  };
  const toggleNames = () => {
    const next = !names;
    setNames(next);
    handleRef.current?.setLabels(next);
    try {
      window.localStorage.setItem(NAMES_KEY, next ? "1" : "0");
    } catch {
      /* storage unavailable */
    }
  };
  const shareRun = async () => {
    const url = pageUrl(lang, `/run?swept=${swept}&bridges=${sweptReal}`);
    const text = t(lang, "corridor.share_text", { n: String(swept), b: String(sweptReal) });
    const nav = navigator as Navigator & { share?: (d: { title?: string; text?: string; url?: string }) => Promise<void> };
    if (typeof nav.share === "function") {
      try {
        await nav.share({ title: t(lang, "site.name"), text, url });
        return;
      } catch {
        /* cancelled → WhatsApp */
      }
    }
    const wa = shareLinks({ url, lang, text }).find((l) => l.id === "whatsapp");
    if (wa) window.open(wa.href, "_blank", "noopener");
  };

  const cardLink = t(lang, "sec.corridor_card_link");
  const feedVisible = feed.slice(0, feedCap);

  return (
    <div>
      <div ref={boxRef} className="relative h-[60vh] max-h-[560px] min-h-[380px] md:h-[520px] md:max-h-none w-full bg-scene overflow-hidden" aria-label="3D corridor">
        {mode === "fallback" ? (
          <>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={fallbackSrc} alt={t(lang, "sec.corridor_fallback_alt")} className="w-full h-full object-cover" width={1280} height={480} />
            <div className="absolute bottom-0 inset-x-0 bg-card/90 px-3 py-1.5 font-semibold text-[12px] text-muted lh-body">{t(lang, "sec.corridor_unavailable")}</div>
          </>
        ) : (
          <div ref={hostRef} className="absolute inset-0" />
        )}
        {mode === "loading" ? (
          <div className="absolute inset-0 grid place-items-center text-muted font-bold text-[13px]" aria-live="polite">
            {t(lang, "sec.corridor_loading")}
          </div>
        ) : null}

        {mode === "3d" ? (
          <>
            <div className="absolute top-2 left-2 z-10 inline-flex items-center gap-2 bg-board text-white b-ink-2 rounded-r2 px-[10px] py-[6px] shadow-hard-2" aria-live="off">
              <span className={"inline-block w-2 h-2 rounded-full " + (runState === "running" ? "bg-live animate-pulse" : "bg-dead")} aria-hidden="true" />
              <span className="arcade text-[11px] md:text-[12px] tracking-wide num" data-testid="corridor-clock">
                {clock}
              </span>
              <span className="font-semibold text-[10px] opacity-80">{t(lang, "corridor.clock_label")}</span>
            </div>
            <div className="absolute top-2 right-2 z-10 flex items-center gap-2">
              {xray > 0.35 ? (
                <div className="bg-card/90 b-ink-2 rounded-r2 px-[10px] py-[5px] arcade text-[8px] text-ink" data-testid="corridor-xray">
                  X-RAY VIEW
                </div>
              ) : null}
              <button
                type="button"
                onClick={toggleNames}
                aria-pressed={names}
                className={"inline-flex items-center gap-[6px] min-h-[40px] px-[10px] b-ink-2 rounded-r2 font-bold text-[11px] cursor-pointer shadow-hard-2 " + (names ? "bg-card text-ink" : "bg-board text-white")}
                data-testid="corridor-names"
                title={t(lang, "corridor.names")}
              >
                <span aria-hidden="true">{names ? "◉" : "○"}</span> {t(lang, "corridor.names")}
              </button>
            </div>
            <div className="absolute bottom-2 right-2 z-10 flex items-center gap-2">
              <button
                type="button"
                onClick={() => handleRef.current?.frame()}
                className="inline-flex items-center justify-center min-h-[40px] px-3 bg-card b-ink-2 rounded-r2 font-bold text-[12px] text-ink shadow-hard-2 cursor-pointer hover:bg-ground"
                aria-label={t(lang, "corridor.frame")}
                data-testid="corridor-frame"
              >
                ⌂ {t(lang, "corridor.frame")}
              </button>
              <button
                type="button"
                onClick={cinematic}
                className="inline-flex items-center justify-center min-h-[40px] px-3 bg-board text-white b-ink-2 rounded-r2 font-bold text-[12px] shadow-hard-2 cursor-pointer hover:bg-ink"
                aria-label={t(lang, "corridor.cinematic")}
                data-testid="corridor-cinematic"
              >
                🎬 {t(lang, "corridor.cinematic")}
              </button>
            </div>
            {/* pops: SWEPT / PLACED, at the object's screen position */}
            {pops.map((p) => (
              <div key={p.key} className={"absolute z-20 pointer-events-none arcade text-[10px] md:text-[11px] px-2 py-1 b-ink-2 rounded-r2 shadow-hard-2 corridor-pop " + (p.tone === "red" ? "bg-live text-white" : "bg-ultra text-white")} style={{ left: p.x, top: p.y }} role="status">
                {p.text}
              </div>
            ))}
            {/* desktop: feed overlay bottom-left */}
            <div className="hidden md:flex absolute z-10 left-2 bottom-2 flex-col gap-[6px] pointer-events-none max-w-[340px]" aria-live="polite">
              {feedVisible.map((f) => (
                <FeedRow key={f.key} item={f} />
              ))}
            </div>
          </>
        ) : null}

        {mode === "3d" && pick ? (
          <div className="absolute z-20 min-w-[180px] max-w-[290px] bg-card b-ink-2 rounded-r2 shadow-hard-2 p-3 font-baloo text-[12px] text-ink lh-body" style={{ left: pick.x, top: pick.y }} role="dialog" aria-label={pick.place.name}>
            <div className="font-extrabold text-[13px] mb-1">{pick.place.name}</div>
            <div className="num">
              {fmtInt(pick.place.reported)} {t(lang, "word.reported")} · <span className="text-confirmed-text font-semibold">{fmtInt(pick.place.confirmed)} {t(lang, "word.confirmed")}</span> ·{" "}
              <span className="text-amber-text font-semibold">{fmtInt(pick.place.unknown)} {t(lang, "word.unknown")}</span>
            </div>
            <div className="text-muted mt-0.5">{t(lang, "sec.corridor_last", { t: pick.place.last ?? "—" })}</div>
            {pick.place.now ? <div className="mt-1 max-w-[260px] text-[11.5px] lh-body">{pick.place.now}</div> : null}
            <Link href={href(lang, "/places/" + pick.place.id)} className="inline-block mt-1.5 font-semibold underline underline-offset-3">
              {cardLink}
            </Link>
          </div>
        ) : null}

        <ul className="sr-only">
          {places.map((p) => (
            <li key={p.id}>
              <Link href={href(lang, "/places/" + p.id)}>
                {p.name}: {fmtInt(p.reported)} {t(lang, "word.reported")}, {fmtInt(p.confirmed)} {t(lang, "word.confirmed")}, {fmtInt(p.unknown)} {t(lang, "word.unknown")}
              </Link>
            </li>
          ))}
        </ul>
      </div>

      {mode !== "fallback" ? (
        <>
          {/* phones: the story feed lives under the canvas so it never covers the view */}
          <div className="md:hidden border-t-[2.5px] border-ink bg-ground px-3 py-2 flex flex-col gap-[6px] min-h-[64px]" aria-live="polite" data-testid="corridor-feed">
            {feedVisible.length ? feedVisible.map((f) => <FeedRow key={f.key} item={f} />) : <div className="font-medium text-[12px] text-muted">{t(lang, "corridor.feed_empty")}</div>}
          </div>

          <div className="border-t-[2.5px] border-ink bg-card px-3 md:px-4 py-3 flex flex-col gap-[10px]" data-testid="corridor-controls">
            <div className="flex flex-wrap items-center gap-2 md:gap-3">
              <button type="button" onClick={play} className="inline-flex items-center justify-center min-h-[44px] px-[16px] pt-[2px] rounded-r2 b-ink-2 bg-ultra text-white font-extrabold text-[13px] shadow-hard-3 press-3 cursor-pointer" data-testid="corridor-replay">
                ▶ {t(lang, runState === "idle" ? "corridor.play" : "corridor.replay")}
              </button>
              <button type="button" onClick={reset} className="inline-flex items-center justify-center min-h-[44px] px-[14px] pt-[2px] rounded-r2 b-ink-2 bg-card text-ink font-bold text-[13px] cursor-pointer hover:bg-ground">
                ⟲ {t(lang, "corridor.reset")}
              </button>
              {swept > 0 || sweptReal > 0 || runState === "done" ? (
                <button type="button" onClick={shareRun} className="inline-flex items-center justify-center min-h-[44px] px-[14px] pt-[2px] rounded-r2 b-ink-2 bg-amber-fill text-ink font-bold text-[13px] cursor-pointer shadow-hard-2 press-2" data-testid="corridor-share">
                  ↗ {t(lang, "corridor.share_run")}
                </button>
              ) : null}
              <div className="ml-auto flex items-center gap-2">
                {bridges.length ? (
                  <div className="inline-flex items-center gap-2 bg-ground b-ink-2 rounded-r2 px-[10px] py-[6px]" title={t(lang, "corridor.real_bridges_title")}>
                    <span className="font-semibold text-[11px] text-muted">{t(lang, "corridor.real_bridges")}</span>
                    <span className="arcade text-[12px] num" data-testid="corridor-real">
                      {sweptReal}/{bridges.length}
                    </span>
                  </div>
                ) : null}
                <div className={"inline-flex items-center gap-2 b-ink-2 rounded-r2 px-[10px] py-[6px] transition-colors " + (flash ? "bg-amber-fill" : "bg-ground")}>
                  <span className="font-semibold text-[11px] text-muted">{t(lang, "corridor.swept")}</span>
                  <span className={"arcade num transition-transform " + (flash ? "text-[15px]" : "text-[12px]")} data-testid="corridor-swept">
                    {swept}
                  </span>
                </div>
              </div>
            </div>

            {/* row 1: the volume the wave carries (the barrier lake the avalanche breached) */}
            <label className="flex flex-wrap items-center gap-x-2 gap-y-1 font-semibold text-[12px]">
              <span className="whitespace-nowrap">{t(lang, "corridor.lake_volume")}</span>
              <input type="range" min={LAKE_MM3_MIN} max={LAKE_MM3_MAX} step={0.5} value={scenario.lakeMm3} onChange={(e) => setScenario((s) => ({ ...s, lakeMm3: Number(e.target.value) }))} className="w-[140px] md:w-[180px] h-10 accent-ultra" aria-valuetext={`${scenario.lakeMm3} Mm³`} />
              <span className="arcade text-[10px] num whitespace-nowrap">{scenario.lakeMm3.toFixed(1)} Mm³</span>
              <span className="font-medium text-[11px] text-muted">· {t(lang, "corridor.lake_volume_sub")}</span>
            </label>

            {/* row 2: breach speed and the things to drop, on one line (wrapping on phones) */}
            <div className="flex flex-wrap items-start gap-x-5 gap-y-2">
              <div className="flex items-center gap-[6px] font-semibold text-[12px] min-h-[40px]" role="radiogroup" aria-label={t(lang, "corridor.breach")}>
                <span>{t(lang, "corridor.breach")}</span>
                {BREACH_OPTIONS.map((b) => (
                  <button key={b.key} type="button" role="radio" aria-checked={scenario.breachSeconds === b.seconds} onClick={() => setScenario((s) => ({ ...s, breachSeconds: b.seconds }))} className={"min-h-[40px] px-[12px] rounded-pill b-ink-2 text-[12px] font-bold cursor-pointer " + (scenario.breachSeconds === b.seconds ? "bg-amber-fill text-ink" : "bg-card text-ink hover:bg-ground")}>
                    {t(lang, "corridor.breach_" + b.key)}
                  </button>
                ))}
              </div>
              <div className="flex-1 min-w-[260px]">
                <div className="flex items-center gap-2 flex-wrap min-h-[40px]">
                  <span className="font-semibold text-[12px]">{t(lang, "corridor.drop")}</span>
                  {armed ? (
                    <span className="inline-flex items-center gap-2 bg-amber-fill text-amber-text b-ink-2 rounded-r2 px-[10px] py-[4px] font-bold text-[11.5px]" data-testid="corridor-armed">
                      {t(lang, "corridor.armed_hint", { obj: t(lang, "corridor.obj." + armed) })}
                      <button type="button" onClick={disarm} className="inline-grid place-items-center w-6 h-6 rounded-full b-ink-2 bg-card font-extrabold cursor-pointer" aria-label={t(lang, "corridor.disarm")}>
                        ×
                      </button>
                    </span>
                  ) : (
                    <span className="font-medium text-[11.5px] text-muted">{t(lang, "corridor.drop_sub")}</span>
                  )}
                </div>
                <div className="flex flex-wrap gap-2 mt-1">
                  {CATALOGUE.map((c) => (
                    <Chip key={c.kind} active={armed === c.kind} onClick={() => arm(c.kind)} className="!min-h-[40px] !px-3 text-[12.5px]" ariaLabel={t(lang, "corridor.obj." + c.kind)}>
                      {c.emoji} {t(lang, "corridor.obj." + c.kind)}
                    </Chip>
                  ))}
                </div>
              </div>
            </div>

            <p className="m-0 font-medium text-[11px] text-muted lh-body">{t(lang, "corridor.illustrative")}</p>
          </div>
        </>
      ) : null}
    </div>
  );
}

function FeedRow({ item }: { item: FeedItem }) {
  const bar = item.tone === "amber" ? "bg-amber" : item.tone === "red" ? "bg-live" : item.tone === "ultra" ? "bg-ultra" : "bg-ink";
  return (
    <div className="flex items-stretch gap-2 bg-card b-ink-2 rounded-r2 px-2 py-[5px] font-baloo text-[12px] text-ink lh-body corridor-pop">
      <span className={"w-[4px] rounded-full flex-none " + bar} aria-hidden="true" />
      <div className="min-w-0">
        <div className="font-extrabold text-[12.5px] leading-tight truncate">
          {item.clock ? <span className="arcade text-[9px] text-amber-text num mr-1">{item.clock}</span> : null}
          {item.title}
        </div>
        {item.sub ? <div className="text-muted text-[11px] num truncate">{item.sub}</div> : null}
      </div>
    </div>
  );
}
