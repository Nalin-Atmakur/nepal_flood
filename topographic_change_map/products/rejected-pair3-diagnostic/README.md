# Rejected third-pair diagnostic

Pair `B040001100881410 + B040001100882F10` produced internally consistent
rasters and 7.893 km² of direct support, but stable-terrain NMAD was 6.613 m
and median per-cell uncertainty was 9.784 m. It therefore fails the predeclared
6.0 m promotion ceiling.

`promotion.json` is authoritative: `promotedToMosaic=false` and
`accuracyClass=FAILED`. Its rasters are deliberately not published or included
in the viewer. Diagnostic JSON is retained to make the rejection reproducible.
