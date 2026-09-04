import type { Metadata } from "next";

const title = "Privacy Policy";
const description =
  "How Vedic Neev collects, stores, and protects your family's data — phone-based sign-in, exam telemetry, and payment information — for JNVST, AISSEE, and RMS mock test preparation.";

export const metadata: Metadata = {
  title,
  description,
  alternates: { canonical: "/privacy" },
  openGraph: { title, description, url: "/privacy" },
  twitter: { title, description },
};

/**
 * Placeholder legal/business specifics (grievance officer contact,
 * registered entity details, effective date) are called out explicitly
 * below rather than invented — fill these in, ideally after legal review,
 * before this page goes live. Everything else describes this app's actual
 * data handling as implemented (see apps/web/app/api/auth/whatsapp-otp,
 * packages/db/prisma/schema.prisma, apps/web/src/lib/payments/razorpayServer.ts).
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
          Vedic Neev (&ldquo;<strong>Vedic Neev</strong>&rdquo;, &ldquo;we&rdquo;, &ldquo;us&rdquo;, or
          &ldquo;our&rdquo;) operates vedicneev.com, an exam-preparation platform for students preparing for the
          Jawahar Navodaya Vidyalaya Selection Test (JNVST), the All India Sainik Schools Entrance Examination
          (AISSEE), the Rashtriya Military School (RMS) entrance exam, and comparable K-8 school admissions. This
          Policy explains what personal data we collect, why we collect it, how it is stored and secured, and the
          choices you have about it. It applies to every visitor, parent, and student who uses our website and
          mock-test platform.
        </p>
        <p>
          Vedic Neev is built for children. Every student profile on this platform is created and managed by a
          parent or legal guardian&apos;s account — students do not register or consent independently. Wherever this
          Policy refers to &ldquo;you,&rdquo; it means the parent or guardian who controls the account, acting on
          behalf of their child, unless the context makes clear it refers to the student directly (for example,
          exam responses).
        </p>

        <h2>1. Information We Collect</h2>
        <h3>1.1 Account &amp; identity information</h3>
        <ul>
          <li>
            <strong>Phone number.</strong> Sign-in is phone-first: we send a one-time password (OTP) to your WhatsApp
            number to verify it&apos;s you. We do not require or store a password.
          </li>
          <li>
            <strong>Email address</strong> (optional, if you choose to add one).
          </li>
        </ul>
        <h3>1.2 Student profile information</h3>
        <p>Provided by the parent/guardian when adding a child&apos;s profile:</p>
        <ul>
          <li>Full name and target class/grade.</li>
          <li>Target exam (JNVST, AISSEE, RMS, or another supported exam).</li>
          <li>Preferred language (English, Hindi, Marathi, Bengali, or Tamil).</li>
          <li>
            Locality (rural/urban) and reservation category — used only to power the admission-probability estimate
            against publicly available historical cutoff data, a feature you can ignore if you&apos;d rather not
            provide this.
          </li>
        </ul>
        <h3>1.3 Learning &amp; exam telemetry</h3>
        <p>Generated automatically as a student uses the platform:</p>
        <ul>
          <li>Mock test attempts: selected answers, time spent per question, and final scores.</li>
          <li>
            Diagnostic data derived from attempts: accuracy by section/topic, a speed-vs-accuracy classification, and
            the Mistake Vault log (which questions were missed and why, to guide revision).
          </li>
          <li>
            If you use the offline OMR workflow, a scanned image of a printed answer sheet and its graded result.
          </li>
        </ul>
        <h3>1.4 Payment information</h3>
        <p>
          Subscription payments are processed by Razorpay, our third-party payment gateway. We never see or store
          your card, UPI, or net-banking credentials — Razorpay handles that directly under its own PCI-DSS
          compliant infrastructure. We retain only the transaction reference, the plan purchased, and the amount
          paid, so we can confirm and manage your subscription.
        </p>
        <h3>1.5 Communications data</h3>
        <p>
          When we send you a sign-in code or a diagnostic scorecard over WhatsApp, that message is dispatched
          through Meta&apos;s WhatsApp Business Cloud API. We retain a record that a message was sent (for support
          and troubleshooting) but not the content of your WhatsApp conversations generally.
        </p>
        <h3>1.6 Technical data</h3>
        <p>
          Standard web request data (e.g. IP address, browser type) is processed transiently by our hosting
          infrastructure to serve the site securely. Your exam progress, language preference, and sign-in state are
          kept in your browser&apos;s local storage so the app works smoothly between visits — see &ldquo;Cookies
          &amp; Local Storage&rdquo; below.
        </p>

        <h2>2. How We Use Your Information</h2>
        <ul>
          <li>To create and secure your account, and verify sign-in via WhatsApp OTP.</li>
          <li>To generate mock tests, grade them, and produce diagnostic reports and Mistake Vault entries.</li>
          <li>To process subscription payments and manage plan entitlements.</li>
          <li>To send service communications: OTP codes, requested diagnostic scorecards, and account-related notices.</li>
          <li>To maintain platform security, prevent abuse, and troubleshoot issues.</li>
          <li>To improve the accuracy and coverage of our question bank and diagnostic tools.</li>
        </ul>
        <p>We do not use student data to serve targeted advertising, and we do not sell personal data to anyone.</p>

        <h2>3. How We Store &amp; Secure Your Data</h2>
        <p>
          Your data is stored in a PostgreSQL database hosted on Supabase, a managed infrastructure provider that
          encrypts data at rest and in transit. All traffic to vedicneev.com is served over HTTPS. Sign-in codes are
          never stored in plain text — they are hashed before being written to the database, expire after a short
          window, and are invalidated after a limited number of incorrect attempts. Our administrative tools are
          gated behind a separate, signed session credential; student and parent accounts and administrative access
          are kept entirely separate.
        </p>
        <p>
          No method of storage or transmission is 100% secure, and we cannot guarantee absolute security. If we
          become aware of a data breach affecting your personal information, we will notify you and the relevant
          authorities as required by applicable law.
        </p>

        <h2>4. Third-Party Service Providers</h2>
        <p>We share the minimum data necessary with the following service providers, each acting on our behalf:</p>
        <ul>
          <li>
            <strong>Supabase</strong> — database hosting and (where enabled) authentication infrastructure.
          </li>
          <li>
            <strong>Razorpay</strong> — payment processing for subscriptions.
          </li>
          <li>
            <strong>Meta (WhatsApp Business Cloud API)</strong> — delivery of sign-in codes and, where you opt in,
            diagnostic scorecards.
          </li>
        </ul>
        <p>
          We do not permit these providers to use your data for their own independent purposes beyond providing the
          service we&apos;ve engaged them for.
        </p>

        <h2>5. Children&apos;s Data &amp; Parental Consent</h2>
        <p>
          This platform is designed for use by children under the guidance of a parent or legal guardian. A
          student profile can only be created by an account holder who has verified their own phone number and
          confirms they are that student&apos;s parent or guardian. We do not knowingly collect personal data
          directly from a child without that verified adult account in place. If you believe a child has provided
          us with personal data outside of this process, please contact us using the details in
          &ldquo;Contact Us&rdquo; below and we will take steps to remove it.
        </p>

        <h2>6. Cookies &amp; Local Storage</h2>
        <p>
          We use your browser&apos;s local storage (not third-party advertising cookies) to keep you signed in,
          remember your language preference, and preserve in-progress mock test answers and timers so an accidental
          refresh doesn&apos;t lose your work. This data stays on your device and is not shared with third-party
          advertisers.
        </p>

        <h2>7. Data Retention</h2>
        <p>
          We retain account and exam data for as long as your account remains active, so that test history and
          diagnostic trends remain useful over time. If you request account deletion, we will delete or anonymize
          your personal data within a reasonable period, except where we are required to retain certain records
          (for example, payment records) to comply with law.
        </p>

        <h2>8. Your Rights</h2>
        <p>Subject to applicable law, including India&apos;s Digital Personal Data Protection Act, 2023, you can:</p>
        <ul>
          <li>Request a copy of the personal data we hold about your account and your children&apos;s profiles.</li>
          <li>Ask us to correct inaccurate or incomplete data.</li>
          <li>Ask us to delete your account and associated personal data.</li>
          <li>Withdraw consent for optional data (such as locality/category used for admission-probability estimates) at any time.</li>
        </ul>
        <p>To exercise any of these rights, contact us using the details below.</p>

        <h2>9. Changes to This Policy</h2>
        <p>
          We may update this Policy from time to time as our platform evolves. We will update the &ldquo;Last
          updated&rdquo; date above when we do, and, for material changes, provide a more prominent notice.
        </p>

        <h2>10. Grievance Officer &amp; Contact Us</h2>
        <p>
          If you have questions about this Policy or wish to exercise your rights, contact our Grievance Officer:
        </p>
        <ul>
          <li>Name: <strong>[Fill in before publishing]</strong></li>
          <li>Email: <strong>[Fill in before publishing]</strong></li>
          <li>Registered address: <strong>[Fill in before publishing]</strong></li>
        </ul>
        <p className="text-sm text-muted-foreground">
          This page is a professional draft aligned with how Vedic Neev actually handles data today. It should
          receive a legal review — particularly for the placeholders above and for compliance with India&apos;s
          Digital Personal Data Protection Act, 2023 and IT Rules, 2021 — before publication.
        </p>
      </div>
    </article>
  );
}
