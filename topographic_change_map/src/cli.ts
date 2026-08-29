#!/usr/bin/env node
import { cloneBreezeProfile } from "./browser/clone.js";
import {
  isWithinSecondaryDisplay,
  launchHeadedSession,
  readChromeWindowBounds,
} from "./browser/launch.js";
import { loadConfig } from "./config.js";
import { buildPublicCatalogue } from "./catalogue/build.js";
import { readMousePosition } from "./mouse.js";
import { checkRemote } from "./remote.js";
import { loadState, saveState } from "./state.js";

async function main(): Promise<void> {
  const command = process.argv[2] ?? "help";
  if (command === "preflight") {
    const config = await loadConfig();
    const remote = await checkRemote(config);
    saveState(loadState());
    process.stdout.write(`${JSON.stringify({ ok: true, remote })}\n`);
    return;
  }
  if (command === "remote-check") {
    const config = await loadConfig();
    process.stdout.write(`${JSON.stringify(await checkRemote(config))}\n`);
    return;
  }
  if (command === "catalogue-public") {
    process.stdout.write(`${JSON.stringify(await buildPublicCatalogue())}\n`);
    return;
  }
  if (command === "browser-prepare") {
    await cloneBreezeProfile();
    process.stdout.write(`${JSON.stringify({ ok: true, profile: "Breeze clone ready" })}\n`);
    return;
  }
  if (command === "browser-smoke") {
    const mouseBefore = await readMousePosition();
    const session = await launchHeadedSession();
    const bounds = await readChromeWindowBounds(session.dashboard);
    if (!isWithinSecondaryDisplay(bounds)) {
      await session.context.close();
      throw new Error(`Chrome opened outside display 1: ${JSON.stringify(bounds)}`);
    }
    const mouseAfter = await readMousePosition();
    const mouseUnchanged = mouseBefore.x === mouseAfter.x && mouseBefore.y === mouseAfter.y;
    if (!mouseUnchanged) {
      await session.context.close();
      throw new Error("System mouse moved during headed browser automation");
    }
    process.stdout.write(
      `${JSON.stringify({ ok: true, headed: true, display: 1, bounds, mouseUnchanged })}\n`,
    );
    await new Promise<void>((resolve) => {
      const timer = setTimeout(resolve, 15_000);
      session.context.once("close", () => {
        clearTimeout(timer);
        resolve();
      });
    });
    await session.context.close();
    return;
  }

  process.stdout.write(
    "Usage: npm run cli -- <preflight|remote-check|browser-prepare|browser-smoke|catalogue-public>\n",
  );
}

main().catch((error: unknown) => {
  const message = error instanceof Error ? error.message : "Unknown error";
  process.stderr.write(`${JSON.stringify({ ok: false, error: message })}\n`);
  process.exitCode = 1;
});
