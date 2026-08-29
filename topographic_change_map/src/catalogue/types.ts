export type Epoch = "PRE" | "POST" | "CONTEXT";
export type CameraModelType = "RPC" | "PHYSICAL" | "CSM" | "ORBIT" | "COARSE_LOOK";

export interface AoiProperties {
  id: string;
  name: string;
  status: "PILOT" | "PRELIMINARY" | "AUTHORITATIVE";
  purpose: string;
}

export interface SceneAsset {
  key: string;
  href: string;
  mediaType: string | null;
  roles: string[];
}

export interface SceneRecord {
  schemaVersion: 1;
  provider: "VANTOR_OPEN" | "PLANET_SOURCE_COOP";
  sceneId: string;
  sourceMetadataUrl: string;
  epoch: Epoch;
  acquiredAt: string;
  sensor: string;
  geometry: Polygon | MultiPolygon;
  bbox: [number, number, number, number];
  gsdM: number | null;
  cloudPct: number | null;
  offNadirDeg: number | null;
  azimuthDeg: number | null;
  orthorectified: boolean;
  cameraModelType: CameraModelType | null;
  cameraModelAvailable: boolean;
  assets: SceneAsset[];
  licence: string;
}

export type PairVerdict =
  | "PUBLIC_PARALLAX_ONLY"
  | "REJECT_NO_OVERLAP"
  | "REJECT_WEAK_GEOMETRY"
  | "METADATA_REVIEW";

export interface PairRecord {
  schemaVersion: 1;
  pairId: string;
  aoiId: string;
  epoch: "PRE" | "POST";
  leftSceneId: string;
  rightSceneId: string;
  providers: string[];
  commonAoiFraction: number;
  acquisitionDeltaSeconds: number;
  approximateRaySeparationDeg: number | null;
  cameraModelsAvailable: boolean;
  verdict: PairVerdict;
  reasons: string[];
}
import type { MultiPolygon, Polygon } from "geojson";
