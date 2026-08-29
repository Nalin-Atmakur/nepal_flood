# Rejected second-pair diagnostic

Pair `B030001100CF1310 + B110001101165110` produced internally consistent
rasters and 3.069 km² of direct support, but its stable-terrain NMAD was
6.289 m. That exceeds the predeclared 6.0 m ceiling, and median per-cell
uncertainty was 9.906 m.

`promotion.json` is therefore authoritative: `promotedToMosaic=false` and
`accuracyClass=FAILED`. Its rasters are deliberately not published or included
in the viewer. The summary, invariant validation, and failed gate are retained
so the rejection is reproducible and thresholds are not silently moved after
seeing the result.
