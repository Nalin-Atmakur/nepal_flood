import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Nepal Flood Tracker",
    short_name: "Flood Tracker",
    description: "Live picture of the 26 August 2026 Bhote Koshi / Trishuli flood.",
    start_url: "/",
    display: "standalone",
    background_color: "#f2f3f6",
    theme_color: "#2438e8",
    icons: [
      { src: "/icon-192.png", sizes: "192x192", type: "image/png" },
      { src: "/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
  };
}
