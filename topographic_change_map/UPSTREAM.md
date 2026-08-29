# Upstream reconstruction audit

## Source

- Repository: <https://github.com/geo-pera/bhotekoshi-2026-reconstruction>
- Audited commit: `43c22e0f9a3777d071c2f181302ca2daad384a53`
- Code licence: MIT
- Derived imagery products: CC BY-NC 4.0

## Reused scientific idea

The strong public Vantor pair is `B040001100881410` plus `B040001100881710`, approximately 48 degrees apart. Both public products were orthorectified against pre-event terrain. Where the post-event surface differs from that reference, the two opposite looks retain a displacement approximately proportional to:

```text
dh * (tan(off_nadir_A) + tan(off_nadir_B))
```

The displacement is projected along the look axis, and a spatial bias surface is fitted using stable terrain away from the river corridor.

## Reproducibility finding

The upstream repository commits derived dense tie-point CSVs and vector layers, but intentionally omits the `tie_points.py` dense phase-correlation engine. This project therefore does not simply accept the published measurements. It implements an independent, tested engine in `python/tie_points.py` and reruns the method from the public source COGs.

Upstream data and results are used as comparison evidence and are always attributed to the pinned commit above.
