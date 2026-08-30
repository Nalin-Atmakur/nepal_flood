"use client";

import dynamic from "next/dynamic";
import type { CorridorPlace, RealBridge } from "@/lib/corridor";
import type { Lang } from "@/lib/i18n";

/**
 * Client island for the 3D corridor. `ssr: false` is only allowed inside a client component in
 * Next 15+, which is the whole reason this wrapper exists. The parent server block owns the
 * chunky frame, the legend and the caption; the scene (or its PNG fallback) fills the frame.
 */
const CorridorScene = dynamic(() => import("@/components/three/CorridorScene"), {
  ssr: false,
  loading: () => <div className="h-[400px] md:h-[480px] w-full bg-scene" aria-busy="true" aria-label="3D corridor" />,
});

export default function CorridorIsland({ places, lang, lakeVolumeM3, bridges = [] }: { places: CorridorPlace[]; lang: Lang; lakeVolumeM3?: number | null; bridges?: RealBridge[] }) {
  return <CorridorScene places={places} lang={lang} fallbackSrc="/corridor-fallback.png" lakeVolumeM3={lakeVolumeM3} bridges={bridges} />;
}
