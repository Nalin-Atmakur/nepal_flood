#!/usr/bin/env node
/**
 * Rasterise app/icon.svg into the icons Next serves: apple-icon 180, icon 192/512 for the manifest, and
 * app/favicon.ico — an ICO container holding 16/32/48 px PNGs (every current browser reads PNG-in-ICO).
 * The .ico matters: Next links it first and Safari/Chrome prefer it, so a stale one (the create-next-app
 * placeholder is the Vercel triangle) wins over icon.svg. Run with `npm run icons`.
 */
import { readFile, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";
const here = dirname(fileURLToPath(import.meta.url));
const svg = await readFile(resolve(here, "../app/icon.svg"));
const png = (size) => sharp(svg).resize(size, size).png().toBuffer();
for (const [name, size] of [["../app/apple-icon.png", 180], ["../public/icon-192.png", 192], ["../public/icon-512.png", 512]]) {
  await writeFile(resolve(here, name), await png(size));
  console.log("wrote", name, size);
}

/** ICO = 6-byte header + 16-byte directory entry per image + the images (PNG blobs are allowed). */
function ico(images) {
  const header = Buffer.alloc(6);
  header.writeUInt16LE(0, 0); // reserved
  header.writeUInt16LE(1, 2); // type: icon
  header.writeUInt16LE(images.length, 4);
  const dir = Buffer.alloc(16 * images.length);
  let offset = 6 + dir.length;
  images.forEach(({ size, data }, i) => {
    const e = i * 16;
    dir.writeUInt8(size >= 256 ? 0 : size, e); // width (0 = 256)
    dir.writeUInt8(size >= 256 ? 0 : size, e + 1); // height
    dir.writeUInt8(0, e + 2); // palette
    dir.writeUInt8(0, e + 3); // reserved
    dir.writeUInt16LE(1, e + 4); // colour planes
    dir.writeUInt16LE(32, e + 6); // bits per pixel
    dir.writeUInt32LE(data.length, e + 8);
    dir.writeUInt32LE(offset, e + 12);
    offset += data.length;
  });
  return Buffer.concat([header, dir, ...images.map((i) => i.data)]);
}
const sizes = [16, 32, 48];
const favicon = ico(await Promise.all(sizes.map(async (size) => ({ size, data: await png(size) }))));
await writeFile(resolve(here, "../app/favicon.ico"), favicon);
console.log("wrote ../app/favicon.ico", sizes.join("/"), favicon.length, "bytes");
