import type { Metadata } from "next";
import "../globals.css";

/** Root layout for the hidden admin routes: plain, unindexed, no site chrome. */
export const metadata: Metadata = { title: "Raw reports · Nepal Flood Tracker", robots: { index: false, follow: false } };

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-ground text-ink font-sans">{children}</body>
    </html>
  );
}
