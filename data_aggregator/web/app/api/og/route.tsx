/**
 * GET /api/og?lang=en|ne|hi — the 1200×630 share card.
 *
 * Reproduces design/Design form preferences/OG Card.dc.html with next/og (satori): ground #f2f3f6,
 * 3px ink borders, hard 6px shadows, quarter circles, logo circle, LIVE chip in Press Start 2P,
 * three big number cards, the "people have added what they know" pill, the domain and the language pill.
 * Under the subtitle: "updated N min ago" from v_live_counts.last_processed_at (green while fresh, amber past
 * STALE_AFTER_MINUTES, "no processed data yet" when null).
 *
 * Numbers come from lib/queries.getOgNumbers(); every failure degrades to "—" so the card always renders.
 * Fonts are fetched from Google Fonts once per isolate (module-level cached promise) with an old-browser
 * User-Agent so the CSS carries plain TTF URLs (one file per weight, Latin + Devanagari together).
 * See web/docs/11-og-and-share.md.
 */
import { ImageResponse } from "next/og";
import { LANGS, LANG_LABELS, asLang, t, type Lang } from "@/lib/i18n";
import { SITE_HOST, STALE_AFTER_MINUTES } from "@/lib/config";
import { fmtAgo, fmtCadence, fmtDayTime, fmtInt, minutesSince } from "@/lib/format";
import { colors } from "@/lib/tokens";
import { getOgNumbers, type FigureLatest, type OgNumbers } from "@/lib/queries";

export const runtime = "nodejs";

// ---------------------------------------------------------------------------
// Fonts
// ---------------------------------------------------------------------------

type FontWeight = 100 | 200 | 300 | 400 | 500 | 600 | 700 | 800 | 900;
type OgFont = { name: string; data: ArrayBuffer; weight: FontWeight; style: "normal" };
type FontSpec = { family: string; weight: FontWeight };

const FONT_CSS_URL =
  "https://fonts.googleapis.com/css2?family=Baloo+2:wght@600;800&family=Press+Start+2P&display=swap";
/**
 * A pre-WOFF browser (Firefox 3.5) gets one plain TTF per weight, without unicode-range splitting, so the
 * Baloo 2 file carries Latin and Devanagari together. (Firefox 3.6+ would be served WOFF instead.)
 */
const OLD_UA = "Mozilla/5.0 (Windows; U; Windows NT 5.1; en-US; rv:1.9.1) Gecko/20090624 Firefox/3.5";
const WANTED: FontSpec[] = [
  { family: "Baloo 2", weight: 800 },
  { family: "Baloo 2", weight: 600 },
  { family: "Press Start 2P", weight: 400 },
];

function isWeight(n: number): n is FontWeight {
  return n >= 100 && n <= 900 && n % 100 === 0;
}

/** Parse the @font-face blocks of a Google Fonts stylesheet into {family, weight, url}. TTF/OTF first, WOFF as a last resort. */
function parseFontFaces(css: string): { family: string; weight: FontWeight; url: string }[] {
  const out: { family: string; weight: FontWeight; url: string }[] = [];
  const blocks = css.match(/@font-face\s*\{[^}]*\}/g) ?? [];
  for (const block of blocks) {
    const family = /font-family:\s*['"]?([^;'"]+)['"]?\s*;/.exec(block)?.[1]?.trim();
    const weight = Number(/font-weight:\s*(\d+)/.exec(block)?.[1] ?? "400");
    const sources = Array.from(block.matchAll(/url\(([^)]+)\)\s*format\(['"]?(\w+)['"]?\)/g), (m) => ({
      url: m[1].replace(/['"]/g, ""),
      format: m[2].toLowerCase(),
    }));
    const src = sources.find((x) => x.format === "truetype" || x.format === "opentype") ?? sources.find((x) => x.format === "woff");
    if (family && src && isWeight(weight)) out.push({ family, weight, url: src.url });
  }
  return out;
}

async function fetchFonts(): Promise<OgFont[]> {
  const css = await fetch(FONT_CSS_URL, {
    headers: { "User-Agent": OLD_UA, Accept: "text/css,*/*;q=0.1" },
  }).then((r) => (r.ok ? r.text() : Promise.reject(new Error(`fonts css ${r.status}`))));
  const faces = parseFontFaces(css);
  const loaded = await Promise.all(
    WANTED.map(async (want): Promise<OgFont | null> => {
      const face = faces.find((f) => f.family === want.family && f.weight === want.weight);
      if (!face) return null;
      try {
        const r = await fetch(face.url);
        if (!r.ok) return null;
        return { name: want.family, data: await r.arrayBuffer(), weight: want.weight, style: "normal" };
      } catch {
        return null;
      }
    }),
  );
  return loaded.filter((f): f is OgFont => f !== null);
}

let fontsPromise: Promise<OgFont[]> | null = null;

/** Once per isolate; a total failure resets the cache so the next request retries. Never throws. */
function loadFonts(): Promise<OgFont[]> {
  if (!fontsPromise) {
    fontsPromise = fetchFonts().catch(() => [] as OgFont[]).then((fonts) => {
      if (fonts.length === 0) fontsPromise = null;
      return fonts;
    });
  }
  return fontsPromise;
}

// ---------------------------------------------------------------------------
// Card
// ---------------------------------------------------------------------------

const BALOO = "Baloo 2";
const ARCADE = "Press Start 2P";
const EMPTY: OgNumbers = { dead: null, missing: null, rescued: null, policeMissing: null, submissionsTotal: 0, lastProcessedAt: null };

function asOfCaption(lang: Lang, fig: FigureLatest | null): string {
  const when = fig?.as_of ? t(lang, "time.as_of", { t: fmtDayTime(fig.as_of, lang) }) : t(lang, "time.as_of_unknown");
  return `NDRRMA · ${when}`;
}

type NumberCardProps = {
  value: number | null | undefined;
  label: string;
  caption: string;
  bg: string;
  digits: string;
  labelColor: string;
  captionColor: string;
};

function NumberCard({ value, label, caption, bg, digits, labelColor, captionColor }: NumberCardProps) {
  return (
    <div
      style={{
        flex: 1,
        display: "flex",
        flexDirection: "column",
        background: bg,
        border: `3px solid ${colors.ink}`,
        borderRadius: 2,
        boxShadow: `6px 6px 0 ${colors.ink}`,
        padding: "28px 30px 24px",
      }}
    >
      <div style={{ fontFamily: BALOO, fontWeight: 800, fontSize: 92, lineHeight: 1, letterSpacing: "-0.01em", color: digits }}>
        {fmtInt(value)}
      </div>
      <div style={{ fontFamily: BALOO, fontWeight: 700, fontSize: 22, lineHeight: 1.2, marginTop: 8, color: labelColor }}>
        {label}
      </div>
      <div style={{ fontFamily: BALOO, fontWeight: 500, fontSize: 14, lineHeight: 1.3, marginTop: 2, color: captionColor }}>
        {caption}
      </div>
    </div>
  );
}

function Card({ lang, n }: { lang: Lang; n: OgNumbers }) {
  const noData = n.dead === null && n.missing === null && n.rescued === null;
  const caption = (fig: FigureLatest | null) => (noData ? t(lang, "og.no_data") : asOfCaption(lang, fig));
  const missingCaption = noData
    ? t(lang, "og.no_data")
    : n.policeMissing
      ? `NDRRMA · ${t(lang, "og.police_note", { n: fmtInt(n.policeMissing.value) })}`
      : asOfCaption(lang, n.missing);
  const mins = minutesSince(n.lastProcessedAt);
  const updated = n.lastProcessedAt ? t(lang, "og.updated", { ago: fmtAgo(n.lastProcessedAt, lang) }) : t(lang, "og.no_processed");
  const updatedColor = mins === null ? colors.amberText : mins > STALE_AFTER_MINUTES ? colors.amberText : colors.confirmedText;

  return (
    <div
      style={{
        width: 1200,
        height: 630,
        display: "flex",
        background: colors.ground,
        border: `3px solid ${colors.ink}`,
        position: "relative",
        overflow: "hidden",
        color: colors.ink,
        fontFamily: BALOO,
      }}
    >
      {/* quarter circles */}
      <div
        style={{
          position: "absolute",
          right: -130,
          top: -130,
          width: 380,
          height: 380,
          borderRadius: "50%",
          background: "rgba(255,184,0,0.14)",
          border: "3px solid rgba(255,184,0,0.3)",
        }}
      />
      <div
        style={{
          position: "absolute",
          left: -90,
          bottom: -90,
          width: 260,
          height: 260,
          borderRadius: "50%",
          background: "rgba(36,56,232,0.08)",
          border: "3px solid rgba(36,56,232,0.18)",
        }}
      />

      {/* header */}
      <div style={{ position: "absolute", left: 56, top: 48, right: 56, display: "flex", alignItems: "center", gap: 18 }}>
        <div
          style={{
            width: 64,
            height: 64,
            flexShrink: 0,
            background: colors.ultramarine,
            border: `3px solid ${colors.ink}`,
            borderRadius: "50%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.4" strokeLinecap="round">
            <path d="M3 14c2-2.5 4-2.5 6 0s4 2.5 6 0 4-2.5 6 0" />
            <path d="M3 19c2-2.5 4-2.5 6 0s4 2.5 6 0 4-2.5 6 0" />
            <path d="M12 4l3 5H9l3-5z" fill="#fff" />
          </svg>
        </div>
        <div style={{ display: "flex", flexDirection: "column" }}>
          <div style={{ fontFamily: BALOO, fontWeight: 800, fontSize: 34, lineHeight: 1 }}>{t(lang, "site.name")}</div>
          <div style={{ fontFamily: BALOO, fontWeight: 600, fontSize: 17, lineHeight: 1.4, color: colors.muted }}>
            {t(lang, "site.og_sub", { cadence: fmtCadence(lang) })}
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 4, fontFamily: BALOO, fontWeight: 700, fontSize: 15, lineHeight: 1.3, color: updatedColor }}>
            <div style={{ width: 8, height: 8, borderRadius: "50%", background: updatedColor }} />
            <div>{updated}</div>
          </div>
        </div>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            flexShrink: 0,
            gap: 9,
            background: colors.scoreboard,
            color: "#fff",
            borderRadius: 999,
            padding: "10px 18px 8px",
            fontFamily: ARCADE,
            fontWeight: 400,
            fontSize: 12,
            lineHeight: 1,
            marginLeft: 12,
          }}
        >
          <div style={{ width: 11, height: 11, borderRadius: "50%", background: colors.liveRed }} />
          <div>LIVE</div>
        </div>
      </div>

      {/* the three numbers */}
      <div style={{ position: "absolute", left: 56, right: 56, top: 172, display: "flex", gap: 22 }}>
        <NumberCard
          value={n.dead?.value}
          label={t(lang, "og.dead")}
          caption={caption(n.dead)}
          bg={colors.card}
          digits={colors.ink}
          labelColor={colors.ink}
          captionColor={colors.muted}
        />
        <NumberCard
          value={n.missing?.value}
          label={t(lang, "og.out_of_contact")}
          caption={missingCaption}
          bg={colors.amberFill}
          digits={colors.amberText}
          labelColor={colors.amberDeep}
          captionColor={colors.amberText}
        />
        <NumberCard
          value={n.rescued?.value}
          label={t(lang, "og.rescued")}
          caption={caption(n.rescued)}
          bg={colors.card}
          digits={colors.confirmed}
          labelColor={colors.ink}
          captionColor={colors.muted}
        />
      </div>

      {/* bottom row */}
      <div
        style={{
          position: "absolute",
          left: 56,
          right: 56,
          bottom: 44,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 16,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              minHeight: 44,
              padding: "4px 22px 0",
              background: colors.ultramarine,
              color: "#fff",
              border: `3px solid ${colors.ink}`,
              borderRadius: 999,
              fontFamily: BALOO,
              fontWeight: 800,
              fontSize: 19,
            }}
          >
            {t(lang, "og.added", { n: fmtInt(n.submissionsTotal) })}
          </div>
          <div style={{ fontFamily: BALOO, fontWeight: 600, fontSize: 18, color: colors.muted2 }}>{SITE_HOST}</div>
        </div>
        <div
          style={{
            display: "flex",
            flexShrink: 0,
            border: `2.5px solid ${colors.ink}`,
            borderRadius: 999,
            overflow: "hidden",
            background: colors.card,
          }}
        >
          {LANGS.map((l, i) => {
            const active = l === lang;
            return (
              <div
                key={l}
                style={{
                  padding: "8px 18px 6px",
                  fontFamily: BALOO,
                  fontWeight: active ? 800 : 600,
                  fontSize: 15,
                  lineHeight: 1,
                  background: active ? colors.scoreboard : colors.card,
                  color: active ? "#fff" : colors.ink,
                  ...(i > 0 ? { borderLeft: `2.5px solid ${colors.ink}` } : {}),
                }}
              >
                {LANG_LABELS[l]}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Handler
// ---------------------------------------------------------------------------

export async function GET(req: Request) {
  const lang = asLang(new URL(req.url).searchParams.get("lang"));

  let numbers: OgNumbers = EMPTY;
  try {
    numbers = await getOgNumbers();
  } catch {
    numbers = EMPTY;
  }

  let fonts: OgFont[] = [];
  try {
    fonts = await loadFonts();
  } catch {
    fonts = [];
  }

  return new ImageResponse(<Card lang={lang} n={numbers} />, {
    width: 1200,
    height: 630,
    // An empty list would leave satori without any font; undefined falls back to the bundled default.
    fonts: fonts.length ? fonts : undefined,
    headers: { "Cache-Control": "public, max-age=300, s-maxage=300, stale-while-revalidate=600" },
  });
}
