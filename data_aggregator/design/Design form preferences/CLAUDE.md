# Project instructions

- IGNORE the Modernist design system entirely (user override). Do not load `_ds/modernist-*` styles or bundle in any new work.
- Visual direction v3: "Arcade / cartoon (neo-brutalist)" — like ratemygithub.com energy, kept respectful for the subject.
  - Sharp chunky style: 2.5px ink borders, 2px radius on rectangles (frames 4px), HARD offset shadows only (4px 4px 0 ink — never blurred), slight sticker rotations (±1deg) on stat cards. Contrast comes from CURVED accents against the sharp rects: circular logo/section-number badges, pill language toggle/LIVE chip/share buttons/unknown badges, big quarter-circle amber overlays on the scoreboard.
  - Palette: ink #1a1a1a, page ground #f2f3f6 (canvas behind frames #d8dbe2), white cards; brand ultramarine #2438e8 (CTA fills, section badges, active toggle); signal amber #ffb800 (scoreboard digits, unknown fill #ffe294 w/ text #8a3f06); scoreboard near-black #141419; confirmed green #148a4e; dead/neutral #8a8a8a; live red #e5484d (LED dot only).
  - Type: Baloo 2 everywhere (chunky rounded; covers Latin AND Devanagari). Arcade accent font "Press Start 2P" ONLY for tiny scoreboard labels/LIVE chip/live counter digits.
  - Buttons: amber fill, ink border, hard shadow; press = translate(2px,2px) + shadow shrink.
  - Copy stays calm and serious; no jokes, no emoji next to casualty numbers.
  - 3D corridor: `corridor-3d.js` default (light) theme inside a chunky framed card.
- Questionnaire (§7) is the ONE-BOX design: one textarea + mic, prompt chips that insert text, two optional secondary fields (place, contact), success screen with "We understood:" extraction chips. No multi-step forms.
- Numbers always show source + as-of time. No names/photos of affected people. Not styled like an official/government source.
