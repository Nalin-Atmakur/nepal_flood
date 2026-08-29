# Processing area and scale contract

This project uses several different spatial scales. They must not be described
interchangeably.

| Scale | Current role |
|---|---|
| approximately 0.3–0.4 m | Native public WorldView image ground-sample distance |
| 1 m | Common orthoimage co-registration grid |
| 64–96 m | Local image neighbourhood used for phase correlation |
| 32 m | Default validated change-product cell spacing |
| 10 m | Separately validated experimental output spacing; research-only |
| 1 km | Geographic reporting/indexing bin only |

Native image resolution is not change-map resolution. A 0.4 m image contains
fine visual detail, but a defensible height displacement requires a textured
neighbourhood, calibration, filtering, and uncertainty propagation. The current
public orthorectified products do not support independent 0.4 m height estimates.

## How processing coverage is selected

The four versioned 1 km polygons around Syabrubesi, Timure, Rasuwagadhi, and
Bidur are manual discovery/feasibility fixtures. The first Syabrubesi square was
chosen around a known affected settlement to prove the pipeline on a bounded
area. These polygons do not define the production map.

Production candidates are derived automatically as:

```text
authoritative affected polygon
  intersect common footprint of both acquisitions
  intersect locally usable/cloud-free imagery
  plus stable-terrain calibration buffer
```

Candidates are scheduled using affected coverage, stereo geometry, matchable
terrain, exposed buildings/infrastructure, and compute cost. Mountains are not
processed first by policy; the present area is mountainous because the affected
Bhote Koshi corridor itself is Himalayan.

After matching, every supported measurement is assigned to a standard UTM Zone
45N 1,000 m square using the integer kilometre of its easting and northing. A
reporting square is listed if it contains at least one supported measurement.
The reporting grid therefore summarizes where measurements occurred; it does
not control imagery downloads, matching, or raster resolution.

## Current default product

The strict product contains 1,252 supported 32 m cells covering 1.282 km².
Those cells happen to occupy 22 one-kilometre reporting bins within the upper
Bhote Koshi processing rectangle. The relaxed product occupies 24 bins. Neither
number means that an entire 22 or 24 km² was directly measured.

The experimental product contains 6,882 supported 10 m cells covering
0.688 km² across 23 reporting bins. Its stable-terrain error remains roughly
4 m, so the smaller horizontal cells must not be described as more accurate
vertical measurements.
