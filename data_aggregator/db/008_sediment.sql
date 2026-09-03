-- Migration 008: sediment measurement points
-- Run in Supabase SQL editor before running scripts/insert_points.py

-- Enable PostGIS if not already enabled
CREATE EXTENSION IF NOT EXISTS postgis;

-- ── Table ─────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS sediment_points (
    id            BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    lon           DOUBLE PRECISION NOT NULL,
    lat           DOUBLE PRECISION NOT NULL,
    dh_m          REAL             NOT NULL,   -- elevation change in metres (+deposition, -scour)
    reliability   SMALLINT,                    -- GeoPera reliability score
    uncertainty_m REAL,                        -- 1-sigma uncertainty in metres
    geom          GEOMETRY(Point, 4326) GENERATED ALWAYS AS (
                      ST_SetSRID(ST_MakePoint(lon, lat), 4326)
                  ) STORED
);

-- Spatial index for nearest-neighbour queries
CREATE INDEX IF NOT EXISTS sediment_points_geom_idx
    ON sediment_points USING GIST (geom);

-- Prevent duplicate points (same coordinate from overlapping rasters)
CREATE UNIQUE INDEX IF NOT EXISTS sediment_points_lonlat_idx
    ON sediment_points (
        ROUND(lon::numeric, 5),
        ROUND(lat::numeric, 5)
    );

-- ── RPC function ──────────────────────────────────────────────────────────────
-- Returns the nearest sediment measurement within max_dist_m metres.
CREATE OR REPLACE FUNCTION get_sediment_depth(
    p_lat      DOUBLE PRECISION,
    p_lon      DOUBLE PRECISION,
    max_dist_m DOUBLE PRECISION DEFAULT 150
)
RETURNS TABLE (dh_m REAL, uncertainty_m REAL, reliability SMALLINT, distance_m DOUBLE PRECISION)
LANGUAGE sql STABLE SECURITY DEFINER
AS $$
    SELECT
        s.dh_m,
        s.uncertainty_m,
        s.reliability,
        ST_Distance(
            s.geom::geography,
            ST_SetSRID(ST_MakePoint(p_lon, p_lat), 4326)::geography
        ) AS distance_m
    FROM sediment_points s
    WHERE ST_DWithin(
        s.geom::geography,
        ST_SetSRID(ST_MakePoint(p_lon, p_lat), 4326)::geography,
        max_dist_m
    )
    ORDER BY s.geom <-> ST_SetSRID(ST_MakePoint(p_lon, p_lat), 4326)
    LIMIT 1;
$$;

-- ── RLS ───────────────────────────────────────────────────────────────────────
ALTER TABLE sediment_points ENABLE ROW LEVEL SECURITY;

-- Public read-only access
CREATE POLICY "public read sediment_points"
    ON sediment_points FOR SELECT
    USING (true);
