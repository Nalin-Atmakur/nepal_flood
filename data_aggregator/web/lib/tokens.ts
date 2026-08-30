/**
 * Design tokens — the "Arcade ledger" system from design/Design form preferences/Component Sheet.dc.html.
 * The same values are declared as Tailwind theme variables in app/globals.css; this module exists for
 * code that cannot use CSS classes (the OG image, the three.js scene, the fallback PNG script).
 * See web/docs/02-design-system.md.
 */
export const colors = {
  ink: "#1a1a1a",
  ground: "#f2f3f6",
  canvas: "#d8dbe2",
  card: "#ffffff",
  ultramarine: "#2438e8",
  ultramarineDeep: "#1826a8",
  amber: "#ffb800",
  amberFill: "#ffe294",
  amberText: "#8a3f06",
  amberDeep: "#5c3a10",
  confirmed: "#148a4e",
  confirmedFill: "#b9f0c9",
  confirmedText: "#0f7a42",
  scoreboard: "#141419",
  liveRed: "#e5484d",
  liveGreen: "#7ee2a8",
  dead: "#8a8a8a",
  deadDot: "#bdbdbd",
  rule: "#e7e9f0",
  tableHead: "#e2e7ff",
  muted: "#6b6f7c",
  muted2: "#4a4e59",
  muted3: "#3f434e",
  hint: "#8a8e99",
  dashed: "#b8bcc7",
  boardText: "#aeb6d6",
  boardDim: "#4d5878",
  boardBody: "#c9ccd6",
  footerText: "#d8d2c4",
  footerLink: "#9db2ff",
  markerUnknown: "#ffae42",
  floodPath: "#ec3013",
  gradeD: "#ffd0b0",
  terrain: "#dedbd8",
  sceneBg: "#e9e7e5",
} as const;

export const shadows = {
  hard6: "6px 6px 0 #1a1a1a",
  hard4: "4px 4px 0 #1a1a1a",
  hard3: "3px 3px 0 #1a1a1a",
  hard2: "2px 2px 0 #1a1a1a",
  none: "0 0 0 #1a1a1a",
} as const;

export const radii = { rect: 2, frame: 4, pill: 999 } as const;

export const borders = { thick: 2.5, thin: 2, hair: 1.5 } as const;

export const fonts = {
  body: "'Baloo 2', system-ui, sans-serif",
  arcade: "'Press Start 2P', monospace",
} as const;

/** Spacing scale from the sheet: 4 · 8 · 12 · 16 · 22 · 28. */
export const space = [4, 8, 12, 16, 22, 28] as const;

/** Stat cards tilt ±0.6deg; press = translate(2px,2px) + shadow shrink. */
export const motion = { tiltDeg: 0.6, pressPx: 2 } as const;

/** Reliability grade circles A–E (background, foreground). */
export const gradeColors: Record<"A" | "B" | "C" | "D" | "E", { bg: string; fg: string }> = {
  A: { bg: colors.confirmed, fg: "#ffffff" },
  B: { bg: colors.confirmedFill, fg: colors.ink },
  C: { bg: colors.amberFill, fg: colors.amberText },
  D: { bg: colors.gradeD, fg: colors.amberText },
  E: { bg: colors.rule, fg: colors.muted },
};

/** Timeline / status dot colours by `place_timeline.dot`. */
export const dotColors: Record<string, string> = {
  live: colors.liveRed,
  unknown: colors.amber,
  confirmed: colors.confirmed,
  neutral: colors.deadDot,
};

/** "The first hours" dot colours by `event_timeline.kind` (docs/13-story-and-digest.md). */
export const eventKindColors: Record<string, string> = {
  trigger: colors.liveRed,
  wave: colors.floodPath,
  gauge: colors.ink,
  warning: colors.amber,
  impact: colors.amberFill,
  response: colors.confirmed,
  event: colors.deadDot,
};

/** "What changed today" bullet badge colours by `digest.bullets[].kind` (background, foreground). */
export const digestKindColors: Record<string, { bg: string; fg: string }> = {
  figure: { bg: colors.amberFill, fg: colors.amberText },
  place: { bg: colors.ultramarine, fg: "#ffffff" },
  gauge: { bg: colors.confirmedFill, fg: colors.confirmedText },
  news: { bg: colors.card, fg: colors.ink },
};
