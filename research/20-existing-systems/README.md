# 20-existing-systems — landscape scan

**Question:** For each system that already exists in this space: what does it do, who operates it, is it active in *this* response, what's its data model / API, and could we integrate rather than rebuild?

**Why this track gates everything:** the bootstrap constraint (§2) — a new standalone system is net-negative by default. No build decision happens until this scan supports it.

**Convention:** one file per system, ending with a verdict line:

```
VERDICT: INTEGRATE | EXTEND | AVOID | IRRELEVANT — one sentence of reasoning
```

- **INTEGRATE** — consume/feed it as-is
- **EXTEND** — build on top of it (plugin, layer, import/export)
- **AVOID** — duplicating it would cause harm; stay out of its lane
- **IRRELEVANT** — not applicable to this event/need

**Status:** initial scan 2026-08-29 from prior knowledge + web research. Activity-in-this-response claims marked `EVIDENCED` (with source) or `[UNVERIFIED]`.
