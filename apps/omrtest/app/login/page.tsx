"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { KeyRound, MessageCircle, ScanLine, Sparkles } from "lucide-react";
import { toast } from "sonner";

import { sendOtp, verifyOtp } from "@/lib/auth/whatsappOtpClient";
import { loginWithPassword } from "@/lib/auth/passwordLoginClient";
import { Button, cn } from "@vedicneev/ui";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";

const INDIAN_MOBILE_PATTERN = /^[6-9]\d{9}$/;

// A phone number is an identifier, not a secret — this only pre-fills it
// and switches to the Password tab so a presenter isn't typing 10 digits
// live; the PIN itself is never stored here and is always typed by hand.
const DEMO_ACCOUNT_LABEL = "Sukhoi Academy";
const DEMO_ACCOUNT_PHONE = "9000000001";

const glassInputClass =
  "border-white/10 bg-white/5 text-white placeholder:text-white/30 focus-visible:ring-white/30 focus-visible:ring-offset-0";
const glassLabelClass = "text-white/70";

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

function GlowBackdrop() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      <motion.div
        className="absolute left-[-10%] top-[-15%] h-[36rem] w-[36rem] rounded-full bg-brand-indigo/30 blur-[120px]"
        animate={{ opacity: [0.5, 0.8, 0.5], scale: [1, 1.08, 1] }}
        transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute bottom-[-20%] right-[-10%] h-[30rem] w-[30rem] rounded-full bg-indigo-400/20 blur-[120px]"
        animate={{ opacity: [0.4, 0.7, 0.4], scale: [1, 1.1, 1] }}
        transition={{ duration: 12, repeat: Infinity, ease: "easeInOut", delay: 1 }}
      />
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage:
            "linear-gradient(rgba(255,255,255,0.6) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.6) 1px, transparent 1px)",
          backgroundSize: "48px 48px",
        }}
      />
    </div>
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

  function switchMethod(nextMethod: LoginMethod) {
    setMethod(nextMethod);
    setOtpStep("phone");
    setCode("");
    setPassword("");
    setError(null);
  }

  function fillDemoNumber() {
    setMethod("password");
    setPhone(DEMO_ACCOUNT_PHONE);
    setError(null);
    toast(`${DEMO_ACCOUNT_LABEL} number filled — enter the PIN to sign in.`);
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
      toast.error(result.error ?? "Could not send the code.");
      return;
    }
    toast.success("Code sent on WhatsApp.");
    setOtpStep("otp");
  }

  async function handleVerifyOtp() {
    setPending(true);
    setError(null);
    const result = await verifyOtp(phone, code);
    setPending(false);
    if (!result.success) {
      setError(result.error ?? "Incorrect code. Try again.");
      toast.error(result.error ?? "Incorrect code.");
      return;
    }
    toast.success("Signed in.");
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
      toast.error(result.error ?? "Incorrect phone number or password.");
      return;
    }
    toast.success("Signed in.");
    goToCallback();
  }

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-brand-navy px-4 py-12">
      <GlowBackdrop />

      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="relative z-10 w-full max-w-md"
      >
        <div className="mb-8 flex flex-col items-center text-center">
          <span className="flex h-11 w-11 items-center justify-center rounded-xl border border-white/10 bg-white/10 text-white shadow-[0_0_30px_-5px_rgba(99,102,241,0.6)]">
            <ScanLine className="h-5 w-5" aria-hidden="true" />
          </span>
          <h1 className="mt-4 text-2xl font-bold tracking-tight text-white">Institute Partner Sign In</h1>
          <p className="mt-1 text-sm text-white/50">Sign in with the mobile number registered on your account.</p>
        </div>

        <button
          type="button"
          onClick={fillDemoNumber}
          disabled={pending}
          className="group mb-4 flex w-full items-center justify-between gap-3 rounded-xl border border-indigo-400/30 bg-gradient-to-r from-indigo-500/15 via-indigo-400/10 to-transparent px-4 py-3 text-left transition-all hover:border-indigo-400/60 hover:from-indigo-500/25 disabled:cursor-not-allowed disabled:opacity-60"
        >
          <span className="flex items-center gap-2.5">
            <span className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg bg-indigo-400/20 text-indigo-300">
              <Sparkles className="h-4 w-4" aria-hidden="true" />
            </span>
            <span>
              <span className="block text-sm font-semibold text-white">Instant Demo Access</span>
              <span className="block text-xs text-white/50">{DEMO_ACCOUNT_LABEL} · fills number, no OTP needed</span>
            </span>
          </span>
          <span className="rounded-full border border-white/10 bg-white/5 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-white/60 transition-colors group-hover:text-white/90">
            Demo
          </span>
        </button>

        <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-6 shadow-2xl backdrop-blur-xl">
          <div className="mb-5 grid grid-cols-2 gap-1 rounded-lg border border-white/5 bg-white/5 p-1">
            <button
              type="button"
              onClick={() => switchMethod("password")}
              disabled={pending}
              className={cn(
                "relative flex items-center justify-center gap-1.5 rounded-md py-1.5 text-sm font-medium transition-colors",
                method === "password" ? "text-white" : "text-white/40 hover:text-white/70"
              )}
            >
              {method === "password" ? (
                <motion.span layoutId="login-tab-pill" className="absolute inset-0 rounded-md bg-white/10" transition={{ duration: 0.2 }} />
              ) : null}
              <span className="relative flex items-center gap-1.5">
                <KeyRound className="h-3.5 w-3.5" aria-hidden="true" />
                Password
              </span>
            </button>
            <button
              type="button"
              onClick={() => switchMethod("otp")}
              disabled={pending}
              className={cn(
                "relative flex items-center justify-center gap-1.5 rounded-md py-1.5 text-sm font-medium transition-colors",
                method === "otp" ? "text-white" : "text-white/40 hover:text-white/70"
              )}
            >
              {method === "otp" ? (
                <motion.span layoutId="login-tab-pill" className="absolute inset-0 rounded-md bg-white/10" transition={{ duration: 0.2 }} />
              ) : null}
              <span className="relative flex items-center gap-1.5">
                <MessageCircle className="h-3.5 w-3.5" aria-hidden="true" />
                WhatsApp OTP
              </span>
            </button>
          </div>

          <AnimatePresence mode="wait">
            {method === "password" ? (
              <motion.form
                key="password"
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 8 }}
                transition={{ duration: 0.15 }}
                onSubmit={(e) => {
                  e.preventDefault();
                  void handlePasswordLogin();
                }}
                className="space-y-4"
              >
                <div>
                  <Label htmlFor="phone-password" className={glassLabelClass}>
                    Mobile number
                  </Label>
                  <div className="flex items-center gap-2">
                    <span className="flex h-10 items-center rounded-md border border-white/10 bg-white/5 px-3 text-sm text-white/40">
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
                      className={glassInputClass}
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="password" className={glassLabelClass}>
                    Password or PIN
                  </Label>
                  <Input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Your password or 6-digit PIN"
                    disabled={pending}
                    className={glassInputClass}
                  />
                </div>
                <Button type="submit" disabled={pending} className="w-full">
                  {pending ? "Signing in…" : "Login with Password"}
                </Button>
                <p className="text-center text-xs text-white/40">
                  First time signing in, or forgot your password? Use WhatsApp OTP instead.
                </p>
              </motion.form>
            ) : otpStep === "phone" ? (
              <motion.form
                key="otp-phone"
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 8 }}
                transition={{ duration: 0.15 }}
                onSubmit={(e) => {
                  e.preventDefault();
                  void handleSendOtp();
                }}
                className="space-y-4"
              >
                <div>
                  <Label htmlFor="phone" className={glassLabelClass}>
                    Mobile number
                  </Label>
                  <div className="flex items-center gap-2">
                    <span className="flex h-10 items-center rounded-md border border-white/10 bg-white/5 px-3 text-sm text-white/40">
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
                      className={glassInputClass}
                    />
                  </div>
                </div>
                <Button type="submit" disabled={pending} className="w-full">
                  <MessageCircle className="h-4 w-4" aria-hidden="true" />
                  {pending ? "Sending…" : "Send code on WhatsApp"}
                </Button>
              </motion.form>
            ) : (
              <motion.form
                key="otp-code"
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 8 }}
                transition={{ duration: 0.15 }}
                onSubmit={(e) => {
                  e.preventDefault();
                  void handleVerifyOtp();
                }}
                className="space-y-4"
              >
                <p className="text-sm text-white/60">
                  Code sent to <span className="font-medium text-white">+91 {phone}</span> on WhatsApp.
                </p>
                <div>
                  <Label htmlFor="code" className={glassLabelClass}>
                    One-time code
                  </Label>
                  <Input
                    id="code"
                    type="text"
                    inputMode="numeric"
                    maxLength={6}
                    value={code}
                    onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
                    placeholder="6-digit code"
                    disabled={pending}
                    className={glassInputClass}
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
                  className="w-full text-center text-sm font-medium text-indigo-300 hover:underline disabled:opacity-50"
                >
                  Use a different number
                </button>
              </motion.form>
            )}
          </AnimatePresence>

          {error ? (
            <p role="alert" className="mt-4 text-sm font-medium text-red-400">
              {error}
            </p>
          ) : null}
        </div>
      </motion.div>
    </div>
  );
}
