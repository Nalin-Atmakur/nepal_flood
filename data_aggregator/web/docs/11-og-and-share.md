# 11 · OG card and share links

```
  GET /api/og?lang=ne ──▶ app/api/og/route.tsx (Node runtime, next/og ImageResponse 1200×630)
        ├─ getOgNumbers()  figures_latest: NDRRMA dead / missing|out_of_contact / rescued · Nepal Police missing · v_live_counts.submissions_total
        ├─ fonts: Google Fonts CSS fetched with an old-browser UA → TTF (Baloo 2 800/600 incl. Devanagari, Press Start 2P) cached per isolate; renders without them if the fetch fails
        └─ Cache-Control: public, max-age=300, s-maxage=300, stale-while-revalidate=600

  every page ──generateMetadata──▶ lib/metadata.ts pageMetadata(lang, { title, path })
        ├─ metadataBase https://nepalfloodtracker.com · canonical · hreflang en / ne-NP / hi-IN / x-default
        ├─ openGraph.images = twitter.images = /api/og?lang=<lang>
        └─ title "<page> · Nepal Flood Tracker", description site.description
```

## 1. The card (OG Card.dc.html)

Logo circle + "Nepal Flood Tracker" + "Bhote Koshi · Trishuli — live picture, updated every {cadence}" + LIVE chip;
three big cards — dead (white) · out of contact (amber, note "NDRRMA · Police says N — see both") · rescued (green digits) —
each with "NDRRMA · as of {as_of}"; bottom row: "N people have added what they know" pill, the domain, and the language
pill with the requested language dark. When all NDRRMA figures are absent the numbers show "—" and the caption
"awaiting first data pull". Labels come from `og.*` keys; numbers use `fmtInt` (Latin digits).

## 2. Runtime note

The plan named the Edge runtime; Next 16 marks it deprecated, so the route runs on the Node runtime with the same
`ImageResponse` API (the only change is the export `runtime = "nodejs"`).

## 3. Share links (`lib/share.ts`)

`shareLinks({ url, lang })` → WhatsApp · X · LinkedIn · Telegram · Copy link, each with
`?utm_source=<network>&utm_medium=share&utm_campaign=nft_<lang>` added to the page URL (`withUtm`, keeps existing
params) and the per-language `share.text`. `ShareBar` (client) renders them as share pills; "Copy link" uses the
Clipboard API with a `prompt()` fallback and flips to "Copied" for 2 s. Used on the home page (`variant="full"`) and
the report success screen (`variant="compact"`).

## 4. Checking a preview (numbered)

1. `curl -s -o /tmp/og.png -w "%{content_type}\n" "https://nepalfloodtracker.com/api/og?lang=ne"` → `image/png`.
2. Open the PNG: three numbers and LIVE must be legible at 300 px wide; nothing essential in the outer 24 px.
3. Paste a page URL into a WhatsApp chat or an OG debugger; the card should show the live numbers of the last 5 minutes.
