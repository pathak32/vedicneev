"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Button,
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@vedicneev/ui";
import { Menu, Sparkles } from "lucide-react";

import { useActiveStudent } from "@/lib/auth/ActiveStudentContext";
import { selectActiveAccount, useAuthStore } from "@/lib/auth/useAuthStore";
import { PhoneAuthModal } from "./PhoneAuthModal";
import { StudentSwitcherDropdown } from "./StudentSwitcherDropdown";

export function SiteHeader() {
  const router = useRouter();
  const { hasHydrated, isAuthenticated } = useActiveStudent();
  const [authOpen, setAuthOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  const navLinks = (
    <>
      <Link
        href="/learn"
        onClick={() => setMenuOpen(false)}
        className="text-sm text-muted-foreground hover:text-foreground"
      >
        Learn
      </Link>
      <Link
        href="/pricing"
        onClick={() => setMenuOpen(false)}
        className="text-sm text-muted-foreground hover:text-foreground"
      >
        Pricing
      </Link>
      {isAuthenticated ? (
        <Link
          href="/parent"
          onClick={() => setMenuOpen(false)}
          className="text-sm text-muted-foreground hover:text-foreground"
        >
          Parent Command Center
        </Link>
      ) : null}
    </>
  );

  return (
    <header className="flex items-center justify-between border-b border-border bg-background px-4 py-3 md:px-8">
      <div className="flex items-center gap-6">
        <Link href="/" className="flex items-center gap-2 font-bold text-foreground">
          <Sparkles className="h-5 w-5 text-primary" />
          Vedic Neev
        </Link>
        <nav className="hidden items-center gap-6 md:flex">{navLinks}</nav>
      </div>

      <div className="flex items-center gap-2">
        {hasHydrated ? (
          isAuthenticated ? (
            <StudentSwitcherDropdown />
          ) : (
            <Button type="button" onClick={() => setAuthOpen(true)}>
              Sign In
            </Button>
          )
        ) : null}

        <Sheet open={menuOpen} onOpenChange={setMenuOpen}>
          <SheetTrigger asChild>
            <Button type="button" variant="ghost" size="icon" className="md:hidden">
              <Menu className="h-5 w-5" />
              <span className="sr-only">Open menu</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="right">
            <SheetHeader>
              <SheetTitle>Menu</SheetTitle>
            </SheetHeader>
            <nav className="mt-4 flex flex-col gap-4">{navLinks}</nav>
          </SheetContent>
        </Sheet>
      </div>

      <PhoneAuthModal
        open={authOpen}
        onOpenChange={setAuthOpen}
        onAuthenticated={() => {
          // Read the store directly — the store already committed the sign-in
          // synchronously, but this component's own hook values haven't
          // re-rendered yet in this same event-handler tick.
          const account = selectActiveAccount(useAuthStore.getState());
          if (!account || account.students.length === 0) router.push("/onboarding");
        }}
      />
    </header>
  );
}
