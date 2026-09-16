import type { Metadata } from "next";

const title = "Privacy Policy";
const description =
  "How VedicNeev Typing Test collects and uses your data — phone-based sign-in, typing attempt history, and WhatsApp scorecard delivery.";

export const metadata: Metadata = {
  title,
  description,
  alternates: { canonical: "/privacy", languages: { en: "/privacy", hi: "/hi/privacy" } },
  openGraph: { title, description, url: "/privacy" },
};

/**
 * Scoped to what this app actually does — typing practice, freemium
 * limits, WhatsApp OTP sign-in shared with vedicneev.com, and WhatsApp
 * scorecard delivery. No payment processing of its own yet (no
 * TypingSubscription checkout flow exists in this app currently), so this
 * doesn't carry apps/web's Razorpay section.
 */
export default function PrivacyPolicyPage() {
  return (
    <article className="mx-auto flex max-w-2xl flex-col gap-6 px-4 py-12 md:px-8">
      <header className="flex flex-col gap-3">
        <h1 className="text-3xl font-extrabold leading-tight tracking-tight text-foreground md:text-4xl">
          Privacy Policy
        </h1>
        <p className="text-sm text-muted-foreground">
          Last updated: <strong>[Effective date — fill in before publishing]</strong>
        </p>
      </header>

      <div className="prose prose-neutral max-w-none dark:prose-invert prose-headings:font-bold prose-a:text-primary">
        <p>
          VedicNeev Typing Test (&ldquo;we,&rdquo; &ldquo;us,&rdquo; or &ldquo;our&rdquo;) operates
          typingtest.vedicneev.com, a government-exam typing practice platform. This Policy explains what personal
          data we collect, why, and the choices you have about it. It's part of the same VedicNeev account system
          as vedicneev.com — signing in here uses the same phone-verified account.
        </p>

        <h2>1. Information We Collect</h2>
        <ul>
          <li>
            <strong>Phone number.</strong> Sign-in is phone-first via WhatsApp OTP, shared across VedicNeev
            products — we don't require or store a password.
          </li>
          <li>
            <strong>Target exam &amp; typing history.</strong> Your declared target exam, and every typing
            attempt's typed text, timing, and computed Gross/Net Speed, Accuracy, and Mistake counts.
          </li>
          <li>
            <strong>Custom Text Practice content.</strong> Any text you paste into Custom Text Practice is
            processed to grade that one attempt and stored with your attempt history like any other attempt.
          </li>
        </ul>

        <h2>2. How We Use Your Information</h2>
        <ul>
          <li>To grade typing attempts and show your dashboard history, streaks, and leaderboard position.</li>
          <li>To enforce the free-tier daily passage limit and Pro entitlements.</li>
          <li>To deliver a scorecard over WhatsApp when you tap &ldquo;Send Scorecard to WhatsApp.&rdquo;</li>
        </ul>
        <p>We do not use your data for targeted advertising, and we do not sell personal data to anyone.</p>

        <h2>3. WhatsApp Delivery</h2>
        <p>
          Sign-in codes and requested scorecards are sent via Meta&apos;s WhatsApp Business Cloud API. We retain a
          record that a message was sent, not the content of your WhatsApp conversations generally.
        </p>

        <h2>4. Data Storage &amp; Security</h2>
        <p>
          Your data is stored in the same PostgreSQL database (hosted on Supabase) as the rest of the VedicNeev
          platform, encrypted at rest and in transit, served over HTTPS.
        </p>

        <h2>5. Your Rights</h2>
        <p>
          You can request a copy of your data, ask us to correct it, or ask us to delete your account and
          associated data, subject to applicable law including India&apos;s Digital Personal Data Protection Act,
          2023. Contact us using the details below.
        </p>

        <h2>6. Changes to This Policy</h2>
        <p>We may update this Policy as the platform evolves; we'll update the date above when we do.</p>

        <h2>7. Contact Us</h2>
        <ul>
          <li>Email: <strong>[Fill in before publishing]</strong></li>
        </ul>
        <p className="text-sm text-muted-foreground">
          This page should receive a legal review before publication, particularly for the placeholders above.
        </p>
      </div>
    </article>
  );
}
