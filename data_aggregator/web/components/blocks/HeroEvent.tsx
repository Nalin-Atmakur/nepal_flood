import Link from "next/link";
import { AGENCIES } from "@/lib/config";
import { fmtAsOf, fmtInt } from "@/lib/format";
import { href, t, type Lang } from "@/lib/i18n";
import { pickFigure, type FigureLatest } from "@/lib/queries";
import SinceWave from "./SinceWave";

/**
 * The first screen of the redesigned home page (web/docs/22-home-v4.md): **what happened**, then **how bad**,
 * before anything about what the site does. A first-time visitor arrives from a forwarded link knowing nothing;
 * three seconds decide whether they read on or leave.
 *
 *   26 AUGUST 2026 · RASUWA → CHITWAN
 *   The Bhote Koshi–Trishuli flood
 *   one sentence of what happened
 *   [ 675 dead ] [ 2,498 out of contact ] [ 7,514 rescued ]      NDRRMA · as of … ↗ · why they differ →
 *   ● 4 d 14 h since the wave · Every hour matters.
 */
export default function HeroEvent({ lang, figures }: { lang: Lang; figures: FigureLatest[] | null }) {
  const ndrrma = AGENCIES[0];
  const dead = pickFigure(figures, ndrrma.publishers, ndrrma.dead);
  const missing = pickFigure(figures, ndrrma.publishers, ndrrma.missing);
  const rescued = pickFigure(figures, ndrrma.publishers, ndrrma.rescued);
  const asOf = dead?.as_of ?? missing?.as_of ?? rescued?.as_of ?? null;

  return (
    <section data-block="hero" className="max-w-[1280px] mx-auto px-4 md:px-7 mt-4 md:mt-6" aria-labelledby="hero-title">
      <div className="b-ink rounded-r2 shadow-hard-3 md:shadow-hard-4 bg-card relative overflow-hidden px-4 py-4 md:px-7 md:py-6">
        <span className="amber-quarter" style={{ width: 190, height: 190, right: -60, top: -60 }} aria-hidden="true" />
        <div className="relative">
          <div className="arcade text-[8px] md:text-[9px] tracking-wide text-amber-text">{t(lang, "hero.eyebrow")}</div>
          <h1 id="hero-title" className="font-extrabold text-[26px] md:text-[40px] lh-tight m-0 mt-1 [text-wrap:balance]">
            {t(lang, "hero.title")}
          </h1>
          <p className="font-medium text-[14px] md:text-[16px] lh-body m-0 mt-2 max-w-[62ch] text-muted-2">{t(lang, "hero.lead")}</p>

          <div className="grid grid-cols-3 gap-2 md:gap-4 mt-4" data-testid="hero-figures">
            <Figure value={dead?.value ?? null} label={t(lang, "og.dead")} tone="ink" />
            <Figure value={missing?.value ?? null} label={t(lang, "og.out_of_contact")} tone="amber" />
            <Figure value={rescued?.value ?? null} label={t(lang, "og.rescued")} tone="green" />
          </div>

          <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1 mt-2 font-semibold text-[11.5px] md:text-[12px] text-muted num">
            <span>
              {t(lang, ndrrma.labelKey)}
              {asOf ? ` · ${fmtAsOf(asOf, lang)}` : ""}
              {dead?.url ? (
                <>
                  {" "}
                  <a href={dead.url} target="_blank" rel="noopener noreferrer" className="text-ultra">
                    ↗
                  </a>
                </>
              ) : null}
            </span>
            <Link href={href(lang, "/numbers")} className="font-bold text-ultra no-underline hover:underline">
              {t(lang, "hero.why")}
            </Link>
          </div>

          <p className="flex flex-wrap items-center gap-x-2 gap-y-1 m-0 mt-3 pt-3 border-t-[2px] border-rule font-bold text-[12.5px] md:text-[13.5px] text-live">
            <span className="inline-block w-[9px] h-[9px] rounded-full bg-live animate-pulse" aria-hidden="true" />
            {missing?.value !== undefined && missing?.value !== null ? t(lang, "yours.urgent_missing", { n: fmtInt(missing.value) }) : t(lang, "yours.urgent_nonum")}
            <SinceWave lang={lang} className="text-ink/70 font-semibold" />
          </p>
        </div>
      </div>
    </section>
  );
}

function Figure({ value, label, tone }: { value: number | null; label: string; tone: "ink" | "amber" | "green" }) {
  const box = tone === "amber" ? "bg-amber-fill" : "bg-ground";
  const digits = tone === "amber" ? "text-amber-text" : tone === "green" ? "text-confirmed-text" : "text-ink";
  return (
    <div className={["b-ink-2 rounded-r2 px-2 py-2 md:px-4 md:py-3 text-center md:text-left", box].join(" ")}>
      <div className={["font-extrabold num lh-tight text-[30px] md:text-[52px]", digits].join(" ")}>{value === null ? "—" : fmtInt(value)}</div>
      <div className="font-bold text-[11px] md:text-[13px] lh-tight mt-[2px]">{label}</div>
    </div>
  );
}
