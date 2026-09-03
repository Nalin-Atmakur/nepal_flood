import type { Metadata } from "next";
import SedimentMapLoader from "@/components/sediment/SedimentMapLoader";

export const metadata: Metadata = {
  title: "Sediment depth map — Nepal Flood Tracker",
  description:
    "Explore elevation changes from the August 2026 Bhote Koshi–Trishuli flood. Click any point or use your location to see measured scour and deposition depths.",
};

export default function SedimentPage() {
  return (
    <main className="flex flex-col" style={{ height: "100dvh" }}>
      <div className="px-4 py-3 border-b border-gray-200 shrink-0">
        <h1 className="text-base font-semibold">Sediment depth map</h1>
        <p className="text-xs text-gray-500 mt-0.5">
          Click anywhere in the corridor, or tap{" "}
          <strong>My location</strong> to see elevation change at that
          point. Data: GeoPera / WorldView-3, CC&nbsp;BY-NC.
        </p>
      </div>
      <div className="flex-1 min-h-0">
        <SedimentMapLoader />
      </div>
    </main>
  );
}
