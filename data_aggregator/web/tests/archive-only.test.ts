import { describe, expect, it } from "vitest";
import { deriveTrail } from "@/components/me/MyFolder";
import type { OwnReport } from "@/lib/queries";

const report = (status: OwnReport["status"], withdrawn_at: string | null = null): OwnReport => ({
  id: "11111111-1111-1111-1111-111111111111",
  created_at: "2026-08-30T12:00:00Z",
  lang: "en",
  respondent_type: "family",
  place_id: "timure",
  supersedes: null,
  withdrawn_at,
  status,
});

describe("archive-only family intake", () => {
  it("shows only the private receipt state for active reports", () => {
    expect(deriveTrail(report("received"), "en").map((step) => step.key)).toEqual(["received"]);
  });

  it("shows receipt then withdrawal without processing states", () => {
    expect(deriveTrail(report("withdrawn", "2026-08-30T13:00:00Z"), "en").map((step) => step.key)).toEqual([
      "received",
      "withdrawn",
    ]);
  });
});
