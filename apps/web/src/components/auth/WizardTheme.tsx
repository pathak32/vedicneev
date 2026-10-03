import type { ReactNode } from "react";

/**
 * Shared dark/blue scoped theme for the new-visitor funnel (/start → login →
 * onboarding). Deliberately scoped to this subtree via a CSS variable
 * override rather than touching globals.css's --primary, which stays the
 * site's orange brand color everywhere else (the dashboard, store, existing
 * marketing homepage). ".dark" alone already gives a near-black background;
 * only --primary/--ring need overriding to get the requested blue accent.
 */
export function WizardTheme({ children }: { children: ReactNode }) {
  return (
    <div
      className="dark min-h-screen bg-background text-foreground"
      style={
        {
          "--primary": "217 91% 60%",
          "--primary-foreground": "0 0% 100%",
          "--ring": "217 91% 60%",
        } as React.CSSProperties
      }
    >
      {children}
    </div>
  );
}
