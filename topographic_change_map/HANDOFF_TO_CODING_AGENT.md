# Comprehensive handoff prompt for a new coding agent

> This file is itself a prompt. Give it to a coding agent that has a fresh clone
> of the repository and is currently located at the repository root.

---

You are taking over the Nepal 2026 Flood Topographic Change Map project. Treat
this as a scientific software and data-acquisition handoff, not merely a web
application handoff.

Your first task is to ingest and verify the project context, explain the project
back to the user in plain language, identify the best next steps, and ask the
questions needed to choose the next milestone. Do not begin a major rewrite or
claim that the final change map already exists.

## 1. Starting assumptions

- You are at the root of a freshly cloned `nepal_flood` repository.
- The relevant project directory is `topographic_change_map/`.
- Other root-level projects, particularly `data_aggregator/`, are separate and
  must not be modified unless the user explicitly places them in scope.
- The repository may have advanced since this handoff was written. Current
  committed files, tests, manifests, and Git history override stale numbers in
  this prompt.
- A fresh clone will not contain private imagery, ignored environment files,
  browser sessions, credentials, or large processing intermediates.
- Never request that passwords, API keys, phone numbers, MFA codes, cookies, or
  client secrets be pasted into chat. Use ignored local environment files or an
  approved secret store.

## 2. Mission in one sentence

Build a scientifically defensible map of flood-related surface-elevation change
over the affected Bhote Koshi / Trishuli corridor in Nepal by reconstructing
compatible pre-event and post-event elevation surfaces, aligning them on stable
terrain, calculating `post elevation - pre elevation`, propagating uncertainty,
and retaining unsupported areas as nodata.

The longer-term humanitarian goal is to combine validated elevation change with
building footprints and damage classifications to investigate deposition,
erosion, debris accumulation, and possible building burial. A positive change
must not automatically be called debris depth or burial depth.

## 3. The most important scientific distinction

The repository currently contains a useful research product, but not yet a true
before/after topographic-change map.

The current coloured viewer layer is a:

> **relative post-event ortho-parallax height residual**

It was derived from two opposite-look post-flood WorldView orthorectified
images. It demonstrates terrain-dependent parallax and supports research and
visualisation. The public images do not expose their original RPCs or physical
camera models, and the orthorectification reference DEM is not fully known.
Therefore the current layer must not be described as:

- direct pre/post topographic change;
- a rigorous absolute-height DSM;
- deposition or erosion;
- debris depth;
- building burial depth; or
- operational rescue evidence.

A true change map requires, at minimum:

```text
camera-bearing pre-event stereo or a defensible pre-event elevation surface
                            +
camera-bearing post-event stereo or a defensible post-event elevation surface
                            +
compatible horizontal and vertical datums
                            +
stable-terrain co-registration and withheld validation
                            +
propagated reconstruction/alignment uncertainty
                            =
validated post-minus-pre surface-elevation change
```

Do not weaken this distinction because the existing 3D viewer looks convincing.

## 4. Mandatory ingestion protocol

Perform the following read-only checks before proposing implementation work.
Do not silently skip files. If a file is missing, record that fact and continue
with the closest committed source of truth.

### 4.1 Establish repository state

From the repository root, run:

```bash
pwd
git status --short
git branch --show-current
git log -8 --oneline --decorate
git remote -v
find .. -name AGENTS.md -print
```

Read any applicable `AGENTS.md` that governs `topographic_change_map/`. Do not
apply instructions from a sibling project's `AGENTS.md` to this project.

Preserve all unrelated working-tree changes. Never use `git add .`, `git add -A`,
`git reset --hard`, or broad cleanup commands in a shared or dirty worktree.

### 4.2 Read the durable project contract in this order

Read these files completely:

1. `topographic_change_map/README.md`
2. `topographic_change_map/PLAN.md`
3. `topographic_change_map/STATUS.md`
4. `topographic_change_map/DECISIONS.md`
5. `topographic_change_map/SCALES_AND_AOI.md`
6. `topographic_change_map/RUNBOOK.md`
7. `topographic_change_map/PUBLICATION.md`
8. `topographic_change_map/UPSTREAM.md`
9. `topographic_change_map/products/README.md`
10. `topographic_change_map/products/VALIDATION.md`

Pay special attention to the latest entries in `DECISIONS.md`. They are binding
unless the user explicitly changes the scientific scope.

### 4.3 Read the research package

Read `topographic_change_map/research/README.md`, then treat the remaining paths
in this subsection as relative to `topographic_change_map/`:

1. `topographic_change_map/research/README.md`
2. `research/00-goal-and-scope.md`
3. `research/01-current-status.md`
4. `research/02-data-acquisition.md`
5. `research/03-stereo-feasibility.md`
6. `research/04-dsm-generation.md`
7. `research/05-change-map.md`
8. `research/06-validation-and-confidence.md`
9. `research/07-buildings-and-viewer.md`
10. `research/08-automation-architecture.md`
11. `research/09-roadmap.md`
12. `research/10-open-questions.md`
13. `research/11-candidate-imagery-ranking.md`
14. `research/sources.md`

Then inspect the shareable source catalogue:

- `research/Nepal_Flood_Topographic_Data_Source_Catalogue.xlsx`
- `research/imagery-source-catalogue.csv`
- `research/source-catalogue-validation.json`

The spreadsheet is the team-facing decision catalogue. The CSV and
`topographic_change_map/python/source_catalogue_data.py` are easier for an agent
to query. At the time
of writing, the catalogue contains 64 routes across optical stereo, SAR/InSAR,
historical imagery, existing DEMs, commercial providers, research programmes,
and institution-gated disaster-response archives. Verify the current count.

### 4.4 Inspect machine-readable evidence

Read and summarize, rather than relying only on prose:

```text
topographic_change_map/catalogue/aois.geojson
topographic_change_map/catalogue/public-scenes.json
topographic_change_map/catalogue/public-pairs.json
topographic_change_map/catalogue/hma-dem-granules.json
topographic_change_map/catalogue/sentinel2-context.json
topographic_change_map/parallax/public-pilot-results.json
topographic_change_map/products/release-manifest.json
topographic_change_map/products/release-audit.json
topographic_change_map/products/cross-machine-comparison.json
topographic_change_map/products/viewer-evidence-validation.json
topographic_change_map/products/building-change-summary-strict.summary.json
topographic_change_map/products/building-change-summary-10m-experimental.summary.json
```

Use `jq`, a short read-only script, or the repository's existing tools to extract
the important fields. Do not edit generated JSON during onboarding.

### 4.5 Inspect the implementation entry points

Understand the code by reading at least:

```text
topographic_change_map/package.json
topographic_change_map/src/cli.ts
topographic_change_map/src/config.ts
topographic_change_map/src/state.ts
topographic_change_map/src/remote.ts
topographic_change_map/src/redaction.ts
topographic_change_map/python/prepare_ortho_pair.py
topographic_change_map/python/tie_points.py
topographic_change_map/python/ortho_change.py
topographic_change_map/python/quality_gate.py
topographic_change_map/python/validate_products.py
topographic_change_map/python/mosaic_products.py
topographic_change_map/python/download_hma.py
topographic_change_map/python/source_catalogue_data.py
topographic_change_map/viewer/index.html
topographic_change_map/scripts/viewer_smoke.ts
topographic_change_map/scripts/release_audit.ts
```

Also inspect the test names under:

```text
topographic_change_map/test/
topographic_change_map/test_python/
```

You do not need to read dependency directories such as `node_modules/`.

### 4.6 Run the non-mutating verification suite

From `topographic_change_map/`, install dependencies only if the environment
does not already have them. Then run the repository-supported checks:

```bash
npm ci
npm run check
npm test
npm run test:python
npm run viewer:build
npm run viewer:test
npm run audit:release
```

If the Python environment is absent, follow the committed documentation rather
than inventing a dependency set. For the source-catalogue workbook:

```bash
python -m venv .work/venv
.work/venv/bin/pip install -r requirements-spreadsheet.txt
.work/venv/bin/python python/build_source_spreadsheet.py
.work/venv/bin/pytest -q test_python/test_source_catalogue.py
```

Be aware that rebuilding generated files may modify timestamps or binary
workbook bytes. During onboarding, prefer reading the committed validation
report unless regeneration is necessary.

Report exact pass/fail counts and distinguish code failures from absent private
data, missing optional software, provider authentication, CAPTCHA, or network
gates.

## 5. What currently exists

Verify every number against the latest manifests, but expect to find:

- A versioned upper Bhote Koshi processing extent around Syabrubesi, Timure and
  Rasuwagadhi.
- WGS84 bounds close to `28.139691–28.283023°N` and
  `85.310212–85.393888°E`.
- A strongest public WorldView-3 opposite-look pair:
  `B040001100881410` and `B040001100881710`.
- Both views are post-event and approximately 82 seconds apart.
- A strict 32 m research layer with roughly 1,252 supported cells and 1.282 km²
  of directly supported area.
- An experimental 10 m research layer with roughly 6,882 supported cells and
  0.688 km² of directly supported area.
- Stable-terrain error on the order of 4 m and median uncertainty on the order
  of 6–7 m, preventing building-scale elevation claims.
- Two additional candidate pairs rejected by a fixed stable-error gate rather
  than merged opportunistically.
- Building overlays that explicitly distinguish measured, significant,
  non-significant and unsupported records.
- A Three.js/WebGL terrain viewer with synchronized OpenStreetMap context,
  settlement pins, clicked coordinates, uncertainty/support layers and
  same-coordinate imagery evidence.
- Two side-by-side imagery crops in the evidence panel. These are opposing
  post-event views, not before/after images.
- NASA Ames Stereo Pipeline installed and tested successfully against an
  official RPC-bearing ASTER fixture on the project sandbox, proving the
  software route works when real camera geometry is available.
- A reproducible source discovery, pair scoring, sparse matching, dense
  residual, quality-gating, viewer, and audit pipeline.
- A shareable, validated source/access spreadsheet containing authentication,
  entitlement, licence, payment, delivery and next-action fields without real
  credentials.

## 6. Spatial scales that must not be confused

Read `topographic_change_map/SCALES_AND_AOI.md` and preserve this distinction:

| Scale | Meaning |
|---|---|
| approximately 0.3–0.4 m | native WorldView image ground-sample distance |
| 1 m | common imagery co-registration grid |
| 2 m | viewer RGB previews only |
| 64–96 m | local matching neighbourhood |
| 32 m | default validated residual-product cell spacing |
| 10 m | experimental research-only output spacing |
| 1 km | reporting/indexing bin, not pixel or measurement resolution |

Sub-metre imagery does not imply sub-metre height accuracy. The 1 km squares do
not determine the matching resolution and do not mean an entire square has been
measured.

## 7. Current data and access assessment

The important routes are expected to be ranked roughly as follows, but use the
latest source catalogue for the authoritative order.

### 7.1 Original Vantor WorldView-3 pair

This is the best empirically evidenced post-event DSM request because the public
orthos already demonstrate overlap and matching. The missing pieces are the
original Basic/System-Ready images and their RPC/RPB/IMD/attitude/ephemeris
package. Access is commercial or partner-gated.

### 7.2 Airbus Pléiades Neo 3 plus Pléiades-1B

Potentially the best untested post-event route. Request exact Primary/DIMAP
packages, verify look convergence and clouds, and retain all camera metadata.
Access may be commercial or available through an authorised Charter partner.

### 7.3 Planet SkySat plus Pelican

The exact public orthos exist, and Planet documents Basic/RPC-bearing products.
The existing individual Planet account was verified but had no high-resolution
product entitlement. The public cross-sensor matching pilot was weak. Do not
assume entitlement or scientific success merely because the product family
supports RPCs.

### 7.4 International Charter and Sentinel Asia

These are strong access aggregators for the exact Nepal event but generally
require an authorised disaster-response organisation, national agency, project
manager, or member partner. Never claim institutional authority that the user
does not possess.

### 7.5 Pre-event elevation

This remains at least as important as post-event data. HMA 8 m granules are
pinned, but Earthdata activation previously stopped at reCAPTCHA. HMA can be an
improved sensitivity baseline; it is not automatically contemporaneous or
building-scale truth. Search recent pre-26-August-2026 camera-bearing stereo in
parallel. National survey, ICIMOD, drone, engineering or field control may be
more valuable than another global DEM.

### 7.6 SAR

SAR is not a magic before/after height solution. A single post-event image or an
HH/HV polarization pair is not an interferometric elevation pair. A useful SAR
experiment requires compatible complex SLC acquisitions, precise orbits,
baseline/coherence screening, and explicit layover/shadow masks. Strong routes
include exact Sentinel-1/NISAR/ALOS-2 pairing audits and a TanDEM-X CoSSC
bistatic proposal. Steep Himalayan terrain and flood decorrelation are serious
limitations.

## 8. Best next steps

After ingestion, verify and present a ranked recommendation. The likely order
is:

1. **Request the original WorldView-3 pair**
   `B040001100881410 + B040001100881710`, including every camera and product
   metadata file. This is the fastest route from demonstrated correspondence to
   rigorous post-event triangulation.
2. **Request the exact Airbus PNEO3 + PHR1B Primary/DIMAP packages** and calculate
   true ray convergence from delivered metadata before attempting dense stereo.
3. **Complete Earthdata activation and download the four pinned HMA 8 m
   granules**, then audit epoch, datum, voids and stable-terrain agreement.
4. **Search recent pre-flood stereo archives** with original camera models.
   Without a defensible pre-event surface, the final product remains post-event
   topography rather than temporal change.
5. **Ask Nepal DHM/NDRRMA/Department of Survey, ICIMOD, Charter and Sentinel Asia
   partners** for source imagery, national elevation, contours and independent
   control/check points.
6. **Run an exact SAR pair audit** across NISAR, Sentinel-1 and ALOS-2 using
   track/frame/mode/polarization/orbit/coherence criteria. Do not download large
   products until metadata passes.
7. **Submit a TanDEM-X CoSSC science proposal** if an eligible institutional PI
   is available. Single-pass bistatic geometry may be the strongest SAR height
   route.
8. **Test the confirmed 2014 Cartosat-1 Fore/Aft pair** as an explicitly old
   sensitivity baseline, never as a perfect August 2026 pre-event surface.
9. **When a camera-bearing post pair arrives**, run the verified NASA ASP path:
   camera validation → sparse geometry → bundle adjustment/mapprojection →
   dense stereo → `point2dem` → intersection-error/support layers → independent
   accuracy assessment.
10. **Only after compatible pre and post DSMs exist**, harmonize datums,
    co-register on stable terrain, validate on withheld checkpoints, compute
    `post - pre`, propagate uncertainty and publish significance/support masks.
11. **Validate debris and burial interpretation separately** with building/ground
    modelling and independent labelled evidence.

Do not spend the main effort polishing the viewer while the camera-bearing data
and pre-event baseline remain unresolved. The viewer is already functional; the
critical path is defensible elevation.

## 9. Questions you must ask the user after explaining the project

First provide your evidence-backed overview. Then ask a concise, prioritized
set of questions. Do not dump every possible question; ask the ones that change
the next milestone. Cover these decisions:

1. **Intended outcome:** Is the immediate deliverable a rigorous post-event DSM,
   a true pre/post change map, or a research demonstration using the current
   residual?
2. **Accuracy target:** Is broad corridor-scale change acceptable, or is the
   target metre-scale/per-building interpretation? What minimum detectable
   change is required?
3. **Geographic priority:** Should work remain on the upper Bhote Koshi corridor,
   or expand to another authoritative flood-affected polygon? Which settlements
   or infrastructure are operationally most important?
4. **Access authority:** Does the team have a university, NGO, Nepal government,
   Charter, Sentinel Asia, Copernicus or commercial partner who can legitimately
   request restricted source products?
5. **Budget:** Is the original free-data-only decision still binding, or may the
   team request quotes/purchase imagery? Never place an order without explicit
   approval.
6. **Accounts and blockers:** Can the user complete the Earthdata CAPTCHA/MFA
   handoff? Are any Planet, Airbus, Vantor, ESA, DLR or institutional accounts
   now entitled to relevant products?
7. **Independent validation:** Are survey points, engineering data, drone DEMs,
   national contours, field observations or known stable control sites
   available?
8. **Publication and licensing:** Is the next result internal research, public
   communication, or decision support? Who approves scientific wording and
   imagery-derived-product licensing?
9. **Compute and storage:** Is the documented sandbox still available, or must
   processing move to another machine/cloud environment?
10. **Time horizon and owner:** What is the next real deadline, and who can own
    provider/institutional outreach while engineering proceeds?

If the user has already answered one of these in the active conversation, do
not ask it again. State the answer you inferred and ask only what remains.

## 10. Required onboarding response

After completing the ingestion protocol, respond to the user with these
sections:

1. **Project in plain English** — two or three short paragraphs.
2. **What is working today** — viewer, current residual, coverage, evidence,
   automation, validation and source catalogue.
3. **What is not yet achieved** — absolute post DSM, compatible pre DSM, true
   change and validated debris/burial interpretation.
4. **How the system works** — source discovery → geometry/matching gate → DSM →
   alignment/differencing → uncertainty/support → buildings/viewer.
5. **Best next steps** — ranked by scientific value and dependency, separating
   work the agent can do immediately from external access handoffs.
6. **Verification state** — exact test/audit results you observed.
7. **Questions for the team** — the smallest useful set from Section 9.

Explicitly identify any discrepancy between this handoff and the current
repository. Cite local files with clickable paths when the agent interface
supports them.

## 11. Operating rules after onboarding

- Search before building and reuse the existing pipeline.
- Validate before publishing.
- Prefer metadata-first screening and small pilots before bulk downloads.
- Never convert approximate look metadata into absolute height without a camera
  model and validation.
- Never use a pre-event image and a post-event image as if they were a stereo
  pair; stereo reconstruction is normally performed within each epoch.
- Keep unsupported areas as nodata.
- Preserve provenance, acquisition time, sensor, product level, licence,
  camera-model source, datum and processing version.
- Every numerical change value must have uncertainty and support status.
- Use stable terrain for alignment and separate withheld stable terrain or
  independent checkpoints for validation.
- Do not tune thresholds after seeing a desired result. Record rejected pairs.
- Do not call correlation with another non-independent DEM “ground truth.”
- Do not infer building burial solely from damage class or positive surface
  change.
- Never automate CAPTCHA bypass. Pause for a legitimate user handoff.
- Never impersonate a government, university, NGO or authorised responder.
- Do not purchase products or start trials without explicit approval.
- Keep source imagery, credentials, browser profiles and bulk intermediates out
  of Git.
- Make path-scoped commits and preserve unrelated worktree changes.
- Update `STATUS.md`, manifests, tests and documentation when advancing a
  milestone.

## 12. Definition of genuine completion

The final scientific objective is complete only when the project can provide:

- a versioned affected-area AOI;
- documented pre-event and post-event elevation sources;
- original camera/phase/orbit provenance where reconstruction requires it;
- validated DSMs in compatible horizontal and vertical datums;
- stable-terrain alignment diagnostics;
- withheld or independent accuracy statistics;
- `post - pre` elevation change;
- reconstruction, alignment and propagated change uncertainty;
- significance, valid-support and nodata masks;
- licence-compatible derived products;
- reproducible commands and manifests;
- a viewer that accurately communicates provenance, uncertainty and gaps; and
- separately validated interpretation before any debris-depth or burial claim.

If these are externally blocked, the correct outcome is a precisely documented
research product and acquisition decision package—not a visually plausible but
scientifically misleading map.

## 13. Begin now

Run the ingestion protocol. Do not merely summarize this handoff file. Verify it
against the current repository, inspect the evidence, run the appropriate
checks, explain the project back to the user, rank the next steps, and ask the
focused questions that determine which path should be executed next.
