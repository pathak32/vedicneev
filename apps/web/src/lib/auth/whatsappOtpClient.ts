/**
 * Client-side wrapper for the real, Supabase-backed WhatsApp OTP sign-in
 * routes — POST /api/auth/whatsapp/send-otp and
 * POST /api/auth/whatsapp/verify-otp — which useAuthStore.ts calls
 * whenever a Supabase project is configured (see lib/supabase/env.ts's
 * isSupabaseAuthConfigured). Mirrors mockAuthProvider.ts's result shapes
 * so useAuthStore.ts can select between the two with minimal branching.
 */

export interface SendOtpResult {
  success: boolean;
  error?: string;
}

export interface VerifyOtpResult {
  success: boolean;
  error?: string;
  user?: { id: string; phone: string };
}

async function postJson(
  url: string,
  body: Record<string, unknown>
): Promise<{ success?: boolean; error?: string; user?: { id: string; phone: string } }> {
  try {
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    return await res.json();
  } catch {
    return { success: false, error: "Network error — could not reach the server." };
  }
}

export async function sendOtp(phone: string): Promise<SendOtpResult> {
  const data = await postJson("/api/auth/whatsapp/send-otp", { phone });
  return { success: !!data.success, error: data.error };
}

export async function verifyOtp(phone: string, code: string): Promise<VerifyOtpResult> {
  const data = await postJson("/api/auth/whatsapp/verify-otp", { phone, code });
  return { success: !!data.success, error: data.error, user: data.user };
}
