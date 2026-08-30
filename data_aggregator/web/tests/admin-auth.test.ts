import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { ADMIN_SESSION_MS, adminConfigured, checkPassword, signToken, verifyToken } from "@/lib/admin-auth";

describe("admin gate", () => {
  const saved = process.env.ADMIN_PASSWORD;
  beforeEach(() => {
    process.env.ADMIN_PASSWORD = "correct-horse-battery-staple";
  });
  afterEach(() => {
    if (saved === undefined) delete process.env.ADMIN_PASSWORD;
    else process.env.ADMIN_PASSWORD = saved;
  });

  it("is off without a password of at least 12 characters", () => {
    process.env.ADMIN_PASSWORD = "short";
    expect(adminConfigured()).toBe(false);
    expect(signToken()).toBeNull();
    expect(checkPassword("short")).toBe(true); // the check itself still compares, the gate just refuses to sign
    expect(verifyToken("1.abc")).toBe(false);
  });

  it("accepts only the exact password", () => {
    expect(checkPassword("correct-horse-battery-staple")).toBe(true);
    expect(checkPassword("correct-horse-battery-stapl")).toBe(false);
    expect(checkPassword("")).toBe(false);
    expect(checkPassword(null)).toBe(false);
  });

  it("signs tokens that verify until they expire, and not after the password changes", () => {
    const t = signToken()!;
    expect(verifyToken(t)).toBe(true);
    expect(verifyToken(t, Date.now() + ADMIN_SESSION_MS + 1)).toBe(false);
    expect(verifyToken(t.slice(0, -1) + "x")).toBe(false);
    expect(verifyToken("garbage")).toBe(false);
    process.env.ADMIN_PASSWORD = "a-different-password-now";
    expect(verifyToken(t)).toBe(false);
  });
});
