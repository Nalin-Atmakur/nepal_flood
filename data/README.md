# data/

## ⚠️ No personal data. Ever. This is not negotiable.

This is a **public repository about a live mass-casualty event**. Nothing in this directory — or anywhere in this repo — may contain personal data of any real individual:

- No names of missing, dead, rescued, or displaced people
- No phone numbers, photos, ID/passport numbers, addresses
- No coordinates tied to an identifiable individual
- No scraped or re-uploaded missing-persons lists — not even "public" ones
- Not in test fixtures, not in examples, not in commit messages, not in issue text

**Why this is a hard rule, not caution:**

- Family-tracing data can expose survivors to people who wish them harm (this has happened in other responses)
- Misidentification devastates families; unverified death reports circulating publicly are cruel
- Location data on displaced people has been misused elsewhere
- A public repo is forever: force-pushing a deletion does not un-leak a name

Test/example data must be **obviously synthetic and labelled as such** (e.g. `EXAMPLE-PERSON-001`, coordinates in the ocean).

## What belongs here

- `schemas/` — data model drafts, PFIF mappings, field lists. Structure, never content.
- Aggregate, non-personal reference data may be *linked* (see `research/sources/`), not committed. The `.gitignore` blocks common data formats by design; do not override it without a written justification in `docs/DECISIONS.md`.

If you are unsure whether something counts as personal data, it does.
