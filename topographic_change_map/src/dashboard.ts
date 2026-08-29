import fs from "node:fs";
import http from "node:http";
import path from "node:path";
import { PROJECT_ROOT } from "./constants.js";

const STATUS_PATH = path.join(PROJECT_ROOT, "STATUS.md");
const REPORT_PATH = path.join(PROJECT_ROOT, "catalogue/REPORT.md");

function escapeHtml(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;");
}

function render(): string {
  const status = fs.existsSync(STATUS_PATH) ? fs.readFileSync(STATUS_PATH, "utf8") : "Status unavailable";
  const report = fs.existsSync(REPORT_PATH) ? fs.readFileSync(REPORT_PATH, "utf8") : "Catalogue not generated";
  return `<!doctype html>
<html><head><meta charset="utf-8"><meta http-equiv="refresh" content="15">
<title>Nepal Flood Topographic Change Map</title>
<style>
body{font-family:ui-monospace,SFMono-Regular,Menlo,monospace;margin:0;background:#10151c;color:#e8eef5}
header{position:sticky;top:0;background:#16324a;padding:14px 22px;border-bottom:2px solid #2d82b7}
main{display:grid;grid-template-columns:1fr 1fr;gap:16px;padding:16px}
section{background:#18212b;border:1px solid #304253;border-radius:8px;padding:16px;min-width:0}
pre{white-space:pre-wrap;word-break:break-word;font-size:12px;line-height:1.4}
.live{color:#6ee7a8}.muted{color:#9fb0c0;font-size:12px}
</style></head><body>
<header><strong>Nepal Flood Topographic Change Map</strong> <span class="live">● LIVE</span>
<div class="muted">Headed Chrome · secondary display · refreshes every 15 seconds · ${escapeHtml(new Date().toISOString())}</div></header>
<main><section><h2>Execution status</h2><pre>${escapeHtml(status)}</pre></section>
<section><h2>Public catalogue</h2><pre>${escapeHtml(report)}</pre></section></main>
</body></html>`;
}

export async function startDashboard(port = 4173): Promise<{ url: string; close: () => Promise<void> }> {
  const server = http.createServer((request, response) => {
    if (request.url !== "/" && request.url !== "/index.html") {
      response.writeHead(404).end("Not found");
      return;
    }
    response.writeHead(200, { "content-type": "text/html; charset=utf-8", "cache-control": "no-store" });
    response.end(render());
  });
  await new Promise<void>((resolve, reject) => {
    server.once("error", reject);
    server.listen(port, "127.0.0.1", resolve);
  });
  return {
    url: `http://127.0.0.1:${port}/`,
    close: async () => await new Promise<void>((resolve, reject) => server.close((error) => (error ? reject(error) : resolve()))),
  };
}
