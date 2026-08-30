# 06 — ⑥ findings (`processing/findings.py`)

Data-quality findings for the people who hold the lists. The `findings` table is private (never
read by the site); each row is `{kind, detail jsonb, created_at, handed_to, handed_at}`. Findings
of a kind are deleted and re-inserted every run unless `handed_at` is set.

```
   latest OPMCM projection ──▶ name_collision        DAO Sindhupalchok rows whose location resolves to
   (ctx.cache / raw_pulls)                            bhotekoshi_rm_sindhupalchok or says Bhotekoshi/भोटेकोशी
                                                      detail: dao_sindhupalchok_rows, bhotekoshi_rm_rows,
                                                      share_of_all_listed, sample_locations (texts only), note
   entities ────────────────▶ duplicate_across_lists entities whose merged_from spans ≥ 2 sources
                                                      detail: entities, by_source_pair {"form+opmcm": n, …}, entity_ids (≤ 200)
   OPMCM ⋈ NDRRMA ──────────▶ lost_but_rescued       OPMCM 'lost' rows whose person_key is on the NDRRMA rescued list
                                                      detail: count, opmcm_ids (≤ 300), note
   raw_pulls setu_recordlist ▶ absent_from_setu      only when a Setu pull exists (wave 2): placeholder detail
   v_sources_status ────────▶ stale_source           last fetch older than 3 × max(cadence, PULL_INTERVAL_MINUTES)
                                                      or last_ok = false; detail: sources[{source, minutes_since_fetch, last_ok}]
```

The `name_collision` check is the one the catalogue flagged: a 100-row OPMCM sample was 62 %
"DAO Sindhupalchok" with addresses in *Bhotekoshi Rural Municipality* wards 2–5 — either a
collision with the *Bhote Koshi river* (Rasuwa) or genuinely displaced Kerung-route workers.
Until a list-holder answers, ③ counts those rows at `bhotekoshi_rm_sindhupalchok`, not in the
corridor.

## Inputs → tables → outputs

| inputs | writes | log |
|---|---|---|
| OPMCM + NDRRMA projections (`raw_pulls`), `entities`, `v_sources_status`, `raw_pulls` (Setu) | `findings` | `findings.done` (kinds) |

## Failure behaviour

One try/except (`findings.failed`). Details never contain names: OPMCM ids, entity ids,
location strings and counts only.
