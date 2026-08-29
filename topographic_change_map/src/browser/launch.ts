import fs from "node:fs";
import { chromium, type BrowserContext, type Page } from "playwright-core";
import {
  AUTOMATION_PROFILE_ROOT,
  CHROME_EXECUTABLE,
  targetChromeBounds,
  targetDisplay,
} from "../constants.js";

export interface HeadedSession {
  context: BrowserContext;
  dashboard: Page;
  gmail: Page;
  provider: Page;
}

export interface BrowserLaunchOptions {
  headed: boolean;
  dashboardUrl?: string;
}

export interface WindowBounds {
  x: number;
  y: number;
  width: number;
  height: number;
}

export function isWithinTargetDisplay(bounds: WindowBounds = targetChromeBounds()): boolean {
  const display = targetDisplay();
  return (
    bounds.x >= display.x &&
    bounds.y >= display.y &&
    bounds.x + bounds.width <= display.x + display.width &&
    bounds.y + bounds.height <= display.y + display.height
  );
}

export const isWithinSecondaryDisplay = isWithinTargetDisplay;

export async function launchHeadedSession(dashboardUrl?: string): Promise<HeadedSession> {
  return await launchBrowserSession({ headed: true, ...(dashboardUrl ? { dashboardUrl } : {}) });
}

export async function launchBrowserSession(options: BrowserLaunchOptions): Promise<HeadedSession> {
  const bounds = targetChromeBounds();
  if (!fs.existsSync(CHROME_EXECUTABLE)) throw new Error("Google Chrome is not installed");
  if (options.headed && !isWithinTargetDisplay(bounds)) {
    throw new Error("Configured Chrome bounds leave the target display");
  }

  const context = await chromium.launchPersistentContext(AUTOMATION_PROFILE_ROOT, {
    executablePath: CHROME_EXECUTABLE,
    channel: "chrome",
    headless: !options.headed,
    chromiumSandbox: true,
    viewport: null,
    acceptDownloads: true,
    args: [
      "--profile-directory=Default",
      ...(options.headed
        ? [
            `--window-position=${bounds.x},${bounds.y}`,
            `--window-size=${bounds.width},${bounds.height}`,
          ]
        : []),
      "--no-first-run",
      "--no-default-browser-check",
      "--disable-backgrounding-occluded-windows",
    ],
  });

  const existing = context.pages();
  const dashboard = existing[0] ?? (await context.newPage());
  await dashboard.goto(
    options.dashboardUrl ??
      "data:text/html,<title>Topographic Change Map</title><h1>Automation dashboard</h1><p>Headed Chrome is ready.</p>",
  );
  const gmail = await context.newPage();
  await gmail.goto("https://mail.google.com/", { waitUntil: "domcontentloaded" });
  const provider = await context.newPage();
  await provider.goto("about:blank");
  await dashboard.bringToFront();
  return { context, dashboard, gmail, provider };
}

export async function readChromeWindowBounds(page: Page): Promise<WindowBounds> {
  const session = await page.context().newCDPSession(page);
  try {
    const result = await session.send("Browser.getWindowForTarget");
    const { left, top, width, height } = result.bounds;
    if ([left, top, width, height].some((value) => typeof value !== "number")) {
      throw new Error("Chrome did not report complete window bounds");
    }
    return { x: left!, y: top!, width: width!, height: height! };
  } finally {
    await session.detach();
  }
}
