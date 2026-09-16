import type { Metadata } from "next";

const title = "Terms & Conditions";
const description =
  "The terms governing use of VedicNeev Typing Test — account rules, freemium limits, and Custom Text Practice content responsibility.";

export const metadata: Metadata = {
  title,
  description,
  alternates: { canonical: "/terms", languages: { en: "/terms", hi: "/hi/terms" } },
  openGraph: { title, description, url: "/terms" },
};

export default function TermsPage() {
  return (
    <article className="mx-auto flex max-w-2xl flex-col gap-6 px-4 py-12 md:px-8">
      <header className="flex flex-col gap-3">
        <h1 className="text-3xl font-extrabold leading-tight tracking-tight text-foreground md:text-4xl">
          Terms &amp; Conditions
        </h1>
        <p className="text-sm text-muted-foreground">
          Last updated: <strong>[Effective date — fill in before publishing]</strong>
        </p>
      </header>

      <div className="prose prose-neutral max-w-none dark:prose-invert prose-headings:font-bold prose-a:text-primary">
        <p>
          These Terms govern your access to and use of typingtest.vedicneev.com (the &ldquo;Service&rdquo;),
          operated by VedicNeev. By creating an account or using the Service, you agree to these Terms.
        </p>

        <h2>1. Your Account</h2>
        <p>
          Sign-in uses the same phone-verified VedicNeev account as our other products. You're responsible for
          keeping your phone number accessible and secure. Never share your one-time password (OTP) with anyone.
        </p>

        <h2>2. The Service We Provide</h2>
        <p>
          Timed typing tests modeled on government exam skill-test patterns (RRB NTPC, various High Courts,
          UPSSSC, and others), Custom Text Practice, official Gross/Net Speed and Accuracy grading, a Sentence
          X-Ray mistake breakdown, and a dual-mode Typing Speed &amp; Logic quiz.
        </p>

        <h2>3. Practice Material Disclaimer</h2>
        <ul>
          <li>
            <strong>Practice content, not official material.</strong> Passages are original practice content
            modeled on each exam's known format — not a reproduction of any official exam paper.
          </li>
          <li>
            <strong>Scores are estimates.</strong> Speed and accuracy figures reflect the standard
            5-key-depressions-per-word government formula, computed against our own passages — always verify your
            actual exam's official pattern and required speed from the conducting authority's notification.
          </li>
        </ul>

        <h2>4. Custom Text Practice</h2>
        <p>
          When you use Custom Text Practice, you're responsible for the text you paste in. Don't paste
          copyrighted, confidential, or unlawful content. We process that text only to grade your own attempt.
        </p>

        <h2>5. Free Tier &amp; Pro</h2>
        <p>
          The free tier includes a limited number of passages per day, shown on the pricing/upgrade prompts you
          encounter in-app. We may change free-tier limits or introduce paid plans with reasonable notice.
        </p>

        <h2>6. Acceptable Use</h2>
        <p>You agree not to scrape or redistribute our question bank, attempt to disrupt the Service, or share your account outside your own use.</p>

        <h2>7. Disclaimers &amp; Limitation of Liability</h2>
        <p>
          The Service is provided &ldquo;as is.&rdquo; We do not guarantee any particular exam outcome.
          WhatsApp-delivered scorecards depend on Meta's WhatsApp Business platform being available. To the
          maximum extent permitted by law, we are not liable for indirect or consequential damages arising from
          your use of the Service.
        </p>

        <h2>8. Governing Law</h2>
        <p>
          These Terms are governed by the laws of India. Disputes are subject to the exclusive jurisdiction of the
          courts of <strong>[Fill in your registered jurisdiction/city before publishing]</strong>.
        </p>

        <h2>9. Contact Us</h2>
        <p>
          Questions about these Terms? Contact us at <strong>[Fill in support/contact email before publishing]</strong>.
          See also our <a href="/privacy">Privacy Policy</a>.
        </p>
        <p className="text-sm text-muted-foreground">
          This page should receive a legal review before publication, particularly for the placeholders above.
        </p>
      </div>
    </article>
  );
}
