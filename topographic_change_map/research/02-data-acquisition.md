# Data acquisition and access automation

## Objective

Automate catalogue discovery, metadata normalization, entitlement checks, selective download, and provenance tracking across imagery providers.

Do not make automated account creation the center of the system. Account creation may require CAPTCHA, MFA, licence acceptance, payment, organization verification, or humanitarian-access approval. Those actions require human review and may create legal obligations.

## Human and automated responsibilities

Human-controlled:

- create provider accounts;
- accept licences and terms;
- complete MFA;
- request humanitarian, research, or commercial access;
- approve purchases or binding agreements;
- provide secrets through a secure local mechanism.

Automated:

- search catalogues by AOI and date;
- retrieve scene and asset metadata;
- identify Basic/non-orthorectified products;
- detect RPC or other camera models;
- calculate footprint overlap;
- detect account entitlement;
- record licence metadata;
- download thumbnails or small crops;
- download full imagery only after the pair passes cheap gates;
- checksum and inventory downloaded assets.

## Provider adapters

Initial adapters:

```text
Planet
Vantor / Maxar Open Data
Airbus catalogue
Copernicus Data Space
International Charter public inventory
```

Each adapter should implement a common interface:

```text
search(aoi, start_time, end_time, filters)
describe_scene(scene_id)
list_products(scene_id)
check_access(product_id)
list_assets(product_id)
download_asset(asset_id, destination)
```

## Normalized candidate manifest

Every candidate scene should be translated into one internal schema:

```yaml
provider: planet
scene_id: 20260827_020055_ssc1_u0001
sensor: SkySat
capture_time: 2026-08-27T02:00:55Z
product_type: basic
orthorectified: false
camera_model_type: rpc
gsd_m: 0.81
cloud_fraction: 0.50
aoi_id: syabrubesi-pilot-v1
aoi_overlap_fraction: null
access_status: unknown
licence_id: null
assets: []
provenance:
  queried_at: null
  endpoint: null
```

The manifest must distinguish unknown, false, and unavailable values.

## Acquisition state machine

```text
DISCOVERED
  -> METADATA_CHECKED
  -> REJECTED_METADATA
     or AUTH_REQUIRED
     or ENTITLEMENT_REQUIRED
     or ACCESSIBLE
  -> GEOMETRY_PASSED
  -> PILOT_ASSETS_DOWNLOADED
  -> PILOT_PASSED
  -> FULL_ASSETS_DOWNLOADED
```

## Download policy

1. Query metadata first.
2. Download RPC/camera files and thumbnails next.
3. Download a small common crop if the API supports it.
4. Run geometry and sparse matching tests.
5. Download full products only after a candidate pair passes.

This minimizes bandwidth, storage, and licence exposure.

## Secret handling

- Read tokens from environment variables or a secret manager.
- Never log authorization headers or URLs containing credentials.
- Redact secrets from exceptions and HTTP traces.
- Do not write secrets to manifests, notebooks, shell history, or Git.
- Record only that authentication succeeded or failed.

## Immediate Planet query

When `PL_API_KEY` becomes available, query the two exact candidate IDs and record:

- product existence;
- footprint and Syabrubesi AOI overlap;
- available asset/product types;
- whether a Basic/non-orthorectified product exists;
- whether RPCs are embedded or supplied separately;
- activation and download permissions;
- licence restrictions;
- image band and resolution details.
