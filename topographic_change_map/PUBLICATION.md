# Viewer publication

## Live development build

The committed static viewer is directly accessible at:

<https://raw.githack.com/Nalin-Atmakur/nepal_flood/main/docs/topographic-change-viewer/>

Add `?grid=10m` to open the experimental 10 m layer directly:

<https://raw.githack.com/Nalin-Atmakur/nepal_flood/main/docs/topographic-change-viewer/?grid=10m>

This URL serves the files committed on `main` through the third-party
RawGitHack development CDN. It is suitable for review, not an operational SLA.
The viewer and both JSON grids have been independently fetched with HTTP 200,
and both the 32 m and 10 m WebGL modes pass the automated browser smoke test.

## GitHub Pages

The workflow `.github/workflows/topographic-change-viewer.yml` builds the same
viewer and always retains a downloadable `topographic-change-viewer` artifact.
The workflow is green even while Pages is disabled. Its Pages deployment job is
conditionally skipped until a repository administrator selects **Settings →
Pages → Source: GitHub Actions**; the next run then deploys automatically. No
code or data change is needed.

The `docs/` bundle is also compatible with **Deploy from a branch → main →
/docs** if that publication mode is preferred.

## Local reproducible build

```bash
cd topographic_change_map
npm ci
npm run viewer:build
npm run viewer:test
npx vite preview --config vite.config.ts --host 127.0.0.1 --port 4174
```

Raw source imagery and credentials are never included in the publication.
