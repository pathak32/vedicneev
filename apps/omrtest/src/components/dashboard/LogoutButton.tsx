"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { LogOut } from "lucide-react";

import { cn } from "@vedicneev/ui";

const VARIANT_CLASSES = {
  // DashboardShell's dark navy header.
  dark: "text-white/60 hover:bg-white/5 hover:text-white",
  // Any light-background page (e.g. /onboarding/pending).
  light: "text-slate-500 hover:bg-slate-100 hover:text-slate-900",
} as const;

export function LogoutButton({ variant = "dark" }: { variant?: keyof typeof VARIANT_CLASSES }) {
  const router = useRouter();
  const [loggingOut, setLoggingOut] = useState(false);

  async function handleLogout() {
    setLoggingOut(true);
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
    router.refresh();
  }

  return (
    <button
      type="button"
      onClick={handleLogout}
      disabled={loggingOut}
      className={cn(
        "flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-sm font-medium transition-colors disabled:opacity-50",
        VARIANT_CLASSES[variant]
      )}
    >
      <LogOut className="h-3.5 w-3.5" aria-hidden="true" />
      <span className="hidden sm:inline">{loggingOut ? "Logging out…" : "Log out"}</span>
    </button>
  );
}
