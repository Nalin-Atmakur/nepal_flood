import { expect, test } from "@playwright/test";

const LANGS = ["en", "ne", "hi"] as const;
const HOME_BLOCKS = ["scoreboard", "corridor", "stats", "side", "places", "add", "river", "latest", "share"] as const;
const WAIT = { timeout: 15_000 };

for (const lang of LANGS) {
  test.describe(`/${lang}`, () => {
    test("home renders every block and the LIVE chip", async ({ page }) => {
      const res = await page.goto(`/${lang}`);
      expect(res?.status()).toBe(200);
      for (const block of HOME_BLOCKS) {
        await expect(page.locator(`[data-block="${block}"]`).first(), block).toBeAttached(WAIT);
      }
      for (const n of ["01", "02", "03", "04", "05", "06", "07"]) {
        await expect(page.locator(`[data-n="${n}"]`).first(), `section ${n}`).toBeAttached(WAIT);
      }
      await expect(page.locator('[data-block="scoreboard"]').first()).toBeVisible(WAIT);
      await expect(page.getByText("LIVE", { exact: true }).first()).toBeVisible(WAIT);
    });

    test("report shows four who-cards and reveals the box", async ({ page }) => {
      const res = await page.goto(`/${lang}/report`);
      expect(res?.status()).toBe(200);
      const cards = page.locator('[data-testid="who-card"]');
      await expect(cards).toHaveCount(4, WAIT);
      await cards.first().click();
      const box = page.locator('[data-testid="the-box"]');
      await expect(box.first()).toBeVisible(WAIT);
      const textarea = page.locator('textarea[data-testid="the-box"], [data-testid="the-box"] textarea');
      await expect(textarea.first()).toBeVisible(WAIT);
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
