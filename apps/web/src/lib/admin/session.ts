/**
 * A minimal, real (not fake/theater) shared-secret gate for the /admin
 * panel — there's no user-role system in this project yet (packages/db's
 * UserRole enum is only STUDENT/PARENT; auth is a fully client-side mock,
 * see apps/web/src/lib/auth/mockAuthProvider.ts), so this deliberately
 * doesn't try to hook into that. Session is a stateless signed cookie: its
 * value is an HMAC of a fixed marker string keyed by ADMIN_ACCESS_KEY, so
 * middleware can verify it without any server-side session storage, and
 * the cookie value itself never reveals the password.
 *
 * Built on the Web Crypto API (crypto.subtle), not node:crypto — this file
 * is imported by middleware.ts, which Next.js always runs on the Edge
 * Runtime, and node:crypto's createHmac/timingSafeEqual aren't available
 * there. crypto.subtle and a hand-rolled constant-time compare work in
 * both the Edge Runtime and normal Node.js route handlers.
 */

export const ADMIN_SESSION_COOKIE = "vn_admin_session";
const SESSION_MARKER = "admin-authenticated";

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

/** The value to store in the session cookie once a login password check has already succeeded. */
export async function createSessionToken(): Promise<string | null> {
  const key = getAdminKey();
  if (!key) return null;
  return hmacHex(key, SESSION_MARKER);
}

/** True only if `token` is a valid session for the currently configured ADMIN_ACCESS_KEY. */
export async function isValidSessionToken(token: string | undefined | null): Promise<boolean> {
  if (!token) return false;
  const expected = await createSessionToken();
  if (!expected) return false;
  return constantTimeEqual(expected, token);
}

/** Constant-time check of a submitted login password against ADMIN_ACCESS_KEY. */
export function isValidAdminPassword(password: string): boolean {
  const key = getAdminKey();
  if (!key) return false;
  return constantTimeEqual(key, password);
}
