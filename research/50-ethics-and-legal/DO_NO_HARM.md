# Do no harm

The harms this project could plausibly cause, and the rules that prevent them. These are commitments, not aspirations.

## Harm 1 — Fragmenting the picture with a parallel registry

After 9/11, 25+ separate survivor registries appeared within three days; families had to search all of them, and responders trusted none. That failure is why PFIF exists. A well-intentioned new missing-persons list for this event would:

- split family reports across yet another silo,
- create duplicate records under name variants (Devanagari ↔ Latin transliteration makes this worse),
- and dilute trust in the official count at exactly the moment families need one number.

**Rule:** we do not stand up a public missing-persons registry. If person-data work ever becomes justified (see `docs/DECISIONS.md`), it must sync with existing registries via PFIF or an equivalent open standard, under an accountable data controller — or not exist. The ICRC Restoring Family Links network and Nepal Police/NDRRMA channels are the authoritative lanes; an amateur duplicate of RFL is dangerous, not helpful.

## Harm 2 — Our numbers contradicting official ones in public

"Missing" in this event is substantially a **telecoms artifact** — counts have moved as cut-off settlements regained contact. If we publish derived figures (e.g. "N buildings destroyed → ~M people affected") they will be quoted, compared against official figures, and used to accuse someone of lying.

**Rule:** we do not publish casualty, missing, or affected-population estimates. Anything we produce that implies exposure (e.g. damage-map overlays with population rasters) is delivered to responders, labelled as modelled prioritisation input, not released as public statistics. Every number we do record is written `as of <date>, <source> reported ~N`.

## Harm 3 — Exposing people through location data

Maps of where survivors are sheltering, which houses are empty, or where an identifiable family lives are targeting data as much as rescue data. Family-tracing information has been misused against displaced people in other crises.

**Rule:** no coordinates tied to identifiable individuals or households, anywhere in our outputs. Aggregation floor: settlement/ward level or coarser for anything public.

## Harm 4 — Amplifying false or synthetic information

This event already has documented AI-generated fake flood footage circulating (see `research/sources/`). Resharing dramatic imagery "to raise awareness" without verification pollutes the information space rescuers and families depend on.

**Rule:** we amplify only verified material (Copernicus/UNOSAT products, agency statements, imagery with provenance). Anything else gets checked against verified sources first; if unverifiable, it isn't shared — including in this repo.

## Harm 5 — Wasting responders' scarcest resource: attention

Every "here's an app we made" message to an EOC during a live response costs coordinator time. Unsolicited tools with no channel, no validation, and no maintenance plan are a burden dressed as help.

**Rule:** we approach responders through existing coordination structures (HOT/Open Mapping Hub, ICIMOD, NDRRMA's own channels), with something they asked for or demonstrably lack — not cold pitches during the acute phase.

## Harm 6 — Mistaking our legitimacy

We are not a mandated responder. We are a volunteer research/tech team. We do not self-brand as an official information source, do not use government or agency logos, and clearly label everything as unofficial volunteer work.
