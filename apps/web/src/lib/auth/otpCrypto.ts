import { createHash, randomInt, timingSafeEqual } from "crypto";

/** Generates a 6-digit code from a CSPRNG (crypto.randomInt, not Math.random) — "000000"–"999999", zero-padded. */
export function generateOtpCode(): string {
  return String(randomInt(0, 1_000_000)).padStart(6, "0");
}

/**
 * One-way hash for storing a code — plain SHA-256 is fine here despite
 * being fast (not a password KDF like bcrypt): a 6-digit code's entropy
 * is what actually needs protecting, and that's the job of the attempt
 * cap + short expiry enforced by the route, not the hash's slowness.
 */
export function hashOtpCode(code: string, phone: string): string {
  // Salted with the phone number so two users who happen to get the same
  // 6-digit code don't produce the same hash.
  return createHash("sha256").update(`${phone}:${code}`).digest("hex");
}

export function otpCodeMatches(code: string, phone: string, storedHash: string): boolean {
  const expected = Buffer.from(hashOtpCode(code, phone), "utf8");
  const actual = Buffer.from(storedHash, "utf8");
  return expected.length === actual.length && timingSafeEqual(expected, actual);
}
