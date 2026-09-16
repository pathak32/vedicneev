"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Button,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@vedicneev/ui";
import { ChevronDown, GraduationCap, Globe, Sparkles } from "lucide-react";

import { useActiveStudent } from "@/lib/auth/ActiveStudentContext";
import { selectActiveAccount, useAuthStore } from "@/lib/auth/useAuthStore";
import { vedicMindAiUrl } from "@/lib/ecosystem/vedicMindAi";
import { SUPPORTED_LANGUAGES, useLanguageStore } from "@/lib/hooks/useLanguageStore";
import { useT } from "@/lib/i18n/useT";
import { institutePartnerUrl } from "@/lib/institute/instituteUrl";
import { readInstitutePartnerFlagFromDocument } from "@/lib/institute/partnerFlag";
import { BOARD_DATA, type BoardType } from "@/lib/marketing/examBoards";
import { ExamDropdown } from "./ExamDropdown";
import { PhoneAuthModal } from "./PhoneAuthModal";
import { StudentSwitcherDropdown } from "./StudentSwitcherDropdown";

/**
 * Language picker — click/Enter/Space to open (not hover-only), so it's
 * fully reachable by keyboard and screen readers. The previous
 * hover-reveal version (`group-hover:block` on a `hidden` panel) was
 * unreachable by keyboard entirely: a `display:none` panel can't receive
 * focus, so Tabbing past the trigger skipped every language option with
 * no way to open the panel without a mouse.
 */
function LanguageSwitcher() {
  const languageCode = useLanguageStore((s) => s.languageCode);
  const setLanguage = useLanguageStore((s) => s.setLanguage);
  const [open, setOpen] = useState(false);

  return (
    <div className="relative" onBlur={(e) => { if (!e.currentTarget.contains(e.relatedTarget)) setOpen(false); }}>
      <button
        type="button"
        aria-haspopup="true"
        aria-expanded={open}
        aria-label="Choose language"
        onClick={() => setOpen((o) => !o)}
        className="flex items-center gap-1.5 rounded-lg border border-border bg-muted px-3 py-1.5 text-xs font-bold text-foreground transition-colors hover:border-primary/40 hover:bg-accent"
      >
        <Globe className="h-3.5 w-3.5 text-primary" />
        <span className="uppercase">{languageCode}</span>
        <ChevronDown className="h-3 w-3 text-muted-foreground" />
      </button>
      {open ? (
        <div role="menu" className="absolute left-0 z-50 mt-1 w-44 rounded-xl border border-border bg-background py-2 shadow-xl">
          {SUPPORTED_LANGUAGES.map((lang) => (
            <button
              key={lang.code}
              type="button"
              role="menuitem"
              onClick={() => {
                setLanguage(lang.code);
                setOpen(false);
              }}
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
      ) : null}
    </div>
  );
}

/** Single "Active Exam Boards" dropdown replacing the three unclickable board pills — each item routes to that board's dedicated pattern/eligibility/marking-scheme page. */
function ExamBoardsMenu() {
  const t = useT();
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button type="button" variant="outline" size="sm" className="gap-1.5">
          <GraduationCap className="h-3.5 w-3.5" />
          {t("navActiveExamBoards")}
          <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-56">
        <DropdownMenuLabel>{t("navActiveExamBoards")}</DropdownMenuLabel>
        {(Object.keys(BOARD_DATA) as BoardType[]).map((boardKey) => (
          <DropdownMenuItem key={boardKey} asChild>
            <Link href={`/exam-boards/${boardKey}`}>{t(BOARD_DATA[boardKey].nameKey)}</Link>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export function SiteHeader() {
  const router = useRouter();
  const { hasHydrated, isAuthenticated } = useActiveStudent();
  const [authOpen, setAuthOpen] = useState(false);
  // Read once on mount rather than via useState's lazy initializer — this
  // runs during SSR too (where `document` doesn't exist), and
  // readInstitutePartnerFlagFromDocument already returns false in that
  // case, so starting at false and correcting on mount avoids a
  // hydration-mismatch warning instead of risking one.
  const [isInstitutePartner, setIsInstitutePartner] = useState(false);
  useEffect(() => {
    setIsInstitutePartner(readInstitutePartnerFlagFromDocument());
  }, []);
  const t = useT();

  return (
    <header className="sticky top-0 z-40 flex items-center justify-between gap-4 border-b border-border bg-background/95 px-4 py-2.5 backdrop-blur md:px-8">
      <Link href="/" className="flex shrink-0 items-center gap-2 font-bold text-foreground">
        <Sparkles className="h-5 w-5 text-primary" />
        Vedic Neev
      </Link>

      <nav className="hidden items-center gap-5 text-sm font-medium text-muted-foreground md:flex">
        <Link href="/sprints" className="hover:text-foreground">
          {t("navScholarshipSprints")}
        </Link>
        <Link href="/store" className="hover:text-foreground">
          {t("navStore")}
        </Link>
        <Link href="/#exam-boards" className="hover:text-foreground">
          {t("navMockSeries")}
        </Link>
        <Link href="/practice" className="hover:text-foreground">
          {t("navFreePractice")}
        </Link>
        <a
          href={vedicMindAiUrl("/", "header_nav")}
          target="_blank"
          rel="noopener noreferrer"
          className="hover:text-foreground"
        >
          {t("navVedicMindAi")}
        </a>
        <a
          href={institutePartnerUrl(isInstitutePartner ? "/dashboard" : "/login", "header_nav")}
          target="_blank"
          rel="noopener noreferrer"
          className="hover:text-foreground"
        >
          {t("navForInstitutes")}
        </a>
        {isAuthenticated ? (
          <Link href="/dashboard" className="hover:text-foreground">
            {t("navDashboard")}
          </Link>
        ) : null}
        {isAuthenticated ? <ExamDropdown /> : null}
        {isAuthenticated ? (
          <Link href="/parent" className="hover:text-foreground">
            {t("navParent")}
          </Link>
        ) : null}
      </nav>

      <div className="flex items-center gap-2.5">
        <LanguageSwitcher />
        <ExamBoardsMenu />
        <Link
          href="/sprints"
          className="hidden items-center gap-1 rounded-xl border border-primary/20 bg-primary/5 px-3 py-1.5 text-xs font-extrabold text-primary hover:bg-primary/10 lg:flex"
        >
          <Sparkles className="h-3.5 w-3.5" /> {t("navWeeklyScholarship")}
        </Link>

        {hasHydrated ? (
          isAuthenticated ? (
            <StudentSwitcherDropdown />
          ) : (
            <Button type="button" onClick={() => setAuthOpen(true)}>
              {t("navSignIn")}
            </Button>
          )
        ) : null}
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
