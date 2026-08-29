import fs from "node:fs";
import path from "node:path";
import type { Page } from "playwright-core";
import type { AppConfig } from "../config.js";
import { WORK_ROOT } from "../constants.js";

export type GmailAuthStatus = "AUTHENTICATED" | "USER_HANDOFF" | "FAILED";

export interface GmailAuthResult {
  status: GmailAuthStatus;
  host: string;
  path: string;
  challenge: string | null;
  screenshot: string;
}

async function saveDiagnostic(page: Page, name: string): Promise<string> {
  const root = path.join(WORK_ROOT, "screenshots");
  fs.mkdirSync(root, { recursive: true, mode: 0o700 });
  const target = path.join(root, name);
  await page.screenshot({ path: target, fullPage: true });
  return target;
}

async function clickNext(page: Page): Promise<void> {
  const next = page.locator("#identifierNext, #passwordNext, button:has-text('Next')").first();
  await next.click();
  await page.waitForTimeout(1500);
}

export async function ensureGmailAuthenticated(
  page: Page,
  config: AppConfig,
): Promise<GmailAuthResult> {
  await page.goto("https://mail.google.com/", { waitUntil: "domcontentloaded" });
  await page.waitForTimeout(1500);
  let current = new URL(page.url());
  if (current.hostname === "mail.google.com") {
    return {
      status: "AUTHENTICATED",
      host: current.hostname,
      path: current.pathname,
      challenge: null,
      screenshot: await saveDiagnostic(page, "gmail-authenticated.png"),
    };
  }

  const emailInput = page.locator('input[type="email"], input[name="identifier"]').first();
  if (await emailInput.isVisible().catch(() => false)) {
    await emailInput.fill(config.TCM_SIGNUP_EMAIL);
    await clickNext(page);
  }

  const passwordInput = page.locator('input[type="password"], input[name="Passwd"]').first();
  if (await passwordInput.isVisible({ timeout: 10_000 }).catch(() => false)) {
    await passwordInput.fill(config.TCM_SIGNUP_EMAIL_PASSWORD);
    await clickNext(page);
  }

  await page.waitForTimeout(4000);
  current = new URL(page.url());
  const screenshot = await saveDiagnostic(page, "gmail-auth-result.png");
  if (current.hostname === "mail.google.com") {
    return {
      status: "AUTHENTICATED",
      host: current.hostname,
      path: current.pathname,
      challenge: null,
      screenshot,
    };
  }
  const challenge = current.pathname.includes("challenge")
    ? current.pathname
    : (await page.locator('iframe[title*="challenge" i], iframe[src*="recaptcha"], [data-sitekey]').count()) > 0
      ? "captcha"
      : "login_not_completed";
  return {
    status: challenge === "login_not_completed" ? "FAILED" : "USER_HANDOFF",
    host: current.hostname,
    path: current.pathname,
    challenge,
    screenshot,
  };
}
