import { readFileSync } from "node:fs";
import { expect, test } from "@playwright/test";

/** The hidden raw-reports page: a password form to the world, the archive to the team. */
function localPassword(): string | null {
  try {
    const m = /^ADMIN_PASSWORD=(.+)$/m.exec(readFileSync(".env.local", "utf8"));
    return m ? m[1].trim() : null;
  } catch {
    return null;
  }
}

test("/admin/reports is not redirected by the locale proxy and shows only the password form", async ({ page }) => {
  const res = await page.goto("/admin/reports");
  expect(res?.status()).toBe(200);
  expect(page.url()).toContain("/admin/reports");
  await expect(page.locator('[data-testid="admin-login"]')).toBeVisible();
  await expect(page.locator('[data-testid="admin-rows"]')).toHaveCount(0);
  const exp = await page.request.get("/admin/reports/export");
  expect(exp.status()).toBe(401);
});

test("a wrong password stays on the form; the right one opens the archive and the CSV", async ({ page }) => {
  await page.goto("/admin/reports");
  await page.fill('input[name="password"]', "definitely-not-the-password");
  await page.click('[data-testid="admin-login"] button[type="submit"]');
  await expect(page.locator('[data-testid="admin-login"] [role="alert"]')).toBeVisible();
  const pw = localPassword();
  test.skip(!pw, "no ADMIN_PASSWORD in .env.local");
  await page.fill('input[name="password"]', pw!);
  await page.click('[data-testid="admin-login"] button[type="submit"]');
  await expect(page.getByRole("heading", { name: "Raw reports" })).toBeVisible();
  await expect(page.locator('[data-testid="admin-login"]')).toHaveCount(0);
  const exp = await page.request.get("/admin/reports/export");
  expect([200, 503]).toContain(exp.status());
  if (exp.status() === 200) expect(exp.headers()["content-type"]).toContain("text/csv");
});
