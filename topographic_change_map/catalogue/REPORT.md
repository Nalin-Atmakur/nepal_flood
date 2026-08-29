# Public imagery catalogue report

Generated: 2026-08-29T18:59:04.925Z

## Summary

- Scenes: 37
- Providers: VANTOR_OPEN 13, PLANET_SOURCE_COOP 24
- Public products with rigorous camera model assets: 0
- Same-epoch overlapping AOI pair records: 244
- Public-parallax-only pairs: 232

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
