"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@vedicneev/ui";
import { Award, ChevronDown, Globe, Sparkles } from "lucide-react";

import { useActiveStudent } from "@/lib/auth/ActiveStudentContext";
import { selectActiveAccount, useAuthStore } from "@/lib/auth/useAuthStore";
import { SUPPORTED_LANGUAGES, useLanguageStore } from "@/lib/hooks/useLanguageStore";
import { useT } from "@/lib/i18n/useT";
import { ExamDropdown } from "./ExamDropdown";
import { PhoneAuthModal } from "./PhoneAuthModal";
import { StudentSwitcherDropdown } from "./StudentSwitcherDropdown";

/** Compact hover-reveal language picker, left of the nav links — writes to the same store the hero section and exam runner read. */
function LanguageSwitcher() {
  const languageCode = useLanguageStore((s) => s.languageCode);
  const setLanguage = useLanguageStore((s) => s.setLanguage);

  return (
    <div className="group relative">
      <button
        type="button"
        className="flex items-center gap-1.5 rounded-lg border border-border bg-muted px-3 py-1.5 text-xs font-bold text-foreground transition-colors hover:border-primary/40 hover:bg-accent"
      >
        <Globe className="h-3.5 w-3.5 text-primary" />
        <span className="uppercase">{languageCode}</span>
        <ChevronDown className="h-3 w-3 text-muted-foreground" />
      </button>
      <div className="absolute left-0 z-50 mt-1 hidden w-44 rounded-xl border border-border bg-background py-2 shadow-xl group-hover:block">
        {SUPPORTED_LANGUAGES.map((lang) => (
          <button
            key={lang.code}
            type="button"
            onClick={() => setLanguage(lang.code)}
            className={`w-full px-4 py-2 text-left text-xs font-semibold transition-colors ${
              languageCode === lang.code
                ? "bg-accent font-bold text-foreground"
                : "text-muted-foreground hover:bg-accent hover:text-foreground"
            }`}
          >
            {lang.label}
          </button>
        ))}
      </div>
    </div>
  );
}

/** Floating full-form reminder for the three exam boards this platform covers — only shown once there's room (xl+). */
function ExamBoardPills() {
  const t = useT();
  return (
    <div className="hidden items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-4 py-1.5 xl:flex">
      <span className="flex items-center gap-1 text-[11px] font-extrabold text-primary">
        <Award className="h-3.5 w-3.5" /> {t("navActiveBoards")}
      </span>
      <span
        className="rounded-md border border-primary/10 bg-background px-2 py-0.5 text-[11px] font-bold text-foreground shadow-sm"
        title="Jawahar Navodaya Vidyalaya Selection Test"
      >
        JNVST (Navodaya)
      </span>
      <span
        className="rounded-md border border-primary/10 bg-background px-2 py-0.5 text-[11px] font-bold text-foreground shadow-sm"
        title="All India Sainik School Entrance Examination"
      >
        AISSEE (Sainik)
      </span>
      <span
        className="rounded-md border border-primary/10 bg-background px-2 py-0.5 text-[11px] font-bold text-foreground shadow-sm"
        title="Rashtriya Military Schools"
      >
        RMS (Military)
      </span>
    </div>
  );
}

export function SiteHeader() {
  const router = useRouter();
  const { hasHydrated, isAuthenticated } = useActiveStudent();
  const [authOpen, setAuthOpen] = useState(false);
  const t = useT();

  return (
    <header className="sticky top-0 z-40 flex items-center justify-between gap-4 border-b border-border bg-background/95 px-4 py-3 backdrop-blur md:px-8">
      <div className="flex items-center gap-6">
        <nav className="hidden items-center gap-5 text-sm text-muted-foreground md:flex">
          <Link href="/learn" className="hover:text-foreground">
            {t("navLearn")}
          </Link>
          <Link href="/blog" className="hover:text-foreground">
            {t("navBlog")}
          </Link>
          <Link href="/pricing" className="hover:text-foreground">
            {t("navPricing")}
          </Link>
          {isAuthenticated ? (
            <Link href="/dashboard" className="hover:text-foreground">
              {t("navDashboard")}
            </Link>
          ) : null}
          {isAuthenticated ? <ExamDropdown /> : null}
          {isAuthenticated ? (
            <Link href="/practice" className="hover:text-foreground">
              {t("navPractice")}
            </Link>
          ) : null}
          {isAuthenticated ? (
            <Link href="/parent" className="hover:text-foreground">
              {t("navParent")}
            </Link>
          ) : null}
        </nav>
        <LanguageSwitcher />
      </div>

      <ExamBoardPills />

      <div className="flex items-center gap-4">
        <div className="hidden items-center gap-3 lg:flex">
          <Link href="/sprints" className="text-xs font-bold text-muted-foreground hover:text-foreground">
            {t("navMockSeries")}
          </Link>
          <Link href="/practice" className="text-xs font-bold text-muted-foreground hover:text-foreground">
            {t("navFreePractice")}
          </Link>
          <Link
            href="/sprints"
            className="flex items-center gap-1 rounded-xl border border-primary/20 bg-primary/5 px-3 py-1.5 text-xs font-extrabold text-primary hover:bg-primary/10"
          >
            <Sparkles className="h-3.5 w-3.5" /> {t("navWeeklyScholarship")}
          </Link>
        </div>

        {hasHydrated ? (
          isAuthenticated ? (
            <StudentSwitcherDropdown />
          ) : (
            <Button type="button" onClick={() => setAuthOpen(true)}>
              {t("navSignIn")}
            </Button>
          )
        ) : null}

        <Link href="/" className="flex items-center gap-2 font-bold text-foreground">
          <Sparkles className="h-5 w-5 text-primary" />
          Vedic Neev
        </Link>
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
