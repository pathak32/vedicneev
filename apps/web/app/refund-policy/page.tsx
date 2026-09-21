import type { Metadata } from "next";

const title = "Refund Policy";
const description =
  "Vedic Neev's refund and cancellation terms for Exam Pass and Vedic All-Access subscriptions, processed via Razorpay.";

export const metadata: Metadata = {
  title,
  description,
  alternates: { canonical: "/refund-policy", languages: { en: "/refund-policy", hi: "/hi/refund-policy" } },
  openGraph: { title, description, url: "/refund-policy" },
  twitter: { title, description },
};

/**
 * Placeholder legal/business specifics (the refund window length,
 * registered entity details, effective date) are called out explicitly
 * below rather than invented — same pattern as /privacy and /terms — fill
 * these in, ideally after legal review, before this page goes live.
 */
export default function RefundPolicyPage() {
  return (
    <article className="mx-auto flex max-w-2xl flex-col gap-6 px-4 py-12 md:px-8">
      <header className="flex flex-col gap-3">
        <h1 className="text-3xl font-extrabold leading-tight tracking-tight text-foreground md:text-4xl">
          Refund Policy
        </h1>
        <p className="text-sm text-muted-foreground">
          Last updated: <strong>[Effective date — fill in before publishing]</strong>
        </p>
      </header>

      <div className="prose prose-neutral max-w-none dark:prose-invert prose-headings:font-bold prose-a:text-primary">
        <p>
          This Refund Policy covers paid subscriptions on vedicneev.com (Exam Pass and Vedic All-Access, described on
          our <a href="/pricing">Pricing</a> page), processed through Razorpay. It supplements our{" "}
          <a href="/terms">Terms of Service</a> — Section 5 of those Terms links here for our current refund and
          cancellation terms.
        </p>

        <h2>1. Eligibility for a Refund</h2>
        <p>
          A subscription purchase is eligible for a full refund if requested within{" "}
          <strong>[Fill in your refund window, e.g. 7 days] of the payment date</strong>, provided the account has
          not made substantial use of paid-only content in that window (for example, generating a large number of
          full-length mock tests only available on a paid plan). We review refund requests case by case where usage
          is borderline.
        </p>
        <p>
          Refund requests outside this window, or for a subscription in its final billing cycle before a renewal
          that has already been used, are handled at our discretion.
        </p>

        <h2>2. What Is Not Refundable</h2>
        <ul>
          <li>Any billing cycle that has already run its full term with normal platform access.</li>
          <li>Promotional, discounted, or complimentary access grants.</li>
          <li>Amounts already refunded once for the same billing cycle.</li>
        </ul>

        <h2>3. How to Request a Refund</h2>
        <p>
          Email <strong>admin@vedicmindai.in</strong> from the address or phone number linked to your account, with
          the Razorpay payment reference (found in your payment confirmation) and the reason for your request. We
          aim to respond within <strong>[Fill in your response SLA, e.g. 3 business days]</strong>.
        </p>

        <h2>4. Refund Processing</h2>
        <p>
          Approved refunds are issued to the original payment method through Razorpay. Depending on your bank or
          payment provider, it can take <strong>[Fill in, e.g. 5–7 business days]</strong> for the refund to reflect
          in your account after we initiate it. We do not process refunds in cash or to a different payment method
          than the one used for the original purchase.
        </p>

        <h2>5. Subscription Cancellation</h2>
        <p>
          You can cancel auto-renewal for your subscription at any time from your account, or by contacting us at
          the email above. Cancelling stops future billing but does not, by itself, refund the current billing
          cycle — see Section 1 for when a current-cycle refund applies.
        </p>

        <h2>6. Failed or Duplicate Payments</h2>
        <p>
          If Razorpay reports a successful charge but your account was not upgraded (for example, due to a network
          interruption), contact us with the payment reference and we will reconcile it — either by activating the
          correct plan entitlement or issuing a full refund if the charge cannot be matched to an order.
        </p>

        <h2>7. Changes to This Policy</h2>
        <p>
          We may update this Refund Policy as our platform evolves. We will update the &ldquo;Last updated&rdquo;
          date above when we do.
        </p>

        <h2>8. Contact Us</h2>
        <p>
          Questions about a refund? Contact us at <strong>admin@vedicmindai.in</strong>. See also our{" "}
          <a href="/terms">Terms of Service</a> and <a href="/privacy">Privacy Policy</a>.
        </p>
        <p className="text-sm text-muted-foreground">
          This page is a professional draft aligned with how Vedic Neev actually operates today. It should receive
          a legal review — particularly for the placeholders above — before publication.
        </p>
      </div>
    </article>
  );
}
