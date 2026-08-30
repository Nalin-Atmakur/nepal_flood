import { expect, test } from "@playwright/test";

/**
 * /sources on phones: one card per source (no sideways table, nothing clipped), the ▸ disclosure opens the extract
 * panel full-width under the card; on md+ the table is what renders (docs/15-sources-page.md §3).
 */
const WAIT = { timeout: 15_000 };

test.describe("/sources layouts", () => {
  test("phone (390 px): cards, ≥44 px toggles, two open panels, no horizontal overflow", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto("/en/sources");
    const cards = page.locator("[data-testid=source-cards] [data-testid=source-card]");
    await expect(cards.first()).toBeVisible(WAIT);
    await expect(page.locator("table").first()).toBeHidden();

    const toggles = page.locator("[data-testid=source-cards] [data-testid=source-toggle]");
    for (const i of [0, 1]) {
      const box = await toggles.nth(i).boundingBox();
      expect(box?.width ?? 0).toBeGreaterThanOrEqual(44);
      expect(box?.height ?? 0).toBeGreaterThanOrEqual(44);
      await toggles.nth(i).click();
      await expect(toggles.nth(i)).toHaveAttribute("aria-expanded", "true");
    }
    await expect(page.locator("[data-testid=source-cards] [data-testid=source-panel]")).toHaveCount(2);

    const widths = await page.evaluate(() => ({ sw: document.documentElement.scrollWidth, iw: window.innerWidth }));
    expect(widths.sw).toBe(widths.iw);
    const text = (await page.locator("[data-testid=source-cards]").allInnerTexts()).join("\n");
    expect(text).not.toMatch(/[०-९]/); // Latin digits everywhere
  });

  test("desktop: the table renders and the cards do not", async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 900 });
    await page.goto("/en/sources");
    await expect(page.locator("table").first()).toBeVisible(WAIT);
    await expect(page.locator("[data-testid=source-cards]").first()).toBeHidden();
  });
});
