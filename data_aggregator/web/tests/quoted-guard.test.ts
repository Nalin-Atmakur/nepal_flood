import { describe, expect, it } from "vitest";
import { AGENCIES, STAT_CARDS } from "@/lib/config";

/**
 * `*_quoted` figures are third-party numbers lifted from NRCS / ReliefWeb reports (pipeline wave 4). They are
 * context for the digest and place lines, never headline numbers — no column candidate and no stat card may
 * name one. Mirrors pipeline/tests/test_quoted_guard.py.
 */
describe("quoted-figure guard", () => {
  it("no side-by-side column candidate ends with _quoted", () => {
    for (const a of AGENCIES) {
      for (const m of [...a.dead, ...a.missing, ...a.rescued]) expect(m.endsWith("_quoted"), `${a.key}: ${m}`).toBe(false);
      for (const p of a.publishers) expect(/quoted/i.test(p), `${a.key}: ${p}`).toBe(false);
    }
  });
  it("no stat card id ends with _quoted", () => {
    for (const c of STAT_CARDS) expect(c.id.endsWith("_quoted"), c.id).toBe(false);
  });
});
