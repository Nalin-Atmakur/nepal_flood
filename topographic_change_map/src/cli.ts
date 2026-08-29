#!/usr/bin/env node
import { cloneBreezeProfile } from "./browser/clone.js";
import { runBrowserCommandLoop, submitBrowserCommand } from "./browser/commands.js";
import {
  isWithinTargetDisplay,
  launchBrowserSession,
  launchHeadedSession,
  readChromeWindowBounds,
} from "./browser/launch.js";
import { loadConfig } from "./config.js";
import { buildPublicCatalogue } from "./catalogue/build.js";
import { startDashboard } from "./dashboard.js";
import { ensureGmailAuthenticated } from "./email/gmail.js";
import { readMousePosition } from "./mouse.js";
import { runPublicParallaxPilots } from "./parallax/publicPilot.js";
import { buildCoverageReport } from "./coverage/build.js";
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
  if (command === "parallax-public") {
    process.stdout.write(`${JSON.stringify(await runPublicParallaxPilots())}\n`);
    return;
  }
  if (command === "coverage-build") {
    process.stdout.write(`${JSON.stringify(buildCoverageReport())}\n`);
    return;
  }
  if (command === "browser-prepare") {
    await cloneBreezeProfile();
    process.stdout.write(`${JSON.stringify({ ok: true, profile: "Breeze clone ready" })}\n`);
    return;
  }
  if (command === "gmail-auth") {
    const config = await loadConfig();
    const session = await launchBrowserSession({ headed: false });
    try {
      const result = await ensureGmailAuthenticated(session.gmail, config);
      process.stdout.write(`${JSON.stringify(result)}\n`);
      if (result.status !== "AUTHENTICATED") process.exitCode = 2;
    } finally {
      await session.context.close();
    }
    return;
  }
  if (command === "browser-smoke") {
    const mouseBefore = await readMousePosition();
    const session = await launchHeadedSession();
    const bounds = await readChromeWindowBounds(session.dashboard);
    if (!isWithinTargetDisplay(bounds)) {
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
  if (command === "browser-run") {
    const dashboard = await startDashboard();
    const session = await launchBrowserSession({ headed: false, dashboardUrl: dashboard.url });
    process.stdout.write(`${JSON.stringify({ ok: true, persistent: true, headed: false })}\n`);
    await new Promise<void>((resolve) => {
      const finish = (): void => resolve();
      process.once("SIGINT", finish);
      process.once("SIGTERM", finish);
      session.context.once("close", finish);
    });
    await session.context.close().catch(() => undefined);
    await dashboard.close().catch(() => undefined);
    return;
  }
  if (command === "browser-headed-run") {
    const dashboard = await startDashboard();
    const mouseBefore = await readMousePosition();
    const session = await launchBrowserSession({ headed: true, dashboardUrl: dashboard.url });
    const bounds = await readChromeWindowBounds(session.dashboard);
    const mouseAfter = await readMousePosition();
    if (!isWithinTargetDisplay(bounds) || mouseBefore.x !== mouseAfter.x || mouseBefore.y !== mouseAfter.y) {
      await session.context.close();
      await dashboard.close();
      throw new Error("Persistent headed session violated display or no-mouse invariant");
    }
    process.stdout.write(`${JSON.stringify({ ok: true, persistent: true, headed: true, bounds, mouseUnchanged: true })}\n`);
    const stopCommands = await runBrowserCommandLoop(session);
    await new Promise<void>((resolve) => {
      const finish = (): void => resolve();
      process.once("SIGINT", finish);
      process.once("SIGTERM", finish);
      session.context.once("close", finish);
    });
    stopCommands();
    await session.context.close().catch(() => undefined);
    await dashboard.close().catch(() => undefined);
    return;
  }
  if (command === "browser-command") {
    const requested = process.argv[3];
    if (requested !== "GMAIL_AUTH" && requested !== "PLANET_INSPECT") {
      throw new Error("browser-command requires GMAIL_AUTH or PLANET_INSPECT");
    }
    process.stdout.write(`${JSON.stringify(await submitBrowserCommand(requested))}\n`);
    return;
  }

  process.stdout.write(
    "Usage: npm run cli -- <preflight|remote-check|browser-prepare|browser-smoke|browser-run|browser-headed-run|browser-command TYPE|gmail-auth|catalogue-public|parallax-public|coverage-build>\n",
  );
}

main().catch((error: unknown) => {
  const message = error instanceof Error ? error.message : "Unknown error";
  process.stderr.write(`${JSON.stringify({ ok: false, error: message })}\n`);
  process.exitCode = 1;
});
