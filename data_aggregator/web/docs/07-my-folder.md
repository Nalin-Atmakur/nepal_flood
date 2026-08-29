# 07 · My folder — /me

"this device · no account". Everything the visitor added from this browser, with what happened to it.

```
  /[lang]/me  ── app/[lang]/me/page.tsx (server: loads `places` for name joins) ──▶ <MyFolder> (client)
                                                                                      │
       ensureSession() ──▶ user id ──▶ getOwnReports()  reports_archive (RLS: own rows, newest first)
                                    └▶ getOwnUser()     users.contact (prefills "Keep this folder")
                                                                                      │
       item card ×n  ─ ItemBadge #  · type · place · submitted ─ summary_public | received placeholder
                     ─ trail  Received → Anonymised → Processed → Matched to X | Not yet matched | … → Withdrawn
                     ─ Add more detail · Correct this  (→ /report?supersedes=…&mode=…)   · Withdraw
       aside         ─ Add another report · Keep this folder (users.contact) · PRIVACY
```

## 1. The status trail (`components/me/MyFolder.tsx` → `deriveTrail`)

| Pill | Done when |
|---|---|
| Received | always |
| Anonymised | `anonymised_at` set, or `status ∈ anonymised, processed, matched` |
| Processed | `status ∈ processed, matched` |
| Matched to X (amber) | `status = matched` and `place_id` set (X = localised place name) |
| Not yet matched (grey) | otherwise |
| Withdrawn | `withdrawn_at` set or `status = withdrawn` — replaces the tail; card dims; action buttons hide |

`status = spam` is shown like `received` (the visitor is never told a row was flagged).

## 2. Actions

1. **Add more detail** → `/report?type=<type>&supersedes=<id>&mode=add[&place=<place_id>]` — the box opens prefilled "Also: ".
2. **Correct this** → same with `mode=correct` — prefilled "Correction: ".
3. **Withdraw** → `window.confirm(me.withdraw_confirm)` → `withdrawReport(sb, id)` = `update reports_archive set withdrawn_at = now()`
   for the own row. The DB trigger (`db/migrations/004_rls.sql`) rejects any other change and sets `status = 'withdrawn'`.
   The row stays in the folder, marked withdrawn; the pipeline drops it from the counts on its next run.
4. **Keep this folder** → `saveContact(sb, userId, contact)` = `update users set contact` (empty clears). Never displayed anywhere else.

## 3. What is never shown

The raw `text` of a report is not rendered on /me (only `summary_public`, the PII-free line written by `process_data`,
or the "Received —" placeholder). Contacts are not rendered. Nothing on this page is ever visible to another user
because the reads run under the visitor's own anonymous session.

## 4. States

| State | UI |
|---|---|
| Supabase unconfigured / anonymous sign-in disabled | `EmptyState` "Your folder is not available right now." |
| loading | "Opening your folder…" (role=status) |
| no rows | dashed "Nothing in this folder yet." + "Add what you know — it takes five minutes." |
| withdraw failed | inline alert `me.withdraw_failed` |
| save failed | inline alert `me.save_failed` |
