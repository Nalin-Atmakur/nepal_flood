/**
 * Canvas-text sprites for the corridor: a place name (or "SWEPT 09:03") on a white pill with an ink border,
 * in the design's Baloo 2 (Devanagari renders because the page already loads the font). Textures are cached per
 * text so the same label never rasterises twice; sprites are cheap to show/hide.
 */
import * as THREE from "three";

export type LabelOptions = {
  /** scene units for the pill's height; width follows the text */
  height?: number;
  /** ink on white (default) or white on ink ("dark") or amber pill ("amber") */
  tone?: "light" | "dark" | "amber";
  /** sprite centre offset (0.5 = centred; 0 = anchored at the bottom) */
  anchorY?: number;
};

const cache = new Map<string, { tex: THREE.CanvasTexture; w: number; h: number }>();
const TONES = {
  light: { bg: "#ffffff", fg: "#1a1a1a", border: "#1a1a1a" },
  dark: { bg: "#141419", fg: "#ffffff", border: "#1a1a1a" },
  amber: { bg: "#ffe294", fg: "#8a3f06", border: "#1a1a1a" },
} as const;

function raster(text: string, tone: keyof typeof TONES): { tex: THREE.CanvasTexture; w: number; h: number } {
  const key = `${tone}|${text}`;
  const hit = cache.get(key);
  if (hit) return hit;
  const dpr = 2;
  const font = `600 28px "Baloo 2", "Noto Sans Devanagari", system-ui, sans-serif`;
  const probe = document.createElement("canvas").getContext("2d")!;
  probe.font = font;
  const textW = Math.ceil(probe.measureText(text).width);
  const padX = 18;
  const h = 48;
  const w = Math.min(520, textW + padX * 2);
  const canvas = document.createElement("canvas");
  canvas.width = w * dpr;
  canvas.height = h * dpr;
  const g = canvas.getContext("2d")!;
  g.scale(dpr, dpr);
  const t = TONES[tone];
  const r = 10;
  g.fillStyle = t.bg;
  g.strokeStyle = t.border;
  g.lineWidth = 2.5;
  g.beginPath();
  g.moveTo(r, 1.5);
  g.arcTo(w - 1.5, 1.5, w - 1.5, h - 1.5, r);
  g.arcTo(w - 1.5, h - 1.5, 1.5, h - 1.5, r);
  g.arcTo(1.5, h - 1.5, 1.5, 1.5, r);
  g.arcTo(1.5, 1.5, w - 1.5, 1.5, r);
  g.closePath();
  g.fill();
  g.stroke();
  g.font = font;
  g.fillStyle = t.fg;
  g.textBaseline = "middle";
  g.textAlign = "center";
  g.fillText(text, w / 2, h / 2 + 2, w - padX);
  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = 4;
  tex.needsUpdate = true;
  const out = { tex, w, h };
  cache.set(key, out);
  return out;
}

/** A billboard label; `sprite.userData.text` keeps the string for tests/debugging. */
export function createLabel(text: string, opts: LabelOptions = {}): THREE.Sprite {
  const height = opts.height ?? 2.2;
  const tone = opts.tone ?? "light";
  const { tex, w, h } = raster(text, tone);
  const mat = new THREE.SpriteMaterial({ map: tex, transparent: true, depthTest: true, depthWrite: false, sizeAttenuation: true });
  const sprite = new THREE.Sprite(mat);
  sprite.scale.set((w / h) * height, height, 1);
  sprite.center.set(0.5, opts.anchorY ?? 0);
  sprite.userData.text = text;
  sprite.renderOrder = 20;
  return sprite;
}

/** Drop every cached texture (the scene is being torn down). */
export function disposeLabelCache(): void {
  for (const v of cache.values()) v.tex.dispose();
  cache.clear();
}
