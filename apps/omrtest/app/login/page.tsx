"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { KeyRound, MessageCircle, ScanLine } from "lucide-react";

import { sendOtp, verifyOtp } from "@/lib/auth/whatsappOtpClient";
import { loginWithPassword } from "@/lib/auth/passwordLoginClient";
import { Button, Card, CardContent, cn } from "@vedicneev/ui";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";

const INDIAN_MOBILE_PATTERN = /^[6-9]\d{9}$/;

/**
 * Institute partner sign-in — two independent methods sharing one
 * "phone verified, now hand off to /login/callback" tail. WhatsApp OTP
 * (the original, always-available method) goes through
 * verify-otp/route.ts; Password/PIN goes through
 * api/auth/password/login/route.ts. Both ultimately call the SAME
 * bridgeToSupabaseSession (see passwordLogin.ts's own comment) — the two
 * forms below only differ in how they establish "yes, this is really
 * you," never in what happens after.
 */
export default function LoginPage() {
  return (
    <Suspense fallback={null}>
      <LoginForm />
    </Suspense>
  );
}

type LoginMethod = "otp" | "password";
type OtpStep = "phone" | "otp";

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

  const [method, setMethod] = useState<LoginMethod>("otp");
  const [otpStep, setOtpStep] = useState<OtpStep>("phone");
  const [phone, setPhone] = useState("");
  const [code, setCode] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(
    otpErrorParam === "not_institute_admin"
      ? "That phone number isn't registered as an institute partner. Contact support if you believe this is a mistake."
      : null
  );
  const [pending, setPending] = useState(false);

  function goToCallback() {
    const callbackUrl = next ? `/login/callback?next=${encodeURIComponent(next)}` : "/login/callback";
    router.push(callbackUrl);
  }

  function switchMethod(next: LoginMethod) {
    setMethod(next);
    setOtpStep("phone");
    setCode("");
    setPassword("");
    setError(null);
  }

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
    setOtpStep("otp");
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
    goToCallback();
  }

  async function handlePasswordLogin() {
    if (!INDIAN_MOBILE_PATTERN.test(phone)) {
      setError("Enter a valid 10-digit Indian mobile number.");
      return;
    }
    if (!password) {
      setError("Enter your password or PIN.");
      return;
    }
    setPending(true);
    setError(null);
    const result = await loginWithPassword(phone, password);
    setPending(false);
    if (!result.success) {
      setError(result.error ?? "Incorrect phone number or password.");
      return;
    }
    goToCallback();
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-brand-navy px-4 py-12">
      <div className="w-full max-w-md">
        <div className="mb-8 flex flex-col items-center text-center">
          <span className="flex h-11 w-11 items-center justify-center rounded-lg bg-white/10 text-white">
            <ScanLine className="h-5 w-5" aria-hidden="true" />
          </span>
          <h1 className="mt-4 text-2xl font-bold tracking-tight text-white">Institute Partner Sign In</h1>
          <p className="mt-1 text-sm text-white/60">Sign in with the mobile number registered on your account.</p>
        </div>

        <Card className="border-white/10 bg-white shadow-2xl">
          <CardContent className="p-6">
            <div className="mb-5 grid grid-cols-2 gap-1 rounded-lg bg-slate-100 p-1">
              <button
                type="button"
                onClick={() => switchMethod("password")}
                disabled={pending}
                className={cn(
                  "flex items-center justify-center gap-1.5 rounded-md py-1.5 text-sm font-medium transition-colors",
                  method === "password" ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-700"
                )}
              >
                <KeyRound className="h-3.5 w-3.5" aria-hidden="true" />
                Password
              </button>
              <button
                type="button"
                onClick={() => switchMethod("otp")}
                disabled={pending}
                className={cn(
                  "flex items-center justify-center gap-1.5 rounded-md py-1.5 text-sm font-medium transition-colors",
                  method === "otp" ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-700"
                )}
              >
                <MessageCircle className="h-3.5 w-3.5" aria-hidden="true" />
                WhatsApp OTP
              </button>
            </div>

            {method === "password" ? (
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  void handlePasswordLogin();
                }}
                className="space-y-4"
              >
                <div>
                  <Label htmlFor="phone-password">Mobile number</Label>
                  <div className="flex items-center gap-2">
                    <span className="flex h-10 items-center rounded-md border border-input bg-slate-50 px-3 text-sm text-slate-500">
                      +91
                    </span>
                    <Input
                      id="phone-password"
                      type="tel"
                      inputMode="numeric"
                      maxLength={10}
                      value={phone}
                      onChange={(e) => setPhone(e.target.value.replace(/\D/g, ""))}
                      placeholder="10-digit mobile number"
                      disabled={pending}
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="password">Password or PIN</Label>
                  <Input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Your password or 6-digit PIN"
                    disabled={pending}
                  />
                </div>
                <Button type="submit" disabled={pending} className="w-full">
                  {pending ? "Signing in…" : "Login with Password"}
                </Button>
                <p className="text-center text-xs text-slate-500">
                  First time signing in, or forgot your password? Use WhatsApp OTP instead.
                </p>
              </form>
            ) : otpStep === "phone" ? (
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  void handleSendOtp();
                }}
                className="space-y-4"
              >
                <div>
                  <Label htmlFor="phone">Mobile number</Label>
                  <div className="flex items-center gap-2">
                    <span className="flex h-10 items-center rounded-md border border-input bg-slate-50 px-3 text-sm text-slate-500">
                      +91
                    </span>
                    <Input
                      id="phone"
                      type="tel"
                      inputMode="numeric"
                      maxLength={10}
                      value={phone}
                      onChange={(e) => setPhone(e.target.value.replace(/\D/g, ""))}
                      placeholder="10-digit mobile number"
                      disabled={pending}
                    />
                  </div>
                </div>
                <Button type="submit" disabled={pending} className="w-full">
                  <MessageCircle className="h-4 w-4" aria-hidden="true" />
                  {pending ? "Sending…" : "Send code on WhatsApp"}
                </Button>
              </form>
            ) : (
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  void handleVerifyOtp();
                }}
                className="space-y-4"
              >
                <p className="text-sm text-slate-600">
                  Code sent to <span className="font-medium text-slate-900">+91 {phone}</span> on WhatsApp.
                </p>
                <div>
                  <Label htmlFor="code">One-time code</Label>
                  <Input
                    id="code"
                    type="text"
                    inputMode="numeric"
                    maxLength={6}
                    value={code}
                    onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
                    placeholder="6-digit code"
                    disabled={pending}
                  />
                </div>
                <Button type="submit" disabled={pending} className="w-full">
                  {pending ? "Verifying…" : "Verify & sign in"}
                </Button>
                <button
                  type="button"
                  onClick={() => {
                    setOtpStep("phone");
                    setCode("");
                    setError(null);
                  }}
                  disabled={pending}
                  className="w-full text-center text-sm font-medium text-brand-indigo hover:underline disabled:opacity-50"
                >
                  Use a different number
                </button>
              </form>
            )}

            {error ? (
              <p role="alert" className="mt-4 text-sm font-medium text-destructive">
                {error}
              </p>
            ) : null}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
