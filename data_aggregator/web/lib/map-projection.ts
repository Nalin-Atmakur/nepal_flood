/**
 * Slippy-map (Web Mercator) projection for the pre-rendered corridor basemap (web/docs/21-places-map.md).
 * Pure functions, no dependencies: `scripts/make-map.mjs` cuts the image to a tile window and writes that window
 * into `lib/map-view.ts`; these helpers turn a place's lat/lon into a position inside that image, so the pins sit
 * exactly where the geography is.
 *
 *   worldX(lon) = (lon + 180)/360 · 2^z · 256
 *   worldY(lat) = (1 − ln(tan φ + sec φ)/π)/2 · 2^z · 256
 *   image  = world − tile0 · 256          fraction = image / imageSize
 */
export const TILE_SIZE = 256;
/** Mercator is undefined at the poles; clamp to the standard web-map limit. */
export const MAX_LAT = 85.05112878;

export type MapView = {
  zoom: number;
  tileX0: number;
  tileY0: number;
  tilesX: number;
  tilesY: number;
  width: number;
  height: number;
};
export type Point = { x: number; y: number };

export function lonToWorldX(lon: number, zoom: number): number {
  return ((lon + 180) / 360) * 2 ** zoom * TILE_SIZE;
}

export function latToWorldY(lat: number, zoom: number): number {
  const clamped = Math.max(-MAX_LAT, Math.min(MAX_LAT, lat));
  const r = (clamped * Math.PI) / 180;
  return ((1 - Math.log(Math.tan(r) + 1 / Math.cos(r)) / Math.PI) / 2) * 2 ** zoom * TILE_SIZE;
}

/** Pixel position inside the rendered image (may fall outside it for places off the map). */
export function projectToImage(lat: number, lon: number, view: MapView): Point {
  return {
    x: lonToWorldX(lon, view.zoom) - view.tileX0 * TILE_SIZE,
    y: latToWorldY(lat, view.zoom) - view.tileY0 * TILE_SIZE,
  };
}

/** Position as a fraction of the image (0…1 inside it) — what the DOM needs for `left`/`top` in %. */
export function projectToFraction(lat: number, lon: number, view: MapView): Point {
  const p = projectToImage(lat, lon, view);
  return { x: p.x / view.width, y: p.y / view.height };
}

/** Is a fraction inside the image (with an optional margin, e.g. 0.01 to drop pins on the very edge)? */
export function isInView(p: Point, margin = 0): boolean {
  return p.x >= margin && p.x <= 1 - margin && p.y >= margin && p.y <= 1 - margin;
}

/** Bounding box of a set of fractions, or null when there are none. */
export function fractionBounds(points: Point[]): { x0: number; y0: number; x1: number; y1: number } | null {
  if (!points.length) return null;
  let x0 = Infinity;
  let y0 = Infinity;
  let x1 = -Infinity;
  let y1 = -Infinity;
  for (const p of points) {
    if (p.x < x0) x0 = p.x;
    if (p.y < y0) y0 = p.y;
    if (p.x > x1) x1 = p.x;
    if (p.y > y1) y1 = p.y;
  }
  return { x0, y0, x1, y1 };
}

export type Size = { w: number; h: number };

/**
 * The size the image is drawn at so it *covers* the box without distortion (the manual equivalent of
 * `object-fit: cover`): the box can be any shape — tall on phones, wide on desktop — and the map stays true.
 */
export function coverSize(img: Size, box: Size): Size {
  if (box.w <= 0 || box.h <= 0) return { w: img.w, h: img.h };
  const scale = Math.max(box.w / img.w, box.h / img.h);
  return { w: img.w * scale, h: img.h * scale };
}

/**
 * The transform that frames `bounds` (fractions of the image) inside the box: a scale and a translation in
 * container pixels, clamped so the content always covers the box (no blank edges).
 */
export function fitTransform(bounds: { x0: number; y0: number; x1: number; y1: number }, content: Size, box: Size, opts: { pad?: number; maxScale?: number } = {}): { scale: number; tx: number; ty: number } {
  const pad = opts.pad ?? 0.12;
  const maxScale = opts.maxScale ?? 4;
  const bw = Math.max(1e-4, (bounds.x1 - bounds.x0) * (1 + pad * 2));
  const bh = Math.max(1e-4, (bounds.y1 - bounds.y0) * (1 + pad * 2));
  const scale = Math.max(1, Math.min(maxScale, Math.min(box.w / (bw * content.w), box.h / (bh * content.h))));
  const cx = (bounds.x0 + bounds.x1) / 2;
  const cy = (bounds.y0 + bounds.y1) / 2;
  return clampTransform({ scale, tx: box.w / 2 - cx * content.w * scale, ty: box.h / 2 - cy * content.h * scale }, content, box);
}

/** Keep the content covering the box: translation is bounded by how much of it hangs outside. */
export function clampTransform(t: { scale: number; tx: number; ty: number }, content: Size, box: Size): { scale: number; tx: number; ty: number } {
  const scale = Math.max(1, t.scale);
  return {
    scale,
    tx: Math.min(0, Math.max(box.w - content.w * scale, t.tx)),
    ty: Math.min(0, Math.max(box.h - content.h * scale, t.ty)),
  };
}

/** Zoom by `factor` about a point in box pixels (the cursor or the pinch midpoint). */
export function zoomAbout(t: { scale: number; tx: number; ty: number }, px: number, py: number, factor: number, content: Size, box: Size, maxScale = 8): { scale: number; tx: number; ty: number } {
  const scale = Math.max(1, Math.min(maxScale, t.scale * factor));
  const k = scale / t.scale;
  return clampTransform({ scale, tx: px - (px - t.tx) * k, ty: py - (py - t.ty) * k }, content, box);
}
