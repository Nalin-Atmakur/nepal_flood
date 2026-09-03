import type { Metadata } from "next";
import SedimentMapLoader from "@/components/sediment/SedimentMapLoader";
import { getPlaces, getPlaceStatuses } from "@/lib/queries";

export const metadata: Metadata = {
  title: "Terrain change map — Nepal Flood Tracker",
  description:
    "Explore post-flood terrain change from the August 2026 Bhote Koshi–Trishuli flood. Negative values show scour and erosion; positive values show sediment deposition. Data: GeoPera / WorldView-3.",
};

export default async function SedimentPage() {
  const [refs, statuses] = await Promise.all([getPlaces(), getPlaceStatuses()]);

  return (
    <main>
      <div className="px-4 py-3 border-b border-gray-200">
        <h1 className="text-base font-semibold">Terrain change map</h1>
        <p className="text-xs text-gray-500 mt-0.5">
          Elevation change (post − pre flood). Negative = scour/erosion, positive = sediment deposition. Click anywhere to measure. Data: GeoPera / WorldView-3, CC&nbsp;BY-NC.
        </p>
        <p className="text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded px-2 py-1 mt-1.5">
          ⚠ Depth readings are derived from satellite stereo imagery and may contain inaccuracies. Do not use for engineering or safety decisions.
        </p>
      </div>
      <div className="h-[calc(100svh-180px)] min-h-[400px]">
        <SedimentMapLoader refs={refs ?? []} statuses={statuses ?? []} />
      </div>
    </main>
  );
}
