import fs from "node:fs";
import { chromium, type BrowserContext, type Page } from "playwright-core";
import {
  AUTOMATION_PROFILE_ROOT,
  CHROME_BOUNDS,
  CHROME_EXECUTABLE,
  SECONDARY_DISPLAY,
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

export function isWithinSecondaryDisplay(bounds: WindowBounds = CHROME_BOUNDS): boolean {
  return (
    bounds.x >= SECONDARY_DISPLAY.x &&
    bounds.y >= SECONDARY_DISPLAY.y &&
    bounds.x + bounds.width <= SECONDARY_DISPLAY.x + SECONDARY_DISPLAY.width &&
    bounds.y + bounds.height <= SECONDARY_DISPLAY.y + SECONDARY_DISPLAY.height
  );
}

export async function launchHeadedSession(dashboardUrl?: string): Promise<HeadedSession> {
  return await launchBrowserSession({ headed: true, ...(dashboardUrl ? { dashboardUrl } : {}) });
}

export async function launchBrowserSession(options: BrowserLaunchOptions): Promise<HeadedSession> {
  if (!fs.existsSync(CHROME_EXECUTABLE)) throw new Error("Google Chrome is not installed");
  if (options.headed && !isWithinSecondaryDisplay()) {
    throw new Error("Configured Chrome bounds leave display 1");
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
            `--window-position=${CHROME_BOUNDS.x},${CHROME_BOUNDS.y}`,
            `--window-size=${CHROME_BOUNDS.width},${CHROME_BOUNDS.height}`,
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
