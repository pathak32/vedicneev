import bcrypt from "bcryptjs";

const BCRYPT_ROUNDS = 12;
const PIN_PATTERN = /^\d{6}$/;
const MIN_PASSWORD_LENGTH = 8;

/**
 * Accepts either a 6-digit PIN or a full password (>=8 chars) — the two
 * options /onboarding and /settings both offer. Both are hashed identically
 * (see InstituteAdmin.passwordHash's own comment); this is purely a
 * shared client/server validation rule, not a shape the hash itself
 * encodes.
 */
export function validateSecretShape(secret: string): string | null {
  if (PIN_PATTERN.test(secret)) return null;
  if (secret.length >= MIN_PASSWORD_LENGTH) return null;
  return "Enter a 6-digit PIN or a password of at least 8 characters.";
}

export function hashSecret(secret: string): Promise<string> {
  return bcrypt.hash(secret, BCRYPT_ROUNDS);
}

export function verifySecret(secret: string, hash: string): Promise<boolean> {
  return bcrypt.compare(secret, hash);
}
