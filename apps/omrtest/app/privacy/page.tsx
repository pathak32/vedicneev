import type { Metadata } from "next";

const title = "Privacy Policy";
const description =
  "How VedicNeev Institute Suite handles institute, admin, and student data — including OMR scan images, on omrtest.vedicneev.com.";

export const metadata: Metadata = { title, description };

/**
 * B2B counterpart to apps/web's /privacy — same placeholder-disclosure
 * pattern (grievance officer, registered entity, effective date called out
 * explicitly rather than invented), but scoped to what THIS app actually
 * stores: Institute/InstituteAdmin/TestBatch/OmrUpload rows and the
 * omr-uploads Supabase Storage bucket, not vedicneev.com's consumer data.
 */
export default function InstitutePrivacyPolicyPage() {
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

      <div className="flex flex-col gap-5 text-sm leading-relaxed text-foreground [&_h2]:mt-4 [&_h2]:text-xl [&_h2]:font-bold [&_h2]:text-foreground [&_li]:ml-5 [&_li]:list-disc [&_p]:text-foreground [&_strong]:font-semibold [&_ul]:flex [&_ul]:flex-col [&_ul]:gap-1.5">
        <p>
          VedicNeev Institute Suite (&ldquo;we,&rdquo; &ldquo;us,&rdquo; or &ldquo;our&rdquo;) operates
          omrtest.vedicneev.com, a batch OMR grading platform for coaching institutes. This Policy describes what
          data we collect from an institute and its administrators, how OMR scan images are stored and secured, and
          your rights over that data. It applies to every Institute Admin who signs in to this platform. It is
          separate from, and covers different data than, the Privacy Policy for our consumer product at
          vedicneev.com/privacy.
        </p>

        <h2>1. Who This Covers</h2>
        <p>
          This Policy applies to Institute Admins — the coaching-center staff who sign in to omrtest.vedicneev.com
          to create test batches, generate OMR sheets, and upload scans for grading. Student data appears here only
          as it's printed on and scanned from an OMR sheet (roll number, name if provided, and bubble responses) —
          students themselves never create an account or sign in to this platform.
        </p>

        <h2>2. Information We Collect</h2>
        <ul>
          <li>
            <strong>Admin identity.</strong> Your WhatsApp-verified phone number and name, used for sign-in and to
            attribute actions (test creation, uploads) to an account.
          </li>
          <li>
            <strong>Institute profile.</strong> Institute name, branch/city, target exam category, and optional
            brand color/logo used to customize your printed OMR sheets.
          </li>
          <li>
            <strong>Test batch data.</strong> Batch names, test codes, subjects, question counts, and the answer key
            you set for grading.
          </li>
          <li>
            <strong>OMR scan images.</strong> Photos or scans of filled answer sheets you upload for grading, and
            the roll number, bubble responses, and score derived from each.
          </li>
          <li>
            <strong>Credit ledger activity.</strong> A record of scan-credit grants and consumption tied to your
            institute account (see Section 5).
          </li>
        </ul>

        <h2>3. How We Store &amp; Secure OMR Scan Images</h2>
        <p>
          Every uploaded scan is stored in a <strong>private</strong> Supabase Storage bucket (<code>omr-uploads</code>
          ) — not publicly readable by URL, and accessible only through this application's authenticated,
          institute-scoped API routes. A request for one institute&apos;s scans is always checked against that
          institute&apos;s own session before the file is served; one institute can never read another&apos;s
          uploads. The database itself (PostgreSQL on Supabase) encrypts data at rest and in transit, and all
          traffic to omrtest.vedicneev.com is served over HTTPS.
        </p>
        <p>
          We retain scan images for as long as your institute account remains active, so batches and grading history
          stay auditable. On request, we will delete an institute&apos;s scan images and associated records, except
          where we're required to retain credit-ledger records to resolve a billing dispute.
        </p>

        <h2>4. Anti-Fraud Sheet Tokens</h2>
        <p>
          Each printed OMR sheet carries a unique, pre-assigned sheet ID bubbled directly onto the sheet, used only
          to match an uploaded scan to the correct student roster entry and prevent a photocopied sheet from being
          scored twice. This token is not personally identifying on its own and is discarded from usefulness once a
          batch's grading is complete.
        </p>

        <h2>5. Institutional Credit Ledger</h2>
        <p>
          Scan credits are tracked in an append-only ledger tied to your institute account (grants, consumption per
          successful scan, and refunds for a rejected/duplicate scan). We retain this ledger to support billing
          accuracy and dispute resolution, and it is visible to your own institute's admins and, for support and
          compliance purposes, to VedicNeev's own administrators.
        </p>

        <h2>6. Third-Party Service Providers</h2>
        <ul>
          <li>
            <strong>Supabase</strong> — database and private file storage hosting.
          </li>
          <li>
            <strong>Meta (WhatsApp Business Cloud API)</strong> — delivery of sign-in one-time codes.
          </li>
          <li>
            <strong>Vercel</strong> — application hosting.
          </li>
        </ul>
        <p>We do not permit these providers to use your data for their own independent purposes.</p>

        <h2>7. Your Rights</h2>
        <p>Subject to applicable law, an Institute Admin can:</p>
        <ul>
          <li>Request a copy of the data we hold for their institute account.</li>
          <li>Ask us to correct inaccurate institute profile information.</li>
          <li>Request deletion of their institute's account, scan images, and associated records.</li>
        </ul>

        <h2>8. Changes to This Policy</h2>
        <p>
          We may update this Policy as the platform evolves. We will update the &ldquo;Last updated&rdquo; date
          above when we do.
        </p>

        <h2>9. Contact Us</h2>
        <p>
          Questions about this Policy? Contact us at <strong>admin@vedicmindai.in</strong>.
        </p>
        <p className="text-xs text-muted-foreground">
          This page is a draft aligned with how this platform actually handles data today. It should receive a
          legal review before publication.
        </p>
      </div>
    </article>
  );
}
