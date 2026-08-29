# Public imagery catalogue report

Generated: 2026-08-29T18:59:04.925Z

## Summary

- Scenes: 37
- Providers: VANTOR_OPEN 13, PLANET_SOURCE_COOP 24
- Public products with rigorous camera model assets: 0
- Same-epoch overlapping AOI pair records: 244
- Public-parallax-only pairs: 232

## Sentinel-2 temporal context

The official Copernicus Data Space OData catalogue adds 61 L2A products with
exact UNOSAT overlap from 1 July through 29 August 2026: 57 before the post-event
cutoff and 4 after it. Only two have scene cloud cover below 20%; all four
post-cutoff products have high scene-wide cloud cover. They are retained for
cloud screening, flood extent, and temporal context and explicitly rejected for
precision DSM generation because of 10 m GSD and weak multi-angle geometry.
See `sentinel2-context.json` and `SENTINEL2.md`.

The public Vantor and Planet disaster products are orthorectified. Their view metadata can rank correspondence/parallax experiments, but no pair is promoted to rigorous DSM reconstruction unless both original camera models become available.

## Named candidate combinations

| AOI | Left | Right | Common AOI | Approx. ray separation | Verdict |
|---|---|---|---:|---:|---|
| timure-pilot-v1 | B040001100881710 | 20260827_020055_ssc1_u0001 | 100.0% | 55.36 | PUBLIC_PARALLAX_ONLY |
| syabrubesi-pilot-v1 | B040001100881610 | B040001100881710 | 100.0% | 35.64 | PUBLIC_PARALLAX_ONLY |
| timure-pilot-v1 | B040001100881610 | B040001100881710 | 100.0% | 35.64 | PUBLIC_PARALLAX_ONLY |
| syabrubesi-pilot-v1 | B040001100881710 | 20260827_060959_65_3009 | 100.0% | 25.21 | PUBLIC_PARALLAX_ONLY |
| timure-pilot-v1 | B040001100881610 | 20260827_020055_ssc1_u0001 | 100.0% | 20.14 | PUBLIC_PARALLAX_ONLY |
| rasuwagadhi-pilot-v1 | B040001100881610 | 20260827_020055_ssc1_u0001 | 100.0% | 20.14 | PUBLIC_PARALLAX_ONLY |
| syabrubesi-pilot-v1 | B040001100881610 | 20260827_060959_65_3009 | 100.0% | 11.57 | PUBLIC_PARALLAX_ONLY |
| syabrubesi-pilot-v1 | B040001100881710 | 20260827_020055_ssc1_u0001 | 35.1% | 55.36 | PUBLIC_PARALLAX_ONLY |
| syabrubesi-pilot-v1 | 20260827_020055_ssc1_u0001 | 20260827_060959_65_3009 | 35.1% | 30.25 | PUBLIC_PARALLAX_ONLY |
| syabrubesi-pilot-v1 | B040001100881610 | 20260827_020055_ssc1_u0001 | 35.1% | 20.14 | PUBLIC_PARALLAX_ONLY |

## Important interpretation

- Coverage is calculated against explicit 1 km AOI polygons, not the older Rasuwagadhi point flag.
- Approximate ray separation uses published off-nadir and azimuth metadata, not RPC ray casting.
- PUBLIC_PARALLAX_ONLY means imagery may support correspondence and relative residual-parallax experiments but not defensible absolute elevation.
- Scene-wide cloud cover is retained but must later be recomputed locally using usability masks.
