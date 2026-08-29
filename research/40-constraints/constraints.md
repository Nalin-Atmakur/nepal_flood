# Constraints — the environment anything must survive

*Compiled 2026-08-29. EVIDENCED items carry refs; the rest are standing Nepal-context facts to validate in the field.*

## Connectivity & power

- 87 telecom towers down across the three worst districts; grid power out with the hydropower cascade destroyed (~430 MW offline); repeaters running on airlifted generators. EVIDENCED (→ ../sources/2026-08-27--onlinekhabar--telecom-status.md)
- Design consequence: **offline-first with sync-on-contact is mandatory**, and any "live" product must degrade gracefully to a downloadable, dated snapshot (PDF/GeoPDF/MBTiles) that travels on a phone via helicopter.
- Assume responders charge devices rarely; battery cost of any app matters.

## Devices & users

- Low-end Android dominates; iOS is the exception. Feature-phone SMS still matters for families.
- Responders are exhausted, working in rain, often wearing gloves; anything with a learning curve or login wall will simply not be used. Paper + WhatsApp/Viber are the incumbent "systems" to beat — and they mostly win.

## Language, script, names, dates

- Nepali (Devanagari) is the working language; affected populations include Tamang communities (upper Rasuwa), Tibetan speakers, plus 34 nationalities of tourists.
- **Name transliteration Devanagari ↔ Latin is the deduplication problem** for any person-adjacent data: one person, many spellings. (One reason we stay out of person data.)
- Bikram Sambat vs Gregorian: official documents mix both (2026-08-26 AD ≈ 2083-05-10 BS). Every date in shared data needs an explicit calendar.

## Geodata gotchas

- Pre-2017 datasets use VDC boundaries; current admin is palika/ward — joins break silently. Use OCHA COD P-codes.
- CRS: everything shared as WGS84 (EPSG:4326); Nepal grid data sometimes arrives in modified UTM — verify before differencing elevations (see elevation plan §5).
- Population rasters estimate *residents* (HRSL: 2016 vintage). This event's missing skew heavily toward transients — tourists, pilgrims, workers — invisible to every raster.

## Institutional

- Official warning chains are established (Army → CDO → NDRRMA for the 28 Aug breach). Volunteer outputs must feed people *inside* those chains, never broadcast around them.
- Tibet-side data flows only through Chinese state channels — plan for asymmetric information across the border.
