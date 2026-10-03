import type { ReactNode } from "react";

import { LanguageSwitcher } from "./LanguageSwitcher";

/**
 * Shared dark/blue scoped theme for the new-visitor funnel (/start → login →
 * onboarding). Deliberately scoped to this subtree via a CSS variable
 * override rather than touching globals.css's --primary, which stays the
 * site's orange brand color everywhere else (the dashboard, store, existing
 * marketing homepage). ".dark" alone already gives a near-black background;
 * only --primary/--ring need overriding to get the requested blue accent.
 *
 * Hiding SiteHeader on these routes (see SiteHeader's HEADER_HIDDEN_PREFIXES)
 * also hid its language switcher — a parent who doesn't read English needs
 * it most on exactly this first screen, so it's re-added here, fixed to the
 * corner, rather than left unreachable until after sign-in.
 */
export function WizardTheme({ children }: { children: ReactNode }) {
  return (
    <div
      className="dark flex min-h-screen flex-col bg-background text-foreground"
      style={
        {
          "--primary": "217 91% 60%",
          "--primary-foreground": "0 0% 100%",
          "--ring": "217 91% 60%",
        } as React.CSSProperties
      }
    >
      <div className="flex justify-end p-4">
        <LanguageSwitcher />
      </div>
      <div className="flex flex-1 flex-col">{children}</div>
    </div>
  );
}
