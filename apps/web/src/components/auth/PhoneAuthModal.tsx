"use client";

import { useEffect, useRef, useState } from "react";
import {
  Button,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@vedicneev/ui";
import { Loader2, Phone, ShieldCheck } from "lucide-react";

import { useAuthStore } from "@/lib/auth/useAuthStore";

const RESEND_SECONDS = 30;

export interface PhoneAuthModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Fired once OTP verification succeeds; the caller decides what happens next (e.g. route to onboarding). */
  onAuthenticated?: (isNewUser: boolean) => void;
}

export function PhoneAuthModal({ open, onOpenChange, onAuthenticated }: PhoneAuthModalProps) {
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

  function resetAndClose() {
    setPhone("");
    setOtp("");
    cancelOtp();
    onOpenChange(false);
  }

  async function handleSendOtp() {
    await requestOtp(phone);
  }

  async function handleVerify() {
    const result = await verifyOtp(otp);
    if (result.success) {
      setPhone("");
      setOtp("");
      onOpenChange(false);
      onAuthenticated?.(result.isNewUser ?? false);
    }
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        if (!next) resetAndClose();
        else onOpenChange(next);
      }}
    >
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {step === "phone" ? <Phone className="h-5 w-5 text-primary" /> : <ShieldCheck className="h-5 w-5 text-primary" />}
            {step === "phone" ? "Sign in with your mobile number" : "Enter the OTP"}
          </DialogTitle>
          <DialogDescription>
            {step === "phone"
              ? "We'll text a one-time code to verify it's you."
              : `Sent to +91 ${pendingOtpPhone}. In this demo, the code is always ${"123456"}.`}
          </DialogDescription>
        </DialogHeader>

        {step === "phone" ? (
          <div className="flex flex-col gap-3">
            <div className="flex items-center gap-2">
              <span className="flex h-10 shrink-0 items-center rounded-md border border-input bg-muted px-3 text-sm text-muted-foreground">
                +91
              </span>
              <input
                type="tel"
                inputMode="numeric"
                maxLength={10}
                placeholder="10-digit mobile number"
                value={phone}
                onChange={(e) => setPhone(e.target.value.replace(/\D/g, "").slice(0, 10))}
                className="h-10 w-full rounded-md border border-input bg-background px-3 text-base tracking-wide"
                aria-label="Mobile number"
              />
            </div>
            {otpError ? <p className="text-sm text-destructive">{otpError}</p> : null}
            <Button
              type="button"
              size="lg"
              className="w-full"
              disabled={phone.length !== 10 || otpSending}
              onClick={handleSendOtp}
            >
              {otpSending ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
              Send OTP
            </Button>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            <input
              type="text"
              inputMode="numeric"
              maxLength={6}
              placeholder="6-digit OTP"
              value={otp}
              onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
              className="h-12 w-full rounded-md border border-input bg-background px-3 text-center text-2xl tracking-[0.5em]"
              aria-label="OTP"
            />
            {otpError ? <p className="text-sm text-destructive">{otpError}</p> : null}
            <Button
              type="button"
              size="lg"
              className="w-full"
              disabled={otp.length !== 6 || otpVerifying}
              onClick={handleVerify}
            >
              {otpVerifying ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
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
      </DialogContent>
    </Dialog>
  );
}
