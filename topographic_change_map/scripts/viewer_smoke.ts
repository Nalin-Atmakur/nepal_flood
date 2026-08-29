import { spawn } from "node:child_process";
import fs from "node:fs";
import net from "node:net";
import path from "node:path";
import { chromium } from "playwright-core";
import { CHROME_EXECUTABLE, WORK_ROOT } from "../src/constants.js";

const port = 4175;
const server = spawn(
  process.execPath,
  [path.resolve("node_modules/vite/bin/vite.js"), "preview", "--config", "vite.config.ts", "--host", "127.0.0.1", "--port", String(port)],
  { stdio: "ignore" },
);

async function waitForPort(): Promise<void> {
  const deadline = Date.now() + 20_000;
  while (Date.now() < deadline) {
    const ready = await new Promise<boolean>((resolve) => {
      const socket = net.connect(port, "127.0.0.1");
      socket.once("connect", () => { socket.destroy(); resolve(true); });
      socket.once("error", () => resolve(false));
    });
    if (ready) return;
    await new Promise((resolve) => setTimeout(resolve, 200));
  }
  throw new Error("Viewer preview server did not start");
}

try {
  await waitForPort();
  const browser = await chromium.launch({ executablePath: CHROME_EXECUTABLE, headless: true, chromiumSandbox: true });
  try {
    const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } });
    const failures: string[] = [];
    page.on("pageerror", (error) => failures.push(error.message));
    page.on("response", (response) => { if (response.status() >= 400) failures.push(`${response.status()} ${response.url()}`); });
    await page.goto(`http://127.0.0.1:${port}/`, { waitUntil: "networkidle" });
    await page.waitForSelector("canvas");
    await page.waitForTimeout(1200);
    const result = {
      title: await page.title(),
      canvases: await page.locator("canvas").count(),
      modes: await page.locator("button[data-mode]").count(),
      contextButtons: await page.locator("#context-toggle").count(),
      statistics: await page.locator("#statistics dd").count(),
      failures,
    };
    if (result.title !== "Nepal Flood Topographic Change" || result.canvases < 1 || result.modes !== 4 || result.contextButtons !== 1 || result.statistics < 5 || failures.length) {
      throw new Error(`Viewer smoke failure: ${JSON.stringify(result)}`);
    }
    const screenshotRoot = path.join(WORK_ROOT, "screenshots");
    fs.mkdirSync(screenshotRoot, { recursive: true, mode: 0o700 });
    await page.screenshot({ path: path.join(screenshotRoot, "viewer-smoke.png"), fullPage: true });
    process.stdout.write(`${JSON.stringify(result)}\n`);
  } finally {
    await browser.close();
  }
} finally {
  server.kill("SIGTERM");
}
