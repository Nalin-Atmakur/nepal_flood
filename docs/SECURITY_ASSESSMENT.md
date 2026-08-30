# Nepal 2026 flood-response application security and privacy assessment

**Assessment date:** 30 August 2026  
**Assessed revision:** `9763f5cb9766f1b539f081a5cd35ba6da930367f` on `main`  
**Assessment type:** Read-only source, design, migration, and safe local test review  
**Decision:** **NO-GO for public intake or influencer promotion**

## Executive conclusion

The current revision should not be promoted to affected families or linked from public outreach. The application contains three critical, release-blocking privacy failures:

1. Family-derived status and report data can be published at an exact place and time granularity, including singleton report buckets and counts of people expected, reached, and unknown.
2. The intake has no implemented consent record, named data controller, or named authorised operational receiver, despite interface copy implying a permission flag and an official handoff.
3. Withdrawal removes only part of a report's footprint. Public counts, latest place status, timeline rows, summaries, and uploaded files can persist after withdrawal.

These are not merely policy gaps. They are implemented data flows and were reproduced with safe synthetic checks. Removing names does not make the resulting combinations anonymous.

Eight high-risk findings compound the release blockers: raw reports are sent to OpenAI before redaction; redaction fails open when the model omits an identifier; intake and public activity metrics are client-rate-limited and poisonable; uploaded evidence is not quarantined or content-inspected; some external PII ingestion fails open; deterministic identifiers and browser fingerprints enable linking; anonymous sessions expose prior reports on shared devices; and the interface inaccurately says sensitive material is “stripped and encrypted on arrival.”

The recommended immediate containment is to pause sensitive intake and disable publication of family-derived status/count/timeline data. If the site must remain available, run it in information-only mode until the critical safeguards are designed, independently reviewed, and verified in a non-production environment.

### Finding count

| Severity | Count | Release effect |
|---|---:|---|
| Critical | 3 | Block public intake and promotion |
| High | 8 | Must be resolved before handling family evidence at scale |
| Medium | 5 | Must be resolved or explicitly risk-accepted before production |
| Low | 0 | None reported separately |

## Scope and rules of engagement

### Included

- `data_aggregator/web`: Next.js application, anonymous authentication, report intake, “my reports,” uploads, analytics, browser speech input, queries, and client-side controls.
- `data_aggregator/db`: schema, grants, RLS policies, views, Realtime publication, storage policies, and database tests.
- Relevant `data_aggregator/pipeline` code: anonymisation, external ingestion, derived counts, ledger/status/timeline generation, LLM integration, identity keys, logging, and deletion.
- Deployment and third-party boundaries: Vercel, Supabase Auth/Postgres/Storage/Realtime, OpenAI, Vercel Analytics, upstream government/media sources, and browser/OS speech services.

### Excluded

- The older topographic/satellite/drone viewer direction except where an evidence file enters the current intake or pipeline.
- Destructive tests, production writes, live account creation, live upload tests, denial-of-service tests, or probing the public deployment.
- Legal compliance certification, organisational access-control interviews, infrastructure-console review, backup inspection, or processor-contract review.

### Confidence labels

- **Verified:** Directly present in the pinned source or reproduced by a safe local test.
- **Verified design / deployment not probed:** The migration or application code enables the behavior; the live database was not queried.
- **Conditional:** A valid weakness exists, but exploitation needs an additional value or condition that was not demonstrated.
- **Hypothesis:** A plausible risk requiring staging or operational evidence before confirmation.

## System and trust-boundary summary

The browser creates a persistent Supabase anonymous session and writes reports directly to Postgres under RLS. It uploads original evidence directly to a private Supabase Storage bucket and inserts file metadata. The Python pipeline uses the Supabase service role, reads raw reports, sends report text to OpenAI for extraction, writes `reports_anon`, derives identities/entities, and publishes status, count, timeline, and summary tables/views. The Next.js site reads those public derived objects with the anonymous key. Vercel Analytics is mounted globally. Browser speech recognition can introduce a separate browser/OS provider.

Sensitive assets include raw report text, contact details, photographs and documents, message and travel evidence, exact event times, household/group membership, identity-linkage keys, anonymous-session refresh tokens, and the service-role/OpenAI secrets used by the pipeline.

## Findings summary

| ID | Severity | Finding | Status |
|---|---|---|---|
| NF-01 | Critical | Public family-derived place/time combinations enable re-identification | Verified + synthetic reproduction |
| NF-02 | Critical | Consent, controller, and authorised receiver are not implemented | Verified design gap |
| NF-03 | Critical | Withdrawal and deletion do not propagate through public data or files | Verified + synthetic reproduction |
| NF-04 | High | Raw sensitive reports are sent to OpenAI before redaction | Verified |
| NF-05 | High | “Anonymisation” fails open and produces linkable pseudonymous records | Verified + synthetic reproduction |
| NF-06 | High | Client-only rate limits permit abuse, cost exhaustion, and public metric poisoning | Verified |
| NF-07 | High | Evidence uploads lack server-side quarantine, inspection, quotas, and safe operator handling | Verified design gap |
| NF-08 | High | External PII pre-storage can fail open, and one source intentionally stores the original spreadsheet | Verified |
| NF-09 | High | Unsalted deterministic identity keys and browser fingerprints enable linking and guessing | Verified + synthetic reproduction |
| NF-10 | High | Persistent anonymous sessions expose previous reports on shared or lost devices | Verified design |
| NF-11 | High | Privacy copy inaccurately claims sensitive data is stripped and encrypted on arrival | Verified |
| NF-12 | Medium | A reporter can conditionally link a correction to another user's case | Verified, conditional exploit |
| NF-13 | Medium | TLS certificate verification is disabled for a police data source | Verified |
| NF-14 | Medium | Security headers and sensitive-route third-party controls are absent | Verified design; some impact not live-verified |
| NF-15 | Medium | Owner-privileged public views create a fragile RLS bypass boundary | Verified design; future-disclosure risk |
| NF-16 | Medium | Clean builds and security gates are not reproducible or enforced | Verified |

## Detailed findings

### NF-01 — Public family-derived place/time combinations enable re-identification

**Severity:** Critical  
**Status:** Verified in source and synthetically reproduced; deployed state not probed

**Evidence**

- `data_aggregator/db/migrations/003_derived.sql:21` defines public `place_status` rows containing `expected`, `confirmed_reached`, `unknown`, `reports_count`, and exact `last_contact_at`.
- `data_aggregator/db/migrations/003_derived.sql:66` defines `report_counts` by exact UTC hour, respondent type, and exact place with no minimum cell size.
- `data_aggregator/db/migrations/004_rls.sql:64` grants anonymous/public read policies on these derived tables; lines 71–73 grant access to owner-privileged views.
- `data_aggregator/db/migrations/003_derived.sql:147` exposes `ps.*` beside exact place latitude and longitude in `v_place_status_latest`.
- `data_aggregator/pipeline/processing/report_counts.py:22` publishes every count, including `n = 1`.
- `data_aggregator/pipeline/processing/ledger.py:431` derives expected, reached, unknown, report totals, contact time, and timeline rows from family reports.
- `data_aggregator/web/lib/queries.ts:366` reads the public status and timeline data into the application.
- A synthetic family report at Timure produced an exact hourly `family × timure × n=1` bucket.

**Concern and family impact**

An observer can combine a small place, hour, respondent type, status changes, public posts, local knowledge, and exact coordinates to infer that a particular household reported, how many people were expected, and whether someone remains unknown. Repeated snapshots also permit differencing. This directly conflicts with the requirement not to publish exact timestamps, household-level locations, or small-group combinations. The dataset is sensitive even when names and raw messages are absent.

**Possible solutions**

- Immediately revoke anonymous access to family-derived `place_status`, `report_counts`, `place_timeline`, and any view or summary that can encode the same signal; stop their publication jobs.
- Keep operational reconciliation data inside an authenticated, role-scoped workspace for the named receiver.
- Design a disclosure-control policy approved by the data controller: substantially wider time and geographic buckets, a documented minimum group threshold, complementary suppression, rounding or calibrated noise, suppression of exact “last contact” values, and protection against differencing over time.
- Use only vetted aggregate releases produced from a separate publication table. Make the public schema incapable of storing exact sensitive values.
- Perform motivated-intruder and linkage testing with realistic sparse Nepal corridor data before each release, including joins with social posts and public missing-person lists.

### NF-02 — Consent, controller, and authorised receiver are not implemented

**Severity:** Critical  
**Status:** Verified design gap

**Evidence**

- `data_aggregator/db/migrations/001_archive.sql:26` defines the raw report record without consent version, purpose, authority/relationship, permitted receiver, processing scope, expiry, or withdrawal receipt.
- No consent or permission field is submitted by the report form. The submission path in `data_aggregator/web/components/form/TheBox.tsx:230` writes directly after a client-side rate check.
- `data_aggregator/web/messages/en.json:356` says a “permission flag (on by default) travels with the report,” but no such field exists.
- `data_aggregator/web/messages/en.json:170`, line 172, line 258, and line 480 refer to an “official channel” or a team arranging one without naming the receiver.
- `data_aggregator/web/messages/en.json:3` and line 36 correctly say the project is volunteer-run and unofficial, but do not identify who controls the sensitive data.

**Concern and family impact**

The application cannot prove what a family agreed to, who may receive the evidence, whether a submitter has authority to report about another person, or what withdrawal means. Default-on permission is not a safe basis for forwarding highly sensitive family evidence. Outreach would invite disclosure before an accountable operational path exists.

**Possible solutions**

- Pause intake until a named controller and a named, contractually authorised operational receiver accept responsibility.
- Add a plain-language bilingual eligibility and consent step before any sensitive field or upload. Do not preselect optional sharing.
- Record an immutable consent receipt containing notice version, purposes, data categories, receiver, processing/LLM disclosures, retention, withdrawal method, timestamp, and the submitter's relationship/authority.
- Separate consent to store/reconcile from consent to transfer to the receiver and from any future research/public aggregation.
- Define handling for minors, people reporting about others, emergency incapacity, disputed authority, and withdrawn consent.
- Provide a non-digital route and clear “not an emergency or official registry” escalation information.

### NF-03 — Withdrawal and deletion do not propagate through public data or files

**Severity:** Critical  
**Status:** Verified in source and synthetically reproduced

**Evidence**

- `data_aggregator/pipeline/processing/anonymise.py:289` deletes a withdrawn row from `reports_anon` only when the pipeline next runs.
- `data_aggregator/pipeline/processing/report_counts.py:29` only upserts current non-empty buckets. It never deletes a bucket that no longer exists. With an empty synthetic source, the step made no cleanup write.
- `data_aggregator/pipeline/processing/ledger.py:420` only emits new rows for places that still have signals; previous “latest” status and previously written timeline rows are not removed.
- `data_aggregator/db/migrations/011_report_media.sql:38` grants Storage select/insert behavior but implements no owner deletion policy or purge trigger.
- `data_aggregator/web/docs/06-report-flow.md:101` explicitly says withdrawn attachments remain in the archive and suggests a future purge job.
- `data_aggregator/web/messages/en.json:237`, line 247, and line 358 promise that withdrawal leaves public counts within the cadence and that everything is deletable.

**Concern and family impact**

A family can receive confirmation that a report was withdrawn while a unique public count, place status, timeline event, generated summary, or original photograph remains. In sparse data, the continued public signal can reveal exactly what the family tried to retract. The interface promise is materially stronger than the implemented behavior.

**Possible solutions**

- Treat withdrawal as a durable tombstone event that triggers a complete dependency graph: raw record, derived record, identity/entity links, counts, statuses, timelines, summaries, caches/CDN objects, search indexes, Storage objects, logs, exports, and receiver copies.
- Recompute replaceable publication tables transactionally from eligible records, or delete all affected derived rows before recomputation. Test zero-record and last-record-at-place cases.
- Implement authenticated file deletion and orphan cleanup, plus controller-reviewed retention exceptions for evidence already transferred under a valid basis.
- Define backup retention and erasure behavior, document what cannot be immediately removed, and issue a verifiable withdrawal receipt.
- Correct the interface text until end-to-end erasure is demonstrably working.

### NF-04 — Raw sensitive reports are sent to OpenAI before redaction

**Severity:** High  
**Status:** Verified

**Evidence**

- `data_aggregator/pipeline/processing/anonymise.py:88` builds a prompt containing the raw `REPORT TEXT` and report metadata.
- `data_aggregator/pipeline/processing/anonymise.py:178` calls the LLM with that prompt.
- `data_aggregator/pipeline/lib/llm.py:95` sends the messages to OpenAI Chat Completions.
- Redaction occurs only after the model response in `data_aggregator/pipeline/processing/anonymise.py:123`.

**Concern and family impact**

Names, contact details, travel plans, last messages, addresses, and medical or status details can cross a third-party boundary before the family is clearly told or separately consents. The application therefore cannot claim that the model sees only anonymised material. Processor retention, geography, access, and incident behavior were not established in this review.

**Possible solutions**

- Prefer deterministic structured intake and local/controlled extraction that does not transmit raw narrative to a third party.
- If an external model is necessary, pre-redact and minimise locally first, use an approved no-training/limited-retention configuration, restrict region and access, and execute an appropriate processor agreement and risk assessment.
- Disclose the named processor, data categories, purpose, retention, and transfer behavior before consent.
- Use per-purpose service credentials, strict egress controls, prompt/log redaction, access audit, and a kill switch.
- Do not send attachments or raw evidence to an LLM unless a separately assessed workflow explicitly requires it.

### NF-05 — “Anonymisation” fails open and produces linkable pseudonymous records

**Severity:** High  
**Status:** Verified and synthetically reproduced

**Evidence**

- `data_aggregator/pipeline/processing/anonymise.py:155` redacts only the names that the model itself returns in `private.names`.
- `data_aggregator/pipeline/lib/text.py:409` covers basic phone, email, uppercase passport patterns, and supplied names, but not general addresses, routes, social handles, lowercase IDs, multilingual names omitted by the model, or many Nepal identity formats.
- `data_aggregator/pipeline/tests/test_anonymise.py:28` tests a cooperative model that reports the name it leaked; it does not test silent model omission.
- `data_aggregator/db/migrations/002_raw.sql:105` retains exact created/event timestamps, place, demographic bands, purpose, travel mode, operator/project, free text, and deterministic linkage keys in `reports_anon`.
- Synthetic checks confirmed that an omitted Devanagari name, a lowercase passport-like identifier, and a precise address all survive `redact_pii`.

**Concern and family impact**

The model is both extractor and source of the redaction list. A single omission becomes a disclosure. Even successful lexical redaction leaves a highly specific pseudonymous event record that can be linked back to a person or household. `reports_anon` should not be treated as anonymous.

**Possible solutions**

- Reclassify `reports_anon` as sensitive pseudonymous data and keep it private.
- Use allowlisted structured output: construct publication records from approved categorical values rather than copying model-produced free text.
- Apply multilingual, deterministic entity/identifier/address detection before and after model use; reject or quarantine output when confidence is insufficient.
- Add adversarial tests for omitted names, Nepali scripts, transliteration, addresses, routes, filenames, handles, IDs, quoted messages, and deliberate model noncompliance.
- Apply the disclosure controls in NF-01 after redaction; lexical scrubbing alone is insufficient.

### NF-06 — Client-only rate limits permit abuse, cost exhaustion, and public metric poisoning

**Severity:** High  
**Status:** Verified

**Evidence**

- `data_aggregator/web/lib/ratelimit.ts:1` stores all rate-limit state in browser `localStorage` and fails open if storage is unavailable or cleared.
- `data_aggregator/web/components/form/TheBox.tsx:230` checks that limiter and then inserts directly through Supabase.
- `data_aggregator/db/migrations/004_rls.sql:39` permits an authenticated anonymous user to insert a report; lines 50–53 permit insertion and reading of `submissions_log`.
- `data_aggregator/db/migrations/001_archive.sql:65` does not force an authoritative server timestamp or tightly constrain live-submission fields.
- `data_aggregator/db/migrations/003_derived.sql:132` counts `submissions_log.created_at > now() - 10 minutes` without an upper bound, so a caller-supplied future timestamp can remain “live.”

**Concern and family impact**

An attacker can clear storage, create anonymous sessions, submit arbitrary reports/uploads, increase OpenAI and Storage cost, flood operators, impersonate families, and spoof the “people here now/contributions” indicators. False records can dilute or redirect operational attention.

**Possible solutions**

- Move intake behind a server/edge function or tightly scoped database RPC that sets server time and accepts only allowlisted fields.
- Apply layered quotas by session, device risk, IP/network, time, report identity, and Storage usage; use accessible bot challenges only where proportional.
- Add idempotency, duplicate detection, moderation queues, anomaly alerts, cost caps, and an immediate intake kill switch.
- Separate decorative presence/activity from operational metrics and never use caller-writable timestamps.
- Rate-limit anonymous-session creation and LLM processing independently from form submission.

### NF-07 — Evidence uploads lack server-side quarantine, inspection, quotas, and safe operator handling

**Severity:** High  
**Status:** Verified design gap

**Evidence**

- `data_aggregator/web/lib/uploads.ts:52` enforces count, size, extension, and browser-supplied MIME checks only in the client.
- `data_aggregator/db/migrations/011_report_media.sql:38` allows files up to 50 MB and checks MIME/path ownership, but provides no content sniffing, malware scan, document sanitisation, metadata stripping, per-user quota, or total quota.
- The Storage insert policy checks the first path component is `auth.uid` but does not require an existing owned report for the full object path.
- `data_aggregator/web/lib/uploads.ts:77` uploads the object before inserting `report_files`; a metadata-row failure can leave an orphan object, and no cleanup path is implemented.
- No checksum, original/derived relationship, transformation history, scan status, or evidence custody event is stored.

**Concern and family impact**

Attackers can upload disguised or active documents, consume storage, and target staff who open evidence. Original photos retain EXIF and other metadata. Orphan objects and absent lineage undermine deletion and evidential integrity.

**Possible solutions**

- Upload to a non-browsable quarantine bucket through a server-authorised flow; verify magic bytes, parse safely, scan for malware, and apply content disarm/reconstruction where appropriate.
- Enforce per-report, per-user, and system quotas in a trusted component and remove failed/orphan uploads.
- Preserve an immutable, access-restricted original with cryptographic checksum and custody log; create separately labelled safe derivatives with metadata removed.
- Serve operator previews through a sandboxed viewer with safe content disposition, no active macros/scripts, short signed URLs, and audited access.
- Record uploader, consent scope, source, checksum, scan result, transformation lineage, timestamps, retention, and deletion events.

### NF-08 — External PII pre-storage can fail open

**Severity:** High  
**Status:** Verified

**Evidence**

- `data_aggregator/pipeline/pull_external_data.py:336` invokes optional `prestore` logic and stores whatever it returns without a central “PII source must fail closed” invariant.
- Unexpected schemas are passed through raw in `data_aggregator/pipeline/normalisers/opmcm_person_reports.py:58`, `data_aggregator/pipeline/normalisers/opmcm_help_requests.py:47`, and `data_aggregator/pipeline/normalisers/ndrrma_rescues.py:49`.
- Parse failures can return raw HTML in `data_aggregator/pipeline/normalisers/police_udb.py:85` and `data_aggregator/pipeline/normalisers/setu_recordlist.py:83`.
- `data_aggregator/pipeline/normalisers/dao_nuwakot_rescued.py:93` downloads and uploads the entire rescued-person spreadsheet before deriving counts, despite the module comment saying names and other PII are never written.

**Concern and family impact**

An upstream schema change, error page, or malicious response can bypass source-specific stripping and enter raw storage. The DAO spreadsheet path intentionally stores identified people. Service-role compromise, operator access, retention errors, or a storage incident would then expose source PII beyond the claimed purpose.

**Possible solutions**

- Mark PII-bearing sources centrally and make any missing/failed/unexpected pre-storage transform block persistence and alert an operator.
- Validate against strict schemas, apply DLP checks to the exact bytes about to be stored, and quarantine failures in a separately controlled environment.
- Store only approved aggregate fields for external person lists unless the named controller and receiver establish a specific operational need, authority, retention, and access model.
- Add schema-drift, malformed payload, HTML error, and adversarial PII tests for every PII-bearing source.

### NF-09 — Unsalted deterministic identity keys and browser fingerprints enable linking and guessing

**Severity:** High  
**Status:** Verified and synthetically reproduced

**Evidence**

- `data_aggregator/pipeline/lib/text.py:327` computes `person_key` with plain SHA-256 over a phone, passport, or name/demographic tuple and no secret key.
- The same input produced the same key in a synthetic check without requiring runtime secret material.
- `data_aggregator/web/lib/reports.ts:27` hashes user agent, screen dimensions, timezone, and language into a persistent report fingerprint.

**Concern and family impact**

Phone numbers and common name/demographic combinations have limited entropy and can be enumerated offline after a database leak or by an insider. Stable keys also allow cross-dataset linking. The browser fingerprint is personal/linkable data but is collected without a clear consent, purpose, or retention model.

**Possible solutions**

- If linkage is necessary, use a scoped HMAC with a protected, rotatable key and separate keys per purpose/environment. Limit access and retain mappings only as long as operationally required.
- Avoid identity keys in publication tables and prevent cross-purpose reuse.
- Remove the browser fingerprint unless a documented, proportionate purpose survives privacy review. Prefer trusted server-side abuse signals with short retention and access controls.
- Threat-model insider enumeration and require audit/approval for bulk identity-key access.

### NF-10 — Persistent anonymous sessions expose previous reports on shared or lost devices

**Severity:** High  
**Status:** Verified design; physical/shared-device exploitation not performed

**Evidence**

- `data_aggregator/web/lib/supabase.ts:25` persists the anonymous JWT and refresh token in `localStorage`.
- No explicit logout, “clear this device,” device lock, or step-up authentication flow was found.
- `data_aggregator/web/lib/queries.ts:518` permits the browser session to retrieve its raw report text/contact fields; UI omission does not prevent direct API/devtools access.

**Concern and family impact**

On a shared relief-centre phone, borrowed handset, repaired device, or lost phone, the next holder can access raw family submissions/files and withdraw them. Conversely, storage loss or session expiry can strand a family without a reliable recovery route.

**Possible solutions**

- Provide visible logout and “remove my reports from this device” controls and warn users before persisting on a shared device.
- Use short-lived sessions, limit refresh-token persistence, and consider a separate recoverable secret or step-up mechanism for viewing/withdrawing sensitive content.
- Return only the minimum list metadata by default; require deliberate re-authentication for raw report/file access.
- Define safe recovery that does not rely on easily guessed personal information.

### NF-11 — Privacy copy inaccurately claims sensitive data is stripped and encrypted on arrival

**Severity:** High  
**Status:** Verified

**Evidence**

- `data_aggregator/web/messages/en.json:355` says names, contacts, and photos are “stripped and encrypted on arrival.”
- `data_aggregator/db/migrations/001_archive.sql:26` stores raw report text, contact, and fingerprint.
- `data_aggregator/db/migrations/011_report_media.sql` stores original attachments; no application-layer field/file encryption, key separation, envelope encryption, or metadata stripping implementation was found.
- The pipeline sends raw report text to OpenAI before redaction (NF-04).

**Concern and family impact**

Transport encryption and provider-managed at-rest encryption are not the same as stripping sensitive content or applying application-layer encryption. A family may submit because the interface gives a materially false impression of who can see raw data and when it is removed.

**Possible solutions**

- Correct the copy immediately to describe the actual processing and access model.
- If the stronger claim is required, implement application-layer envelope encryption for raw text, contacts, and files with separated keys, narrowly authorised decryption, audit, rotation, and incident procedures.
- Show accurate third-party, metadata, retention, backup, receiver, and withdrawal disclosures before consent.

### NF-12 — A reporter can conditionally link a correction to another user's case

**Severity:** Medium  
**Status:** Verified weakness; conditional on learning another report UUID

**Evidence**

- `data_aggregator/db/migrations/001_archive.sql:36` defines `supersedes` as a foreign key but does not require the referenced report to belong to the same user.
- `data_aggregator/db/migrations/004_rls.sql:39` checks the new row's owner/status but not ownership of `supersedes`.
- The intake validates UUID shape, not ownership, and `data_aggregator/pipeline/processing/anonymise.py:163` copies the link into the derived record.

**Concern and family impact**

If a report UUID leaks through a user, operator, log, screenshot, or future feature, another anonymous user can present an unrelated submission as its correction. That can contaminate deduplication and the authoritative case chain. UUID entropy prevents simple enumeration but is not an authorisation control.

**Possible solutions**

- Enforce same-owner linkage in a database constraint/security-definer RPC that performs an explicit ownership check.
- Use an unguessable, purpose-specific correction token rather than accepting arbitrary report IDs.
- Audit correction relationships and route cross-owner merges through authorised operator review.

### NF-13 — TLS certificate verification is disabled for a police data source

**Severity:** Medium  
**Status:** Verified

**Evidence**

- `data_aggregator/pipeline/normalisers/police_udb.py:94` calls the fetch function with `verify=False`.
- The source configuration describes a self-signed certificate.

**Concern and family impact**

An on-path attacker or compromised network can alter the response used for public figures and, because some parse failures retain raw content, potentially introduce unexpected sensitive or hostile data.

**Possible solutions**

- Trust a pinned issuing certificate or narrowly pin the expected certificate/public key with an expiry/rotation process.
- Use a controlled proxy or manual authenticated retrieval if the upstream cannot provide valid TLS.
- Fail closed on verification failure and surface a stale-data warning rather than silently weakening TLS.

### NF-14 — Security headers and sensitive-route third-party controls are absent

**Severity:** Medium  
**Status:** Verified design; live edge headers and provider behavior not probed

**Evidence**

- `data_aggregator/web/next.config.ts:1` defines no Content Security Policy, framing control, Referrer Policy, Permissions Policy, or application-level HSTS configuration.
- `data_aggregator/web/app/[lang]/layout.tsx:84` mounts Vercel Analytics globally, including report and “my reports” routes.
- Browser speech recognition is available on intake, introducing browser/OS speech-provider behavior that is not clearly disclosed.
- Supabase tokens persist in `localStorage`, increasing the impact of any future XSS.

**Concern and family impact**

Missing browser hardening increases XSS/clickjacking/data-exfiltration impact. Global analytics and speech processing may disclose route, device, network, or audio-related data outside the core controller/receiver path. The deployed platform may add some headers, but that was not assumed.

**Possible solutions**

- Define and test a restrictive CSP, `frame-ancestors`, Referrer Policy, Permissions Policy, MIME sniffing protection, and appropriate HSTS at the actual edge.
- Remove analytics from sensitive routes or configure a reviewed, minimised, consent-compatible deployment with no sensitive parameters and short retention.
- Clearly disclose speech processing and offer equivalent text entry; avoid recording or retaining audio in the application.
- Add automated response-header tests against staging.

### NF-15 — Owner-privileged public views create a fragile RLS bypass boundary

**Severity:** Medium  
**Status:** Verified design; no current raw-person row was demonstrated through these views

**Evidence**

- `data_aggregator/db/migrations/004_rls.sql:71` documents and grants public access to views that run with owner privileges.
- `data_aggregator/db/migrations/012_source_extracts.sql:4` creates public views exposing selected data from otherwise service-only tables.
- `v_source_figures_recent` includes free-form `scope`, `note`, and `url` fields from normalisers.

**Concern and family impact**

RLS on base tables does not protect an owner-privileged view. A future column addition or normaliser note can silently cross the public boundary without a policy failure. Error/status views can also leak operational detail. This is a fragile governance mechanism even if current rows are intended aggregates.

**Possible solutions**

- Use `security_invoker` views where supported, or publish through dedicated, least-privilege aggregate tables with explicit column allowlists.
- Revoke default/public view access and grant only individually reviewed objects.
- Add migration tests that enumerate public relations/columns and seed canary PII to prove it is unreachable as `anon`.
- Treat free-form note, URL, error, and scope fields as untrusted until publication-reviewed.

### NF-16 — Clean builds and security gates are not reproducible or enforced

**Severity:** Medium  
**Status:** Verified

**Evidence**

- `npm ci` fails because `package.json` and `package-lock.json` are out of sync (`@emnapi/runtime` and `@emnapi/core` are missing from the lock).
- The production Next.js build fails because `data_aggregator/web/lib/tokens` is absent while eight application files import it.
- Two Vitest suites fail for the same missing module; a flood simulation test exceeded its 5-second timeout.
- The Python suite needs `tzdata` on Windows, uses platform-specific `strftime("%-d")`, and references an absent `w2a_dao_nuwakot_rescued.xlsx` fixture.
- `data_aggregator/web/docs/12-deploy.md` describes manual production deployment and states there is no CI yet.
- Python requirements are ranges rather than a locked, hash-verified environment.

**Concern and family impact**

The assessed revision cannot be cleanly rebuilt, and critical RLS/security checks are not enforced before deployment. Manual deployment can ship missing files, stale migrations, unreviewed public views, or dependency drift. A broken emergency site also pushes families toward unsafe informal channels.

**Possible solutions**

- Restore reproducible JS and Python dependency locks with integrity hashes and automated update review.
- Require CI for clean install, lint/typecheck, unit tests, production build, migration lint, secret scan, dependency audit, and a disposable Supabase integration environment.
- Make public-schema/RLS, withdrawal propagation, disclosure control, upload quarantine, and consent tests release-blocking.
- Require reviewed migrations and a rollback/intake-pause runbook before production deployment.

## Test and tool results

All mutable work occurred in a disposable `git archive` snapshot under the assessment workspace. No test was aimed at the live deployment.

| Check | Result | Interpretation |
|---|---|---|
| Source baseline | Clean `main`, target `9763f5c`, origin `+0/-0` | Assessment pinned; no source edits |
| `npm ci` | Failed: lockfile/package mismatch | Verified reproducibility defect |
| Snapshot-only `npm install --no-save --package-lock=false` | Completed | Enabled tests; not evidence of a valid clean lock install |
| ESLint | Passed | No lint errors in the installed snapshot |
| i18n check | Passed, 479 keys × 3 languages | Translation key consistency only |
| Vitest | 106 passed; 1 timed out; 2 suites failed to load | Missing `data_aggregator/web/lib/tokens` blocks suites; timeout is performance/environment-sensitive |
| Next.js production build | Failed with 8 unresolved `@/lib/tokens` imports | Revision is not deployable as archived |
| npm audit | 0 known advisories across 549 resolved dependencies | Does not cure lockfile mismatch |
| Python pytest, unmodified clean environment | Collection failed on absent `tzdata` and default Windows encoding | Portability/setup defects |
| Python pytest with snapshot-only UTF-8/date shim and `tzdata` | 283 passed, 1 skipped, 1 failed | Remaining failure is absent XLSX fixture |
| Database/RLS pytest | 34 skipped | No non-production Supabase credentials; dynamic RLS remains unverified |
| Synthetic privacy checks | 6/6 concerns reproduced | Omitted name/ID/address survive; singleton count; no stale-count cleanup; deterministic person key |
| `pip-audit -r requirements.txt` | No known vulnerabilities in freshly resolved application requirements | Requirements are unpinned, so this is not a production SBOM guarantee |
| Bandit | 3 alerts | SHA-1/MD5 alerts are non-security stable-ID uses; one swallowed exception is low. Manual review found the custom `verify=False` path Bandit missed |
| High-confidence credential scan | No confirmed credential in current tree/history | Apparent `sk-` matches were URL/prose fragments with no random key shape; no values were printed |

## Positive controls observed

The following controls are useful and should be preserved:

- RLS is enabled across the principal tables, and raw/service tables are generally revoked from `anon`.
- Raw report and media buckets are configured private.
- Report ownership is checked for ordinary reads and withdrawal updates.
- Upload filenames are normalised to a restricted character set, reducing traversal risk.
- No `dangerouslySetInnerHTML` or obvious raw report HTML rendering path was found in the scoped web application.
- The database client has guards against unfiltered update/delete operations.
- Pipeline logs apply basic secret/phone/email/passport redaction and generally avoid raw report bodies.
- The HTTP fetch layer implements timeouts, retries, and response-size caps.
- `reports_anon` and entity tables are not directly readable by public users.

These controls reduce common web risk but do not neutralise the privacy and publication findings above.

## Verification limitations

- The production Vercel/Supabase configuration, edge headers, RLS state, Storage settings, Auth configuration, logs, backups, IAM membership, and processor settings were not inspected.
- No live endpoint, account, upload, rate-limit, or public-data probe was performed.
- The database test suite was skipped because no authorised disposable Supabase environment was provided.
- Dependency audits reflect the versions resolved during this assessment. The Python environment is not locked, and the JS clean lock install fails.
- Organisational safeguards—controller appointment, receiver agreement, incident response, staff vetting, access reviews, and deletion at downstream recipients—cannot be established from source alone.
- Absence of a finding is not proof of absence, particularly for runtime configuration and insider processes.

## Prioritised decision and remediation sequence

### Immediate containment

1. Pause sensitive intake and influencer/public promotion.
2. Revoke public access to family-derived place status, count, timeline, and summary outputs; purge or quarantine existing sparse public data.
3. Disable or isolate the LLM path for raw family reports.
4. Preserve existing evidence under tightly restricted access while the controller determines lawful/ethical retention and withdrawal handling.

### Before any closed pilot

1. Name the data controller and authorised operational receiver; execute the operational/data-sharing arrangements.
2. Implement bilingual eligibility, informed consent, authority-to-report, accurate privacy notices, retention, withdrawal, and incident-contact flows.
3. Implement end-to-end withdrawal/deletion, including files, derivatives, public aggregates, caches, backups policy, and receiver copies.
4. Build a private role-based reconciliation workspace and a separately governed coarse publication pipeline.
5. Add trusted abuse controls, secure session/recovery behavior, and a pause-intake kill switch.
6. Quarantine, inspect, trace, and safely render evidence uploads.

### Before public promotion

1. Complete a disclosure/re-identification assessment using realistic sparse data and repeated releases.
2. Pass staging RLS/Storage/Realtime tests as anonymous user, family A, family B, operator, pipeline service, and withdrawn user.
3. Pass adversarial multilingual redaction and free-text rejection tests.
4. Establish reproducible builds and release-blocking CI/security gates.
5. Conduct an independent penetration test and privacy review of the deployed staging system.
6. Exercise incident response, data breach notification, receiver handoff, and immediate intake shutdown.

## Final repository-integrity statement

The source repository remained on `main` at `9763f5cb9766f1b539f081a5cd35ba6da930367f`, aligned with `origin/main`, with no staged or unstaged changes at the assessment integrity check. No commit, push, reset, deployment, live write, or application-code remediation was performed.
