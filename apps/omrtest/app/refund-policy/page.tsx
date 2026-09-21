import type { Metadata } from "next";

const title = "Refund Policy";
const description = "VedicNeev Institute Suite's refund terms for scan-credit purchases.";

export const metadata: Metadata = { title, description };

export default function InstituteRefundPolicyPage() {
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

      <div className="flex flex-col gap-5 text-sm leading-relaxed text-foreground [&_h2]:mt-4 [&_h2]:text-xl [&_h2]:font-bold [&_h2]:text-foreground [&_li]:ml-5 [&_li]:list-disc [&_p]:text-foreground [&_strong]:font-semibold [&_ul]:flex [&_ul]:flex-col [&_ul]:gap-1.5">
        <p>
          This Refund Policy covers scan-credit purchases on omrtest.vedicneev.com. It supplements our{" "}
          <a href="/terms">Terms of Service</a>.
        </p>

        <h2>1. Credits Already Consumed</h2>
        <p>
          A scan credit is consumed only when a scan successfully grades. A scan that is rejected (unreadable,
          duplicate, or no roster match) never consumes a credit, so no refund request is needed for those — the
          credit remains in your balance automatically. Credits already consumed by a successfully graded scan are
          not refundable, since the service (grading) was fully delivered.
        </p>

        <h2>2. Unused Purchased Credits</h2>
        <p>
          Unused, purchased (not free-trial) scan credits are eligible for a refund if requested within{" "}
          <strong>[Fill in your refund window, e.g. 14 days] of purchase</strong>, provided your institute account
          has not been suspended for a Terms violation. Free-trial welcome credits are not refundable, as no payment
          was made for them.
        </p>

        <h2>3. How to Request a Refund</h2>
        <p>
          Email <strong>admin@vedicmindai.in</strong> from your registered admin account, with your institute name
          and the payment reference for the credit purchase. We aim to respond within{" "}
          <strong>[Fill in your response SLA, e.g. 3 business days]</strong>.
        </p>

        <h2>4. Refund Processing</h2>
        <p>
          Approved refunds are issued to the original payment method. Depending on your bank or payment provider, it
          can take <strong>[Fill in, e.g. 5–7 business days]</strong> to reflect after we initiate it.
        </p>

        <h2>5. Failed or Duplicate Payments</h2>
        <p>
          If a payment was charged but your institute's credit balance was not updated, contact us with the payment
          reference and we will reconcile it — either by crediting the correct balance or issuing a full refund if
          the charge cannot be matched to a purchase.
        </p>

        <h2>6. Changes to This Policy</h2>
        <p>
          We may update this Refund Policy as the Service evolves. We will update the &ldquo;Last updated&rdquo;
          date above when we do.
        </p>

        <h2>7. Contact Us</h2>
        <p>
          Questions about a refund? Contact us at <strong>admin@vedicmindai.in</strong>. See also our{" "}
          <a href="/terms">Terms of Service</a> and <a href="/privacy">Privacy Policy</a>.
        </p>
        <p className="text-xs text-muted-foreground">
          This page is a draft aligned with how this platform actually operates today. It should receive a legal
          review before publication.
        </p>
      </div>
    </article>
  );
}
