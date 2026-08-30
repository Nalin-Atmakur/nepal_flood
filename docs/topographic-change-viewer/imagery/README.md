# Viewer parallax-image previews

`view-a.jpg` and `view-b.jpg` are 2 m RGB web previews exported from the public
Vantor WorldView-3 orthorectified COGs:

- `B040001100881410`, acquired 2026-08-27 05:04:50 UTC;
- `B040001100881710`, acquired 2026-08-27 05:06:11 UTC.

Both previews use the same EPSG:32645 extent and pixel grid. A viewer click can
therefore draw the identical UTM coordinate at the centre of both crops. These
are two post-event opposite-look acquisitions, not pre/post photographs. The
actual matching pipeline uses the co-registered 1 m analysis rasters; previews
are downsampled only for web delivery.

Source copyright: Vantor Inc. 2026, distributed through the Vantor Open Data
Nepal Flooding August 2026 event under the
[Creative Commons Attribution–NonCommercial 4.0 licence](https://creativecommons.org/licenses/by-nc/4.0/).
These previews are adapted by reprojection and downsampling. Source COGs are not
committed here.

`checksums.sha256` pins the exact published preview bytes.
