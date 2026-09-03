/**
 * A minimal, real (not fake/theater) auth gate for the /admin panel.
 *
 * There's still only one real credential in this app — the shared
 * ADMIN_ACCESS_KEY password (packages/db's User model has no password
 * field for anyone, admin included; student/parent auth is a fully
 * client-side OTP mock, see apps/web/src/lib/auth/mockAuthProvider.ts) —
 * but the session itself is now bound to an actual `User` row with
 * role: ADMIN (see getOrCreateAdminUser below), not just a static
 * "authenticated" marker. That split matches the two layers of
 * enforcement in this app:
 *   - middleware.ts (Edge Runtime, no Prisma access) can only verify the
 *     cookie's HMAC signature — enough to bounce anonymous traffic away
 *     from /admin before it costs a render.
 *   - app/admin/(protected)/layout.tsx (Node.js) does the real,
 *     DB-backed check: decode the signed userId, load that User via
 *     Prisma, and confirm role === "ADMIN" before rendering anything.
 *
 * Built on the Web Crypto API (crypto.subtle), not node:crypto, because
 * middleware.ts needs to import isValidSessionToken and Next.js always
 * runs middleware on the Edge Runtime, where node:crypto isn't available.
 */

export const ADMIN_SESSION_COOKIE = "vn_admin_session";

/** The one admin account this app manages — see getOrCreateAdminUser. */
export const ADMIN_USER_PHONE = "vedicneev-admin";

const encoder = new TextEncoder();

function getAdminKey(): string | null {
  const key = process.env.ADMIN_ACCESS_KEY;
  return key && key.length > 0 ? key : null;
}

export function isAdminConfigured(): boolean {
  return getAdminKey() !== null;
}

function toHex(buffer: ArrayBuffer): string {
  return Array.from(new Uint8Array(buffer))
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");
}

/** Same-length, timing-safe string compare (Node's `timingSafeEqual` isn't available in the Edge Runtime). */
function constantTimeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i += 1) {
    diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return diff === 0;
}

async function hmacHex(key: string, message: string): Promise<string> {
  const cryptoKey = await crypto.subtle.importKey("raw", encoder.encode(key), { name: "HMAC", hash: "SHA-256" }, false, [
    "sign",
  ]);
  const signature = await crypto.subtle.sign("HMAC", cryptoKey, encoder.encode(message));
  return toHex(signature);
}

/** `<userId>.<hmac>` — the userId travels in the clear (it's not a secret) but can't be forged without ADMIN_ACCESS_KEY. */
export async function createSessionToken(userId: string): Promise<string | null> {
  const key = getAdminKey();
  if (!key) return null;
  const signature = await hmacHex(key, userId);
  return `${userId}.${signature}`;
}

/** Verifies the token's signature and, if valid, returns the admin userId it was issued for. */
export async function verifySessionToken(token: string | undefined | null): Promise<string | null> {
  if (!token) return null;
  const key = getAdminKey();
  if (!key) return null;

  const separatorIndex = token.lastIndexOf(".");
  if (separatorIndex <= 0) return null;
  const userId = token.slice(0, separatorIndex);
  const signature = token.slice(separatorIndex + 1);

  const expected = await hmacHex(key, userId);
  return constantTimeEqual(expected, signature) ? userId : null;
}

/** True only if `token`'s signature is valid — used by middleware.ts, which can't reach the database to check the role. */
export async function isValidSessionToken(token: string | undefined | null): Promise<boolean> {
  return (await verifySessionToken(token)) !== null;
}

/** Constant-time check of a submitted login password against ADMIN_ACCESS_KEY. */
export function isValidAdminPassword(password: string): boolean {
  const key = getAdminKey();
  if (!key) return false;
  return constantTimeEqual(key, password);
}
