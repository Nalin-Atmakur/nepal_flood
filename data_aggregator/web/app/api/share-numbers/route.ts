import { getOgNumbers } from "@/lib/queries";
import type { ShareNumbers } from "@/lib/share";

/**
 * GET /api/share-numbers — the three headline numbers (NDRRMA dead · out of contact · rescued) for the share
 * message (lib/use-share-numbers.ts). Same source as the OG card; cached five minutes at the edge.
 */
export const runtime = "nodejs";

export async function GET() {
  let body: ShareNumbers = { dead: null, missing: null, rescued: null };
  try {
    const n = await getOgNumbers();
    body = { dead: n.dead?.value ?? null, missing: n.missing?.value ?? null, rescued: n.rescued?.value ?? null };
  } catch {
    /* unavailable → nulls */
  }
  return Response.json(body, { headers: { "Cache-Control": "public, max-age=60, s-maxage=300, stale-while-revalidate=600" } });
}
