"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

import { sendOtp, verifyOtp } from "@/lib/auth/whatsappOtpClient";

const INDIAN_MOBILE_PATTERN = /^[6-9]\d{9}$/;
const RESEND_SECONDS = 30;

/**
 * Institute partner sign-in — the same WhatsApp-OTP-to-Supabase-session
 * flow apps/web's PhoneAuthModal uses, now via the shared @vedicneev/auth
 * package instead of a second implementation. On a verified code the
 * session cookie is already set (see verify-otp/route.ts's comment); this
 * page's only remaining job is to hand off to /login/callback, which does
 * the actual InstituteAdmin check and redirect (dashboard vs onboarding
 * vs, on a real failure, back here with an error).
 */
export default function LoginPage() {
  return (
    <Suspense fallback={null}>
      <LoginForm />
    </Suspense>
  );
}

/**
 * useSearchParams (to read `next`/`error`) opts a component out of static
 * rendering unless it's under a Suspense boundary — split out so the outer
 * page.tsx export satisfies that without every piece of markup needing to
 * live inside the boundary.
 */
function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const next = searchParams.get("next");
  const otpErrorParam = searchParams.get("error");

  const [step, setStep] = useState<"phone" | "otp">("phone");
  const [phone, setPhone] = useState("");
  const [code, setCode] = useState("");
  const [error, setError] = useState<string | null>(
    otpErrorParam === "not_institute_admin"
      ? "That phone number isn't registered as an institute partner. Contact support if you believe this is a mistake."
      : null
  );
  const [pending, setPending] = useState(false);

  async function handleSendOtp() {
    if (!INDIAN_MOBILE_PATTERN.test(phone)) {
      setError("Enter a valid 10-digit Indian mobile number.");
      return;
    }
    setPending(true);
    setError(null);
    const result = await sendOtp(phone);
    setPending(false);
    if (!result.success) {
      setError(result.error ?? "Could not send the code. Try again.");
      return;
    }
    setStep("otp");
  }

  async function handleVerifyOtp() {
    setPending(true);
    setError(null);
    const result = await verifyOtp(phone, code);
    setPending(false);
    if (!result.success) {
      setError(result.error ?? "Incorrect code. Try again.");
      return;
    }
    const callbackUrl = next ? `/login/callback?next=${encodeURIComponent(next)}` : "/login/callback";
    router.push(callbackUrl);
  }

  return (
    <main>
      <h1>Institute Partner Sign In</h1>

      {step === "phone" ? (
        <form
          onSubmit={(e) => {
            e.preventDefault();
            void handleSendOtp();
          }}
        >
          <label htmlFor="phone">Mobile number</label>
          <input
            id="phone"
            type="tel"
            inputMode="numeric"
            maxLength={10}
            value={phone}
            onChange={(e) => setPhone(e.target.value.replace(/\D/g, ""))}
            placeholder="10-digit mobile number"
            disabled={pending}
          />
          <button type="submit" disabled={pending}>
            {pending ? "Sending…" : "Send code"}
          </button>
        </form>
      ) : (
        <form
          onSubmit={(e) => {
            e.preventDefault();
            void handleVerifyOtp();
          }}
        >
          <p>Code sent to +91 {phone} on WhatsApp.</p>
          <label htmlFor="code">One-time code</label>
          <input
            id="code"
            type="text"
            inputMode="numeric"
            maxLength={6}
            value={code}
            onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
            placeholder="6-digit code"
            disabled={pending}
          />
          <button type="submit" disabled={pending}>
            {pending ? "Verifying…" : "Verify & sign in"}
          </button>
          <button
            type="button"
            onClick={() => {
              setStep("phone");
              setCode("");
              setError(null);
            }}
            disabled={pending}
          >
            Use a different number
          </button>
        </form>
      )}

      {error ? <p role="alert">{error}</p> : null}
    </main>
  );
}
