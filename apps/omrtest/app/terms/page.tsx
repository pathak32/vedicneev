import type { Metadata } from "next";

const title = "Terms of Service";
const description =
  "The terms governing an institute's use of VedicNeev Institute Suite — account rules, scan credits, and OMR grading terms.";

export const metadata: Metadata = { title, description };

export default function InstituteTermsOfServicePage() {
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

      <div className="flex flex-col gap-5 text-sm leading-relaxed text-foreground [&_h2]:mt-4 [&_h2]:text-xl [&_h2]:font-bold [&_h2]:text-foreground [&_li]:ml-5 [&_li]:list-disc [&_p]:text-foreground [&_strong]:font-semibold [&_ul]:flex [&_ul]:flex-col [&_ul]:gap-1.5">
        <p>
          These Terms of Service (&ldquo;<strong>Terms</strong>&rdquo;) govern your institute&apos;s access to and
          use of omrtest.vedicneev.com and the VedicNeev Institute Suite (the &ldquo;<strong>Service</strong>
          &rdquo;), operated by VedicNeev (&ldquo;we,&rdquo; &ldquo;us,&rdquo; or &ldquo;our&rdquo;). By onboarding
          an institute or signing in as an Institute Admin, you agree to these Terms on behalf of the institute you
          represent. If you do not agree, please do not use the Service.
        </p>

        <h2>1. Who Can Use This Service</h2>
        <p>
          This Service is intended for coaching institutes and their authorized staff (Institute Admins) preparing
          and grading offline mock tests for their own students. The person who completes onboarding must have
          authority to act on behalf of the institute they register.
        </p>

        <h2>2. Your Account</h2>
        <ul>
          <li>You are responsible for keeping the phone number linked to your admin account secure — it is how you receive your sign-in code.</li>
          <li>Never share your one-time password (OTP) with anyone.</li>
          <li>You are responsible for actions taken under your institute's admin accounts, including staff you grant access to.</li>
          <li>Provide accurate institute profile information — name, branch/city, and exam category directly affect what's shown on your printed sheets and reports.</li>
        </ul>

        <h2>3. The Service We Provide</h2>
        <p>
          VedicNeev Institute Suite lets an institute create test batches, generate watermarked, pre-tokenized OMR
          answer sheets for a fixed roster of students, upload scanned/photographed completed sheets, and receive
          automated grading against an answer key you set. Every sheet is bound to one student's roster entry before
          it is printed — there is no generic, reusable master sheet.
        </p>

        <h2>4. Scan Credits &amp; the Credit Ledger</h2>
        <p>
          Grading a scanned sheet consumes one scan credit from your institute's balance. Credits are tracked in an
          append-only ledger (grants, consumption, and refunds for a rejected or duplicate scan). New institutes
          receive a limited free-trial credit grant on onboarding; further credits are subject to
          <strong> [Fill in your pricing/top-up terms before publishing]</strong>. A rejected scan (unreadable,
          duplicate, or no roster match) does not consume a credit.
        </p>

        <h2>5. Accuracy of Automated Grading</h2>
        <p>
          Grading is performed by automated bubble-detection software. While designed for high accuracy, image
          quality, printing defects, and unusual markings can affect results. We recommend institutes spot-check a
          sample of graded sheets, particularly for high-stakes assessments. We are not liable for grading
          discrepancies caused by poor scan quality or improperly filled sheets.
        </p>

        <h2>6. Acceptable Use</h2>
        <p>You agree not to:</p>
        <ul>
          <li>Attempt to bypass the per-sheet anti-fraud token to submit or reuse a photocopied sheet fraudulently.</li>
          <li>Upload scans belonging to another institute or obtained without authorization.</li>
          <li>Attempt to reverse-engineer, disrupt, or gain unauthorized access to the Service.</li>
          <li>Share your admin account credentials outside your institute's authorized staff.</li>
        </ul>

        <h2>7. Data You Upload</h2>
        <p>
          You retain ownership of the test content, roster data, and scan images you upload. You grant us a limited
          license to store and process that data solely to provide the Service (generating sheets, grading, and
          reporting results back to you). See our <a href="/privacy">Privacy Policy</a> for how this data is stored
          and secured.
        </p>

        <h2>8. Disclaimers</h2>
        <p>
          The Service is provided &ldquo;as is.&rdquo; We do not guarantee uninterrupted availability of WhatsApp
          sign-in delivery, scan processing, or any third-party service (Supabase, Meta, Vercel) this Service
          depends on.
        </p>

        <h2>9. Limitation of Liability</h2>
        <p>
          To the maximum extent permitted by law, VedicNeev shall not be liable for any indirect, incidental, or
          consequential damages arising from your use of the Service, including grading discrepancies, data loss,
          or third-party service interruptions.
        </p>

        <h2>10. Termination</h2>
        <p>
          You may request account and data deletion at any time. We may suspend or terminate an institute account
          that violates these Terms or poses a security risk to the platform.
        </p>

        <h2>11. Governing Law</h2>
        <p>
          These Terms are governed by the laws of India. Disputes shall be subject to the exclusive jurisdiction of
          the courts of <strong>Lucknow</strong>.
        </p>

        <h2>12. Refunds &amp; Cancellation</h2>
        <p>
          Scan-credit purchase refund and cancellation terms are set out in our <a href="/refund-policy">Refund
          Policy</a>.
        </p>

        <h2>13. Changes to These Terms</h2>
        <p>
          We may update these Terms as the Service evolves. We will update the &ldquo;Last updated&rdquo; date
          above, and for material changes, provide a more prominent notice.
        </p>

        <h2>14. Contact Us</h2>
        <p>
          Questions about these Terms? Contact us at <strong>admin@vedicmindai.in</strong>. See also our{" "}
          <a href="/privacy">Privacy Policy</a>.
        </p>
        <p className="text-xs text-muted-foreground">
          This page is a draft aligned with how this platform actually operates today. It should receive a legal
          review before publication.
        </p>
      </div>
    </article>
  );
}
