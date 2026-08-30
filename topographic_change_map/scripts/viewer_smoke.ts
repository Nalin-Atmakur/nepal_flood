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
    const defaultResult = {
      title: await page.title(),
      canvases: await page.locator("canvas").count(),
      modes: await page.locator("button[data-mode]").count(),
      contextButtons: await page.locator("#context-toggle").count(),
      productOptions: await page.locator("#product-grid option").count(),
      statistics: await page.locator("#statistics dd").count(),
    };
    if (defaultResult.title !== "Nepal Flood Topographic Change" || defaultResult.canvases < 1 || defaultResult.modes !== 4 || defaultResult.contextButtons !== 1 || defaultResult.productOptions !== 2 || defaultResult.statistics < 5) {
      throw new Error(`Default viewer smoke failure: ${JSON.stringify(defaultResult)}`);
    }
    const screenshotRoot = path.join(WORK_ROOT, "screenshots");
    fs.mkdirSync(screenshotRoot, { recursive: true, mode: 0o700 });
    await page.screenshot({ path: path.join(screenshotRoot, "viewer-smoke.png"), fullPage: true });
    await page.locator("#context-toggle").click();
    await page.waitForSelector('.geo-pin[data-pin-id="syabrubesi"]', { timeout: 30_000 });
    const synchronizedPins = await page.locator(".geo-pin:not(.selected-location)").count();
    await page.locator('.geo-pin[data-pin-id="syabrubesi"]').click();
    await page.waitForSelector("#imagery-panel.visible", { timeout: 30_000 });
    await page.waitForFunction(
      () => document.querySelector("#view-a-meta")?.textContent?.includes("off-nadir") === true,
      undefined,
      { timeout: 30_000 },
    );
    const popupColor = await page.locator(".maplibregl-popup-content").evaluate((element) => getComputedStyle(element).color);
    const evidenceResult = {
      synchronizedPins,
      imageryCanvases: await page.locator("#imagery-panel canvas").count(),
      imageryVisible: await page.locator("#imagery-panel").evaluate((element) => element.classList.contains("visible")),
      popupColor,
      cropEnergy: await page.locator("#view-a-crop").evaluate((canvas: HTMLCanvasElement) => {
        const pixels = canvas.getContext("2d")!.getImageData(64, 64, 1, 1).data;
        return pixels[0]! + pixels[1]! + pixels[2]!;
      }),
    };
    if (evidenceResult.synchronizedPins !== 3 || evidenceResult.imageryCanvases !== 2 || !evidenceResult.imageryVisible || popupColor === "rgb(255, 255, 255)" || evidenceResult.cropEnergy <= 0) {
      throw new Error(`Synchronized evidence smoke failure: ${JSON.stringify(evidenceResult)}`);
    }
    await page.screenshot({ path: path.join(screenshotRoot, "viewer-synchronized-evidence.png"), fullPage: true });
    await page.locator("#context-map").click({ position: { x: 500, y: 350 } });
    await page.waitForSelector(".geo-pin.selected-location", { timeout: 10_000 });
    const dynamicSelection = {
      markers: await page.locator(".geo-pin.selected-location").count(),
      inspection: await page.locator("#inspection").textContent(),
    };
    if (dynamicSelection.markers !== 1 || !dynamicSelection.inspection?.includes("Selected map location")) {
      throw new Error(`Dynamic map/terrain selection failure: ${JSON.stringify(dynamicSelection)}`);
    }
    await page.locator("#context-toggle").click();
    await page.locator("#imagery-close").click();
    await page.locator("#viewport canvas").click({ position: { x: 720, y: 500 } });
    await page.waitForFunction(
      () => document.querySelector("#inspection")?.textContent?.includes("Selected terrain cell") === true,
      undefined,
      { timeout: 10_000 },
    );
    const terrainSelection = {
      inspection: await page.locator("#inspection").textContent(),
      imageryVisible: await page.locator("#imagery-panel").evaluate((element) => element.classList.contains("visible")),
    };
    if (!terrainSelection.imageryVisible) {
      throw new Error(`3D terrain evidence failure: ${JSON.stringify(terrainSelection)}`);
    }
    await page.close();
    const experimentalPage = await browser.newPage({ viewport: { width: 1440, height: 1000 } });
    experimentalPage.on("pageerror", (error) => failures.push(error.message));
    experimentalPage.on("response", (response) => { if (response.status() >= 400) failures.push(`${response.status()} ${response.url()}`); });
    await experimentalPage.goto(`http://127.0.0.1:${port}/?grid=10m`, { waitUntil: "networkidle", timeout: 120_000 });
    await experimentalPage.waitForSelector("#statistics dd");
    await experimentalPage.waitForFunction(() => document.querySelectorAll("#statistics dd").length >= 5, undefined, { timeout: 120_000 });
    const experimentalResult = {
      selectedGrid: await experimentalPage.locator("#product-grid").inputValue(),
      canvases: await experimentalPage.locator("canvas").count(),
      statistics: await experimentalPage.locator("#statistics dd").count(),
    };
    if (experimentalResult.selectedGrid !== "10m" || experimentalResult.canvases < 1 || experimentalResult.statistics < 5 || failures.length) {
      throw new Error(`Experimental viewer smoke failure: ${JSON.stringify({ experimentalResult, failures })}`);
    }
    await experimentalPage.close();
    process.stdout.write(`${JSON.stringify({ default: defaultResult, evidence: evidenceResult, dynamicSelection, terrainSelection, experimental: experimentalResult, failures })}\n`);
  } finally {
    await browser.close();
  }
} finally {
  server.kill("SIGTERM");
}
