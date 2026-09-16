"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@vedicneev/ui";
import { Loader2, MessageCircle, Phone, ShieldCheck, Sparkles } from "lucide-react";

import { selectActiveAccount, useAuthStore } from "@/lib/auth/useAuthStore";
import { isCrossOrigin } from "@/lib/auth/crossDomainRedirect";

const RESEND_SECONDS = 30;

export interface LoginPageContentProps {
  /** Already validated (resolveSafeNext) by the server component that renders this. */
  next: string;
  /** Set by a sibling product (typingtest.vedicneev.com, ...) that links here for its own WhatsApp OTP sign-in — see apps/typingtest/app/login/page.tsx. Those candidates have no K-12 student profile and never should be routed through this app's own onboarding wizard. */
  isExternalProductIntent: boolean;
}

/**
 * The interactive phone/OTP form — reached only once app/login/page.tsx's
 * server-side session check has confirmed there's no existing session, so
 * this component no longer needs (and deliberately doesn't have) its own
 * "already signed in, bounce away" effect. See that file's own comment for
 * why the old client-side version of that check was the actual bug.
 */
export function LoginPageContent({ next, isExternalProductIntent }: LoginPageContentProps) {
  const router = useRouter();
  const origin = typeof window !== "undefined" ? window.location.origin : "https://vedicneev.com";

  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [resendIn, setResendIn] = useState(0);

  const requestOtp = useAuthStore((s) => s.requestOtp);
  const verifyOtp = useAuthStore((s) => s.verifyOtp);
  const cancelOtp = useAuthStore((s) => s.cancelOtp);
  const pendingOtpPhone = useAuthStore((s) => s.pendingOtpPhone);
  const otpError = useAuthStore((s) => s.otpError);
  const otpSending = useAuthStore((s) => s.otpSending);
  const otpVerifying = useAuthStore((s) => s.otpVerifying);

  const step = pendingOtpPhone ? "otp" : "phone";
  const timerRef = useRef<number | null>(null);

  useEffect(() => {
    if (step !== "otp") return;
    setResendIn(RESEND_SECONDS);
    timerRef.current = window.setInterval(() => {
      setResendIn((s) => Math.max(0, s - 1));
    }, 1000);
    return () => {
      if (timerRef.current) window.clearInterval(timerRef.current);
    };
  }, [step, pendingOtpPhone]);

  async function handleSendOtp() {
    await requestOtp(phone);
  }

  async function handleVerify() {
    const result = await verifyOtp(otp);
    if (!result.success) return;

    setPhone("");
    setOtp("");

    // Mirrors SiteHeader's onAuthenticated routing: a brand-new account
    // (no student profiles yet) goes through this app's own K-12 onboarding
    // first, carrying `next` along so onboarding can hand off to the
    // original destination. Skipped entirely for a sibling product's own
    // sign-in (isExternalProductIntent) — those candidates aren't K-12
    // parents/students at all, and the product they came from owns
    // capturing its own onboarding intent (e.g. typingtest's dashboard
    // prompts for a target exam once the visitor lands there).
    const account = selectActiveAccount(useAuthStore.getState());
    const needsK12Onboarding = !isExternalProductIntent && (!account || account.students.length === 0);

    if (needsK12Onboarding) {
      router.push(`/onboarding?next=${encodeURIComponent(next)}`);
      return;
    }

    if (isCrossOrigin(next, origin)) window.location.href = next;
    else router.push(next);
  }

  return (
    <div className="mx-auto flex min-h-[70vh] max-w-sm flex-col justify-center gap-6 px-4 py-12">
      <div className="text-center">
        <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
          {step === "phone" ? <Phone className="h-6 w-6" /> : <ShieldCheck className="h-6 w-6" />}
        </div>
        <h1 className="text-xl font-bold text-foreground">
          {step === "phone" ? "Sign in with your mobile number" : "Enter the OTP"}
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {step === "phone"
            ? "We'll send a one-time code over WhatsApp to verify it's you."
            : `Sent to +91 ${pendingOtpPhone} on WhatsApp.`}
        </p>
      </div>

      {step === "phone" ? (
        <div className="flex flex-col gap-3 rounded-2xl border border-border bg-card p-5 shadow-sm">
          <div className="flex items-center gap-2">
            <span className="flex h-11 shrink-0 items-center rounded-md border border-input bg-muted px-3 text-sm text-muted-foreground">
              +91
            </span>
            <input
              type="tel"
              inputMode="numeric"
              maxLength={10}
              placeholder="10-digit mobile number"
              value={phone}
              onChange={(e) => setPhone(e.target.value.replace(/\D/g, "").slice(0, 10))}
              className="h-11 w-full rounded-md border border-input bg-background px-3 text-base tracking-wide"
              aria-label="Mobile number"
              autoFocus
            />
          </div>
          {otpError ? <p className="text-sm text-destructive">{otpError}</p> : null}
          <Button
            type="button"
            size="lg"
            className="w-full gap-2"
            disabled={phone.length !== 10 || otpSending}
            onClick={handleSendOtp}
          >
            {otpSending ? <Loader2 className="h-4 w-4 animate-spin" /> : <MessageCircle className="h-4 w-4" />}
            Send OTP via WhatsApp
          </Button>
        </div>
      ) : (
        <div className="flex flex-col gap-3 rounded-2xl border border-border bg-card p-5 shadow-sm">
          <input
            type="text"
            inputMode="numeric"
            maxLength={6}
            placeholder="6-digit OTP"
            value={otp}
            onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
            className="h-12 w-full rounded-md border border-input bg-background px-3 text-center text-2xl tracking-[0.5em]"
            aria-label="OTP"
            autoFocus
          />
          {otpError ? <p className="text-sm text-destructive">{otpError}</p> : null}
          <Button
            type="button"
            size="lg"
            className="w-full gap-2"
            disabled={otp.length !== 6 || otpVerifying}
            onClick={handleVerify}
          >
            {otpVerifying ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
            Verify &amp; Continue
          </Button>
          <div className="flex items-center justify-between text-sm">
            <button
              type="button"
              className="text-muted-foreground underline-offset-2 hover:underline"
              onClick={() => {
                setOtp("");
                cancelOtp();
              }}
            >
              Change number
            </button>
            <button
              type="button"
              className="text-primary underline-offset-2 hover:underline disabled:pointer-events-none disabled:text-muted-foreground"
              disabled={resendIn > 0 || otpSending}
              onClick={handleSendOtp}
            >
              {resendIn > 0 ? `Resend OTP in ${resendIn}s` : "Resend OTP"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
