#!/usr/bin/env node
/**
 * Live smoke: every public route in the three languages on the production host must answer 200 and carry its
 * OG image; the OG route must return PNG; sitemap/robots must exist. No browser, ~10 s.
 *   node scripts/live-smoke.mjs            (https://www.nepalfloodtracker.com)
 *   node scripts/live-smoke.mjs http://localhost:3000
 * See web/docs/12-deploy.md.
 */
const base = (process.argv[2] || "https://www.nepalfloodtracker.com").replace(/\/$/, "");
const langs = ["en", "ne", "hi"];
const paths = ["", "/report", "/me", "/places", "/places/dhunche", "/sources", "/about", "/run?swept=2&bridges=3"];
let failures = 0;
const check = async (url, test) => {
  try {
    const r = await fetch(url, { redirect: "manual", headers: { "user-agent": "nepalfloodtracker-smoke/1" } });
    const body = r.headers.get("content-type")?.includes("text/html") ? await r.text() : "";
    const msg = test(r, body);
    if (msg) {
      failures++;
      console.log(`FAIL ${url} — ${msg}`);
    } else console.log(`ok   ${url}`);
  } catch (e) {
    failures++;
    console.log(`FAIL ${url} — ${e.message}`);
  }
};
for (const lang of langs) {
  for (const p of paths) {
    await check(`${base}/${lang}${p}`, (r, body) =>
      r.status !== 200 ? `status ${r.status}` : !body.includes('property="og:image"') ? "no og:image" : !body.includes(`lang="${lang}"`) && !body.includes(`lang="${lang}-`) ? "lang attr" : "",
    );
  }
  await check(`${base}/api/og?lang=${lang}`, (r) => (r.status !== 200 ? `status ${r.status}` : !(r.headers.get("content-type") || "").includes("image/png") ? "not png" : ""));
}
await check(`${base}/`, (r) => ([301, 302, 307, 308].includes(r.status) ? "" : `expected redirect, got ${r.status}`));
await check(`${base}/robots.txt`, (r) => (r.status === 200 ? "" : `status ${r.status}`));
await check(`${base}/sitemap.xml`, (r) => (r.status === 200 ? "" : `status ${r.status}`));
console.log(failures ? `\n${failures} failure(s)` : "\nall good");
process.exit(failures ? 1 : 0);
