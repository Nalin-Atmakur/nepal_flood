#!/usr/bin/env node
/** Rasterise app/icon.svg into the PNG icons Next serves (apple-icon 180, icon 192/512 for the manifest). */
import { readFile, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";
const here = dirname(fileURLToPath(import.meta.url));
const svg = await readFile(resolve(here, "../app/icon.svg"));
for (const [name, size] of [["../app/apple-icon.png", 180], ["../public/icon-192.png", 192], ["../public/icon-512.png", 512]]) {
  await writeFile(resolve(here, name), await sharp(svg).resize(size, size).png().toBuffer());
  console.log("wrote", name, size);
}
