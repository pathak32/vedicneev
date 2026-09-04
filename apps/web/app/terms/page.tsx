import type { Metadata } from "next";

const title = "Terms of Service";
const description =
  "The terms governing use of Vedic Neev's JNVST, AISSEE, and RMS mock test platform — account rules, subscription terms, and our multi-language content disclaimer.";

export const metadata: Metadata = {
  title,
  description,
  alternates: { canonical: "/terms" },
  openGraph: { title, description, url: "/terms" },
  twitter: { title, description },
};

/**
 * Placeholder legal/business specifics (governing jurisdiction, refund
 * window, registered entity, effective date) are called out explicitly
 * below rather than invented — fill these in, ideally after legal review,
 * before this page goes live.
 */
export default function TermsOfServicePage() {
  return (
    <article className="mx-auto flex max-w-2xl flex-col gap-6 px-4 py-12 md:px-8">
      <header className="flex flex-col gap-3">
        <h1 className="text-3xl font-extrabold leading-tight tracking-tight text-foreground md:text-4xl">
          Terms of Service
        </h1>
        <p className="text-sm text-muted-foreground">
          Last updated: <strong>[Effective date — fill in before publishing]</strong>
        </p>
      </header>

      <div className="prose prose-neutral max-w-none dark:prose-invert prose-headings:font-bold prose-a:text-primary">
        <p>
          These Terms of Service (&ldquo;<strong>Terms</strong>&rdquo;) govern your access to and use of
          vedicneev.com and the Vedic Neev mock test platform (the &ldquo;<strong>Service</strong>&rdquo;), operated
          by Vedic Neev (&ldquo;we,&rdquo; &ldquo;us,&rdquo; or &ldquo;our&rdquo;). By creating an account or using
          the Service, you agree to these Terms on behalf of yourself and, where applicable, the student(s) whose
          profiles you manage. If you do not agree, please do not use the Service.
        </p>

        <h2>1. Who Can Use Vedic Neev</h2>
        <p>
          Vedic Neev is intended for use by parents/legal guardians on behalf of children preparing for JNVST,
          AISSEE, RMS, and comparable school entrance exams. The account holder — the person who registers a phone
          number and completes WhatsApp OTP sign-in — must be an adult (18 or older) with the legal authority to
          act as parent or guardian for each student profile added to the account. Student profiles are managed by,
          and remain the responsibility of, the account holder.
        </p>

        <h2>2. Your Account</h2>
        <ul>
          <li>
            You are responsible for keeping the phone number linked to your account accessible and secure, since
            it is how you receive your sign-in code.
          </li>
          <li>Never share your one-time password (OTP) with anyone. Vedic Neev staff will never ask you for it.</li>
          <li>
            Notify us promptly if you suspect unauthorized access to your account. We are not liable for losses
            arising from your failure to keep your phone number and device secure.
          </li>
          <li>Provide accurate information when creating student profiles — target exam, class, and language preference directly affect what content is shown.</li>
        </ul>

        <h2>3. The Service We Provide</h2>
        <p>
          Vedic Neev offers full-length and sectional mock tests modeled on the JNVST, AISSEE, and RMS exam
          patterns; instant scoring and diagnostic reports; a Mistake Vault that logs and categorizes wrong answers
          for revision; Vedic speed-math shortcuts; and, for supported exams, a printable/scannable offline OMR
          workflow. Content is available in English, Hindi, Marathi, Bengali, and Tamil, with coverage expanding
          over time (see Section 4).
        </p>

        <h2>4. Multi-Language Mock Test Disclaimer</h2>
        <ul>
          <li>
            <strong>Practice material, not official past papers.</strong> Our question bank is original content
            modeled on each exam&apos;s known section structure and difficulty pattern for its class/year band. It
            is not a reproduction of, and should not be relied upon as, an authentic leaked or official past paper
            from the conducting authority, unless a specific item is explicitly labeled otherwise.
          </li>
          <li>
            <strong>Translation coverage varies by content.</strong> English is guaranteed for every question.
            Other languages are added incrementally; where a specific question hasn&apos;t yet been translated into
            your selected language, it is shown in English as a fallback so your test is never interrupted.
          </li>
          <li>
            <strong>Scores are diagnostic estimates, not predictions.</strong> Marks, percentiles, and
            admission-probability figures are study aids generated from your responses and, where shown, publicly
            available historical cutoff data. They are not a guarantee or official prediction of your child&apos;s
            performance, selection, or admission in any real examination.
          </li>
          <li>
            <strong>Official exam patterns govern the real test.</strong> For the authoritative, current exam
            pattern, syllabus, and eligibility for JNVST, AISSEE, or RMS, always refer to the official notification
            published by the relevant conducting body (Navodaya Vidyalaya Samiti, Sainik Schools Society, or the
            Directorate General of Military Training, respectively).
          </li>
        </ul>

        <h2>5. Subscriptions &amp; Payments</h2>
        <p>
          Vedic Neev offers a free tier and paid plans (Exam Pass and Vedic All-Access) described on our{" "}
          <a href="/pricing">Pricing</a> page. Paid subscriptions are processed through Razorpay. Prices are shown
          in Indian Rupees (INR) and may change; we will not change the price of an active subscription mid-term
          without notice. Refund and cancellation terms:{" "}
          <strong>[Fill in your refund window and process before publishing]</strong>.
        </p>

        <h2>6. Acceptable Use</h2>
        <p>You agree not to:</p>
        <ul>
          <li>Scrape, copy, or redistribute our question bank or diagnostic content for commercial purposes.</li>
          <li>Attempt to reverse-engineer, disrupt, or gain unauthorized access to the Service.</li>
          <li>Use the Service to impersonate another person or misrepresent your affiliation with anyone.</li>
          <li>Share your account or a student profile&apos;s access with anyone outside your immediate family.</li>
        </ul>

        <h2>7. Intellectual Property</h2>
        <p>
          All question content, diagnostic reports, branding, and software on the Service are owned by Vedic Neev
          or our licensors. We grant you a limited, non-exclusive, non-transferable license to use the Service for
          your family&apos;s personal educational use — nothing here transfers ownership of that content to you.
        </p>

        <h2>8. Disclaimers</h2>
        <p>
          The Service is provided &ldquo;as is.&rdquo; We do not guarantee that use of Vedic Neev will result in
          selection, admission, or any particular exam outcome. Diagnostic tools, admission-probability estimates,
          and Mistake Vault categorization are heuristic aids, not certified assessments. WhatsApp-delivered
          messages (sign-in codes, scorecards) depend on Meta&apos;s WhatsApp Business platform being available and
          your number being reachable on WhatsApp — we are not responsible for delivery failures outside our
          control.
        </p>

        <h2>9. Limitation of Liability</h2>
        <p>
          To the maximum extent permitted by law, Vedic Neev shall not be liable for any indirect, incidental, or
          consequential damages arising from your use of the Service, including but not limited to exam outcomes,
          data loss from browser storage being cleared, or third-party service interruptions (Supabase, Razorpay,
          WhatsApp).
        </p>

        <h2>10. Termination</h2>
        <p>
          You may stop using the Service and request account deletion at any time. We may suspend or terminate
          accounts that violate these Terms, engage in abuse, or pose a security risk to the platform.
        </p>

        <h2>11. Governing Law</h2>
        <p>
          These Terms are governed by the laws of India. Disputes shall be subject to the exclusive jurisdiction of
          the courts of <strong>[Fill in your registered jurisdiction/city before publishing]</strong>.
        </p>

        <h2>12. Changes to These Terms</h2>
        <p>
          We may update these Terms as the Service evolves. We will update the &ldquo;Last updated&rdquo; date
          above, and for material changes, provide a more prominent notice. Continued use of the Service after a
          change constitutes acceptance of the updated Terms.
        </p>

        <h2>13. Contact Us</h2>
        <p>
          Questions about these Terms? Contact us at <strong>[Fill in support/contact email before publishing]</strong>.
          See also our <a href="/privacy">Privacy Policy</a>.
        </p>
        <p className="text-sm text-muted-foreground">
          This page is a professional draft aligned with how Vedic Neev actually operates today. It should receive
          a legal review — particularly for the placeholders above — before publication.
        </p>
      </div>
    </article>
  );
}
