import type { Metadata } from "next";

const title = "FAQ — JNVST, AISSEE & RMS Mock Tests";
const description =
  "Answers for parents and students: JNVST, AISSEE, and RMS exam patterns, multi-language mock test support, and how WhatsApp sign-in works on Vedic Neev.";

export const metadata: Metadata = {
  title,
  description,
  alternates: { canonical: "/faq" },
  openGraph: { title, description, url: "/faq" },
  twitter: { title, description },
};

interface FaqItem {
  question: string;
  answer: string;
}

interface FaqGroup {
  heading: string;
  items: FaqItem[];
}

// Exam-pattern figures below match this platform's own seeded ExamTemplate
// data (packages/db/prisma/seed.ts) — JNVST is sourced with high confidence
// ("Real JNV Selection Test Class 6 pattern" per that file's own comment);
// AISSEE/RMS are the commonly published pattern, carried here with the same
// "verify against the current official notification" caveat that file uses,
// since conducting bodies can revise a pattern year to year.
const FAQ_GROUPS: FaqGroup[] = [
  {
    heading: "Exam Patterns",
    items: [
      {
        question: "What is the JNVST Class 6 exam pattern?",
        answer:
          "The Jawahar Navodaya Vidyalaya Selection Test (JNVST) for Class 6 has 80 objective-type questions worth 100 marks, in a 120-minute paper with no negative marking: Mental Ability (40 questions, 50 marks, 60 minutes), Arithmetic (20 questions, 25 marks, 30 minutes), and Language (20 questions, 25 marks, 30 minutes). Vedic Neev's full-length mock tests are built to this same structure. Always check the current year's official notification from Navodaya Vidyalaya Samiti for any updates.",
      },
      {
        question: "What is the AISSEE (Sainik School) exam pattern?",
        answer:
          "The commonly published All India Sainik Schools Entrance Examination (AISSEE) Class 6 pattern is 125 objective-type questions worth 300 marks over 150 minutes, with no negative marking: Mathematics (50 questions, 150 marks, 60 minutes), Intelligence (25 questions, 50 marks, 30 minutes), Language (25 questions, 50 marks, 30 minutes), and General Knowledge (25 questions, 50 marks, 30 minutes). Verify this against the current year's official AISSEE notification, since conducting bodies can revise the pattern.",
      },
      {
        question: "What is the RMS (Rashtriya Military School) exam pattern?",
        answer:
          "The commonly published Rashtriya Military School (RMS) Class 6 entrance pattern mirrors AISSEE's structure: 125 objective-type questions worth 300 marks over 150 minutes, with no negative marking. As with AISSEE, treat this as a study guide rather than a guarantee, and check the current year's official RMS notification for authoritative details.",
      },
      {
        question: "Is negative marking used in these mock tests?",
        answer:
          "No — none of the three exam patterns above use negative marking for Class 6, so neither do Vedic Neev's mock tests built to those patterns.",
      },
    ],
  },
  {
    heading: "Multi-Language Mock Tests",
    items: [
      {
        question: "Which languages are supported?",
        answer:
          "English, Hindi, Marathi, Bengali, and Tamil. You can switch languages at any point during a mock test — from the language menu in the exam header — without losing your progress, timer, or answers.",
      },
      {
        question: "What happens if a question hasn't been translated into my chosen language yet?",
        answer:
          "It's shown in English. Every question in our bank is guaranteed to have an English version; other languages are added incrementally, so a question without your selected language yet falls back to English rather than breaking your test.",
      },
      {
        question: "Does switching languages affect my score or timer?",
        answer:
          "No. Language is purely a display setting — your selected answers, question position, and remaining time are all completely unaffected by switching languages mid-test.",
      },
    ],
  },
  {
    heading: "WhatsApp Sign-In",
    items: [
      {
        question: "How do I sign in with WhatsApp?",
        answer:
          "Tap \"Sign In,\" enter your 10-digit mobile number, and we'll send a 6-digit one-time code to that number on WhatsApp. Enter the code on the site to finish signing in — no password needed.",
      },
      {
        question: "I didn't receive the WhatsApp code. What do I do?",
        answer:
          "First, confirm the number you entered is active on WhatsApp. You can request a new code after a short cooldown using \"Resend OTP.\" If codes still aren't arriving, double-check you entered the number without a country code or extra digits, then try again.",
      },
      {
        question: "Is my WhatsApp number shared with anyone else?",
        answer:
          "No. Your number is used only to deliver your sign-in code (and, if you opt in, diagnostic scorecards) through Meta's WhatsApp Business platform. See our Privacy Policy for the full picture.",
      },
      {
        question: "Can one WhatsApp number manage more than one child's profile?",
        answer:
          "Yes — a single parent account can add multiple student profiles (siblings), each with their own exam target, class, and language preference, all signed in under the same parent phone number.",
      },
    ],
  },
  {
    heading: "Plans & Payments",
    items: [
      {
        question: "Is there a free way to try Vedic Neev?",
        answer:
          "Yes — the Free Explorer tier includes one full-length mock test and a basic score summary at no cost, so you can try the platform before subscribing. See the Pricing page for what's included in each paid plan.",
      },
      {
        question: "How do I upgrade or manage my subscription?",
        answer:
          "From the Pricing page or your Parent Command Center, choose a plan and complete checkout — payments are processed securely through Razorpay. You can view or change your plan from the Parent Command Center at any time.",
      },
    ],
  },
];

const faqJsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: FAQ_GROUPS.flatMap((group) =>
    group.items.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: { "@type": "Answer", text: item.answer },
    }))
  ),
};

export default function FaqPage() {
  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-10 px-4 py-12 md:px-8">
      {/* eslint-disable-next-line @next/next/no-sync-scripts -- static JSON-LD, not a loaded script */}
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }} />

      <header className="flex flex-col gap-3">
        <h1 className="text-3xl font-extrabold leading-tight tracking-tight text-foreground md:text-4xl">
          Frequently Asked Questions
        </h1>
        <p className="text-sm text-muted-foreground md:text-base">
          Common questions from parents and students about exam patterns, multi-language mock tests, and signing in.
          Still stuck? See our{" "}
          <a href="/privacy" className="text-primary underline-offset-2 hover:underline">
            Privacy Policy
          </a>{" "}
          or{" "}
          <a href="/terms" className="text-primary underline-offset-2 hover:underline">
            Terms of Service
          </a>
          .
        </p>
      </header>

      {FAQ_GROUPS.map((group) => (
        <section key={group.heading} className="flex flex-col gap-3">
          <h2 className="text-lg font-bold text-foreground md:text-xl">{group.heading}</h2>
          <div className="flex flex-col divide-y divide-border rounded-lg border border-border">
            {group.items.map((item) => (
              <details key={item.question} className="group p-4 [&_summary::-webkit-details-marker]:hidden">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-3 text-sm font-semibold text-foreground md:text-base">
                  {item.question}
                  <span className="shrink-0 text-muted-foreground transition-transform group-open:rotate-45">+</span>
                </summary>
                <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{item.answer}</p>
              </details>
            ))}
          </div>
        </section>
      ))}

      <p className="text-xs text-muted-foreground">
        Exam pattern figures reflect the commonly published Class 6 patterns as of this writing. Conducting bodies
        can revise their exam pattern year to year — always verify against the current official notification from
        the relevant authority (Navodaya Vidyalaya Samiti for JNVST; the Sainik Schools Society for AISSEE; the
        Directorate General of Military Training for RMS) before relying on it for exam-day decisions.
      </p>
    </div>
  );
}
