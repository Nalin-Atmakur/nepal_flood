"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import type * as L from "leaflet";
import "leaflet/dist/leaflet.css";
import { queryDepthAtCoordinate, type SedimentReading } from "@/lib/sediment-query";
import { statusTone } from "@/lib/corridor";
import { colors } from "@/lib/tokens";
import type { PlaceRef, PlaceStatusRow } from "@/lib/queries";

const INITIAL_CENTER: [number, number] = [28.18, 85.35]; // Leaflet uses [lat, lon]
const INITIAL_ZOOM = 12;
const DATA_BOUNDS: [[number, number], [number, number]] = [
  [28.1108, 85.2788],
  [28.3178, 85.4226],
];

type DepthState =
  | { status: "idle" }
  | { status: "loading" }
  | { status: "nodata" }
  | { status: "done"; lat: number; lon: number; reading: SedimentReading };

type RawPoint = [number, number, number, number | null]; // [lon, lat, dh_m, uncertainty_m]

function dhToColor(dh: number): string {
  if (dh < -3) return "#0044dd";
  if (dh < -0.5) return "#55aaff";
  if (dh < 0.5) return "#ffdd00";
  if (dh < 3) return "#ff8800";
  return "#cc0000";
}

// Leaflet custom canvas layer
function createSedimentLayer(
  LLib: typeof L,
  points: RawPoint[]
): L.Layer {
  const CanvasLayer = LLib.Layer.extend({
    _canvas: null as HTMLCanvasElement | null,

    onAdd(map: L.Map) {
      const canvas = document.createElement("canvas");
      canvas.style.cssText = "position:absolute;top:0;left:0;pointer-events:none;";
      canvas.style.zIndex = "300";
      (map.getPanes().overlayPane as HTMLElement).appendChild(canvas);
      this._canvas = canvas;
      this._map = map;

      map.on("moveend zoomend resize", this._redraw, this);
      this._redraw();
    },

    onRemove(map: L.Map) {
      this._canvas?.remove();
      this._canvas = null;
      map.off("moveend zoomend resize", this._redraw, this);
    },

    _redraw() {
      const map: L.Map = this._map;
      const canvas: HTMLCanvasElement = this._canvas;
      if (!map || !canvas) return;

      const size = map.getSize();
      canvas.width = size.x;
      canvas.height = size.y;
      // Align canvas with map origin
      const topLeft = map.containerPointToLayerPoint([0, 0]);
      LLib.DomUtil.setPosition(canvas, topLeft);

      const ctx = canvas.getContext("2d")!;
      ctx.clearRect(0, 0, size.x, size.y);

      const zoom = map.getZoom();
      // Radius large enough that neighbours (~50 m apart) overlap and fill gaps
      const r = zoom < 10 ? 1.5 : zoom < 11 ? 2.5 : zoom < 12 ? 3.5 : zoom < 13 ? 5 : zoom < 14 ? 7.5 : zoom < 15 ? 11 : 16;
      const pad = r + 2;

      // Draw to offscreen canvas at full opacity, then stamp at low opacity.
      // This prevents circles from stacking up where they overlap.
      const off = new OffscreenCanvas(size.x, size.y);
      const octx = off.getContext("2d")!;
      for (const [lon, lat, dh] of points) {
        const pt = map.latLngToContainerPoint([lat, lon]);
        if (pt.x < -pad || pt.x > size.x + pad || pt.y < -pad || pt.y > size.y + pad) continue;
        octx.beginPath();
        octx.arc(pt.x, pt.y, r, 0, Math.PI * 2);
        octx.fillStyle = dhToColor(dh);
        octx.fill();
      }
      ctx.globalAlpha = 0.35;
      ctx.drawImage(off, 0, 0);
      ctx.globalAlpha = 1;
    },
  });

  return new (CanvasLayer as new () => L.Layer)();
}


export function SedimentMap({ refs, statuses }: { refs: PlaceRef[]; statuses: PlaceStatusRow[] }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const markerRef = useRef<L.Marker | null>(null);
  const leafletRef = useRef<typeof L | null>(null);
  const [depth, setDepth] = useState<DepthState>({ status: "idle" });
  const [gpsError, setGpsError] = useState<string | null>(null);
  const [coordInput, setCoordInput] = useState("");
  const [coordError, setCoordError] = useState<string | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);

  const probe = useCallback(async (lat: number, lon: number) => {
    setDepth({ status: "loading" });
    const reading = await queryDepthAtCoordinate(lat, lon);
    if (!reading) {
      setDepth({ status: "nodata" });
    } else {
      setDepth({ status: "done", lat, lon, reading });
    }
  }, []);

  const placeMarker = useCallback(
    (lat: number, lon: number) => {
      const map = mapRef.current;
      if (!map) return;
      markerRef.current?.remove();
      if (!leafletRef.current) return;
      markerRef.current = leafletRef.current.marker([lat, lon]).addTo(map);
      probe(lat, lon);
    },
    [probe]
  );

  useEffect(() => {
    if (!containerRef.current) return;

    // Dynamically import Leaflet to avoid SSR issues
    import("leaflet").then((LLib) => {
      if (!containerRef.current || mapRef.current) return;
      leafletRef.current = LLib;

      console.log("[sediment] initialising Leaflet map");

      const map = LLib.map(containerRef.current, {
        center: INITIAL_CENTER,
        zoom: INITIAL_ZOOM,
        zoomControl: true,
      });

      LLib.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: "© OpenStreetMap contributors",
        maxZoom: 19,
      }).addTo(map);

      // Place pins from the places map
      const byId = new Map(statuses.map((s) => [s.place_id, s]));
      for (const ref of refs) {
        if (ref.lat === null || ref.lon === null) continue;
        const tone = statusTone(byId.get(ref.id) ?? null);
        const fillColor = tone === "reached" ? colors.confirmed : tone === "unknown" ? colors.markerUnknown : colors.deadDot;
        LLib.circleMarker([ref.lat, ref.lon], {
          radius: 6,
          fillColor,
          fillOpacity: 0.9,
          color: "#fff",
          weight: 1.5,
        }).bindTooltip(ref.name_en, { direction: "top", offset: [0, -6] }).addTo(map);
      }

      map.on("click", (e: L.LeafletMouseEvent) => {
        placeMarker(e.latlng.lat, e.latlng.lng);
      });

      mapRef.current = map;

      const tileUrl = process.env.NEXT_PUBLIC_SEDIMENT_TILES_URL;
      console.log("[sediment] NEXT_PUBLIC_SEDIMENT_TILES_URL =", tileUrl ?? "(unset — canvas overlay)");

      if (tileUrl) {
        // Production: XYZ raster tile overlay
        LLib.tileLayer(`${tileUrl}/{z}/{x}/{y}.png`, {
          attribution: "GeoPera / WorldView-3, CC BY-NC",
          opacity: 0.85,
          maxZoom: 19,
        }).addTo(map);
        console.log("[sediment] raster tile layer added");
      } else {
        // Dev: canvas overlay from local JSON
        console.log("[sediment] fetching /stereo_dh.json");
        fetch("/stereo_dh.json")
          .then((r) => {
            if (!r.ok) throw new Error(`HTTP ${r.status}`);
            return r.json() as Promise<RawPoint[]>;
          })
          .then((pts) => {
            console.log("[sediment] loaded", pts.length, "points");
            const layer = createSedimentLayer(LLib, pts);
            layer.addTo(map);
            map.fitBounds(DATA_BOUNDS, { padding: [40, 40], maxZoom: 13 });
            console.log("[sediment] canvas layer added, bounds fitted");
          })
          .catch((e) => {
            console.error("[sediment] failed to load stereo_dh.json:", e);
            setLoadError(`Failed to load sediment data: ${e.message}`);
          });
      }
    });

    return () => {
      mapRef.current?.remove();
      mapRef.current = null;
    };
  }, [placeMarker]);

  function handleCoordSubmit(e: React.FormEvent) {
    e.preventDefault();
    setCoordError(null);
    const parts = coordInput.split(/[\s,]+/).filter(Boolean);
    if (parts.length !== 2) { setCoordError("Enter as: lat, lon"); return; }
    const lat = parseFloat(parts[0]);
    const lon = parseFloat(parts[1]);
    if (isNaN(lat) || isNaN(lon)) { setCoordError("Invalid numbers"); return; }
    mapRef.current?.flyTo([lat, lon], 14);
    placeMarker(lat, lon);
  }

  function handleGPS() {
    setGpsError(null);
    if (!navigator.geolocation) { setGpsError("Geolocation not available."); return; }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        mapRef.current?.flyTo([latitude, longitude], 15);
        placeMarker(latitude, longitude);
      },
      () => setGpsError("Could not get your location. Check browser permissions.")
    );
  }

  return (
    <div className="relative w-full h-full">
      <div ref={containerRef} className="w-full h-full" />

      {loadError && (
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-20 bg-red-50 border border-red-300 text-red-700 text-sm rounded-xl px-5 py-3 max-w-xs text-center">
          {loadError}
        </div>
      )}

      {/* Controls panel — hidden on mobile to avoid crowding */}
      <div className="absolute top-4 right-4 z-[1000] hidden md:flex flex-col gap-2 items-end">
        <form
          onSubmit={handleCoordSubmit}
          className="flex gap-1 bg-white border border-gray-200 shadow-md rounded-lg overflow-hidden"
        >
          <input
            type="text"
            value={coordInput}
            onChange={(e) => setCoordInput(e.target.value)}
            placeholder="lat, lon"
            className="px-3 py-2 text-sm w-36 outline-none"
          />
          <button
            type="submit"
            className="px-3 py-2 text-sm font-medium bg-gray-50 hover:bg-gray-100 border-l border-gray-200 transition-colors"
          >
            Go
          </button>
        </form>

        {coordError && (
          <div className="bg-red-50 border border-red-200 text-red-700 text-xs rounded-lg px-3 py-1.5">
            {coordError}
          </div>
        )}

        <button
          onClick={handleGPS}
          className="bg-white border border-gray-200 shadow-md rounded-lg px-3 py-2 text-sm font-medium hover:bg-gray-50 transition-colors"
        >
          My location
        </button>

        {gpsError && (
          <div className="bg-red-50 border border-red-200 text-red-700 text-xs rounded-lg px-3 py-1.5 max-w-48">
            {gpsError}
          </div>
        )}
      </div>

      {/* GPS button on mobile — bottom left, above tab bar */}
      <div className="absolute bottom-4 left-4 z-[1000] flex flex-col gap-2 items-start md:hidden">
        <button
          onClick={handleGPS}
          className="bg-white border border-gray-200 shadow-md rounded-lg px-3 py-2 text-sm font-medium"
        >
          📍 My location
        </button>
        {gpsError && (
          <div className="bg-red-50 border border-red-200 text-red-700 text-xs rounded-lg px-3 py-1.5 max-w-48">
            {gpsError}
          </div>
        )}
      </div>

      {/* Depth readout — top left on desktop, bottom centre on mobile */}
      <div className="absolute top-4 left-4 md:top-4 md:left-4 z-[1000] bg-white border border-gray-200 shadow-lg rounded-xl px-4 py-3 min-w-44">
        {depth.status === "idle" && (
          <p className="text-xs text-gray-400">Tap map to read depth</p>
        )}
        {depth.status === "loading" && (
          <p className="text-xs text-gray-500">Reading…</p>
        )}
        {depth.status === "nodata" && (
          <p className="text-xs text-gray-500">No data within 150 m.</p>
        )}
        {depth.status === "done" && (
          <>
            <p className="text-[10px] text-gray-400 font-mono mb-1">
              {depth.lat.toFixed(4)}, {depth.lon.toFixed(4)}
            </p>
            <p className={`text-2xl font-bold tabular-nums leading-none ${depth.reading.dh_m < 0 ? "text-blue-600" : "text-orange-600"}`}>
              {depth.reading.dh_m > 0 ? "+" : ""}{depth.reading.dh_m.toFixed(1)}{" "}
              <span className="text-sm font-normal text-gray-500">m</span>
            </p>
            {depth.reading.uncertainty_m !== null && (
              <p className="text-[10px] text-gray-400">
                ± {depth.reading.uncertainty_m.toFixed(1)} m
              </p>
            )}
            <p className="text-xs font-medium mt-1 text-gray-500">
              {depth.reading.dh_m < 0 ? "scour (erosion)" : "deposition"}
            </p>
          </>
        )}
      </div>

      {/* Legend */}
      <div className="absolute bottom-4 right-4 z-[1000] bg-white border border-gray-200 shadow rounded-lg px-3 py-2 text-xs">
        <p className="font-medium mb-1.5 text-gray-600">Terrain change</p>
        <div className="flex items-stretch gap-2">
          <div
            className="w-3 rounded-sm"
            style={{
              background: "linear-gradient(to bottom, #cc0000, #ff8800, #ffdd00, #55aaff, #0044dd)",
              minHeight: 80,
            }}
          />
          <div className="flex flex-col justify-between text-gray-500" style={{ minHeight: 80 }}>
            <span>+10 m</span>
            <span>0</span>
            <span>−10 m</span>
          </div>
        </div>
        <p className="mt-1.5 text-gray-400">deposition ↑ / scour ↓</p>
      </div>
    </div>
  );
}
