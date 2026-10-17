import { redirect } from "next/navigation";

import { getAuthenticatedUser } from "@/lib/auth/getAuthenticatedUser";
import { WizardTheme } from "@/components/auth/WizardTheme";
import { LoginPageContent } from "../login/LoginPageContent";

export const dynamic = "force-dynamic";

/**
 * Minimal, single-purpose entry point for brand-new traffic (YouTube/social
 * promo links point here instead of "/"). One screen, one action: sign in,
 * which for a phone-number+OTP account is the same step as registering — a
 * genuinely new phone number creates the account on verify. No "Student or
 * Parent" question (dropped per product decision — it added a step without
 * narrowing anything the app needs), no marketing scroll. A brand-new
 * account is carried straight into onboarding (see LoginPageContent's
 * needsK12Onboarding check) and lands on "/dashboard" — never the long-form
 * homepage — once class + exam(s) are picked.
 */
export default async function StartPage() {
  const user = await getAuthenticatedUser();
  if (user) redirect("/dashboard");

  return (
    <WizardTheme>
      <div className="mx-auto flex w-full max-w-md flex-1 flex-col items-center justify-center gap-10 px-4 py-12 text-center">
        <div className="flex flex-col items-center gap-3">
          <span className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">VedicNeev</span>
          <h1 className="text-3xl font-bold leading-tight text-foreground">
            Your exam. Your notes. Your questions.
            <br />
            Nothing else in the way.
          </h1>
          <p className="max-w-sm text-sm text-muted-foreground">
            JNVST &middot; RMS &middot; AISSEE &middot; UPSS — tell us which one, once, and we&apos;ll show you only
            what you need.
          </p>
        </div>
        <LoginPageContent next="/dashboard" isExternalProductIntent={false} />
      </div>
    </WizardTheme>
  );
}
