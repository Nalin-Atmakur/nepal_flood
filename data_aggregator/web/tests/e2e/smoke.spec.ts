import { expect, test } from "@playwright/test";

const LANGS = ["en", "ne", "hi", "zh"] as const;
const HOME_BLOCKS = ["right-now", "corridor", "yours"] as const;
const NUMBERS_BLOCKS = ["yours", "side", "stats", "first-hours"] as const;
const LATEST_BLOCKS = ["yours", "digest", "latest", "river"] as const;
const WAIT = { timeout: 15_000 };

for (const lang of LANGS) {
  test.describe(`/${lang}`, () => {
    test("home is three things (right now · corridor · your part) with the tabs and the LIVE chip", async ({ page }) => {
      const res = await page.goto(`/${lang}`);
      expect(res?.status()).toBe(200);
      for (const block of HOME_BLOCKS) {
        await expect(page.locator(`[data-block="${block}"]`).first(), block).toBeAttached(WAIT);
      }
      const blocks = await page.locator("main [data-block]").evaluateAll((els) => els.map((e) => e.getAttribute("data-block")));
      expect(blocks.filter((b) => !HOME_BLOCKS.includes(b as (typeof HOME_BLOCKS)[number]))).toEqual([]);
      await expect(page.locator('[data-block="right-now"]').first()).toBeVisible(WAIT);
      await expect(page.getByText("LIVE", { exact: true }).first()).toBeVisible(WAIT);
      await expect(page.locator('nav[aria-label] a[aria-current="page"]').first()).toBeAttached(WAIT);
    });

    test("three real clips sit under the simulation: posters below the fold, muted autoplay in view, sound on tap", async ({ page }) => {
      await page.goto(`/${lang}`);
      const row = page.locator('[data-block="corridor"] [data-testid="videos-row"]');
      await expect(row).toBeAttached(WAIT);
      await expect(row.locator("[data-video]")).toHaveCount(3);
      await expect(row.locator("iframe")).toHaveCount(0); // below the fold: posters only
      // scrolled into view: the tiles autoplay muted; scrolled away again: back to posters
      await row.evaluate((el) => el.scrollIntoView({ block: "center" }));
      await expect.poll(async () => row.locator('[data-video][data-mode="auto"], [data-video][data-mode="play"]').count(), { timeout: 20_000 }).toBeGreaterThanOrEqual(1);
      await expect.poll(async () => row.locator("iframe").count(), WAIT).toBeGreaterThanOrEqual(1);
      await page.evaluate(() => window.scrollTo(0, 0));
      await expect.poll(async () => row.locator("iframe").count(), { timeout: 20_000 }).toBe(0);
      await expect(page.locator('[data-block="corridor"] [data-testid="videos-add"]')).toHaveAttribute("href", new RegExp(`/${lang}/report`));
    });

    test("the places map: pins on the real geography, tap one for its numbers and its page", async ({ page }) => {
      await page.goto(`/${lang}/places`);
      const map = page.locator('[data-testid="places-map"]');
      await expect(map).toBeVisible(WAIT);
      const pins = map.locator("[data-pin]");
      await expect.poll(async () => pins.count(), WAIT).toBeGreaterThanOrEqual(80);
      // the basemap itself must load (a broken image would leave pins floating on nothing)
      expect(await map.locator("img").first().evaluate((el) => (el as HTMLImageElement).naturalWidth)).toBeGreaterThan(500);
      await map.locator('[data-pin="betrawati"]').click({ force: true });
      const card = page.locator('[data-testid="map-card"]');
      await expect(card).toBeVisible(WAIT);
      await expect(card.locator("a")).toHaveAttribute("href", new RegExp(`/${lang}/places/betrawati`));
      await page.locator('[data-testid="map-fit"]').click();
      await expect(card).toHaveCount(0);
    });

    test("numbers and latest-news tabs render their blocks, each headed by Your part", async ({ page }) => {
      await page.goto(`/${lang}/numbers`);
      for (const block of NUMBERS_BLOCKS) await expect(page.locator(`[data-block="${block}"]`).first(), block).toBeAttached(WAIT);
      await page.goto(`/${lang}/latest`);
      for (const block of LATEST_BLOCKS) await expect(page.locator(`[data-block="${block}"]`).first(), block).toBeAttached(WAIT);
    });

    test("the first hours: section 03 lists at least 10 events with a dot, a time label and text", async ({ page }) => {
      await page.goto(`/${lang}/numbers`);
      const section = page.locator('[data-block="first-hours"][data-n="03"]').first();
      await expect(section).toBeAttached(WAIT);
      const events = section.locator("[data-event]");
      await expect.poll(async () => events.count(), WAIT).toBeGreaterThanOrEqual(10);
      const first = events.first();
      await expect(first.locator('[role="img"]')).toBeAttached();
      await expect(first.locator(".arcade")).toHaveText(/\S/);
      await expect(first.locator("article p")).toHaveText(/\S/);
      const kinds = await events.evaluateAll((els) => els.map((e) => e.getAttribute("data-kind")));
      expect(kinds.every((k) => ["trigger", "wave", "gauge", "warning", "impact", "response"].includes(k ?? ""))).toBe(true);
    });

    test("report is one page: who-cards, the box and Send together; picking a card swaps the chips", async ({ page }) => {
      const res = await page.goto(`/${lang}/report`);
      expect(res?.status()).toBe(200);
      const cards = page.locator('[data-testid="who-card"]');
      await expect(cards).toHaveCount(4, WAIT);
      const box = page.locator('[data-testid="the-box"]');
      await expect(box.first()).toBeVisible(WAIT);                       // no tap needed to see the box
      await expect(page.locator('[data-testid="send"]').first()).toBeVisible(WAIT);
      await expect(cards.first()).toHaveAttribute("data-selected", "true"); // "looking for someone" preselected
      const chipsBefore = await page.locator('[data-testid="chip"]').allTextContents();
      await cards.nth(2).click();                                          // rescuer
      await expect(cards.nth(2)).toHaveAttribute("data-selected", "true");
      await expect(box.first()).toBeVisible(WAIT);                         // still the same page
      const chipsAfter = await page.locator('[data-testid="chip"]').allTextContents();
      expect(chipsAfter).not.toEqual(chipsBefore);
    });

    test("report: a file can be attached and removed before sending; how-it-works is a banner, not a form field", async ({ page }) => {
      await page.goto(`/${lang}/report`);
      await expect(page.getByText("HOW IT WORKS", { exact: true })).toBeVisible(WAIT);
      const attach = page.locator('[data-testid="attach"]');
      await expect(attach).toBeVisible(WAIT);
      await page.locator('[data-testid="attach-input"]').setInputFiles({ name: "photo.png", mimeType: "image/png", buffer: Buffer.from("iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==", "base64") });
      await expect(attach.getByText("photo.png")).toBeVisible(WAIT);
      await attach.getByRole("button", { name: /photo\.png/ }).click();
      await expect(attach.getByText("photo.png")).toHaveCount(0);
    });

    test("sources, about and places carry their page markers", async ({ page }) => {
      for (const p of ["sources", "about", "places"] as const) {
        const res = await page.goto(`/${lang}/${p}`);
        expect(res?.status(), p).toBe(200);
        await expect(page.locator(`[data-page="${p}"]`).first(), p).toBeAttached(WAIT);
      }
    });
  });
}

test("GET /api/og?lang=ne returns a PNG", async ({ request }) => {
  const res = await request.get("/api/og?lang=ne");
  expect(res.status()).toBe(200);
  expect(res.headers()["content-type"] ?? "").toMatch(/^image\/png/);
  expect((await res.body()).byteLength).toBeGreaterThan(1000);
});

test("GET / with a Nepali Accept-Language lands on /ne", async ({ request }) => {
  // Chromium sets Accept-Language from its own locale, so the redirect is checked at the HTTP level.
  const res = await request.get("/", { headers: { "accept-language": "ne-NP,ne;q=0.9" }, maxRedirects: 0 });
  expect([301, 302, 307, 308]).toContain(res.status());
  expect(new URL(res.headers()["location"] ?? "", "http://localhost:3000").pathname).toBe("/ne");
  const hi = await request.get("/places", { headers: { "accept-language": "hi-IN,hi;q=0.9,en;q=0.5" }, maxRedirects: 0 });
  expect(new URL(hi.headers()["location"] ?? "", "http://localhost:3000").pathname).toBe("/hi/places");
});

test("the corridor flood sim: controls render, a run advances the clock, an object in the path gets swept", async ({ page }) => {
  await page.goto("/en?debug=1");
  const controls = page.locator('[data-testid="corridor-controls"]');
  // WebGL is not available on every CI runner: the PNG fallback (no controls) is the documented behaviour there.
  try {
    await expect(controls).toBeVisible({ timeout: 20_000 });
  } catch {
    test.skip(true, "WebGL unavailable → static fallback");
  }
  await page.locator('[data-block="corridor"]').scrollIntoViewIfNeeded();
  const clock = page.locator('[data-testid="corridor-clock"]');
  await expect(clock).toHaveText(/^\d\d:\d\d$/);
  // drop objects in the path through the debug hook (the UI does the same via arm + tap) and replay
  await page.evaluate(() => {
    const h = (window as unknown as { __corridor?: { drop: (k: string, x: number, z: number) => void; play: () => void } }).__corridor;
    h?.drop("house", -10, 0);
    h?.drop("camp", -6, 0);
    h?.play();
  });
  await expect.poll(async () => Number(await page.locator('[data-testid="corridor-swept"]').textContent()), { timeout: 20_000 }).toBeGreaterThanOrEqual(1);
  await expect.poll(async () => page.evaluate(() => (window as unknown as { __corridor?: { debug: () => { frontX: number } } }).__corridor?.debug().frontX ?? -Infinity), {
    timeout: 20_000,
  }).toBeGreaterThan(-20);
  await expect(clock).not.toHaveText("08:37");
  // 14 object chips; tapping one places it in the path immediately and shows the armed hint
  await expect(page.locator('[data-testid="corridor-controls"] [data-testid="chip"]')).toHaveCount(14);
  await page.locator('[data-testid="corridor-controls"] [data-testid="chip"]').nth(2).click();
  await expect(page.locator('[data-testid="corridor-armed"]')).toBeVisible();
  await expect.poll(async () => page.evaluate(() => (window as unknown as { __corridor?: { objectCount: () => number } }).__corridor?.objectCount() ?? 0)).toBeGreaterThan(10);
  // nothing is ever below the ground
  expect(await page.evaluate(() => (window as unknown as { __corridor?: { debug: () => { belowGround: number } } }).__corridor?.debug().belowGround)).toBe(0);
  // the breach defaults to "slow"; the cinematic button restarts the run with the chase camera
  await expect(page.locator('[data-testid="corridor-controls"] [role="radio"][aria-checked="true"]')).toHaveText(/slow|बिस्तारै|धीरे|缓慢/i);
  await page.locator('[data-testid="corridor-cinematic"]').click();
  await expect.poll(async () => page.evaluate(() => (window as unknown as { __corridor?: { debug: () => { cameraMode: string } } }).__corridor?.debug().cameraMode), { timeout: 8000 }).toBe("ride");
  await page.locator('[data-testid="corridor-frame"]').click();
  await expect.poll(async () => page.evaluate(() => (window as unknown as { __corridor?: { debug: () => { cameraMode: string } } }).__corridor?.debug().cameraMode), { timeout: 8000 }).toBe("overview");
  // names toggle: off hides every place pill, on brings them back (persisted per device)
  const names = page.locator('[data-testid="corridor-names"]');
  await names.click();
  await expect.poll(async () => page.evaluate(() => (window as unknown as { __corridor?: { debug: () => { labels: boolean } } }).__corridor?.debug().labels)).toBe(false);
  await expect(names).toHaveAttribute("aria-pressed", "false");
  await names.click();
  await expect.poll(async () => page.evaluate(() => (window as unknown as { __corridor?: { debug: () => { labels: boolean } } }).__corridor?.debug().labels)).toBe(true);
  // reset clears the counter
  await page.getByRole("button", { name: /Reset/ }).click();
  await expect(page.locator('[data-testid="corridor-swept"]')).toHaveText("0");
});
