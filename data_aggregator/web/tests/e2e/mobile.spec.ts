import { expect, test } from "@playwright/test";

/**
 * Phones are the distribution channel (docs/19 #12): every page at 390 × 844 must not scroll sideways, every
 * button/radio/chip must be a real tap target, and the share popover must fit on screen. Runs in the same
 * chromium project with device emulation (touch, 3× pixels).
 */
test.use({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true, deviceScaleFactor: 3 });

const PAGES = ["/en", "/en/numbers", "/en/places", "/en/places/timure", "/en/latest", "/en/report", "/en/report?type=family", "/en/me", "/en/sources", "/en/about", "/ne", "/zh", "/hi/report", "/en/run?swept=3&bridges=2"];
const MIN_TAP = 36;

for (const path of PAGES) {
  test(`phone: ${path} has no sideways scroll and real tap targets`, async ({ page }) => {
    const res = await page.goto(path);
    expect(res?.status()).toBe(200);
    await page.waitForTimeout(600);
    const widths = await page.evaluate(() => ({ doc: document.documentElement.scrollWidth, body: document.body.scrollWidth, vw: window.innerWidth }));
    expect(widths.doc, `document scrollWidth ${widths.doc} > viewport ${widths.vw}`).toBeLessThanOrEqual(widths.vw + 1);
    expect(widths.body, `body scrollWidth ${widths.body} > viewport ${widths.vw}`).toBeLessThanOrEqual(widths.vw + 1);
    // anything that looks like a button must be tappable
    const small = await page.evaluate((min) => {
      const out: string[] = [];
      const els = document.querySelectorAll<HTMLElement>('button, [role="button"], [role="radio"], a.press-3, a.press-4, a[data-testid], a[href^="tel:"]');
      for (const el of els) {
        const r = el.getBoundingClientRect();
        const cs = getComputedStyle(el);
        if (r.width === 0 || r.height === 0 || cs.visibility === "hidden") continue; // hidden variants (desktop-only)
        if (el.dataset.tapOk) continue; // map pins: a 36 px hit area that may overlap its neighbours; the same places are 44 px rows in the list below
        if (r.height < min) out.push(`${el.tagName.toLowerCase()}${el.dataset.testid ? `[${el.dataset.testid}]` : ""} "${(el.textContent ?? "").trim().slice(0, 30)}" ${Math.round(r.height)}px`);
      }
      return out;
    }, MIN_TAP);
    expect(small, small.join("\n")).toEqual([]);
  });
}

test("phone: the share popover fits on screen and WhatsApp carries the message", async ({ page }) => {
  await page.goto("/en");
  await page.locator('[data-block="yours"] [data-testid="share-menu"]').click();
  const pop = page.locator('[data-testid="share-popover"]').first();
  await expect(pop).toBeVisible();
  const box = await pop.boundingBox();
  const vw = await page.evaluate(() => window.innerWidth);
  expect(box!.x).toBeGreaterThanOrEqual(0);
  expect(box!.x + box!.width).toBeLessThanOrEqual(vw + 1);
  const wa = await pop.locator('[data-share="whatsapp"]').getAttribute("href");
  expect(wa).toMatch(/^https:\/\/wa\.me\/\?text=/);
  expect(decodeURIComponent(wa ?? "")).toContain("utm_source=whatsapp");
});
