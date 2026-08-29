# data/schemas/

Drafts of data models for anything we might build — **structure only, never content**.

Conventions:

- One file per model, markdown or JSON Schema.
- Any model that touches person records must start from **PFIF 1.4** (person + note records, provenance preserved) and document its mapping to/from PFIF rather than inventing fields. Rationale: `docs/BOOTSTRAP_PROMPT.md` §2 — fragmentation is the failure mode.
- Every field that could carry personal data gets a `sensitivity:` annotation and a note on why it is needed. Fields we can do without, we leave out (data minimisation).
- Example values in schemas must be obviously synthetic (`EXAMPLE-PERSON-001`).

Nothing here yet — schema work is blocked on the landscape scan verdicts in `research/20-existing-systems/`.
