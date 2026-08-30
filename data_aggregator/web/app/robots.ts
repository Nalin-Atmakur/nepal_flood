import type { MetadataRoute } from "next";
import { SITE_HOST } from "@/lib/config";

/** Everything public is crawlable; the OG image route and the per-device folder are not useful to index. */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: [{ userAgent: "*", allow: "/", disallow: ["/api/", "/en/me", "/ne/me", "/hi/me", "/en/run", "/ne/run", "/hi/run"] }],
    sitemap: `https://www.${SITE_HOST}/sitemap.xml`,
  };
}
