"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import type { CorridorPlace, RealBridge } from "@/lib/corridor";
import { pageUrl, shareLinks } from "@/lib/share";
import { DEFAULT_SCENARIO, LAKE_MM3_MAX, LAKE_MM3_MIN, OBJECT_KINDS, type ObjectKind, type Scenario } from "@/lib/flood-sim";
import { fmtInt } from "@/lib/format";
import { href, t, type Lang } from "@/lib/i18n";
import Chip from "@/components/ui/Chip";
import type { CorridorHandle, Phase, RunState } from "./corridor-3d";

/**
 * The 3D corridor panel (Component Sheet §06) with the flood simulation and its controls (web/docs/14-flood-sim.md).
 * 480px tall on desktop, 400px on mobile, plus the control bar. The parent block owns the chunky frame, the
 * legend and the caption. three.js is loaded after first paint and only on a fast connection; on 2G/3G,
 * Save-Data or any WebGL failure the pre-rendered PNG swaps in (no controls).
 */
type Props = { places: CorridorPlace[]; lang: Lang; fallbackSrc: string; lakeVolumeM3?: number | null; bridges?: RealBridge[] };

type Mode = "loading" | "3d" | "fallback";
type Pick = { place: CorridorPlace; x: number; y: number };
type Pop = { key: number; place: CorridorPlace; clock: string; x: number; y: number };

type NetInfo = { saveData?: boolean; effectiveType?: string };
const SLOW = new Set(["slow-2g", "2g", "3g"]);
const POP_MS = 2600;
const MAX_POPS = 2;

function slowConnection(): boolean {
  if (typeof navigator === "undefined") return false;
  const conn = (navigator as Navigator & { connection?: NetInfo }).connection;
  if (!conn) return false;
  return !!conn.saveData || SLOW.has(conn.effectiveType ?? "");
}

function reducedMotion(): boolean {
  return typeof window !== "undefined" && typeof window.matchMedia === "function" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
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
  const popKey = useRef(0);
  const [mode, setMode] = useState<Mode>("loading");
  const [pick, setPick] = useState<Pick | null>(null);
  const [pops, setPops] = useState<Pop[]>([]);
  const [runState, setRunState] = useState<RunState>("idle");
  const [clock, setClock] = useState("08:37");
  const [phase, setPhase] = useState<Phase>("after");
  const [swept, setSwept] = useState(0);
  const [sweptReal, setSweptReal] = useState(0);
  const bridgesRef = useRef<RealBridge[]>(bridges);
  const [armed, setArmed] = useState<ObjectKind | null>(null);
  const seedMm3 = lakeVolumeM3 && lakeVolumeM3 > 0 ? Math.min(LAKE_MM3_MAX, Math.max(LAKE_MM3_MIN, lakeVolumeM3 / 1e6)) : DEFAULT_SCENARIO.lakeMm3;
  const [scenario, setScenario] = useState<Scenario>({ lakeMm3: seedMm3, breachSeconds: DEFAULT_SCENARIO.breachSeconds });

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

  const onReached = useCallback(
    (place: CorridorPlace, clk: string, x: number, y: number) => {
      const key = ++popKey.current;
      // cards live in a fixed column (bottom-left) so they never cover the clock, the caption or each other
      void x;
      void y;
      setPops((prev) => [...prev.slice(-(MAX_POPS - 1)), { key, place, clock: clk, x: 0, y: 0 }]);
      setTimeout(() => setPops((prev) => prev.filter((p) => p.key !== key)), POP_MS);
    },
    [],
  );

  // Keep the scene's markers in sync with the ledger.
  useEffect(() => {
    placesRef.current = places;
    handleRef.current?.setPlaces(places);
  }, [places]);

  // Scenario changes reach the scene immediately (they apply on the next play).
  useEffect(() => {
    handleRef.current?.setScenario(scenario);
  }, [scenario]);

  // Boot after first paint; fall back on slow networks or any WebGL failure; autoplay once unless reduced motion.
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
          onPick,
          onReached,
          onSwept: (_kind, total, real) => {
            setSwept(total);
            setSweptReal(real);
          },
          onClock: setClock,
          onState: setRunState,
          onPhase: setPhase,
        });
        handleRef.current = h;
        if (window.location.search.includes("debug=1")) (window as unknown as { __corridor?: CorridorHandle }).__corridor = h;
        setMode("3d");
        if (!reducedMotion()) autoplay = setTimeout(() => handleRef.current?.play(), 700);
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
      if (autoplay) clearTimeout(autoplay);
      handleRef.current?.dispose();
      handleRef.current = null;
    };
  }, [onPick, onReached]);

  const play = () => {
    setPick(null);
    setSwept(0);
    setSweptReal(0);
    handleRef.current?.play();
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
        /* cancelled or unsupported → fall through to WhatsApp */
      }
    }
    const wa = shareLinks({ url, lang, text }).find((l) => l.id === "whatsapp");
    if (wa) window.open(wa.href, "_blank", "noopener");
  };
  const reset = () => {
    setPick(null);
    setPops([]);
    setSwept(0);
    setSweptReal(0);
    setArmed(null);
    handleRef.current?.arm(null);
    handleRef.current?.reset();
  };
  const arm = (kind: ObjectKind) => {
    const next = armed === kind ? null : kind;
    setArmed(next);
    setPick(null);
    handleRef.current?.arm(next);
  };

  const cardLink = t(lang, "sec.corridor_card_link");

  return (
    <div>
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

        {mode === "3d" ? (
          <>
            {/* clock chip — the front's position on the DHM record */}
            <div className="absolute top-2 left-2 z-10 inline-flex items-center gap-2 bg-board text-white b-ink-2 rounded-r2 px-[10px] py-[6px] shadow-hard-2" aria-live="off">
              <span className={"inline-block w-2 h-2 rounded-full " + (runState === "running" ? "bg-live animate-pulse" : "bg-dead")} aria-hidden="true" />
              <span className="arcade text-[11px] md:text-[12px] tracking-wide num" data-testid="corridor-clock">
                {clock}
              </span>
              <span className="font-semibold text-[10px] opacity-80">{t(lang, "corridor.clock_label")}</span>
            </div>
            {phase !== "after" && !armed ? (
              <div className="absolute top-12 left-2 md:top-2 md:left-auto md:right-2 z-10 bg-card b-ink-2 rounded-r2 px-[10px] py-[6px] font-bold text-[11.5px] md:text-[12px] shadow-hard-2 max-w-[80%] md:max-w-[52%] lh-body corridor-pop-hold" key={phase}>
                {t(lang, "corridor.phase_" + phase)}
              </div>
            ) : null}
            {armed ? (
              <div className="absolute top-2 right-2 z-10 bg-amber-fill text-amber-text b-ink-2 rounded-r2 px-[10px] py-[6px] font-bold text-[12px] shadow-hard-2 max-w-[60%]">
                {t(lang, "corridor.drop_hint", { obj: t(lang, "corridor.obj." + armed) })}
              </div>
            ) : null}
          </>
        ) : null}

        {mode === "3d" && pops.length ? (
          <div className="absolute z-10 left-2 bottom-2 flex flex-col gap-[6px] pointer-events-none" aria-live="polite">
            {pops.map((p) => (
              <div
                key={p.key}
                className="min-w-[170px] max-w-[70vw] md:max-w-[320px] bg-card b-ink-2 rounded-r2 shadow-hard-2 px-3 py-2 font-baloo text-[12px] text-ink lh-body corridor-pop"
                role="status"
              >
                <div className="font-extrabold text-[13px] leading-tight">
                  {p.place.name} <span className="arcade text-[9px] text-amber-text num">{p.clock}</span>
                </div>
                <div className="num">
                  {fmtInt(p.place.reported)} {t(lang, "word.reported")} ·{" "}
                  <span className="text-amber-text font-semibold">
                    {fmtInt(p.place.unknown)} {t(lang, "word.unknown")}
                  </span>
                </div>
              </div>
            ))}
          </div>
        ) : null}

        {mode === "3d" && pick ? (
          <div
            className="absolute z-20 min-w-[180px] max-w-[290px] bg-card b-ink-2 rounded-r2 shadow-hard-2 p-3 font-baloo text-[12px] text-ink lh-body"
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
            {pick.place.now ? <div className="mt-1 max-w-[260px] text-[11.5px] lh-body">{pick.place.now}</div> : null}
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

      {mode === "3d" ? (
        <div className="border-t-[2.5px] border-ink bg-card px-3 md:px-4 py-3 flex flex-col gap-[10px]" data-testid="corridor-controls">
          <div className="flex flex-wrap items-center gap-2 md:gap-3">
            <button
              type="button"
              onClick={play}
              className="inline-flex items-center justify-center min-h-[40px] px-[16px] pt-[2px] rounded-r2 b-ink-2 bg-ultra text-white font-extrabold text-[13px] shadow-hard-3 press-3 cursor-pointer"
              data-testid="corridor-replay"
            >
              ▶ {t(lang, runState === "idle" ? "corridor.play" : "corridor.replay")}
            </button>
            <button
              type="button"
              onClick={reset}
              className="inline-flex items-center justify-center min-h-[40px] px-[14px] pt-[2px] rounded-r2 b-ink-2 bg-card text-ink font-bold text-[13px] cursor-pointer hover:bg-ground"
            >
              ⟲ {t(lang, "corridor.reset")}
            </button>
            {swept > 0 || sweptReal > 0 || runState === "done" ? (
              <button
                type="button"
                onClick={shareRun}
                className="inline-flex items-center justify-center min-h-[40px] px-[14px] pt-[2px] rounded-r2 b-ink-2 bg-amber-fill text-ink font-bold text-[13px] cursor-pointer shadow-hard-2 press-2"
                data-testid="corridor-share"
              >
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
              <div className="inline-flex items-center gap-2 bg-ground b-ink-2 rounded-r2 px-[10px] py-[6px]">
                <span className="font-semibold text-[11px] text-muted">{t(lang, "corridor.swept")}</span>
                <span className="arcade text-[12px] num" data-testid="corridor-swept">
                  {swept}
                </span>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
            <label className="flex items-center gap-2 font-semibold text-[12px]">
              <span className="whitespace-nowrap">{t(lang, "corridor.lake_volume")}</span>
              <input
                type="range"
                min={LAKE_MM3_MIN}
                max={LAKE_MM3_MAX}
                step={0.5}
                value={scenario.lakeMm3}
                onChange={(e) => setScenario((s) => ({ ...s, lakeMm3: Number(e.target.value) }))}
                className="w-[120px] md:w-[160px] h-10 accent-ultra"
                aria-valuetext={`${scenario.lakeMm3} Mm³`}
              />
              <span className="arcade text-[10px] num whitespace-nowrap">{scenario.lakeMm3.toFixed(1)} Mm³</span>
            </label>
            <div className="flex items-center gap-[6px] font-semibold text-[12px]" role="radiogroup" aria-label={t(lang, "corridor.breach")}>
              <span>{t(lang, "corridor.breach")}</span>
              {BREACH_OPTIONS.map((b) => (
                <button
                  key={b.key}
                  type="button"
                  role="radio"
                  aria-checked={scenario.breachSeconds === b.seconds}
                  onClick={() => setScenario((s) => ({ ...s, breachSeconds: b.seconds }))}
                  className={
                    "min-h-[40px] px-[12px] rounded-pill b-ink-2 text-[12px] font-bold cursor-pointer " +
                    (scenario.breachSeconds === b.seconds ? "bg-amber-fill text-ink" : "bg-card text-ink hover:bg-ground")
                  }
                >
                  {t(lang, "corridor.breach_" + b.key)}
                </button>
              ))}
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <span className="font-semibold text-[12px] mr-1">{t(lang, "corridor.drop")}</span>
            {OBJECT_KINDS.map((k) => (
              <Chip key={k} active={armed === k} onClick={() => arm(k)} className="!min-h-[40px] !px-3 text-[12.5px]">
                {OBJECT_ICON[k]} {t(lang, "corridor.obj." + k)}
              </Chip>
            ))}
          </div>

          <p className="m-0 font-medium text-[11px] text-muted lh-body">{t(lang, "corridor.illustrative")}</p>
        </div>
      ) : null}
    </div>
  );
}

const OBJECT_ICON: Record<ObjectKind, string> = { house: "🏠", bridge: "🌉", bus: "🚌", camp: "⛺" };
