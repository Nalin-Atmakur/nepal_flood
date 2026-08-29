import fs from "node:fs";
import path from "node:path";
import { area, feature, featureCollection, intersect } from "@turf/turf";
import type { Feature, FeatureCollection, MultiPolygon, Polygon } from "geojson";
import { PROJECT_ROOT } from "../constants.js";

type AreaFeature = Feature<Polygon | MultiPolygon>;
type Attribute = { Name?: unknown; Value?: unknown };
type ODataProduct = {
  Id: string;
  Name: string;
  ContentDate: { Start: string; End: string };
  ContentLength: number;
  Online: boolean;
  S3Path?: string;
  GeoFootprint: Polygon | MultiPolygon;
  Attributes?: Attribute[];
};

export function attributeValue(attributes: Attribute[] | undefined, name: string): unknown {
  return attributes?.find((item) => item.Name === name)?.Value ?? null;
}

function affectedOverlapKm2(geometry: Polygon | MultiPolygon, affected: AreaFeature[]): number {
  const candidate = feature(geometry) as AreaFeature;
  return affected.reduce((sum, item) => {
    const overlap = intersect(featureCollection([candidate, item]));
    return sum + (overlap ? area(overlap) / 1e6 : 0);
  }, 0);
}

export async function buildSentinel2Catalogue(): Promise<{ scenes: number; pre: number; post: number }> {
  const affectedPath = path.join(PROJECT_ROOT, "catalogue/affected/unosat_damage_area.geojson");
  const affectedCollection = JSON.parse(fs.readFileSync(affectedPath, "utf8")) as FeatureCollection;
  const affected = affectedCollection.features.filter(
    (item): item is AreaFeature => item.geometry?.type === "Polygon" || item.geometry?.type === "MultiPolygon",
  );
  const filter = [
    "Collection/Name eq 'SENTINEL-2'",
    "contains(Name,'MSIL2A')",
    "ContentDate/Start ge 2026-07-01T00:00:00.000Z",
    "ContentDate/Start le 2026-08-29T23:59:59.999Z",
    "OData.CSC.Intersects(area=geography'SRID=4326;POLYGON((85.0 27.8,85.55 27.8,85.55 28.35,85.0 28.35,85.0 27.8))')",
  ].join(" and ");
  const url = new URL("https://catalogue.dataspace.copernicus.eu/odata/v1/Products");
  url.searchParams.set("$filter", filter);
  url.searchParams.set("$expand", "Attributes");
  url.searchParams.set("$orderby", "ContentDate/Start asc");
  url.searchParams.set("$top", "1000");
  const response = await fetch(url, { signal: AbortSignal.timeout(60_000) });
  if (!response.ok) throw new Error(`Copernicus catalogue failed with HTTP ${response.status}`);
  const payload = (await response.json()) as { value?: ODataProduct[] };
  const floodCutoff = Date.parse("2026-08-27T00:00:00Z");
  const scenes = (payload.value ?? []).flatMap((product) => {
    const overlap = affectedOverlapKm2(product.GeoFootprint, affected);
    if (overlap <= 0) return [];
    const acquiredAt = product.ContentDate.Start;
    return [{
      provider: "COPERNICUS_DATA_SPACE",
      productId: product.Id,
      name: product.Name,
      acquiredAt,
      epoch: Date.parse(acquiredAt) < floodCutoff ? "PRE" : "POST",
      platform: attributeValue(product.Attributes, "platformSerialIdentifier"),
      tileId: attributeValue(product.Attributes, "tileId"),
      processingLevel: attributeValue(product.Attributes, "processingLevel"),
      cloudCoverPct: attributeValue(product.Attributes, "cloudCover"),
      relativeOrbitNumber: attributeValue(product.Attributes, "relativeOrbitNumber"),
      contentLengthBytes: product.ContentLength,
      online: product.Online,
      s3Path: product.S3Path ?? null,
      footprint: product.GeoFootprint,
      affectedOverlapKm2: overlap,
      cameraModelAssets: [],
      dsmVerdict: "REJECTED_WEAK_GEOMETRY_AND_10M_GSD",
      contextUses: ["cloud screening", "flood extent", "temporal landscape context"],
    }];
  });
  const output = {
    schemaVersion: 1,
    generatedAt: new Date().toISOString(),
    source: "Copernicus Data Space official OData catalogue",
    query: { start: "2026-07-01", end: "2026-08-29", productType: "S2MSI2A" },
    interpretation: "Sentinel-2 is context imagery, not a building-scale stereo DSM source.",
    scenes,
  };
  const outputPath = path.join(PROJECT_ROOT, "catalogue/sentinel2-context.json");
  fs.writeFileSync(outputPath, `${JSON.stringify(output, null, 2)}\n`);
  const pre = scenes.filter((item) => item.epoch === "PRE").length;
  const post = scenes.length - pre;
  const rows = scenes.map((item) =>
    `| ${item.acquiredAt.slice(0, 10)} | ${item.platform ?? "—"} | ${item.tileId ?? "—"} | ${typeof item.cloudCoverPct === "number" ? item.cloudCoverPct.toFixed(1) : "—"} | ${item.affectedOverlapKm2.toFixed(2)} | ${item.epoch} |`,
  ).join("\n");
  fs.writeFileSync(
    path.join(PROJECT_ROOT, "catalogue/SENTINEL2.md"),
    `# Sentinel-2 temporal context catalogue\n\nGenerated: ${output.generatedAt}\n\nThe official Copernicus Data Space query found ${scenes.length} L2A products with exact UNOSAT overlap (${pre} pre-cutoff, ${post} post-cutoff). These products are retained for cloud/flood/temporal context and are explicitly rejected for precision DSM generation.\n\n| Date | Platform | Tile | Scene cloud % | UNOSAT overlap km² | Epoch |\n|---|---|---|---:|---:|---|\n${rows}\n`,
  );
  return { scenes: scenes.length, pre, post };
}
