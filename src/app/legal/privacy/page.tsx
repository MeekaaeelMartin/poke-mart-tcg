import type { Metadata } from "next";
import Link from "next/link";
import { H2, LEGAL_CONTACT, LEGAL_OPERATOR, LegalDoc, P, Ul } from "@/components/LegalDoc";

export const metadata: Metadata = {
  title: "Privacy Policy (POPIA & GDPR) — South Africa",
  description:
    "How Poke Mart TCG collects, uses, and protects personal information under POPIA and GDPR for Pokemon TCG collectors in South Africa.",
  alternates: { canonical: "/legal/privacy" },
};

export default function PrivacyPage() {
  return (
    <LegalDoc
      title="Privacy Policy"
      subtitle="POPIA (South Africa) and GDPR (EU/UK) aligned notice for Poke Mart TCG users."
    >
      <H2>1. Introduction</H2>
      <P>
        This Privacy Policy explains how {LEGAL_OPERATOR} (“we”, “us”) collects, uses,
        stores, and shares personal information when you use poke-mart-tcg (the “Service”).
        We process information in line with South Africa’s Protection of Personal
        Information Act 4 of 2013 (POPIA) and, where applicable, the EU/UK General Data
        Protection Regulation (GDPR).
      </P>
      <P>
        Information Officer / privacy contact:{" "}
        <a href={`mailto:${LEGAL_CONTACT}`} className="text-[#FFD700] hover:underline">
          {LEGAL_CONTACT}
        </a>
        .
      </P>

      <H2>2. What we collect</H2>
      <Ul>
        <li>
          <strong className="text-zinc-300">Account data:</strong> name, email, password
          hash, optional username, Premium status and expiry.
        </li>
        <li>
          <strong className="text-zinc-300">Portfolio &amp; product data:</strong> cards you
          save, quantities, conditions, watchlist items, price alerts, and activity notes.
        </li>
        <li>
          <strong className="text-zinc-300">Communications:</strong> contact-form messages
          and newsletter email addresses.
        </li>
        <li>
          <strong className="text-zinc-300">Uploads:</strong> images you submit for
          AI-assisted card identification (Premium), processed to provide the feature.
        </li>
        <li>
          <strong className="text-zinc-300">Technical data:</strong> IP address, browser
          type, device info, cookies/session tokens needed for login and security, and
          basic server logs.
        </li>
        <li>
          <strong className="text-zinc-300">Payment-related data:</strong> if/when live
          payments are enabled, limited billing metadata from payment providers (we aim not
          to store full card numbers on our servers).
        </li>
      </Ul>
      <P>
        We also display non-personal catalogue and market data from providers such as
        CardDex (card names, images, prices). That data is not your personal information,
        but usage of the Service may generate personal records as listed above.
      </P>

      <H2>3. Why we process data (purposes &amp; lawful bases)</H2>
      <Ul>
        <li>
          <strong className="text-zinc-300">Contract / service delivery:</strong> create
          accounts, provide free search, run Premium features, sync prices, respond to
          support (POPIA: performance of a contract; GDPR Art. 6(1)(b)).
        </li>
        <li>
          <strong className="text-zinc-300">Legitimate interests:</strong> secure the
          Service, prevent abuse, improve features, understand aggregate usage (POPIA:
          legitimate interests; GDPR Art. 6(1)(f)).
        </li>
        <li>
          <strong className="text-zinc-300">Consent:</strong> newsletter marketing emails
          and non-essential cookies where required (POPIA: consent; GDPR Art. 6(1)(a)). You
          may withdraw consent anytime.
        </li>
        <li>
          <strong className="text-zinc-300">Legal obligation:</strong> retain records where
          tax, consumer, or other law requires (GDPR Art. 6(1)(c)).
        </li>
      </Ul>

      <H2>4. Sharing &amp; operators</H2>
      <P>We may share personal information with:</P>
      <Ul>
        <li>Hosting and infrastructure providers (e.g. application hosting) as operators/processors.</li>
        <li>Email/delivery tools if used for transactional or newsletter messages.</li>
        <li>Payment processors when paid Premium checkout is live.</li>
        <li>CardDex and similar APIs for catalogue/price retrieval (typically not sending your portfolio to them unless a feature requires it).</li>
        <li>Authorities when legally required.</li>
      </Ul>
      <P>
        We do not sell your personal information. Operators are expected to process data
        only on our instructions and with appropriate security.
      </P>

      <H2>5. International transfers</H2>
      <P>
        Servers or subprocessors may be located outside South Africa or the EEA. Where GDPR
        applies, we use appropriate safeguards (e.g. standard contractual clauses or
        provider adequacy mechanisms). Under POPIA, we take steps so that foreign parties
        provide an adequate level of protection or that another lawful ground applies.
      </P>

      <H2>6. Retention</H2>
      <Ul>
        <li>Account and portfolio data: while your account is active, then deleted or anonymised within a reasonable period after closure (unless law requires longer).</li>
        <li>Contact messages: typically up to 24 months.</li>
        <li>Newsletter: until you unsubscribe.</li>
        <li>Server logs: short periods unless needed for security investigations.</li>
        <li>Billing records: as required by applicable financial/tax rules.</li>
      </Ul>

      <H2>7. Security</H2>
      <P>
        We use reasonable technical and organisational measures (hashed passwords, access
        controls, HTTPS where configured). No method of transmission or storage is 100%
        secure; please use a strong unique password.
      </P>

      <H2>8. Your rights</H2>
      <P>
        <strong className="text-zinc-300">Under POPIA</strong> you may request access to,
        correction of, or deletion of your personal information, object to certain
        processing, and lodge a complaint with the Information Regulator (South Africa).
      </P>
      <P>
        <strong className="text-zinc-300">Under GDPR</strong> (if it applies to you) you may
        also have rights to access, rectification, erasure, restriction, portability,
        objection, and to withdraw consent. You may complain to your local supervisory
        authority.
      </P>
      <P>
        To exercise rights, email{" "}
        <a href={`mailto:${LEGAL_CONTACT}`} className="text-[#FFD700] hover:underline">
          {LEGAL_CONTACT}
        </a>{" "}
        with enough detail to verify your identity. We will respond within the timeframes
        required by applicable law.
      </P>

      <H2>9. Children</H2>
      <P>
        The Service is not directed at children under 13. If you believe a child provided
        personal information without appropriate consent, contact us and we will take
        reasonable steps to delete it.
      </P>

      <H2>10. Cookies</H2>
      <P>
        We use essential cookies/session storage for authentication and security. If we add
        analytics or marketing cookies, we will provide controls consistent with applicable
        law.
      </P>

      <H2>11. Changes</H2>
      <P>
        We may update this Policy by posting a revised version. Material changes will be
        highlighted by updating the “Last updated” date and, where appropriate, additional
        notice.
      </P>

      <H2>12. Related documents</H2>
      <P>
        See also our{" "}
        <Link href="/legal/terms" className="text-[#FFD700] hover:underline">
          Terms of Service
        </Link>{" "}
        and{" "}
        <Link href="/legal/subscription" className="text-[#FFD700] hover:underline">
          Subscription &amp; Refund Policy
        </Link>
        .
      </P>
    </LegalDoc>
  );
}
