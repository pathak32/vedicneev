/**
 * Client-side wrapper for POST /api/auth/whatsapp-otp — the real,
 * Supabase-backed sign-in path useAuthStore.ts calls whenever a Supabase
 * project is configured (see lib/supabase/env.ts's isSupabaseAuthConfigured).
 * Mirrors mockAuthProvider.ts's result shapes so useAuthStore.ts can select
 * between the two with minimal branching.
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

async function postOtp(body: Record<string, unknown>): Promise<{
  success?: boolean;
  error?: string;
  user?: { id: string; phone: string };
}> {
  try {
    const res = await fetch("/api/auth/whatsapp-otp", {
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
  const data = await postOtp({ action: "send", phone });
  return { success: !!data.success, error: data.error };
}

export async function verifyOtp(phone: string, code: string): Promise<VerifyOtpResult> {
  const data = await postOtp({ action: "verify", phone, code });
  return { success: !!data.success, error: data.error, user: data.user };
}
