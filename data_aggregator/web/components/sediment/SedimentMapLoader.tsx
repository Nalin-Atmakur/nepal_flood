"use client";

import dynamic from "next/dynamic";
import type { PlaceRef, PlaceStatusRow } from "@/lib/queries";

const SedimentMap = dynamic(
  () => import("./SedimentMap").then((m) => m.SedimentMap),
  {
    ssr: false,
    loading: () => (
      <div className="w-full h-full bg-gray-100 animate-pulse flex items-center justify-center text-sm text-gray-400">
        Loading map…
      </div>
    ),
  }
);

export default function SedimentMapLoader({ refs, statuses }: { refs: PlaceRef[]; statuses: PlaceStatusRow[] }) {
  return <SedimentMap refs={refs} statuses={statuses} />;
}
