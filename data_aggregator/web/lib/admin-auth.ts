import { createHmac, createHash, timingSafeEqual } from "node:crypto";

/**
 * The hidden raw-reports page's gate (web/docs/20-admin-reports.md). One password, held only in the server
 * environment (`ADMIN_PASSWORD`, never in the repo or the client bundle). A correct password sets an httpOnly
 * cookie carrying `expiry.hmac` signed with a key derived from the password, so a token cannot be forged
 * without it and every token dies when the password is rotated. Server-only (node:crypto).
 */
export const ADMIN_COOKIE = "nft_admin";
export const ADMIN_SESSION_MS = 12 * 60 * 60 * 1000;

function secret(): Buffer | null {
  const pw = process.env.ADMIN_PASSWORD;
  if (!pw || pw.length < 12) return null;
  return createHash("sha256").update(`nft-admin-v1:${pw}`).digest();
}

export function adminConfigured(): boolean {
  return secret() !== null;
}

/** Constant-time password check (both sides hashed to equal length first). */
export function checkPassword(input: string | null | undefined): boolean {
  const pw = process.env.ADMIN_PASSWORD;
  if (!pw || !input) return false;
  const a = createHash("sha256").update(input).digest();
  const b = createHash("sha256").update(pw).digest();
  return timingSafeEqual(a, b);
}

function sign(exp: number, key: Buffer): string {
  return createHmac("sha256", key).update(String(exp)).digest("base64url");
}

/** A session token valid until `now + ADMIN_SESSION_MS` (or a given expiry, for tests). */
export function signToken(expiresAt: number = Date.now() + ADMIN_SESSION_MS): string | null {
  const key = secret();
  if (!key) return null;
  return `${expiresAt}.${sign(expiresAt, key)}`;
}

export function verifyToken(token: string | null | undefined, now: number = Date.now()): boolean {
  const key = secret();
  if (!key || !token) return false;
  const dot = token.indexOf(".");
  if (dot <= 0) return false;
  const exp = Number(token.slice(0, dot));
  if (!Number.isFinite(exp) || exp < now) return false;
  const expected = Buffer.from(sign(exp, key));
  const given = Buffer.from(token.slice(dot + 1));
  return expected.length === given.length && timingSafeEqual(expected, given);
}
