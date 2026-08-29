import fs from "node:fs";
import path from "node:path";
import { z } from "zod";
import type { HeadedSession } from "./launch.js";
import { loadConfig } from "../config.js";
import { WORK_ROOT } from "../constants.js";
import { ensureGmailAuthenticated } from "../email/gmail.js";
import { redactValue } from "../redaction.js";

const commandSchema = z.object({
  id: z.string().min(1),
  type: z.enum(["GMAIL_AUTH", "PLANET_INSPECT"]),
});

export type BrowserCommandType = z.infer<typeof commandSchema>["type"];

const CONTROL_ROOT = path.join(WORK_ROOT, "browser-control");
const REQUEST_PATH = path.join(CONTROL_ROOT, "request.json");

function atomicJson(target: string, value: unknown): void {
  fs.mkdirSync(path.dirname(target), { recursive: true, mode: 0o700 });
  const temporary = `${target}.${process.pid}.tmp`;
  fs.writeFileSync(temporary, `${JSON.stringify(value, null, 2)}\n`, { mode: 0o600 });
  fs.renameSync(temporary, target);
}

async function inspectPlanet(session: HeadedSession): Promise<unknown> {
  const page = session.provider;
  await page.goto("https://www.planet.com/account/", { waitUntil: "domcontentloaded" });
  await page.waitForTimeout(2500);
  const screenshotRoot = path.join(WORK_ROOT, "screenshots");
  fs.mkdirSync(screenshotRoot, { recursive: true, mode: 0o700 });
  const screenshot = path.join(screenshotRoot, "planet-account-inspect.png");
  await page.screenshot({ path: screenshot, fullPage: true });
  const inputs = await page.locator("input").evaluateAll((elements) =>
    elements.map((element) => ({
      type: element.getAttribute("type"),
      name: element.getAttribute("name"),
      autocomplete: element.getAttribute("autocomplete"),
      placeholder: element.getAttribute("placeholder"),
    })),
  );
  const links = await page.locator("a").evaluateAll((elements) =>
    elements
      .map((element) => ({ text: (element.textContent ?? "").trim(), href: (element as HTMLAnchorElement).href }))
      .filter((entry) => /sign|register|account/i.test(entry.text))
      .slice(0, 20),
  );
  return {
    host: new URL(page.url()).host,
    path: new URL(page.url()).pathname,
    title: await page.title(),
    inputs,
    links,
    screenshot,
  };
}

async function execute(session: HeadedSession, type: BrowserCommandType): Promise<unknown> {
  if (type === "GMAIL_AUTH") {
    const config = await loadConfig();
    return await ensureGmailAuthenticated(session.gmail, config);
  }
  if (type === "PLANET_INSPECT") return await inspectPlanet(session);
  throw new Error(`Unsupported browser command: ${type satisfies never}`);
}

export async function runBrowserCommandLoop(session: HeadedSession): Promise<() => void> {
  fs.mkdirSync(CONTROL_ROOT, { recursive: true, mode: 0o700 });
  let busy = false;
  const timer = setInterval(async () => {
    if (busy || !fs.existsSync(REQUEST_PATH)) return;
    busy = true;
    let id = "unknown";
    try {
      const request = commandSchema.parse(JSON.parse(fs.readFileSync(REQUEST_PATH, "utf8")));
      id = request.id;
      fs.rmSync(REQUEST_PATH);
      const result = await execute(session, request.type);
      atomicJson(path.join(CONTROL_ROOT, `${id}.response.json`), {
        id,
        ok: true,
        result: redactValue(result),
      });
    } catch (error) {
      fs.rmSync(REQUEST_PATH, { force: true });
      atomicJson(path.join(CONTROL_ROOT, `${id}.response.json`), {
        id,
        ok: false,
        error: error instanceof Error ? error.message : "Unknown browser command failure",
      });
    } finally {
      busy = false;
    }
  }, 500);
  return () => clearInterval(timer);
}

export async function submitBrowserCommand(type: BrowserCommandType): Promise<unknown> {
  fs.mkdirSync(CONTROL_ROOT, { recursive: true, mode: 0o700 });
  if (fs.existsSync(REQUEST_PATH)) throw new Error("Another browser command is pending");
  const id = `${Date.now()}-${process.pid}`;
  const responsePath = path.join(CONTROL_ROOT, `${id}.response.json`);
  atomicJson(REQUEST_PATH, { id, type });
  const deadline = Date.now() + 120_000;
  while (Date.now() < deadline) {
    if (fs.existsSync(responsePath)) {
      const response = JSON.parse(fs.readFileSync(responsePath, "utf8"));
      fs.rmSync(responsePath);
      return response;
    }
    await new Promise((resolve) => setTimeout(resolve, 500));
  }
  throw new Error(`Browser command ${type} timed out`);
}
