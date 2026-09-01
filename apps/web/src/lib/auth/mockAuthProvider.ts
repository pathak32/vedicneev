/**
 * Stand-in for Supabase Phone Auth (`supabase.auth.signInWithOtp` /
 * `verifyOtp`). No SMS provider is linked in this project yet, so every
 * send uses one predictable dev OTP instead of a real delivered code —
 * swap this module for a real `@supabase/supabase-js` client once phone
 * auth is configured; `useAuthStore` only calls the two functions below,
 * so that's a contained change.
 */

export const DEV_FALLBACK_OTP = "123456";

const INDIAN_MOBILE_PATTERN = /^[6-9]\d{9}$/;

function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export interface SendOtpResult {
  success: boolean;
  error?: string;
}

export async function sendOtp(phone: string): Promise<SendOtpResult> {
  await delay(400);
  if (!INDIAN_MOBILE_PATTERN.test(phone)) {
    return { success: false, error: "Enter a valid 10-digit Indian mobile number." };
  }
  // eslint-disable-next-line no-console
  console.info(`[mock SMS] OTP for +91${phone}: ${DEV_FALLBACK_OTP} (no SMS provider linked yet)`);
  return { success: true };
}

export interface VerifyOtpResult {
  success: boolean;
  error?: string;
}

export async function verifyOtp(code: string): Promise<VerifyOtpResult> {
  await delay(300);
  if (code !== DEV_FALLBACK_OTP) {
    return { success: false, error: `Incorrect OTP. Use ${DEV_FALLBACK_OTP} in this demo.` };
  }
  return { success: true };
}
