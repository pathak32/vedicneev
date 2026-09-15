"use client";

import { Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@vedicneev/ui";
import { MessageCircle, RefreshCw } from "lucide-react";

// Renders entirely from client-side search params — force dynamic so the
// build never attempts to prerender a signed-out shell.
export const dynamic = "force-dynamic";

/**
 * Sign-in for typingtest.vedicneev.com is a shared VedicNeev account, not a
 * separate system — the actual WhatsApp OTP flow lives only in apps/web
 * (src/lib/auth/whatsappOtpServer.ts + useAuthStore), and its session
 * cookie is shared across subdomains via NEXT_PUBLIC_COOKIE_DOMAIN (see
 * src/lib/supabase/env.ts). Rather than duplicate that OTP UI/logic here —
 * the same tension apps/omrtest's own login/page.tsx comment flags for
 * itself — this page sends the visitor to complete sign-in on apps/web,
 * then brings them back: once that finishes, the shared cookie already
 * covers this domain, so "Continue" below just re-checks and redirects.
 */
function LoginPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const next = searchParams.get("next") || "/dashboard";
  const mainAppUrl = process.env.NEXT_PUBLIC_APP_URL || "https://vedicneev.com";

  return (
    <div className="mx-auto flex min-h-[70vh] max-w-sm flex-col justify-center gap-6 px-4 py-12">
      <div className="text-center">
        <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
          <MessageCircle className="h-6 w-6" />
        </div>
        <h1 className="text-xl font-bold text-foreground">Sign in with your VedicNeev account</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          One account works across VedicNeev — sign in with your mobile number over WhatsApp, then come back here.
        </p>
      </div>

      <div className="flex flex-col gap-3 rounded-2xl border border-border bg-card p-5 shadow-sm">
        <Button asChild size="lg" className="w-full gap-2">
          <a href={`${mainAppUrl}/login`} target="_blank" rel="noopener noreferrer">
            <MessageCircle className="h-4 w-4" />
            Continue on vedicneev.com
          </a>
        </Button>
        <Button
          type="button"
          variant="outline"
          size="lg"
          className="w-full gap-2"
          onClick={() => router.replace(next)}
        >
          <RefreshCw className="h-4 w-4" />
          I&apos;ve signed in — Continue
        </Button>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={null}>
      <LoginPageContent />
    </Suspense>
  );
}
