import { bbox, bboxPolygon, buffer, featureCollection, point } from "@turf/turf";
import type { Feature, FeatureCollection, Polygon } from "geojson";
import type { AoiProperties } from "./types.js";

function oneKilometreSquare(
  id: string,
  name: string,
  longitude: number,
  latitude: number,
  status: AoiProperties["status"],
  purpose: string,
): Feature<Polygon, AoiProperties> {
  const buffered = buffer(point([longitude, latitude]), 0.5, { units: "kilometers" });
  if (!buffered) throw new Error(`Could not construct AOI ${id}`);
  const square = bboxPolygon(bbox(buffered));
  return {
    ...square,
    properties: { id, name, status, purpose },
  };
}

export function projectAois(): FeatureCollection<Polygon, AoiProperties> {
  return featureCollection([
    oneKilometreSquare(
      "syabrubesi-pilot-v1",
      "Syabrubesi 1 km stereo pilot",
      85.3461,
      28.1622,
      "PILOT",
      "First end-to-end stereo and DSM reconstruction tile",
    ),
    oneKilometreSquare(
      "timure-pilot-v1",
      "Timure 1 km screening tile",
      85.373,
      28.235,
      "PRELIMINARY",
      "Upstream affected-settlement imagery screening",
    ),
    oneKilometreSquare(
      "rasuwagadhi-pilot-v1",
      "Rasuwagadhi border-post 1 km tile",
      85.377744,
      28.279672,
      "PRELIMINARY",
      "Preserves the earlier border-post elevation investigation as a separate AOI",
    ),
    oneKilometreSquare(
      "bidur-pilot-v1",
      "Bidur 1 km screening tile",
      85.15,
      27.9,
      "PRELIMINARY",
      "Downstream affected-area imagery screening; replace with authoritative EMSR927 geometry",
    ),
  ]);
}
