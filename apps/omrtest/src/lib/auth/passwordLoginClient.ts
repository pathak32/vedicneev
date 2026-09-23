/** Client-side wrapper for POST /api/auth/password/login — same shape as whatsappOtpClient.ts's helpers. */
export interface PasswordLoginResult {
  success: boolean;
  error?: string;
}

export async function loginWithPassword(phone: string, password: string): Promise<PasswordLoginResult> {
  try {
    const res = await fetch("/api/auth/password/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ phone, password }),
    });
    const data = await res.json();
    return { success: !!data.success, error: data.error };
  } catch {
    return { success: false, error: "Network error — could not reach the server." };
  }
}
