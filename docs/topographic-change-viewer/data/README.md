# Generated viewer data

`surface-grid.json` is generated from the validated raster bundle with:

```bash
python/export_viewer.py --products <product-directory> --output viewer/public/data/surface-grid.json
```

The generated file is published only after raster-grid and uncertainty validation passes.
