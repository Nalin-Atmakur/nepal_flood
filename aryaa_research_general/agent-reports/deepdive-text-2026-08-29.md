# Deep-dive: TEXT CORPORA for the 26 Aug 2026 Langtang Lirung / Lhende Khola – Bhote Koshi – Trishuli debris flood

*Sweep performed 2026-08-29 (≈15:00–19:00 UTC). Every URL below was either fetched with curl/WebFetch during the sweep or is cited from a fetched index page. Counts are as observed on 2026-08-29 and will grow.*

Legend
- **Access**: RSS / API / scrape (plain HTML, no JS) / JS-only / paywall / login
- **Place-detail richness** 1–5: 5 = settlement/ward/site-level counts and times; 1 = national totals only
- **Reliability** A–F (A = wire/primary official; B = established outlet; C = partisan, aggregator or thin local; D = propaganda-adjacent; F = unusable)
- **Fetch-status**: [C] confirmed programmatically fetchable in this sweep · [R] restricted (key/registration/browser/login required or bot-blocked) · [U] untested / could not resolve from sandbox
- **PII**: flagged where a page carries named victims/missing/rescued. Nothing PII was extracted.

Note on tooling: the WebSearch budget for this session was exhausted after the first wave (≈40 queries); the remainder of the sweep (≈400 requests) ran via curl and WebFetch. Web Archive CDX and a few `.com.np` domains did not resolve from the sandbox (DNS/egress), so those are [U] rather than negative.

---

## 0. Headline findings (read this first)

1. **NDRRMA has an undocumented public REST API** behind its SPA: `https://ndrrma.gov.np/api/v1/publication/publications/`, `.../bulletin/bulletins/`, `.../pressnotenews/newsinfo/`, `.../pressnotenews/press-note/` (JSON, paginated `?limit=&offset=`; fields `date,title,title_ne,summary,description,pdffile`). It exposes the **Rasuwa Bhotekoshi Flood Situation Reports #4–#8** (PDF, twice-daily, per-district bodies, per-agency missing, per-hydropower missing, shelter counts by district, hospital counts, barrier-lake status) plus rescued/injured/foreign-citizen/missing lists (**PII**). This is the single best structured text stream for who/how-many/where. [C]
2. **ekantipur runs a Nepali live page** ("भोटेकोशी विपत्तिको चौथो दिन…", 364 sub-headlines, ~210k chars, timestamped) that names Timure 48×, Dhunche 27×, Rasuwagadhi 17×, Syabrubesi 13×, Mailung 13×, Gosaikunda 11×, Galchhi 9×, Betrawati 8×. It is plain HTML (no JS needed). [C]
3. **Google News RSS is the best free enumerator**: 92–100 items per query per language; `site:` and `when:` operators work (e.g. `site:kathmandupost.com flood` → 100 items). Devanagari-Nepali queries return nothing (no Nepali edition) – use outlet RSS instead. [C]
4. **GDELT DOC API works but is flaky and thin on Nepal**: "Rasuwa" 4-day window → 250 (cap; 140 EN / 109 Nepali). It indexes onlinekhabar, ratopati, ekantipur, annapurnapost, gorkhapatra but almost no Kathmandu Post/Himalayan Times. Many queries time out or 404. Use as a monitor, not a corpus. [C]
5. **ReliefWeb API v1 is decommissioned (HTTP 410) and v2 requires an approved `appname` (403)**; the RSS search feed works (20 items) and the HTML pages are scrapeable. [R] for API, [C] for RSS/HTML.
6. **Wikipedia is a heavily edited, cited cross-source timeline**: en "2026 Nepal floods" = 1,062 revisions / 280 editors in 4 days, 174 external links; Talk 324 revisions; separate "Timeline of the 2026 Nepal floods" article; zh article 277 revisions / 73 editors; Wikidata Q141182413 with 46 sitelinks. [C]
7. **Per-place richness is concentrated in ~6 sources**: NDRRMA sitreps, Kathmandu Post, Onlinekhabar (NP+EN), ekantipur, OCHA Flash Updates, Nepal Police notices. Everything international is national-total level except the Guardian interactive (Bidur/Mailung), AJ (Bidur/Betrawati/TUTH), Korea JoongAng (UT-1 head-counts) and Xinhua (Gyirong/Resuo village).
8. **Nepali outlets report missing people by *home district*** (Rolpa, Sindhupalchok, Morang, Kailali, Madhesh…) – a "who" dimension no international source has. INSEC, Ratopati, Gorkhapatra, Onlinekhabar EN carry these.

---

## 1. Nepal – English-language outlets

| Outlet | Event entry point | RSS / feed | Access | Volume on event (29 Aug) | Place-detail | Reliab. | Fetch |
|---|---|---|---|---|---|---|---|
| **Kathmandu Post** kathmandupost.com | tag pages `https://kathmandupost.com/tags/rasuwa-flood` and `/tags/bhotekoshi-flood` (10/page, paginate `?page=N`, ≥3 pages seen); search `https://kathmandupost.com/search?query=rasuwa` | `https://kathmandupost.com/rss` (40 items, 29 on event) – section feeds (`/national/rss`, `/feed`) do NOT exist | plain HTML, no JS, no paywall; articles 29–50 long paragraphs each | ≈50–60 articles 26–29 Aug (tag pages + RSS + Google News `site:` = 100 items) | **5** (Timure, Syabrubesi, Mailung, Betrawati, Galchhi, Dhunge Bazar, per-project tunnel counts, per-hospital) | A- | [C] |
| **The Himalayan Times** thehimalayantimes.com | tags `https://thehimalayantimes.com/tag/rasuwa-flood`, `/tag/bhotekoshi-flood` (25/page, `?page=N`; tag spans back to 2016 Tatopani floods – filter by date) | none working (`/rss` returns HTML, `/feed` 404) | HTML with browser UA; JSON-LD `articleBody` present (1.6k) | ≈25–40 event articles | 3 (Trishuli, Chitwan morgues, "400 workers in tunnels") | B+ | [C] |
| **Republica / myRepublica** myrepublica.nagariknetwork.com | homepage lists 27 event stories; `/tag/rasuwa-flood` sparse; search 404 | `/rss`, `/feed` → 403 (bot block) | article pages 200 with browser UA, ~9–10 long paragraphs | ≈30–40 | 3 (security-force missing breakdown 44 Army/41 Police/9 APF; UT-3A/3B tunnel ops; Kerung 3D map) | B+ | [C] pages / [R] feed |
| **Onlinekhabar English** english.onlinekhabar.com | tags `https://english.onlinekhabar.com/tag/rasuwa-flood` (≥5 pages) and `/tag/bhotekoshi-flood` (`/page/N`) | `https://english.onlinekhabar.com/feed` (20 items, all event) | WordPress, plain HTML | ≈60–80 (11 of top-100 Google News EN hits) | **5** (Timure sheds head-counts, Ghattekhola, Trishuli Bazar, Syafrubesi lake surge, 898 missing by hydropower project, "116 from Madhesh uncontacted") | B | [C] |
| **Setopati English** en.setopati.com | homepage only (11 event links); no tag/search | none (`/rss` 404) | article HTML fine (18 paras) though home is JS-heavy | ≈15–25 | 3 | B | [C] |
| **Khabarhub English** english.khabarhub.com | homepage; URL pattern `/2026/DD/NNNNNN/`; tag/search 404 | `https://english.khabarhub.com/feed/` (12 items, all event) | WordPress | ≈40–60 (7 of top-100 Google News hits) | 3 (403 tourists by nationality; APF drones/dogs; Syabrubesi landing) | B- | [C] |
| **The Rising Nepal** risingnepaldaily.com | homepage; `/news/NNNNN` | `https://risingnepaldaily.com/rss` (10 items, 5 event) | plain HTML (12 paras) | ≈30 (state daily; RSS-wire copy) | 3 (Timure girl rescue → Dhunche; Rasuwagadhi HEP; 669 bodies/2301 rescued tallies) | B (state) | [C] |
| **Nepalnews** english.nepalnews.com | homepage; search 404 | `https://english.nepalnews.com/rss` (=`/feed`, 12 items, all event) | WordPress | ≈40 (9 of top-100 Google News hits) | 2 | B- | [C] |
| **Nepal Live Today** nepallivetoday.com | — | `/feed/` 403 | Cloudflare 403 to curl | unknown | 2 | B- | [R] |
| **Radio Nepal Online** radionepalonline.com/en | `?s=rasuwa` search works (51 links) | `https://radionepalonline.com/en/feed/` (10 items, all event) | WordPress | ≈40 (state radio; Army tallies; NTC restoration) | 3 | B (state) | [C] |
| **RSS – Rastriya Samachar Samiti** (national news agency) | rssnepal.gov.np / rss.com.np | — | DNS failed from sandbox; its copy surfaces in Rising Nepal, Gorkhapatra, Radio Nepal, Nepalnews | — | 3 | B (state wire) | [U] |
| **Nepali Times** nepalitimes.com | `?s=rasuwa` (22 links) | `https://nepalitimes.com/feed` (30 items, 10 event) | plain HTML | ≈12 (drone-camera avalanche video, Byers interview, Reporter's Diary 27 Aug from Betrawati) | 4 | B+ | [C] |
| **Record Nepal** recordnepal.com | `?s=rasuwa` (4 links) | `/feed` is HTML | — | few | 2 | B | [C] |
| **Himal Southasian** himalmag.com | `?s=nepal+flood` (3) | `/feed/` (15 items, 0 event so far) | — | 0–1 | 1 | B+ | [C] |
| **NxtImagine live tracker** nepaldisasterupdatelive.nxtimaginelabs.com | `/nepal-flood/rasuwa/live-updates/` ("every update, newest first"), `/updates/2026-08-29-*` slugs, `/nepal-flood/rasuwa/damage/` | none seen | static HTML, cites source per update | ≈50 updates | 3 (source-attributed bullet stream: IPPAN 898, Police 669/2,362, NTB 187 tourists) | C+ (aggregator, provenance shown) | [C] |
| **flood-nepal.rabigorkhali.com.np** | JSON API (per repo) | — | static | ≈60 links | 2 | C | [C] |
| **Singhadarbar.com** | `/bhote-koshi-flood/` | — | HTML (31k chars) | 1 big running page | 3 (403 tourists by country) | C | [C] |
| **nirajbhusal.github.io/rasuwa-flood-bulletin** | single page, "13 Bhadau 18:30" stamp | — | static HTML, 246 paragraphs, tables | 1 | 4 (district tallies, rescue by location, Copernicus damage) | C+ (civil-society compilation citing NDRRMA/Police/MoHA/IFRC) – **contains extensive names of dead/injured/missing – PII** | [C] |

Survivor/per-place articles from this group are listed in §9.

---

## 2. Nepal – Nepali-language (Devanagari) outlets

| Outlet | Event entry point | RSS / feed | Access | Volume | Place-detail | Reliab. | Fetch |
|---|---|---|---|---|---|---|---|
| **Kantipur / ekantipur.com** | live page `https://ekantipur.com/news/2026/08/26/17877170054081721.html` ("चौथो दिन…", updated daily; 364 sub-headlines, 746 time tokens); homepage lists 55 dated event links; `/search?q=` is JS; `/tag/…` 404 | none (`/rss`,`/feed` return HTML) → use Google News `site:ekantipur.com बाढी` (100 items) or GDELT (12–47 hits/day) | plain HTML; articles 19 long paras; JSON-LD present (no body) | ≈80–120 in 4 days | **5** (district reporters: Timure, Dhunche, Haku, Mailung, Gosaikunda, Galchhi, Betrawati; tunnel per-project; interview/feature desks) | A-/B+ | [C] |
| **Nagarik** nagariknews.nagariknetwork.com | homepage (71 event links); search JS; sitemap index (17 sub-sitemaps) | `/rss` 404 | article HTML fine (9 paras) | ≈50 | 3 | B+ | [C] |
| **Setopati (Nepali)** setopati.com | homepage (67 event links); `/social/NNNNNN`, `/politics/`, `/kinmel/`; search JS | none | article HTML 17 paras | ≈50 | 4 ("7 minutes after Langtang collapse" video+satellite; tunnel-site identification; Pokhara/Ledo school; Trishuli bank safe) | B | [C] |
| **Onlinekhabar (Nepali)** onlinekhabar.com | homepage (94 event links, 74 dated Aug); `?s=रसुवा` search works (21); tag pages 404 | `https://www.onlinekhabar.com/feed` (**55 items, 44 event**) – highest-volume feed found | WordPress; articles 30–55 paras | ≈120–150 in 4 days | **5** (Betrawati ×20 in one piece; school group 40–50 safe/15 awaiting; villages cut off; tunnel counts by project) | B | [C] |
| **Ratopati (Nepali)** ratopati.com | homepage (94 event links); `/search?q=रसुवा` works (19); `/story/NNNNNN/slug` | `/rss` returns HTML; **English** `https://english.ratopati.com/rss` works (30 items, 19 event) | article HTML (long) | ≈100 (GDELT: 40 hits/4 days) | 3 (home-district missing counts: Morang 15, Madhesh 22; APF divers at Timure; DAO rescued list → **PII**) | B- | [C] |
| **Ujyaalo Online** ujyaaloonline.com | homepage (35 links); search JS | `https://ujyaaloonline.com/feed` (5 items) | article body JS-rendered (only 328 chars via curl) → needs headless or their JSON | ≈40 | 2 | B (radio network; audio not exposed on page) | [R] body / [C] feed |
| **BBC Nepali** bbc.com/nepali | homepage (19 event links; topic page 404) | `https://feeds.bbci.co.uk/nepali/rss.xml` (33 items, 14 event) | article HTML 27 paras | ≈15–20 | 4 (mass burial Chitwan/Nawalparasi; hospital pressure; "rescue harder than 2015 quake"; 7,000+ students affected; **explainer on why reports were confusing** `articles/ce302w7e889o`) | A- | [C] curl (WebFetch tool is blocked on bbc.com) |
| **Annapurna Post** annapurnapost.com | homepage (46 links); `/search?q=रसुवा` (8); `/story/NNNNNN` | `https://annapurnapost.com/rss` (20 items, 17 event) | HTML 7 paras | ≈60 (GDELT 8) | 3 (Nuwakot relatives waiting; 550 rescued incl. 54 foreigners Sat; 6,000 police) | B | [C] |
| **Gorkhapatra** gorkhapatraonline.com | **category page `https://gorkhapatraonline.com/categories/bhotekoshi-fast-flood`** (26 links/page, `?page=2`) | `https://gorkhapatraonline.com/rss` (10 items, 8 event) | HTML 15 paras | ≈50 (state daily) | 3 (Kailali 23 in contact; Gorkha 29 bodies at Bunkot ghat) | B (state) | [C] |
| **Nepal Samacharpatra / newsofnepal.com** | homepage (46 dated links) | `https://newsofnepal.com/feed/` (12 items, 8 event) | HTML 10 paras | ≈40 | 3 (Chitwan +26 bodies; Nawalparasi community-forest burial) | B- | [C] |
| **Nepalpress** nepalpress.com | homepage (56 dated links); `?s=रसुवा` (186 links) | WordPress → `/feed` likely [U] | HTML 14 paras | ≈80+ | 3 | B- | [C] |
| **Nepalkhabar** nepalkhabar.com | homepage (48 dated links) | [U] | HTML | ≈50 | 3 (Timure survivor bank manager – **name in headline, PII**) | B- | [C] |
| **Thahakhabar** thahakhabar.com | homepage (53 links); `/detail/NNNNNN` | [U] | HTML | ≈40 | 3 (Timure girl rescue after 60 h) | C+ | [C] |
| **Deshsanchar** deshsanchar.com | homepage (47 dated links) | [U] | HTML 7 paras | ≈40 | 2 | C+ | [C] |
| **Imagekhabar** imagekhabar.com | homepage (40 links) | [U] | HTML | ≈40 | 3 (sex/age breakdown of 669 dead; UT-3B ops) | C+ | [C] |
| **Kantipur TV** kantipurtv.com | homepage (13 dated links) `/news/2026/08/29/…` | [U] | HTML | ≈15 | 3 (hospital survivors; Kathmandu search) | B | [C] |
| **Himalkhabar / Nayapatrika** | homepages | — | little event content surfaced | low | 2 | B | [C] |
| **Hamro Patro** hamropatro.com | news aggregator (20 of 40 Google-News-NP items) | — | — | aggregator of the above | 2 | C | [U] |
| **INSEC Online** inseconline.org | `?s=भोटेकोशी` → 19-item running series (`/main_news/NNNNNN/`) | [U] | HTML | 19+ | **4** (per-home-district missing: Rolpa 28→4 found; Sindhupalchok 234 incl. a ward chair; Madhesh 22 found; 14 hospitals treating; Nuwakot DAO rescued list → **PII**) | B (human-rights monitor, careful sourcing) | [C] |
| **Local – Bidur Khabar** bidurkhabar.com (Nuwakot) | `/archives/54968` "नुवाकोटमा बाढीको ताण्डव : बगर बने बस्तीहरू" | WordPress `/feed` [U] | HTML 10 paras | ≈5 | 3 (Devighat, Bidur settlements) | C | [C] |
| **Local – Dhading Post** dhadingpost.com | homepage (12 dated links; mostly donations, safe-looting arrests) | [U] | HTML | ≈8 | 2 | C | [C] |
| **Local – Rasuwa outlets** (rasuwakhabar.com, rasuwaonline.com, langtangkhabar.com, rasuwapost.com, hamrorasuwa.com, nuwakotkhabar.com, trishulikhabar.com, chitwanpost.com) | — | — | none resolved from sandbox | — | — | — | [U] – Rasuwa-level reporting is instead reaching national outlets' district correspondents (ekantipur/Onlinekhabar/Ratopati "रसुवा" datelines) and Facebook |
| **Local govt** daorasuwa.moha.gov.np | page "भोटेकोशी बाढी (भाद्र २०८३)" `https://daorasuwa.moha.gov.np/page/bha-ta-ka-sha-b-dha-bha-tha-ra` + notices `/post/sa-cana-bha-ta-ka-sha-b-dha-gata` (PDF) + "Rasuwa Hospital treatment list" page | — | HTML/PDF | ~5 docs | 4 | A (primary) – **PII in treatment/rescued lists** | [C] |
| **Local govt** daonuwakot.moha.gov.np | "मिति २०८३ भदौ … सम्म उद्धार गरिएका व्यक्तिहरुको विवरण" post | — | HTML/PDF | 1–3 | 4 | A – **PII** | [C] |
| Rural municipality sites (gosaikundamun, uttargayamun, naukundamun, kalikamun) | reachable but no event notices found | — | — | 0 | — | — | [C] (empty) |

Pattern worth exploiting: Nepali headlines routinely encode *(place) + (count) + (status)*, e.g. "रसुवामा हराएका कैलालीका २३ जना सम्पर्कमा", "मोरङका १५ सम्पर्कविहीन, तीन जनाको उद्धार", "टिमुरेमा सशस्त्रको गोताखोर टोली परिचालन". A headline-only extractor over the RSS/homepage streams already yields most of the who/where/status facts.

---

## 3. China / Tibet – Chinese-language and Tibet-focused

| Outlet | Event entry point | Feed / API | Access | Volume | Place-detail | Reliab. | Fetch |
|---|---|---|---|---|---|---|---|
| **Xinhua (新华网)** news.cn | series e.g. `https://www.news.cn/politics/20260828/3223c142e4c54bb8ac5251780a1b6c54/c.html` ("四大关切"), `/local/20260828/0667fe…` (救援现场见闻), `/politics/20260829/7191d9ad…` (新华视点) | site search `so.news.cn` → **405 anti-bot page** [R]; no RSS; Google News ZH surfaces 13–15 news.cn items per query | article HTML plain, 12 paras | ≈40–60 | 3 (Gyirong Port, Resuo village, G216 road, barrier lake 2.5M m³; 5→7 dead, 558→554 missing; 555 tourists evacuated, 499 sheltered) | B (state; authoritative for Tibet-side numbers) | [C] |
| **Xinhua English** english.news.cn | `/asiapacific/index.htm` (4 event links); article e.g. `/20260829/3c732ff0…/c.html` (Gyirong evacuations), `/20260828/03238a4c…/c.html` (survivor feature – body not in `<p>`, needs different extractor) | `english.news.cn/rss/*` 404; Google News `site:english.news.cn Nepal` → 100 | HTML | ≈40 (also relays NDRRMA totals: 579/1,924 → 675/2,498) | 3 | B | [C] |
| **People's Daily (人民网)** people.com.cn | **search API works**: `POST http://search.people.cn/search-platform/front/search` `{"key":"吉隆口岸","page":1,"limit":10,...}` → 37,596 all-time hits; event items 26–29 Aug on society/pic/xz sub-sites (`xz.people.com.cn/n2/2026/0829/…`) | JSON API | HTML 10 paras | ≈30 | 3 (upstream barrier lake, road clearing, 水电九局 deployment) | B (state) | [C] |
| **CCTV / CGTN** | `search.cctv.com/search.php?qtext=吉隆` (52 term hits) ; CGTN search JS; CCTV article pages contain no `<p>` (JS) ; `api.cntv.cn/NewSearch` 404 | — | JS-only | ≈20 | 2 (CCTV: 7 dead / 554 missing figure cited by Wikipedia) | B (state) | [R] |
| **Global Times** globaltimes.cn | `/china/society/` list (25 event links) e.g. `/page/202608/1369307.shtml` (7 dead 554 missing), `1369273` (barrier lake), `1369215` (PowerChina-1 SAR), `1369173` (≈100 Chinese nationals missing on Nepal side) | `https://www.globaltimes.cn/rss/outbrain.xml` (50 items, 0 event – stale) | HTML 4 paras | ≈15 | 2 | C+ | [C] |
| **The Paper (澎湃)** thepaper.cn | **search API works**: `POST https://api.thepaper.cn/search/web/news` `{"word":"吉隆口岸","pageNum":1,"pageSize":10,...}` → **239 results**; article `newsDetail_forward_33971014` (why rescue is so hard: disaster chain), `33972765` (地灾国重实验室 preliminary report: ice-rock collapse lasted ≈88 s) | JSON API | HTML pages 403 to curl; API only | ≈240 | 3 – **some headlines name individual missing/safe officers – PII** | B | [C] API / [R] HTML |
| **Caixin** caixin.com | search returned nothing (JS); 1 photo item via Google News | — | JS/paywall | ≈2 | 1 | B+ | [R] |
| **Beijing News (新京报)** bjnews.com.cn | 7–14 items per Google News ZH query (淤泥厚1.5米 etc.) | — | DNS fail from sandbox | ≈15 | 3 | B | [U] |
| **China News Service (中新网)** chinanews.com.cn | 7–9 items per query | search 404 | HTML | ≈15 | 2 | B | [C] |
| **tibet.cn (中国西藏网)** | `/cn/in/jszg/202608/t20260829_8039739.html` (7 dead 554 missing), 【吉隆平安】 series (drones, PLA medics, power), Li Qiang on site | — | HTML | ≈15 | 2 | C+ (state) | [C] |
| **Tibet Daily (西藏日报 / xzxw.com)** | DNS fail; 1 item via Google News | — | — | — | 2 | C+ | [U] |
| **Gyirong County govt** jilong.gov.cn | reachable; link list shows no event notices (news-index pages generic) | — | HTML | 0 seen | — | A (primary) | [C] (no event content found) |
| **Shigatse / Xizang govt** rikaze.gov.cn, xizang.gov.cn, wlt.xizang.gov.cn (tourism dept) | reachable; 1–2 items via Google News | — | HTML | few | 2 | A | [C] |
| **MEM (应急管理部)** mem.gov.cn | 1 item via Google News; site pages generic | — | HTML | 1–3 | 2 | A | [C] |
| **Weibo** s.weibo.com `#吉隆口岸泥石流#` | login wall ("Sina Visitor"/passport) | — | login | — | — | — | [R] |
| **Sina / ifeng / sohu / 163 / guancha / cnr / stdaily / gmw** | mirror Xinhua/新京报 copy; ifeng `c/8vxZZqJ8beq` (5 dead 558 missing) fetchable | — | HTML | dozens | 2 | C+ | [C] |
| **cn.nytimes.com** | 3 items ("中国信息管控或阻碍西藏洪水救援") | — | HTML | 3 | 2 | A- | [C] |
| **BBC 中文 / RFI / DW 中文 / 联合早报 / 8world / RTHK** | 5–18 items each in Google News ZH | — | HTML | ≈40 | 2 | A-/B | [C] |
| **RFA Tibetan** rfa.org/tibetan | 3 event articles (26, 28, 29 Aug) e.g. `/tibetan/tibet/2026/08/29/death-toll-rises-in-kyirong-mudslide…` (38 paras) | — | HTML | 3 | 2 | C+ | [C] |
| **VOT (Voice of Tibet)** vot.org / cn.vot.org | 429 rate-limited; 2 items via Google News | — | — | 2 | 2 | C | [R] |
| **Phayul / tibet.net (CTA)** | 3–4 items each | — | HTML | ≈5 | 1 | C | [C] |
| **NTDTV / Epoch Times (大纪元)** | `ntdtv.com/gb/2026/08/27/a104127642.html` (558 missing, "project office unaccounted"), `epochtimes.com/gb/26/8/28/n14838321.htm` (30-country missing table) | — | HTML | ≈10 | 2 | D (partisan; useful only for censorship claims, cross-check everything) | [C] |

Access note: Wikipedia's "Media coverage and access" section (cited to Guardian/NYT/Conversation) records that foreign journalists were refused entry to the Tibet side and that resident/CCTV footage was removed from Chinese platforms; expect the Tibet-side corpus to be official-only.

---

## 4. India – English and Hindi

| Outlet | Event entry point | Feed | Access | Volume | Place-detail | Reliab. | Fetch |
|---|---|---|---|---|---|---|---|
| **Times of India** | topic pages `/topic/nepal-floods`, `/topic/rasuwa` (28 links) | — | article HTML has no `<p>` but JSON-LD `articleBody` (3.4k) | ≈40 | 2 (Indian pilgrims by state; MEA helplines) | B- | [C] |
| **Hindustan Times** | `/topic/nepal-floods` → 410; article search 404 | — | paywall markers | unknown | 2 | B | [R] |
| **Indian Express** | `/about/nepal-floods/` (15 links); e.g. morgues/unidentified piece; `nepal-tibet-floods-over-1300-missing-foreign-tourists-indians-10851968` | — | HTML 22 paras + JSON-LD 11k; soft paywall | ≈25 | 2 | B+ | [C] |
| **The Hindu** | `/topic/nepal-floods/` (1 link); live-updates article `…/nepal-floods-live-updates-august-27-2026/…` 18 paras | — | soft paywall | ≈15 | 2 | A- | [C] |
| **NDTV** | topic and articles → 403 | — | bot-blocked | ≈20 (5 in Google News) | 2 | B | [R] |
| **Tribune India** | `/topic/nepal-floods` (11 links); Isha-group survivor piece (`/news/china/how-a-tea-break-saved-28…`) 13 paras + JSON-LD | — | HTML | ≈20 | 3 (survivor narrative, border bridge) | B | [C] |
| **ANI** aninews.in | `/topic/nepal-flood/` (21 links); relays NDRRMA numbers fastest (20 GDELT hits/4 d) | — | HTML 10 paras | ≈40 | 2 | B- (wire) | [C] |
| **PTI** ptinews.com | search JS; copy visible via Business Standard, Deccan Herald, The Federal, Kashmir Observer, IANS-live | — | JS | — | 2 | B (wire) | [R] direct / [C] via syndication |
| **Amar Ujala (Hindi)** | tag `/tags/nepal-flood` (77 links, 72 dated Aug); **Hindi live blog** `/live/world/nepal-flash-floods-live-updates-…-2026-08-29` | — | HTML 7 paras + JSON-LD; soft paywall marker | ≈30 | 2–3 (Agra BKU group, Himachal workers, Gandak bodies into UP) | C+ | [C] |
| **Dainik Jagran (Hindi)** | `/topics/nepal-floods` (JS list; 19+11+9 items in Google News HI) | — | HTML | ≈40 | 2 | C+ | [C] |
| **Dainik Bhaskar (Hindi)** | topic 404; 12 items in Google News HI | — | HTML | ≈15 | 2 | C+ | [U] |
| **Aaj Tak (Hindi)** | `/topic/nepal-flood` (3 links) but 17+14+5 items in Google News HI; article 17 paras (133 Indians missing) | — | HTML | ≈35 | 2 | C+ | [C] |
| **Prabhat Khabar / India TV / ABP / NBT / ETV Bharat / News18 / Live Hindustan / ThePrint Hindi / Jansatta / DD News / PTI Bhasha** | all surface in Google News HI (2–9 items each) | — | HTML | ≈60 combined | 2 (Kolkata 32-member group; helpline numbers) | C/C+ | [C] via Google News |
| **Scroll / The Wire / ThePrint** | Scroll topic 5 links; others empty/JS | — | HTML | few | 1 | B | [C] |
| **Indian Embassy Kathmandu** indembkathmandu.gov.in | 57 term hits, 14 event links (advisory/helpline) | — | HTML | ≈3 | 2 | A | [C] |
| **MEA** mea.gov.in/press-releases.htm | list is JS (0 hits) | — | JS | — | — | A | [R] |
| **Bihar FMIS / CWC** fmiscwrdbihar.gov.in (reachable, 5 hits), ffs.india-water.gov.in (DNS fail) | — | — | HTML | — | 2 (Gandak/Valmikinagar) | A | [C]/[U] |

---

## 5. International wires, broadcasters, live blogs

| Outlet | Event entry point | Feed / API | Access | Volume | Place-detail | Reliab. | Fetch |
|---|---|---|---|---|---|---|---|
| **AP** apnews.com | hub `https://apnews.com/hub/nepal` (22 event links); e.g. `/article/nepal-china-flood-rescue-fde34c83…`, `/article/nepal-china-tibet-floods-missing-14d80166…` | — | HTML fine via curl (WebFetch tool blocked) | ≈15 | 3 (Nuwakot, Devighat, Gyirong, Langtang) | A | [C] |
| **Reuters** | `/world/asia-pacific/` and articles → **401** | — | bot-blocked | ≈15 | 2 | A | [R] direct; copy via Cyprus Mail, Yahoo, Straits Times, Korea Times [C] |
| **AFP** | france24.com tag → 403; AFP fact-check → 403; copy via Yahoo News, The Star (MY) | — | bot-blocked | ≈15 | 2 | A | [R]/[C] via syndication |
| **BBC News live** | `https://www.bbc.com/news/live/cr0qxd1y219kt` (posts 27 Aug 22:08 → 29 Aug 16:51 UTC; 123 long paragraphs; single page ID, 53 self-references) | — | curl OK; WebFetch tool blocked on bbc.com | 1 live page + ≈12 articles (12+3 cited by Wikipedia) | 2 | A | [C] |
| **Guardian** | live blogs `https://www.theguardian.com/world/live/2026/aug/28/nepal-tibet-flash-floods-hundreds-dead-missing-day-three-live-updates` and `/world/live/2026/aug/29/nepal-tibet-floods-latest-updates-death-toll-missing-search-and-rescue` (65 long paras); interactive `/world/ng-interactive/2026/aug/28/the-flood-took-everything-i-have-…` (Bidur ×8, Mailung ×2); `/world/nepal` lists 17 dated event items; **Open Platform API**: `content.guardianapis.com/search?q=nepal flood&from-date=2026-08-25&api-key=test` → 429 on shared test key → get a free key | HTML plain | ≈20 + 2 live | 3 | A- | [C] pages / [R] API key |
| **CNN live** | `https://www.cnn.com/2026/08/26/world/live-news/nepal-flash-flooding-floods-intl` (26 Aug 09:15 → 28 Aug 04:16 UTC; 6.2 MB) and `/2026/08/28/world/live-news/nepal-china-flood` (28 Aug 03:44 → 29 Aug 05:17; 118 long paras) | — | curl OK; WebFetch tool gets 451 (geo) | 2 live + articles | 2 | B+ | [C] |
| **NBC live** | `…/live-blog/live-updates-massive-flash-flood-nepal-tibet-border-hundreds-missing-rcna594643` (27→28 Aug) and `…-rcna594833` (28→29 Aug; 187 long paras, 36k chars) | — | curl OK; WebFetch 403 | 2 live | 2 (nationality lists) | B+ | [C] |
| **ABC Australia live** | `https://www.abc.net.au/news/2026-08-29/death-toll-rises-as-rescuers-work-through-flood-devastation/107092742` ("as it happened", ≈67 timestamped posts 02:43–20:52 AEST) + 28 Aug blog; topic `/news/topic/nepal` (22 dated links) | — | HTML | 2 live + ≈15 | 2 (Australians missing; Sydney family) | B+ | [C] |
| **Al Jazeera** | `/where/nepal/` (18 dated links): explainers 27–28 Aug, "Swept away" 27 Aug (Bidur, Betrawati, Trishuli Secondary School, Trauma Center), "families pray for miracles" 28 Aug (TUTH), photo gallery (Trishuli, Devighat) | — | HTML 23 paras | ≈12 | 3 | B+ | [C] |
| **NYT** | `/topic/destination/nepal` lists 7 event pieces (survivors 28 Aug; hydropower 900 workers missing; glacier visual) | — | 403 to curl; paywall | ≈8 | 3 | A- | [R] |
| **SCMP** | `/topics/nepal` (24 links); tunnel article 6 paras + JSON-LD 3.4k | — | soft paywall | ≈15 | 2 | B+ | [C] partial |
| **CBS / ABC US / Fox Weather / USA Today / LA Times / Newsweek / Time** | CBS `…/nepal-flood-rescue-efforts-death-toll/` 48 paras (Timure, Gyirong, UT-1); ABC US `story?id=136022919` (Nuwakot, Devighat); Time → 406 | — | HTML | ≈25 | 2 | B+ | [C] (Time [R]) |
| **UN News** | 4 stories `news.un.org/en/story/2026/08/1168208 … 1168227` (UN-SPIDER, "immense impact") | tag page `/en/tags/nepal` | HTML 25 paras | 4 | 2 | B+ | [C] |
| **Yonhap (EN)** en.yna.co.kr | search JS; article `view/AEN20260827002500315` 5 paras | — | HTML | ≈10 | 2 | B+ | [C] |
| **Korea JoongAng Daily / Korea Times** | JoongAng `…/9-korean-workers-unaccounted-for…/12846550` (UT-1: Doosan 20 assigned/15 present/5 unaccounted; KOEN 7/3; ≈200 staff evacuated) 19 paras; `…/12847627`, `…/12847739` (UT-1 >90 % destroyed) | — | HTML | ≈8 | 3 (UT-1 site) | B | [C] |
| **Bernama / Malay Mail / FMT / The Star (MY)** | Bernama search 400; Malay Mail lists (51 Malaysians – **names published – PII**) `…/233000`; The Star Malaysian group piece | — | HTML | ≈15 | 1–2 | B | [C] |
| **Straits Times / Inquirer / Daily Star (BD) / Gulf News / The National (UAE)** | Daily Star nationality list `…/4257576` (37 paras); The National tour-operator piece | — | HTML | ≈10 | 2 | B | [C] |
| **NHK World** | search/tag JS (0 hits); cited ×2 by Wikipedia | — | JS | ≈3 | 2 | B+ | [R] |
| **DW / France24 / Euronews / RNZ / Global News / Spiegel** | DW topic 404; Euronews video page; cited in Wikipedia/Timeline | — | mixed | ≈10 | 1–2 | B+ | [U]/[C] |
| **Kashmir Observer / The Federal / IANS** | AP/PTI survivor copy (Timure ×5, Bidur ×2) | — | HTML | ≈6 | 3 | C+ (syndication) | [C] |

---

## 6. Official document streams (highest-value structured text)

| Source | What / where | Cadence & volume | Content richness | PII | Fetch |
|---|---|---|---|---|---|
| **NDRRMA REST API** `https://ndrrma.gov.np/api/v1/publication/publications/?limit=80` | 327 publications; **16 event items 27–29 Aug**: *Rasuwa Bhotekoshi Flood Situation Report* #4, #5, #6 (27 Aug), #7 (28 Aug), **#8 (29 Aug 18:30)** – PDFs at `https://ndrrma.gov.np/mediafiles/publications/…`; Nepali "खोज, उद्धार तथा राहत अपडेट" twice daily (08:30/10:00/11:00 AM); Mobilization Team; relief-materials notice | ~4/day | **5** – SR#8: bodies by district (Rasuwa 13, Nuwakot 51, Dhading 45, Gorkha 57, Nawalparasi E 165, Nawalparasi W 63, Tanahun 35, Chitwan 246 = 675); missing 2,498 by category (Police 27, Army 45, APF 13, customs 15, immigration 4, Rasuwa DEOC 562, Nuwakot DEOC 115, hydropower 933, Makwanpur 65, Nepali tourists 127, Langtang NP 3, foreign tourists); shelters (Nuwakot 15 sites / 2,318 people; Rasuwa 12 sites / 1,270); 16 health facilities / 224 treated; 198 telecom towers (145 restored); barrier lake 0.11 km² ≈18 km above Rasuwagadhi | sitreps: no; **the same feed carries "Details of Nepali and Foreign Nationals Missing" (27 Aug), "List of Rescued Foreign citizens" (28 Aug), DAO Rasuwa/Nuwakot rescued lists, airlifted-persons list, injured-in-Kathmandu list – all PII**; SR#8 also points to `ndrrma.gov.np/np/rescue` (verified rescued names – PII) | [C] |
| NDRRMA `…/api/v1/bulletin/bulletins/` | 2,299 Daily Disaster Bulletins (PDF `pdffile`); 26 & 27 Aug present | daily | 3 (national incident table) | no | [C] |
| NDRRMA `…/api/v1/pressnotenews/newsinfo/` | 235 news items; 5 event items 27–29 Aug (HTML body: relief cash to 15 local levels; Army tunnel team; 3 relief collection points; private helicopters under govt coordination; flood-risk alert) | ~2/day | 3 | no | [C] |
| NDRRMA `…/api/v1/pressnotenews/press-note/` | 64; none for this event yet | — | — | — | [C] |
| **BIPAD portal API** `https://bipadportal.gov.np/api/v1/incident/?incident_on__gt=…&expand=loss` | 96 incidents nationally 26–29 Aug; hazard ids Flood 11 / Landslide 17 / Avalanche 3; ward-level titles with `loss` counts | continuous | 4 in principle – **but the main event's losses are NOT yet entered** (only small Dhading/Gajuri flood incidents with 0–2 injured) | no | [C] |
| **Nepal Police** nepalpolice.gov.np | notice `/news/10273/` (13 Bhadra): body-management protocol + **bodies by district (669 on 29 Aug)**; Flash Updates box; `udb.nepalpolice.gov.np` unidentified-bodies & missing-persons database | daily | 4 | UDB = **PII** | [C] |
| **MoFA Nepal** mofa.gov.np | numbered daily "Latest Updates on Flash Floods" 26/27/28 Aug (`/content/1863/…`) with 33-country missing/found table, Emergency Control Room hotlines | daily | 3 (nationality) | no | [C] |
| **DAO Rasuwa / DAO Nuwakot** | see §2 | ad hoc | 4 | **PII** lists | [C] |
| **Nepal Army** disaster.nepalarmy.mil.np / nepalarmy.mil.np/news | not updated for this event (last item Oct 2024); Army tallies reach the corpus via Radio Nepal, RSS wire, PM office, NDRRMA sitreps | — | — | — | [C] (stale) |
| **APF** apf.gov.np | PDFs under `api.apf.gov.np:8443/storage/uploads/news/pdf/` (hospital notices); nothing event-specific surfaced | — | 1 | — | [C] |
| **OPMCM (PM office)** opmcm.gov.np | relief-fund appeal `/content/586/heartfelt-appeal/`; PM statements syndicated via RSS wire | — | 1 | — | [C] |
| **MoHA** moha.gov.np | post on unidentified/unclaimed body management | — | 2 | — | [C] |
| **OCHA – Rasuwa Flood Flash Update #1–#3** via ReliefWeb (`/report/nepal/nepal-rasuwa-flood-flash-update-3`, 28 Aug; infographic PDF 144 KB) | daily | **4** – NEOC bodies by district (538 on 28 Aug: Chitwan 221, Nuwakot E 134, Gorkha 46, Kavre 37, Dhading 34, Tanahun 28, Nuwakot W 27, Rasuwa 12), missing 977 (105 security/customs/immigration…), 3,742 rescued, 12,249 personnel, 15 helicopters, 5 displacement sites in Nuwakot (>1,000 people / cap 1,350), 13 municipalities in 4 districts, 45 km corridor damaged, 2,732 ha farmland | no | [C] |
| **UN RC/HCT "Nepal Flood Response Situation Report #1"** (27 Aug), **"Rapid Situation Overview"** (27 Aug, PDF 671 KB: 42 km Betrawati–Rasuwagadhi road destroyed, timeline of toll revisions), **WFP sitrep** (27 Aug), **IRDR Rapid Analysis** (scientific anatomy), **"Nepal: Deadly Flash Floods – No.1"** (ECHO/others) | 19 ReliefWeb items 27–28 Aug (RSS `https://reliefweb.int/updates/rss.xml?search=rasuwa`) | 3–4 | no | [C] |
| **IFRC GO API** `https://goadmin.ifrc.org/api/v2/event/8073/` | event "Nepal: Rasuwa Flash Flood, 2026" (glide FF-2026-000162-NPL), DREF **MDRNP022** CHF 18 M, field report 18558 (26 Aug); DREF document via appeal_document endpoint | ad hoc | 3 | no | [C] |
| **Nepal Red Cross** nrcs.org | Situation Updates 1–3 PDFs `https://website-api.nrcs.org/media/highlights/files/Rasuwa_Situation_Update_3.pdf` (28 Aug: hospital bed allocations, warehouses at TIA/Battar/Baireni, RFL help desk Chitwan) | daily | 3 | no | [C] |
| **GDACS** | FL1104124 Orange (`gdacs.org/report.aspx?eventid=1104124`), RSS 469 items | — | 1 | no | [C] |
| **HDX** | 18 datasets for "nepal flood rasuwa 2026" (UNOSAT ×3, HOT ×4, Copernicus EMSR927, Microsoft, HeiGIT, GLIDE, IDMC) – geodata not text | — | — | no | [C] |
| **Embassies / advisories** | US Embassy Kathmandu (21 event links; State Dept advisory page 403 [R]); UK FCDO `gov.uk/foreign-travel-advice/nepal` (66 term hits); Canada travel.gc.ca; DFAT smartraveller DNS fail [U]; Japan MOFA anzen page no hit | — | 1–2 | no | mixed |
| **DPNet** dpnet.org.np | resource centre – nothing for this event yet (2025 GLOF sitrep #1 only) | — | — | — | [C] |
| **ICRC familylinks** familylinks.icrc.org | no Nepal 2026 page yet | — | — | — | [C] (empty) |

---

## 7. Aggregators, APIs, reference — tested results

| Service | Test performed (2026-08-29) | Result | Verdict / Fetch |
|---|---|---|---|
| **GDELT DOC 2.0** `api.gdeltproject.org/api/v2/doc/doc?query=…&mode=artlist&maxrecords=250&format=json&timespan=…` | `"Rasuwa flood"` 7d → **146** articles (100 % English; top: nepalnational.com 5, thestar.com.my 4, indiagazette 4, aninews 3 … kathmandupost only 2). `Rasuwa` 4d → **250 (cap)**: English 140 / Nepali 109 / Hindi 1; onlinekhabar.com 47, ratopati.com 40, aninews 20, ekantipur 12, webindia123 10, annapurnapost 8. `sourcecountry:NP flood` 4d → **192** (nepalnational.com 125, peoplesreview.com.np 19, onlinekhabar 11, spotlightnepal 7, reviewnepal 7, ratopati 6, ekantipur 5, gorkhapatra 4, nepalitimes 4). `Rasuwa sourcelang:hindi` → 9; `sourcelang:chinese` → 0. Unquoted multi-word and `Bhotekoshi`, `Gyirong`, `timelinevol`, TV API → 404/timeouts repeatedly. | Works but flaky; misses KP/THT/Republica/Setopati; caps at 250. Monitor-only. [C] |
| **ReliefWeb API** | v1 → HTTP 410 "decommissioned, use v2"; v2 `api.reliefweb.int/v2/reports?appname=nepalflood…` → 403 "not an approved appname" | Register appname at apidoc.reliefweb.int → [R]. RSS `reliefweb.int/updates/rss.xml?search=rasuwa` → 20 items [C]; disaster page ff-2026-000162-npl + updates search (19 links) scrapeable [C] |
| **Wikipedia** (MediaWiki API) | en "2026 Nepal floods": **1,062 revisions, 280 editors** (26 Aug 207 / 27 Aug 391 / 28 Aug 316 / 29 Aug 148), latest 79,589 bytes, first rev 26 Aug 06:01 UTC; 174 external links (kathmandupost 22, bbc 15, news.cn 12, nytimes 5, reuters 5, guardian 5, apnews 3, cnn 3, onlinekhabar 3, nepalnews 3, thehimalayantimes 3…); sections incl. Casualties, Response, "Media coverage and access". Talk page 324 revs / 121 editors. "Timeline of the 2026 Nepal floods": 34 revs / 9 editors / 19.7 KB, day-by-day sections, 25 links (reliefweb 4). Pageviews 73,789 / 233,005 / 174,663 (26/27/28 Aug). zh "2026年中尼边境泥石流灾害": 277 revs / 73 editors / 38.5 KB. ne "२०८३ रसुवा बाढी": 4 revs / 10.4 KB. hi "२०२६ नेपाल बाढ़" exists. **Wikidata Q141182413**: 33 labels, **46 sitelinks**, 22 claims. Commons `Category:2026 Nepal and Tibet floods`. Wikinews: nothing. | Excellent curated timeline + citation graph; revision stream usable as change-detector. [C] |
| **Google News RSS** `news.google.com/rss/search?q=…&hl=…&gl=…&ceid=…` | EN: "Rasuwa flood" 100 (99 event), "Bhotekoshi" 100, "Trishuli flood" 92, "Gyirong" 92, "Rasuwagadhi" 98, "Langtang flood" 53, "Nepal flood tunnel" 100; `site:kathmandupost.com flood` 100, `site:thehimalayantimes.com` 100, `site:myrepublica…` 100, `site:english.news.cn Nepal` 100, `site:ekantipur.com बाढी` 100, `when:2d` works. HI (hl=hi,gl=IN): "नेपाल बाढ़" 102, "रसुवा बाढ़" 100. ZH (hl=zh-CN): "吉隆口岸" 92, "尼泊尔 洪水" 92, "吉隆 泥石流" 92. NP edition (hl=ne): 40 items but English sources; Devanagari-Nepali queries → 0. | Best free enumerator (100/query cap; source domain + title + pubDate; links are redirectors). [C] |
| **Bing News RSS** `bing.com/news/search?q=…&format=rss` | 12 items (EN), 6 (ZH) | Low value. [C] |
| **NewsAPI.org** | `apiKeyMissing` | [R] |
| **MediaCloud** | 401 | [R] |
| **Guardian Open Platform** | 429 on shared `api-key=test` | free key needed [R] |
| **IFRC GO API** | see §6: event 8073, DREF MDRNP022 CHF 18 M | [C] |
| **GDACS API** | `gdacsapi/api/events/geteventlist/SEARCH?eventlist=FL&country=Nepal…` → 1 feature FL1104124 Orange | [C] |
| **HDX CKAN** `package_search?q=nepal flood rasuwa 2026` | 18 datasets | [C] |
| **BIPAD API** | works; main event losses not entered yet | [C] |
| **NDRRMA API** | works, undocumented; see §6 | [C] |
| **People's Daily search API** | 37,596 hits "吉隆口岸" (all-time); event items 26–29 Aug | [C] |
| **The Paper search API** | 239 hits | [C] |
| **Xinhua so.news.cn** | 405 anti-bot page | [R] |
| **Common Crawl** | CC-NEWS `crawl-data/CC-NEWS/2026/08/warc.paths.gz` → 465 WARC files in Aug 2026, **49 dated 26–29 Aug** (bulk, unfiltered). CC-MAIN-2026-34 index: 0 captures of kathmandupost.com/national/2026/08/2* (crawl predates event). | Usable for bulk replay only. [C] |
| **Wayback CDX** `web.archive.org/cdx/search/cdx` | connection failed from sandbox (http 000) | [U] – test outside sandbox; expected to enumerate outlet URLs by date |
| **YouTube** (search-page scrape of `ytInitialData`, no key) | "Rasuwa flood": CNN-News18, CNBC-TV18, Business Standard, USA Today, NY Post, Tribune, Nepal Raibar, Bishwo Ghatana…; "रसुवा बाढी": Nepal Raibar ×3, SidhaKura, Nepal Television, Kantipur TV HD, TV Today, NepalWatch; "भोटेकोशी बाढी उद्धार": Durbeen Khabar, Mobile Khabar, Global TV; "吉隆口岸 泥石流": 中国新闻社, 8world, ETtoday, TVBS, zaobaosg; "Nepal flood press conference": The Hindu, India Today, WION, Republic, NBC, AP, Reuters, Guardian Australia, United Nations, ANI; "Trishuli 3A tunnel rescue": CRUX, CGTN Europe, ninecomau, Web Khabar, Janaki TV; caption tracks present on only 1 of 4 sampled watch pages (Hindi). `yt-dlp` not installed in sandbox. | Transcripts need `yt-dlp --write-auto-sub` or YouTube Data API key → [R]/[U]. Nepali channels of note: Kantipur TV HD, Nepal Television, AP1, Image Channel, News24, Galaxy 4K, SidhaKura, Nepal Raibar. |
| **GDELT TV API** | "query must contain at least one station"; with stations → timeouts | [U] |
| **Facebook** (NDRRMA, Nepal Police, NRCS "Flood Update" reels, DAO pages) | not fetchable | [R] – but NDRRMA's Facebook PDF links mirror the API above |

---

## 8. Expert blogs, analysis, fact-check desks

| Source | Items | Access | Value | Reliab. | Fetch |
|---|---|---|---|---|---|
| **The Landslide Blog (Petley, Eos)** | `https://eos.org/thelandslideblog/26-august-2026-nepal-and-tibet` (26 Aug; 12 paras) – only one post so far; AGU feed stale (2023), Eos category feed returns HTML | HTML | cause/mechanism | A- | [C] |
| **EGU Hydrological Sciences blog** | `blogs.egu.eu/divisions/hs/2026/08/28/summary-of-the-august-26th-2026-himalayan-flash-flood/` | HTML | cause | B+ | [C] |
| **The Conversation** | **9 articles 27–29 Aug** (Tielidze ×2 satellite/cause; Haghani; Parsons; Datta; Khatiwada warnings; Shiwakoti "10 seconds"; Anand on Tibet information control; Haritashya) – `theconversation.com/global/search?q=nepal+flood` | HTML 33 paras; CC-BY | cause, warning gaps | A- | [C] |
| **AntarcticGlaciers.org** | `/2026/08/august-2026-nepal-tibet-floods/` (610 m ice block, 1,200 m fall) | HTML | cause | B+ | [C] |
| **SANDRP** | `sandrp.in/2026/08/28/himalayan-disaster-august-2026-bhote-koshi-deluge/` (hydropower table: UT-1 216 MW, Rasuwagadhi 111, Rasuwa-Bhotekoshi 120, UT-3A 60 + 9 more; Valmikinagar) + "How Global Banks Downplayed the Risks"; feed works | WordPress RSS | per-project context | B- (advocacy; verify numbers) | [C] |
| **ICIMOD** | press release + `/news/` (4 links) | HTML | cause/warning | A- | [C] |
| **Nepali Times** | see §1 (Byers interview; drone-camera piece; downstream danger; forecasting gaps) | RSS | context + diary | B+ | [C] |
| **UN News** | 4 stories | HTML | response | B+ | [C] |
| **USGS event page** | `usgs.gov/programs/landslide-hazards/science/2026-nepal-debris-avalanche-and-flash-flood` → 202 Akamai challenge to curl/WebFetch | JS/challenge | cause | A | [R] |
| **Mappr / EarthSky / Karmactive / rainymap** | explainers | HTML | low | C | [C] |
| **Fact-check desks** | **Nepal Fact Check** (IFCN signatory; CMR-Nepal + MySansaar) 5 event checks 27–29 Aug: `nepalfactcheck.org/2026/08/rasuwa-flood-glof-viral-video-columbia-glacier-alaska/`, `…/viral-images-claimed-to-show-rasuwa-before-and-after-the-flood-are-ai-generated/`, `…/viral-video-bhotekoshi-flood-china-glacier-svalbard-alaska/`, `…/video-claiming-flood-in-trishuli-bazaar-nuwakot-is-ai-generated/`, `…/viral-video-claiming-nepals-home-minister-entered-tunnel-himself-is-actually-from-uttarakhand-india/`; **Snopes** `snopes.com/fact-check/china-nepal-border-flooding/` (Gyirong CCTV genuine); **VERA Files** (AI "dam collapse" clip); **AFP** via Yahoo (AI-generated flood video); **Lead Stories** via Yahoo (elephant rescue video from India); **Vishvas News** and **Newschecker** (Hindi, in Google News HI); **BBC Nepali explainer** `bbc.com/nepali/articles/ce302w7e889o` ("why confusing reports, what are the facts"); South Asia Check, Boom, AltNews: no event items visible | HTML | misinformation tracker | A-/B | [C] (AFP direct [R]) |

---

## 9. Survivor accounts and per-place articles (URL → places; no names reproduced)

Highest value for "who was where, when". *Named individuals appear in most of these – treat as PII; extract places/counts/times only.*

**Timure / Rasuwagadhi / Ghattekhola (border cluster)**
- Kathmandu Post 28 Aug `kathmandupost.com/national/2026/08/28/they-watched-settlements-disappear-beneath-a-wall-of-water-and-mud-somehow-they-survived` – Timure market, Rasuwa Customs Office, mountainside shaking ≈08:45; night in forest; helicopter ≈10:00 Thu → Bidur → Trishuli/Kathmandu hospitals. 4 named survivors (PII).
- Onlinekhabar EN `english.onlinekhabar.com/nepal-flood-survivor-story.html` – Timure and Ghattekhola market upstream; customs office from 07:30; refuge in timber shed **100–200 people**, goat shed **150–200**, pasture shelter **50–60**; 24–25 h in shed; rescue resumed ≈06:00–06:30 Thu; hub = No.1 Military Training Centre, Trishuli; onward Bidur. 3 named (PII).
- Onlinekhabar EN `english.onlinekhabar.com/rasuwa-flood-aug-26.html` (Timure airlift) – Timure ×10, Syabrubesi ×7, Mailung ×6, Rasuwagadhi ×5, Betrawati ×4, Chilime ×4, Gajuri, Mugling, Devighat, Galchhi, UT-3A, TUTH, Trauma Center; 48 numeric tokens.
- Kathmandu Post 26 Aug `…/2026/08/26/major-flood-damages-syabrubesi-hydropower-projects-in-rasuwa` – Timure ×8, Rasuwagadhi, Chilime (first-day picture).
- The Federal / Kashmir Observer (AP/PTI copy) `thefederal.com/category/international/nepal-flash-flood-survivors-recount-terrifying-escapes-in-rasuwa-254979` – Timure ×5, Bidur ×2.
- Radio Nepal `radionepalonline.com/en/2026/08/29/434969.html`, Rising Nepal `risingnepaldaily.com/news/85771`, Thahakhabar `thahakhabar.com/detail/307764`, ekantipur – 7-year-old rescued alive from Timure ≈60 h/4 days after; taken to Dhunche → TUTH.
- Nepalkhabar `nepalkhabar.com/society/285356-…` – bank branch manager survivor from Timure (name in headline – PII).
- Tribune India `tribuneindia.com/news/china/how-a-tea-break-saved-28-sadhgurus-isha-group-kailash-mansarovar-pilgrims-from-nepal-floods` – 28 pilgrims in 3 buses, ≈3 h out of Kathmandu at tea stop; two buses half an hour ahead washed away; one vehicle 50–100 m from the border bridge when the slide came.
- Al Jazeera 28 Aug `aljazeera.com/features/2026/8/28/nepali-families-pray-for-miracles-with-relatives-missing-after-flood` – TU Teaching Hospital missing-posters, Timure, Rasuwagadhi.
- Setopati `setopati.com/social/397132` – "7 minutes after the mountain fell in Langtang" (new video + satellite; Langtang ×8, Rasuwagadhi, Timure).
- Khabarhub `english.khabarhub.com/2026/26/565012/` – 403 tourists (62 Nepali/341 foreign: India 133, US 47, Australia 34, UK 33, Canada 24, Malaysia 19…; 203 M/200 F) heading to Gosaikunda and Kailash; NTB hotlines. Singhadarbar `singhadarbar.com/bhote-koshi-flood/` and Daily Star `thedailystar.net/…/4257576` carry the same nationality tables.

**Syabrubesi / Dhunche / Chilime / Langtang Khola**
- Kathmandu Post 29 Aug `…/2026/08/29/they-escaped-the-bhotekoshi-flood-what-they-saw-still-haunts-them` – Trishuli Bazar, Syabrubesi, Chilime, Betrawati, Timure, Galchhi, Dhunge Bazar, Mailung/UT-1 camp; evacuations to Dhunche (Army), Bidur, Kathmandu. 7 named (PII).
- Onlinekhabar EN `english.onlinekhabar.com/lake-burst-syafrubesi.html` (lake-surge reaches Syafrubesi, Syabrubesi ×9), `…/rasuwa-cut-off-flood-shortage.html` (Gosaikunda ×5, Syabrubesi, Timure), `…/flood-rasuwa-and-nuwakot.html`.
- Kathmandu Post 29 Aug `…/floods-wipe-out-local-governments-ability-to-lead-rescue-relief` – Gosaikunda RM, Syabrubesi, Timure, Dhunche, Bidur (local-government capacity by municipality).
- Onlinekhabar NP `onlinekhabar.com/2026/08/2006599/600-people-trapped-in-tunnel-not-rescued-for-four-days` – tunnel counts by project (UT-1 ×13, Langtang Khola ×6, UT-3A ×6, Chilime ×4).
- Radio Nepal `…/434948.html` (Army totals), `…/2026/08/29/…` Dhunche walk-out.

**Mailung / Haku / Upper Trishuli-1 and the tunnels**
- Kathmandu Post 29 Aug `…/hundreds-feared-trapped-in-hydropower-tunnels-after-bhotekoshi-flood` – per-project: UT-1 254 rescued; Langtang Khola 40–45 missing/18 rescued; Chilime 8 (6 in tunnel); Rasuwagadhi 49 staff, 3–6 in powerhouse; UT-3A 35+ in/near tunnel; UT-3B 20–25; Upper Trishuli-3 213 initially/85 rescued; IPPAN 934 across 11 projects; NEA 200+; ministry 350 rescued.
- Onlinekhabar EN `english.onlinekhabar.com/people-missing-hydropower.html` – 898 missing by project (25 paras).
- Himalayan Times `thehimalayantimes.com/nepal/up-to-400-workers-feared-trapped-in-mud-filled-rasuwa-tunnels`.
- Republica `myrepublica.nagariknetwork.com/news/rescue-operation-launched-at-trishuli-3-a-hydropower-project-24-69.html`, `…/chinese-experts-join-rescue-of-trapped-trishuli-3b-workers-24-95.html`, `…/44-army-personnel-41-police-and-nine-apf-personnel-missing-in-rusuwa-flood-95-23.html`.
- ekantipur 29 Aug `ekantipur.com/news/2026/08/29/there-has-been-no-news-from-inside-the-tunnel-for-four-days-15-39.html` (Haku ×3, UT-1, UT-3A); Setopati `setopati.com/social/397131` (difficulty even locating tunnel portals; UT-3A, Syabrubesi, Betrawati); Gorkhapatra `gorkhapatraonline.com/news/220457`, Nepalpress `…/758456/…`, Annapurna `story/506400` (Home Minister: reached upper part of UT-3A tunnel, oxygen/camera sent).
- Korea JoongAng Daily `koreajoongangdaily.com/korea/9-korean-workers-unaccounted-for-after-flash-flood-hits-nepal-hydropower-site/12846550` – UT-1: Doosan 20 assigned / 15 present / 5 unaccounted; KOEN 7 / 3 missing; ≈200 other staff evacuated; flood ≈09:00. Companion pieces `/12847627`, `/12847739`.
- Guardian interactive 28 Aug `theguardian.com/world/ng-interactive/2026/aug/28/the-flood-took-everything-i-have-…` – Bidur ×8, Mailung ×2 (survivors in Bidur shelters).

**Betrawati / Trishuli Bazar / Bidur / Devighat (Nuwakot)**
- Onlinekhabar NP `onlinekhabar.com/2026/08/2006557/searching-for-the-breath-and-body-of-a-relative-in-betravati` (Betrawati ×20; 55 paras) and `…/2006331/now-the-clock-tower-in-betravati-will-not-give-the-time-video`.
- Onlinekhabar NP `…/2006026/we-arrived-safely-with-40-50-students-15-are-still-awaiting-rescue` – school group (Trishuli Bazar), 40–50 safe, 15 awaiting rescue.
- Onlinekhabar EN `english.onlinekhabar.com/trishuli-bazar-ruins-rasuwa-flood.html` (Trishuli Bazar ×5, Devighat ×2).
- Nepali Times Reporter's Diary `nepalitimes.com/2026-central-nepal-flood` (27–28 Aug; Tokha pass, Trisuli Bazar and Devighat "gone", Betrawati reached 13:00 after 5 h for 10 km; children found in forest above the river; pilgrims still walking to Gosaikunda).
- Al Jazeera 27 Aug `aljazeera.com/news/2026/8/27/swept-away-nepal-families-search-for-relatives-after-devastating-floods` – Bidur, Betrawati, Trishuli Secondary School, Upper Trishuli project, National Trauma Center; last contacts 06:00 and 08:00.
- ekantipur feature `ekantipur.com/feature/2026/08/29/tamang-couple-providing-food-and-shelter-to-relatives-of-those-missing-in-the-flood-59-06.html` (Betrawati/Bidur).
- Annapurna `annapurnapost.com/story/506396` (Nuwakot relatives waiting "सास कि लास").
- Bidur Khabar `bidurkhabar.com/archives/54968` (Nuwakot settlements turned to riverbed; Devighat).
- Kathmandu Post 29 Aug `…/washed-out-bridges-force-flood-hit-communities-to-rely-on-choppers` (Dhading ×16, Galchhi, Benighat, Bidur, Betrawati, Rasuwagadhi, Kerung), `…/flood-survivors-face-a-second-crisis-as-medicines-water-run-short` (Trishuli Hospital ×6).
- ABC US `abcnews.com/International/…story?id=136022919` (Nuwakot ×6, Devighat ×3), AP `apnews.com/article/nepal-china-flood-rescue-fde34c839b648f93f6aa011f044deb00` (Nuwakot ×18, Devighat ×5, Gyirong ×7).
- Kantipur TV `kantipurtv.com/news/2026/08/28/1787922214.html`, `/health/2026/08/28/1787910000.html`, `/news/2026/08/29/1788008268.html` (hospital survivors, Kathmandu searches).

**Downstream (Dhading, Chitwan, Gorkha, Tanahun, Nawalparasi, India)**
- Nepal Police `nepalpolice.gov.np/news/10273/` and OCHA FU#3 – bodies by district (see §6).
- BBC Nepali `bbc.com/nepali/articles/c2l8djd81d5o` (mass burial "so relatives can find them", Chitwan/Nawalparasi/Bharatpur), `…/c4gk240np21o` (scattered bodies, hospital pressure), `…/cn9wxzvj24xo` (post-mortem doctor shortage), `…/cgk51e30v2eo` (rescue harder than 2015), `…/cq5x2ylp2j3o` (7,000+ students affected).
- Himalayan Times `…/forensic-teams-race-to-identify-233-bodies-in-chitwan`; Onlinekhabar EN `…/flood-bodies-overwhelm-hospital.html` (Bharatpur), `…/govt-temporary-burying-bodies.html`; ekantipur `…/2026/08/29/178802355104581997.html` (669 bodies, 20 identified); Gorkhapatra (29 bodies at Bunkot ghat, Gorkha); newsofnepal (Chitwan +26; Nawalparasi community forests); Imagekhabar `news/554882/` (sex/age split of 669).
- Amar Ujala tag (Gandak bodies into UP; Agra BKU group; Himachal workers); India TV (Kolkata 32-member group); Aaj Tak (133 Indians).
- Guardian 29 Aug `…/nepal-flood-missing-kathmandu-hospital`; NYT 28 Aug survivors (paywall).

**Tibet side (Gyirong/Kerung, Resuo)**
- Xinhua 28 Aug 四大关切 `news.cn/politics/20260828/3223c142e4c54bb8ac5251780a1b6c54/c.html` – 10:30 (Beijing) impact; 3→7 dead, 558→554 missing; 2 Resuo villagers rescued; 300+ Gyirong residents evacuated; 5,200 m source, 20+ km in ≈7 min; silt 1.5 m.
- Xinhua EN 29 Aug `english.news.cn/20260829/3c732ff03b7547f097fc12b219f6c397/c.html` – 555 tourists evacuated, 499 villagers/workers sheltered.
- Guardian 29 Aug `…/nepal-tibet-chinese-rescue-team-finds-nothing-but-ruins-after-reaching-border-crossing…` (Gyirong ×5).
- The Star (MY) `thestar.com.my/news/nation/2026/08/27/nepal-floods-malaysian-group-encountered-landslides…` – 38-person group (Polama Groups) already in Tibet; had crossed Rasuwagadhi days earlier.
- Global Times `1369173` (≈100 Chinese nationals missing on the Nepal side), `1369273` (barrier lake 2.5 M m³).
- RFA Tibetan 29 Aug (Kyirong toll).

**Home-district "who" counts (Nepali pattern)** – INSEC series (`inseconline.org/main_news/156191/` Sindhupalchok 234 incl. a ward chair; `156170` Rolpa 28→4 found; `156123` Madhesh 22 found; `156193` 261 foreign tourists rescued / 320 uncontacted; `156188` 14 hospitals), Ratopati (`story/588225` Morang 15/3; `588333` Madhesh 22), Gorkhapatra (`news/220461` Kailali 23 in contact), Onlinekhabar EN (`rasuwa-flood-116-madhesh.html`), ekantipur ("लमजुङका १२ जनाको उद्धार"), NDRRMA SR#8 (Makwanpur 65).

---

## 10. Ranked shortlist – best corpora for place / count / status extraction

1. **NDRRMA publications API + Situation Report PDFs (#4–#8, twice daily)** – authoritative, per-district / per-agency / per-hydropower / per-shelter; `pdftotext -layout` works on the PDFs (Devanagari + digits). Pull `…/api/v1/publication/publications/?limit=80`, filter `date>=2026-08-26`, download `pdffile`. Skip the name-list PDFs (PII).
2. **Kathmandu Post** – tag pages + RSS + `site:` Google News; richest English settlement narratives and per-project tunnel counts; plain HTML.
3. **Onlinekhabar Nepali + English** – biggest feed (55 + 20 items), tag/search pages, ward-level and home-district counts.
4. **ekantipur** – live page + homepage (no RSS; use GDELT/Google News `site:`); district-reporter datelines (Timure, Dhunche, Haku).
5. **OCHA Flash Updates / UN sitreps / NRCS updates via ReliefWeb RSS + HTML** – district body counts, displacement sites, road-corridor km; PDF infographics.
6. **Nepal Police notice stream + MoFA daily updates** – per-district bodies; nationality tables; hotlines (UDB database is PII – count only).
7. **Setopati, Ratopati (EN RSS), Nagarik, Annapurna (RSS), Gorkhapatra (category page + RSS), Nepalpress, Nepalkhabar, Imagekhabar** – mid-volume Nepali; home-district counts; tunnel-op status.
8. **INSEC Online series** – careful per-home-district and per-hospital counts.
9. **BBC Nepali RSS** – reliability anchor + explainer on conflicting numbers.
10. **Live blogs (BBC cr0qxd1y219kt; CNN ×2; NBC ×2; Guardian ×2; ABC AU ×2; Amar Ujala HI)** – timestamped official quotes; all curl-fetchable (WebFetch tool blocked on several).
11. **Xinhua (ZH/EN), People's Daily API, The Paper API, tibet.cn** – the only Tibet-side counts (Gyirong Port, Resuo).
12. **Wikipedia en + Timeline + zh, with revision stream** – curated cross-source timeline; use citations as a crawl seed list (174 links).
13. **Indian Hindi press (Amar Ujala live/tag, Jagran, Aaj Tak) + Tribune/IE/ToI** – Indian pilgrim groups by origin city, Gandak downstream.
14. **Korea JoongAng / Yonhap; Malay Mail / The Star; Guardian AU** – nationality-specific head-counts (UT-1 Koreans; 51 Malaysians; 41 Australians).
15. **GDELT / Google News / Bing** – discovery and volume monitoring only.
16. **The Conversation ×9, Landslide Blog, EGU, SANDRP, ICIMOD, Nepali Times** – cause, hazard, hydropower context (not who/where).
17. **YouTube** (Kantipur TV, Nepal Television, AP1, SidhaKura, Nepal Raibar; India Today, WION, CNN-News18; 中国新闻社, 8world) – needs `yt-dlp` auto-subs; Nepali ASR quality unknown.

---

## 11. Access cheat-sheet (what a pipeline should do)

- Poll (every 30–60 min): Onlinekhabar NP+EN feeds, Khabarhub EN, Rising Nepal, Nepalnews, Radio Nepal, Ratopati EN, Annapurna, Gorkhapatra, newsofnepal, BBC Nepali, Nepali Times, Kathmandu Post `/rss`, ReliefWeb RSS, NDRRMA API (publications, newsinfo, bulletins), Nepal Police news list, MoFA content list, Google News RSS `site:` per outlet (KP, THT, Republica, ekantipur, Setopati, Nagarik, Xinhua EN, Global Times, AP, Guardian, AJ, CBS).
- Scrape with browser UA (no JS): KP tag pages `?page=N`, THT tag pages, Republica article pages (feed 403), Setopati/Nagarik/Nepalpress/Nepalkhabar homepages, ekantipur homepage + live page, Gorkhapatra category page, INSEC search, DAO Rasuwa/Nuwakot pages, Guardian/CNN/NBC/ABC/BBC live pages, tibet.cn.
- API POST: People's Daily search, The Paper search.
- Register for: ReliefWeb v2 appname, Guardian API key, NewsAPI/MediaCloud (optional), YouTube Data API or install `yt-dlp`.
- Blocked/JS-only (need headless browser or skip): Reuters, NDTV, HT, NYT, Time, France24/AFP, USGS page, Xinhua site search, CCTV/CGTN, Weibo, Nepal Live Today, Ujyaalo article bodies, Yonhap/NHK/Bernama search, MEA press list, Facebook.
- PII quarantine: NDRRMA name-list PDFs and `/np/rescue`; Nepal Police UDB; DAO Rasuwa/Nuwakot lists; Malay Mail/FMT name lists; Pardafas "27 missing police (with names)"; nirajbhusal bulletin; The Paper officer-name headlines; ekantipur/Nepalkhabar headlines naming individuals. Extract counts/places only.

*End of deep-dive (2026-08-29).*
