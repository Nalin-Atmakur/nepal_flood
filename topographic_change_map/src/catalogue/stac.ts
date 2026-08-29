import { z } from "zod";
import type { MultiPolygon, Polygon } from "geojson";
import type { SceneRecord } from "./types.js";

const linkSchema = z.object({
  rel: z.string(),
  href: z.string(),
  type: z.string().optional(),
});

const stacNodeSchema = z.object({
  type: z.string(),
  id: z.string(),
  bbox: z.array(z.number()).optional(),
  geometry: z.any().optional(),
  properties: z.record(z.string(), z.any()).optional(),
  assets: z.record(z.string(), z.any()).optional(),
  links: z.array(linkSchema).default([]),
});

interface StacNode extends z.infer<typeof stacNodeSchema> {}

const INCIDENT_CUTOFF = Date.parse("2026-08-26T02:52:00Z");

async function fetchJson(url: string): Promise<unknown> {
  const response = await fetch(url, { headers: { "user-agent": "nepal-flood-tcm/0.1" } });
  if (!response.ok) throw new Error(`STAC fetch failed ${response.status}: ${url}`);
  return await response.json();
}

function providerFor(url: string): SceneRecord["provider"] {
  return url.includes("vantor-opendata") ? "VANTOR_OPEN" : "PLANET_SOURCE_COOP";
}

function absoluteHref(base: string, href: string): string {
  return new URL(href, base).href;
}

function propertyNumber(properties: Record<string, unknown>, key: string): number | null {
  const value = properties[key];
  return typeof value === "number" && Number.isFinite(value) ? value : null;
}

function sensorName(node: StacNode, provider: SceneRecord["provider"]): string {
  const properties = node.properties ?? {};
  for (const key of ["platform", "constellation", "mission"]) {
    const value = properties[key];
    if (typeof value === "string" && value) return value;
  }
  const instruments = properties.instruments;
  if (Array.isArray(instruments) && typeof instruments[0] === "string") return instruments[0];
  return provider === "VANTOR_OPEN" ? "WorldView/GeoEye/Legion" : "Planet sensor";
}

function normalizeItem(node: StacNode, url: string): SceneRecord {
  const provider = providerFor(url);
  const properties = node.properties ?? {};
  const acquiredAt = String(properties.datetime ?? properties.start_datetime ?? "");
  if (!acquiredAt || !Number.isFinite(Date.parse(acquiredAt))) {
    throw new Error(`STAC item ${node.id} has no valid acquisition time`);
  }
  if (!node.geometry || !node.bbox || node.bbox.length < 4) {
    throw new Error(`STAC item ${node.id} has no footprint`);
  }
  const assets = Object.entries(node.assets ?? {}).map(([key, value]) => {
    const asset = value as Record<string, unknown>;
    return {
      key,
      href: absoluteHref(url, String(asset.href ?? "")),
      mediaType: typeof asset.type === "string" ? asset.type : null,
      roles: Array.isArray(asset.roles) ? asset.roles.filter((role): role is string => typeof role === "string") : [],
    };
  });
  const licence = provider === "PLANET_SOURCE_COOP" ? "CC-BY-NC-4.0" : "CC-BY-NC-4.0";
  return {
    schemaVersion: 1,
    provider,
    sceneId: node.id,
    sourceMetadataUrl: url,
    epoch: Date.parse(acquiredAt) < INCIDENT_CUTOFF ? "PRE" : "POST",
    acquiredAt,
    sensor: sensorName(node, provider),
    geometry: node.geometry as Polygon | MultiPolygon,
    bbox: [node.bbox[0]!, node.bbox[1]!, node.bbox[2]!, node.bbox[3]!],
    gsdM: propertyNumber(properties, "gsd"),
    cloudPct: propertyNumber(properties, "eo:cloud_cover"),
    offNadirDeg: propertyNumber(properties, "view:off_nadir"),
    azimuthDeg: propertyNumber(properties, "view:azimuth"),
    orthorectified: true,
    cameraModelType: assets.some((asset) => /rpc|rpb|dimap|camera/i.test(asset.key)) ? "RPC" : "COARSE_LOOK",
    cameraModelAvailable: assets.some((asset) => /rpc|rpb|dimap|camera/i.test(asset.key)),
    assets,
    licence,
  };
}

export async function crawlStac(rootUrl: string): Promise<SceneRecord[]> {
  const queue = [rootUrl];
  const visited = new Set<string>();
  const scenes: SceneRecord[] = [];
  while (queue.length) {
    const url = queue.shift()!;
    if (visited.has(url)) continue;
    visited.add(url);
    const node = stacNodeSchema.parse(await fetchJson(url));
    const isItem = node.type === "Feature" && node.properties && node.geometry;
    if (isItem) {
      scenes.push(normalizeItem(node, url));
      continue;
    }
    for (const link of node.links) {
      if (link.rel === "item" || link.rel === "child") {
        queue.push(absoluteHref(url, link.href));
      }
    }
  }
  return scenes.sort((a, b) => a.acquiredAt.localeCompare(b.acquiredAt) || a.sceneId.localeCompare(b.sceneId));
}
