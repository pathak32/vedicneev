"use client";

import { useRouter } from "next/navigation";
import { Button } from "@vedicneev/ui";
import { MessageCircle, RefreshCw } from "lucide-react";

export interface LoginRedirectCardProps {
  /** Absolute cross-domain login URL on vedicneev.com, already carrying product=typing + the encoded return `next`. */
  loginUrl: string;
}

/**
 * Reached only when app/login/page.tsx's own server-side session check
 * (getAuthenticatedUserId) found no session — a genuinely signed-out
 * visitor. The "Already signed in?" fallback re-runs that same server
 * check (router.refresh()) rather than blindly navigating to `next`, so it
 * can't send someone to a protected page that just bounces them back here.
 */
export function LoginRedirectCard({ loginUrl }: LoginRedirectCardProps) {
  const router = useRouter();

  return (
    <div className="mx-auto flex min-h-[70vh] max-w-sm flex-col justify-center gap-6 px-4 py-12">
      <div className="text-center">
        <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
          <MessageCircle className="h-6 w-6" />
        </div>
        <h1 className="text-xl font-bold text-foreground">Sign in with your VedicNeev account</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          One account works across VedicNeev — sign in with your mobile number over WhatsApp.
        </p>
      </div>

      <div className="flex flex-col gap-3 rounded-2xl border border-border bg-card p-5 shadow-sm">
        <Button asChild size="lg" className="w-full gap-2">
          <a href={loginUrl}>
            <MessageCircle className="h-4 w-4" />
            Continue with WhatsApp OTP
          </a>
        </Button>
        <Button
          type="button"
          variant="outline"
          size="lg"
          className="w-full gap-2"
          onClick={() => router.refresh()}
        >
          <RefreshCw className="h-4 w-4" />
          Already signed in? Continue
        </Button>
      </div>
    </div>
  );
}
