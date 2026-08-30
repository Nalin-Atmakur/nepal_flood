import { cookies } from "next/headers";
import { ADMIN_COOKIE, verifyToken } from "@/lib/admin-auth";
import { fetchRawReports, toCsv } from "../data";

/** GET /admin/reports/export — the raw archive as CSV, for the same session cookie the page sets. Never cached. */
export const dynamic = "force-dynamic";

export async function GET() {
  const jar = await cookies();
  if (!verifyToken(jar.get(ADMIN_COOKIE)?.value)) return new Response("Unauthorized", { status: 401 });
  const data = await fetchRawReports(5000);
  if (!data) return new Response("Archive unavailable (service key missing?)", { status: 503 });
  const stamp = new Date().toISOString().replace(/[:.]/g, "-");
  return new Response(toCsv(data.reports), {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="reports-archive-${stamp}.csv"`,
      "Cache-Control": "no-store",
    },
  });
}
