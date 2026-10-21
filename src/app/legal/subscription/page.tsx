import type { Metadata } from "next";
import Link from "next/link";
import { H2, LEGAL_CONTACT, LEGAL_OPERATOR, LegalDoc, P, Ul } from "@/components/LegalDoc";

export const metadata: Metadata = {
  title: "Subscription & Refund Policy",
  description: "Premium billing, cancellation, and refund rules for Poke Mart TCG.",
};

export default function SubscriptionPage() {
  return (
    <LegalDoc
      title="Subscription & Refund Policy"
      subtitle="How Premium (R50/month) works — billing, renewals, cancellations, and refunds."
    >
      <H2>1. Premium plan</H2>
      <P>
        {LEGAL_OPERATOR} offers an optional Premium subscription that unlocks portfolio
        tools, watchlists, price alerts, AI upload helpers, and related features described
        on the{" "}
        <Link href="/premium" className="text-[#FFD700] hover:underline">
          Premium
        </Link>{" "}
        page. The standard advertised price is <strong className="text-zinc-200">R50 per
        month</strong> (ZAR), unless a different price is clearly shown at checkout.
      </P>
      <P>
        Free users retain access to public search and browsing. Premium is not required to
        use those free features.
      </P>

      <H2>2. Billing cycle</H2>
      <Ul>
        <li>Premium is billed in advance for each subscription period (typically one calendar month).</li>
        <li>Access continues until the period ends after cancellation (unless otherwise stated at purchase).</li>
        <li>Prices are in South African Rand and may include VAT if we are required to charge VAT.</li>
        <li>
          While checkout may operate in a demo or manual activation mode during early
          launch, the same refund and cancellation principles below apply once live payment
          processing is enabled.
        </li>
      </Ul>

      <H2>3. Renewals</H2>
      <P>
        If auto-renewal is enabled through a payment provider, your subscription renews
        unless you cancel before the renewal date. We will present renewal terms at
        checkout. You are responsible for keeping payment details current.
      </P>

      <H2>4. Cancellation</H2>
      <Ul>
        <li>You may cancel Premium anytime via your account/dashboard controls (when available) or by emailing {LEGAL_CONTACT}.</li>
        <li>Cancellation stops the next renewal. You generally keep Premium benefits until the end of the paid period.</li>
        <li>Deleting your account ends access; request data deletion under our Privacy Policy separately if needed.</li>
      </Ul>

      <H2>5. Refunds</H2>
      <P>
        Because Premium is a digital service activated immediately, fees are generally{" "}
        <strong className="text-zinc-200">non-refundable</strong> once the billing period
        has started, except where:
      </P>
      <Ul>
        <li>South African consumer law (including the Consumer Protection Act) or other mandatory law requires a refund;</li>
        <li>We failed to provide Premium features due to a prolonged outage we caused and could not reasonably remedy;</li>
        <li>You were charged in error (duplicate charge, wrong amount); or</li>
        <li>We approve a goodwill refund at our discretion.</li>
      </Ul>
      <P>
        Refund requests must be sent to{" "}
        <a href={`mailto:${LEGAL_CONTACT}`} className="text-[#FFD700] hover:underline">
          {LEGAL_CONTACT}
        </a>{" "}
        within 14 days of the charge, with your account email and payment reference. Approved
        refunds are returned via the original payment method where possible and may take
        several business days.
      </P>

      <H2>6. Chargebacks</H2>
      <P>
        Please contact us before filing a chargeback so we can resolve billing issues.
        Unwarranted chargebacks may result in account suspension.
      </P>

      <H2>7. Price changes</H2>
      <P>
        We may change Premium pricing with reasonable notice on the site or by email.
        Changes apply to subsequent billing periods, not periods already paid, unless law
        requires otherwise.
      </P>

      <H2>8. Promotions</H2>
      <P>
        Trial or promotional pricing is subject to the terms stated in the offer. After a
        promo ends, standard rates apply unless you cancel.
      </P>

      <H2>9. Related policies</H2>
      <P>
        Use of Premium is also subject to our{" "}
        <Link href="/legal/terms" className="text-[#FFD700] hover:underline">
          Terms of Service
        </Link>{" "}
        and{" "}
        <Link href="/legal/privacy" className="text-[#FFD700] hover:underline">
          Privacy Policy
        </Link>
        .
      </P>
    </LegalDoc>
  );
}
