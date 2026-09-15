/**
 * Client-side wrapper for this app's own /api/auth/whatsapp/{send,verify}-otp
 * routes. Unlike apps/web's equivalent (whatsappOtpClient.ts there), this
 * app has no separate client-only demo-mode provider to branch against —
 * the server-side routes (packages/auth's whatsappOtp.ts) already fall
 * back to a phone-only upsert when Supabase isn't configured, so the
 * client here always calls the real endpoint either way.
 */
export interface SendOtpResult {
  success: boolean;
  error?: string;
}

export interface VerifyOtpResult {
  success: boolean;
  error?: string;
}

async function postJson(url: string, body: Record<string, unknown>): Promise<{ success?: boolean; error?: string }> {
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
  return { success: !!data.success, error: data.error };
}
