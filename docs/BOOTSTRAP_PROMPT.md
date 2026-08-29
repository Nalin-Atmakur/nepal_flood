# Claude Code bootstrap prompt — `nepal_flood`

> Paste everything below the line into Claude Code from the root of the `nepal_flood` repo.
> Suggested home in-repo: `docs/BOOTSTRAP_PROMPT.md`

---

You are helping bootstrap a research repository called `nepal_flood`. Read this whole brief before doing anything. **Do not write application code in this session.** The output of this session is repository structure, research scaffolding, and a set of questions back to me.

## 1. Context

On 26 August 2026, a glacier/rock collapse near the Nepal–Tibet border triggered a catastrophic flash flood down the Lhende Khola → Bhote Koshi → Trishuli river system, striking Rasuwa and Nuwakot districts in Nepal and Gyirong County in Tibet Autonomous Region, China. As of 29 August 2026 the response is active and ongoing.

Operationally relevant facts (verify and date-stamp all of these — see §5):

- Hundreds confirmed dead, thousands reported missing across both sides of the border.
- A large fraction of "missing" reports reflect **downed telecoms**, not confirmed deaths. The missing count has risen as communications were restored to cut-off settlements. This is a data-quality problem, not just a body-recovery problem.
- Roads and bridges destroyed along the Betrawati–Rasuwagadhi corridor. Many settlements are helicopter-access-only.
- Barrier lakes formed by landslide debris upstream. A secondary outburst is a live risk and has already paused rescue operations at least once.
- Casualties include a large number of foreign nationals, plus hydropower workers, customs/immigration staff, security personnel and trekking guides — i.e. transient populations not on any local household register.
- A rescue nerve-centre has been operating out of the Nepali Army barracks at Trishuli, Nuwakot, with families gathering there seeking information.

**Goal of the project:** software that helps flood rescuers know the whereabouts of people. Scope of *this* repo, for now, is the research and requirements work that has to precede that.

## 2. The core design constraint — read this before proposing anything

The dominant historical failure mode in disaster people-tracking is **fragmentation**. After 9/11, more than 25 separate survivor registries existed within three days; families and responders had to search all of them. That failure produced the PFIF (People Finder Interchange Format) open standard, which exists so that independent repositories can exchange and aggregate person records and notes while preserving record provenance.

Therefore, treat the following as a hard architectural constraint to be tested, not assumed:

> Any new standalone missing-persons database we create is, by default, **net-negative** unless it either (a) aggregates and syncs with existing registries via an open standard, or (b) serves a need no existing system covers.

Your job in the research phase is to establish which of those is true here. Do not let the repo drift toward "build our own registry" without that being justified in writing.

## 3. What to build in this session

Create this structure. Every directory gets a `README.md` explaining its purpose and its conventions.

```
nepal_flood/
├── README.md
├── docs/
│   ├── BOOTSTRAP_PROMPT.md         # this file
│   ├── GLOSSARY.md                 # INSARAG, ICMS, LEMA, OSOCC, UCC, RFL, PFIF,
│   │                               # NDRRMA, BIPAD, GLOF, ASR levels, VDC, ward, etc.
│   ├── DECISIONS.md                # ADR-style log, newest first
│   └── OPEN_QUESTIONS.md           # things we don't know, owner, blocking-or-not
├── research/
│   ├── 00-event/                   # what happened: timeline, hydrology, geography
│   ├── 10-actors/                  # who is responding and who owns what data
│   ├── 20-existing-systems/        # landscape scan (see §4)
│   ├── 30-user-needs/              # what rescuers actually need (see §4)
│   ├── 40-constraints/             # connectivity, power, devices, language, literacy
│   ├── 50-ethics-and-legal/        # PII, data protection, do-no-harm
│   └── sources/                    # one file per source, see §5
├── data/
│   ├── README.md                   # ⚠️ see §6 — no personal data in this repo, ever
│   └── schemas/                    # data model drafts, PFIF mappings
└── .gitignore
```

`.gitignore` must aggressively exclude anything that could carry personal data: `*.csv`, `*.xlsx`, `*.sqlite`, `*.db`, `*.json` under `data/raw/`, `.env`, credential files. Err toward over-blocking.

## 4. Research tracks

Set up each of these as a directory with a stub document stating the question, the method, current status, and what's missing. Populate what you can from what you already know, clearly marked as unverified where you're not certain. I will feed you links and field investigation notes in later sessions.

**`20-existing-systems/` — landscape scan.** One file per system: what it does, who operates it, whether it's active in this response, its data model, whether it has an API or export format, and whether we could integrate rather than rebuild. At minimum cover:

- **BIPAD Portal** (`bipadportal.gov.np`) — Nepal's national disaster information management system, owned by NDRRMA, built by Youth Innovation Lab. Modules include dashboard, incident, damage & loss, real-time. Nepal Police are the authorised body for reporting incident data.
- **INSARAG ICMS** — the international USAR coordination system (Esri/ArcGIS + Survey123 forms, dashboards surfaced via Virtual OSOCC). Encodes the ASR levels (1: wide area assessment → 5), worksite triage, worksite prioritisation and team tasking forms, and the INSARAG marking/signalling system.
- **Virtual OSOCC / GDACS** — international coordination and alerting.
- **PFIF** — the open XML standard for person + note records with preserved record provenance. Google Person Finder is the best-known implementation.
- **ICRC Restoring Family Links / Family Links Network** — the authoritative humanitarian family tracing channel. Understand why an amateur system that duplicates this is dangerous.
- **KoboToolbox / ODK** — offline-capable field data collection; NDRRMA already uses KoboCollect.
- **HOT OSM, OpenAerialMap, Tasking Manager** — post-event imagery and basemap generation.
- **Ushahidi, Sahana Eden** — crowdsourced incident mapping and relief coordination; document their known limitations honestly.

For each, end with an explicit verdict line: `INTEGRATE / EXTEND / AVOID / IRRELEVANT` plus one sentence of reasoning.

**`30-user-needs/` — what rescuers actually need.** Do not guess and then write it up as fact. Build a structured hypothesis document with each need tagged `EVIDENCED` (with source) or `HYPOTHESIS` (needs validation). Distinguish between these user classes, because they have different and sometimes conflicting information needs:

1. Helicopter crews and aerial recce
2. Ground SAR teams (Nepali Army, Armed Police Force, Nepal Police)
3. The coordination cell / EOC (district and national)
4. Local volunteers and community responders
5. Families of the missing
6. Medical and body-recovery/identification teams

Seed hypotheses to test — where is the last-known-location of person X; which settlements have been physically reached and cleared vs. never visited; which reports are duplicates of the same person under name variants; is a "missing" report a comms outage or an actual disappearance; where are survivors sheltering now vs. where they lived; upstream barrier lake status and evacuation triggers; which access routes are passable today.

**`40-constraints/`** — the environment the software must survive: intermittent-to-zero connectivity, offline-first sync with conflict resolution, low-end Android, battery scarcity, Nepali and Tibetan/Tamang language and script, transliteration of names between Devanagari and Latin (critical for deduplication), Bikram Sambat vs. Gregorian dates, coordinate reference systems, and the fact that responders are exhausted and will not use anything with a learning curve.

**`50-ethics-and-legal/`** — see §6.

## 5. Source handling conventions

I will send you a large volume of links plus our own field investigation notes. Set up `research/sources/` with a strict convention and a template, so that ingestion in later sessions is mechanical:

- One markdown file per source: `YYYY-MM-DD--publisher--short-slug.md`
- YAML frontmatter: `url`, `publisher`, `author`, `published`, `accessed`, `type` (news / academic / government / NGO-report / primary-field-note / social-media), `reliability` (A–F, and say what your scale means), `topics` (list), `status` (unread / summarised / extracted).
- Body: a summary **in your own words**, then extracted claims as a bulleted list, then contradictions with other sources, then relevance to which research track.
- **Never paste long verbatim extracts from copyrighted sources into the repo.** Paraphrase. Short quotes only where exact wording matters, attributed.
- Every factual claim that lands in a research document carries an inline reference to the source file it came from. If you cannot trace a claim to a source, mark it `[UNSOURCED]` rather than deleting it or asserting it.

Add `docs/SOURCE_INGESTION.md` documenting this so I can point future sessions at it.

**Casualty and missing-person figures change hourly.** Never state a number without a timestamp and a source. Prefer `as of <date>, <source> reported ~N` over a bare figure. Do not carry stale numbers forward between documents.

## 6. Ethics and data protection — non-negotiable

This is a public GitHub repository concerning a live mass-casualty event.

- **No personal data of any real individual goes into this repo. Ever.** No names, phone numbers, photos, ID numbers, addresses, coordinates tied to individuals, or scraped missing-persons lists. Not in `data/`, not in test fixtures, not in an example, not in a commit message.
- Test and example data must be obviously synthetic and labelled as such.
- Write `data/README.md` and `50-ethics-and-legal/` to state this plainly, and note the real-world harms that motivate it: family tracing data can expose survivors, misidentification causes severe harm to families, unverified death reports circulating publicly are cruel, and location data on displaced people has been misused elsewhere.
- Document, don't decide: what Nepali law says about personal data and disaster response, what the humanitarian data-protection norms are (ICRC Handbook on Data Protection in Humanitarian Action is the reference text), and who would need to be a data controller for anything we build to be legitimate.
- Add a `50-ethics-and-legal/DO_NO_HARM.md` covering: the risk of a well-intentioned parallel registry fragmenting the official picture, the risk of our numbers contradicting official ones in public, and the rule that we do not publish anything that could be mistaken for an authoritative casualty source.

## 7. Ground rules for you

- **Do not fabricate.** If you don't know a figure, an organisation's role, or whether a system is deployed in this response, write `[UNKNOWN — needs verification]`. Confident-sounding invention is the worst possible failure mode here.
- Don't write application code, choose a stack, or scaffold a frontend yet. If you find yourself designing an app, stop.
- Prefer many small, well-named markdown files over few large ones.
- Keep documents skimmable: a responder or a collaborator should get the gist in 30 seconds.
- Commit in logical units with clear messages. Do not commit anything under `data/raw/`.

## 8. What I want back at the end of this session

1. The repo structure above, committed.
2. `docs/OPEN_QUESTIONS.md` populated with the questions that actually block progress, ranked.
3. A short written answer to this question in `docs/DECISIONS.md`: **given what already exists, what is the strongest candidate gap that a small team could fill in days rather than months, and what would make that gap not worth filling?** Give me two or three candidate wedges with an honest argument against each.
4. A list of clarifying questions for me. Specifically I expect you to ask about: who our actual users are and whether we have a channel to them, whether anyone on the team has a relationship with NDRRMA / Nepal Army / a district EOC, what our language capability is, and what the team's realistic time budget is.

Ask those questions before, not after, you start filling in research content you'd have to redo.
