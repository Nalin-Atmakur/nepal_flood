# Source ingestion conventions

Every external source gets **one markdown file** in `research/sources/`. Ingestion must be mechanical so any session (human or AI) can do it identically.

## File name

```
YYYY-MM-DD--publisher--short-slug.md
```

Date = publication date if known, else access date. Publisher lowercased, hyphenated (`kathmandu-post`, `copernicus-ems`, `hot-osm`). Slug ≤ 5 words.

## Frontmatter (required)

```yaml
---
url: https://…
publisher: Kathmandu Post
author: (or unknown)
published: 2026-08-28   # or unknown
accessed: 2026-08-29
type: news | academic | government | NGO-report | primary-field-note | social-media | dataset | tool
reliability: B
topics: [secondary-flood, actors, casualty-figures]
status: unread | summarised | extracted
---
```

### Reliability scale

- **A** — Official agency, space agency, wire service, peer-reviewed paper
- **B** — Established humanitarian org or national media of record
- **C** — Other media, community projects, well-run volunteer efforts
- **D** — Blogs, social media posts, unattributed compilations
- **E** — Unverifiable, provenance unknown, or AI-generated without checked citations
- **F** — Known-false or fabricated

## Body (in this order)

1. **Summary** — your own words, 3–10 sentences. Never long verbatim extracts; short quotes only where exact wording matters, attributed.
2. **Extracted claims** — bulleted, each self-contained and date-stamped (`as of 2026-08-28, X reported ~N`).
3. **Contradictions** — with other source files, named.
4. **Relevance** — which research track(s) this feeds.

## Rules

- Every factual claim in any research document carries an inline reference to its source file: `(→ sources/2026-08-28--reuters--barrier-lake.md)`. Unreferenced claims are marked `[UNSOURCED]`, not silently kept or deleted.
- Casualty/missing figures change hourly. **Never** carry a stale number forward; always restate with date + source.
- **No personal data.** If a source is itself a list of missing/dead individuals, record only metadata (what it is, who published it, why it matters) — never extract names or details. Mark it `⚠️ CONTAINS PII — metadata only`.
- Copyright: paraphrase. One short attributed quote max where wording matters.
- Template: copy `research/sources/_TEMPLATE.md`.
