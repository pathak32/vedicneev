import type { TypingLanguageCode } from "./useLanguageStore";

type Entry = Record<TypingLanguageCode, string>;

/**
 * App-shell chrome copy (header, homepage, dashboard headings) — one flat
 * key -> per-language string map, same shape/convention as apps/web's own
 * src/lib/i18n/dictionary.ts but scoped to this app's two languages. Covers
 * the shell only; the typing arena, results breakdown, and leaderboard stay
 * English-first for now and can be extended into this same map later,
 * rather than starting a second dictionary.
 */
export const DICTIONARY = {
  // Header
  navDashboard: { en: "Dashboard", hi: "डैशबोर्ड" },
  navSignIn: { en: "Sign in", hi: "साइन इन करें" },
  navBlog: { en: "Blog", hi: "ब्लॉग" },
  navFaq: { en: "FAQ", hi: "सामान्य प्रश्न" },

  // Homepage
  homeTitle: { en: "Government Exam Typing Practice", hi: "सरकारी परीक्षा टंकण अभ्यास" },
  homeSubtitle: {
    en: "Official-format typing tests — Gross/Net Speed, Accuracy, and Full/Half Mistakes graded exactly like the real exam. English & Hindi (Inscript/Remington) layouts supported.",
    hi: "आधिकारिक-प्रारूप टंकण परीक्षण — ग्रॉस/नेट गति, सटीकता, तथा पूर्ण/आधी गलतियाँ ठीक वास्तविक परीक्षा की तरह मूल्यांकित। अंग्रेज़ी तथा हिंदी (इंस्क्रिप्ट/रेमिंगटन) लेआउट समर्थित।",
  },

  // Dashboard
  dashboardTitle: { en: "Your Typing History", hi: "आपका टंकण इतिहास" },
  dashboardAttempts: { en: "Attempts", hi: "प्रयास" },
  dashboardBestSpeed: { en: "Best Net Speed", hi: "सर्वश्रेष्ठ नेट गति" },
  dashboardAvgAccuracy: { en: "Average Accuracy", hi: "औसत सटीकता" },
  dashboardRecentAttempts: { en: "Recent Attempts", hi: "हाल के प्रयास" },

  // Footer
  footerTagline: {
    en: "A VedicNeev product — government-exam typing practice, bilingual (English/Hindi).",
    hi: "एक वेदिक नींव उत्पाद — सरकारी परीक्षा टंकण अभ्यास, द्विभाषी (अंग्रेज़ी/हिंदी)।",
  },
  footerPrivacy: { en: "Privacy Policy", hi: "गोपनीयता नीति" },
  footerTerms: { en: "Terms & Conditions", hi: "नियम एवं शर्तें" },
  footerDisclaimer: { en: "Disclaimer", hi: "अस्वीकरण" },
} satisfies Record<string, Entry>;

export type DictionaryKey = keyof typeof DICTIONARY;
