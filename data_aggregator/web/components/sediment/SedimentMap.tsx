"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import * as maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import { queryDepthAtCoordinate, type SedimentReading } from "@/lib/sediment-query";

// Full flood corridor nav bounds
const CORRIDOR_BOUNDS: [number, number, number, number] = [
  84.8, 27.5, 86.2, 28.6,
];

const INITIAL_CENTER: [number, number] = [85.35, 28.18];
const INITIAL_ZOOM = 12;

type DepthState =
  | { status: "idle" }
  | { status: "loading" }
  | { status: "nodata" }
  | { status: "done"; lat: number; lon: number; reading: SedimentReading };


export function SedimentMap() {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<maplibregl.Map | null>(null);
  const markerRef = useRef<maplibregl.Marker | null>(null);
  const [depth, setDepth] = useState<DepthState>({ status: "idle" });
  const [gpsError, setGpsError] = useState<string | null>(null);
  const [coordInput, setCoordInput] = useState("");
  const [coordError, setCoordError] = useState<string | null>(null);

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
      markerRef.current = new maplibregl.Marker({ color: "#ef4444" })
        .setLngLat([lon, lat])
        .addTo(map);
      probe(lat, lon);
    },
    [probe]
  );

  useEffect(() => {
    if (!containerRef.current) return;

    const map = new maplibregl.Map({
      container: containerRef.current,
      style: {
        version: 8,
        sources: {
          topo: {
            type: "raster",
            tiles: ["https://tile.opentopomap.org/{z}/{x}/{y}.png"],
            tileSize: 256,
            attribution: "© OpenTopoMap contributors, © OpenStreetMap contributors",
          },
        },
        layers: [{ id: "topo", type: "raster", source: "topo", paint: { "raster-saturation": -1 } }],
      },
      center: INITIAL_CENTER,
      zoom: INITIAL_ZOOM,
      maxBounds: [
        [CORRIDOR_BOUNDS[0] - 0.5, CORRIDOR_BOUNDS[1] - 0.5],
        [CORRIDOR_BOUNDS[2] + 0.5, CORRIDOR_BOUNDS[3] + 0.5],
      ],
    });

    map.addControl(new maplibregl.NavigationControl(), "top-left");

    map.on("load", () => {
      const tileUrl = process.env.NEXT_PUBLIC_SEDIMENT_TILES_URL;

      if (tileUrl) {
        // Production: XYZ tiles from Supabase Storage
        map.addSource("sediment", {
          type: "raster",
          tiles: [`${tileUrl}/{z}/{x}/{y}.png`],
          tileSize: 256,
          attribution: "GeoPera / WorldView-3, CC BY-NC",
        });
        map.addLayer({
          id: "sediment-layer",
          type: "raster",
          source: "sediment",
          paint: { "raster-opacity": 0.85 },
        });
      } else {
        // Local dev: load stereo_dh.json as GeoJSON circles coloured by dh_m
        fetch("/stereo_dh.json")
          .then((r) => r.json())
          .then((pts: [number, number, number, number | null][]) => {
            map.addSource("sediment-pts", {
              type: "geojson",
              data: {
                type: "FeatureCollection",
                features: pts.map(([lon, lat, dh]) => ({
                  type: "Feature",
                  geometry: { type: "Point", coordinates: [lon, lat] },
                  properties: { dh },
                })),
              },
            });

            map.addLayer({
              id: "sediment-layer",
              type: "circle",
              source: "sediment-pts",
              paint: {
                "circle-radius": [
                  "interpolate", ["linear"], ["zoom"],
                  10, 3,
                  13, 6,
                  15, 10,
                ] as maplibregl.ExpressionSpecification,
                "circle-color": [
                  "interpolate", ["linear"], ["get", "dh"],
                  -25, "#0000ff",
                  -10, "#6699ff",
                  -2,  "#cce0ff",
                   2,  "#ffddcc",
                  10,  "#ff6600",
                  25,  "#cc0000",
                ] as maplibregl.ExpressionSpecification,
                "circle-opacity": 0.85,
                "circle-stroke-width": 0,
              },
            });

            // Zoom to fit the data
            map.fitBounds(
              [85.2788, 28.1108, 85.4226, 28.3178],
              { padding: 40, maxZoom: 13 }
            );
          })
          .catch((e) => console.error("sediment load error", e));
      }
    });

    map.on("click", (e) => {
      placeMarker(e.lngLat.lat, e.lngLat.lng);
    });

    mapRef.current = map;
    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, [placeMarker]);

  function handleCoordSubmit(e: React.FormEvent) {
    e.preventDefault();
    setCoordError(null);
    const parts = coordInput.split(/[\s,]+/).filter(Boolean);
    if (parts.length !== 2) {
      setCoordError("Enter as: lat, lon");
      return;
    }
    const lat = parseFloat(parts[0]);
    const lon = parseFloat(parts[1]);
    if (isNaN(lat) || isNaN(lon)) {
      setCoordError("Invalid numbers");
      return;
    }
    mapRef.current?.flyTo({ center: [lon, lat], zoom: 14 });
    placeMarker(lat, lon);
  }

  function handleGPS() {
    setGpsError(null);
    if (!navigator.geolocation) {
      setGpsError("Geolocation not available in this browser.");
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        mapRef.current?.flyTo({ center: [longitude, latitude], zoom: 15 });
        placeMarker(latitude, longitude);
      },
      () => setGpsError("Could not get your location. Check browser permissions.")
    );
  }

  return (
    <div className="relative w-full h-full">
      <div ref={containerRef} className="w-full h-full" />

      {/* Controls panel */}
      <div className="absolute top-4 right-4 z-10 flex flex-col gap-2 items-end">
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
          aria-label="Use my location"
        >
          My location
        </button>

        {gpsError && (
          <div className="bg-red-50 border border-red-200 text-red-700 text-xs rounded-lg px-3 py-1.5 max-w-48">
            {gpsError}
          </div>
        )}
      </div>

      {/* Depth readout */}
      {depth.status !== "idle" && (
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-10 bg-white border border-gray-200 shadow-lg rounded-xl px-6 py-4 text-center min-w-52">
          {depth.status === "loading" && (
            <p className="text-sm text-gray-500">Reading elevation data…</p>
          )}
          {depth.status === "nodata" && (
            <p className="text-sm text-gray-500">
              No data within 150 m of this point.
            </p>
          )}
          {depth.status === "done" && (
            <>
              <p className="text-xs text-gray-400 mb-2 font-mono">
                {depth.lat.toFixed(5)}, {depth.lon.toFixed(5)}
              </p>
              <p className="text-3xl font-bold tabular-nums">
                {Math.abs(depth.reading.dh_m).toFixed(1)}{" "}
                <span className="text-lg font-normal text-gray-500">m</span>
              </p>
              {depth.reading.uncertainty_m !== null && (
                <p className="text-xs text-gray-400 tabular-nums">
                  ± {depth.reading.uncertainty_m.toFixed(1)} m uncertainty
                </p>
              )}
              <p className="text-sm mt-1 font-medium">
                {depth.reading.dh_m < 0 ? (
                  <span className="text-blue-600">riverbed scour</span>
                ) : (
                  <span className="text-orange-600">sediment deposition</span>
                )}
              </p>
              <p className="text-xs text-gray-400 mt-2">
                Source: GeoPera / WorldView-3
              </p>
            </>
          )}
        </div>
      )}

      {/* Legend */}
      <div className="absolute bottom-6 right-4 z-10 bg-white border border-gray-200 shadow rounded-lg px-3 py-2 text-xs">
        <p className="font-medium mb-1.5 text-gray-600">Elevation change</p>
        <div className="flex items-stretch gap-2">
          <div
            className="w-3 rounded-sm"
            style={{
              background: "linear-gradient(to bottom, #ff0000, #ff8080, #ffffff, #8080ff, #0000ff)",
              minHeight: 80,
            }}
          />
          <div className="flex flex-col justify-between text-gray-500" style={{ minHeight: 80 }}>
            <span>+50 m</span>
            <span>0</span>
            <span>−50 m</span>
          </div>
        </div>
        <p className="mt-1.5 text-gray-400">deposition ↑ / scour ↓</p>
      </div>
    </div>
  );
}
