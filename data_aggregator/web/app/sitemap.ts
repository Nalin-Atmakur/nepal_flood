import type { MetadataRoute } from "next";
import { SITE_HOST } from "@/lib/config";
import { LANGS } from "@/lib/i18n";
import { getPlaces } from "@/lib/queries";

export const revalidate = 3600;

/** Every public route in the three languages, plus one entry per gazetteer place. */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = `https://www.${SITE_HOST}`;
  const now = new Date();
  const statics = ["", "/numbers", "/places", "/latest", "/report", "/sources", "/about"];
  const out: MetadataRoute.Sitemap = [];
  for (const lang of LANGS) {
    for (const p of statics) {
      out.push({ url: `${base}/${lang}${p}`, lastModified: now, changeFrequency: p === "" ? "hourly" : "daily", priority: p === "" ? 1 : 0.7 });
    }
  }
  const places = (await getPlaces()) ?? [];
  for (const place of places) {
    for (const lang of LANGS) out.push({ url: `${base}/${lang}/places/${place.id}`, lastModified: now, changeFrequency: "hourly", priority: 0.6 });
  }
  return out;
}
