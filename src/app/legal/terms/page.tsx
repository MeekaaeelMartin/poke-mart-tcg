import type { Metadata } from "next";
import Link from "next/link";
import { H2, LEGAL_CONTACT, LEGAL_OPERATOR, LegalDoc, P, Ul } from "@/components/LegalDoc";

export const metadata: Metadata = {
  title: "Terms of Service",
  description: "Terms of Service for using Poke Mart TCG.",
};

export default function TermsPage() {
  return (
    <LegalDoc
      title="Terms of Service"
      subtitle="By accessing or using Poke Mart TCG, you agree to these Terms."
    >
      <H2>1. Who we are</H2>
      <P>
        {LEGAL_OPERATOR} (“Poke Mart”, “we”, “us”) operates a South African web application
        that helps collectors browse Pokemon Trading Card Game (TCG) catalogue data, view
        market-derived prices converted to South African Rand (ZAR), and — for Premium
        members — manage a personal portfolio, watchlist, and related tools.
      </P>
      <P>
        Contact:{" "}
        <a href={`mailto:${LEGAL_CONTACT}`} className="text-[#FFD700] hover:underline">
          {LEGAL_CONTACT}
        </a>
        . Related policies:{" "}
        <Link href="/legal/privacy" className="text-[#FFD700] hover:underline">
          Privacy
        </Link>
        ,{" "}
        <Link href="/legal/subscription" className="text-[#FFD700] hover:underline">
          Subscription &amp; Refunds
        </Link>
        ,{" "}
        <Link href="/legal/intellectual-property" className="text-[#FFD700] hover:underline">
          IP &amp; Fair Use
        </Link>
        ,{" "}
        <Link href="/legal/financial-disclaimer" className="text-[#FFD700] hover:underline">
          Financial Disclaimer
        </Link>
        .
      </P>

      <H2>2. Eligibility</H2>
      <Ul>
        <li>You must be at least 18 years old, or have a parent/guardian’s consent if younger.</li>
        <li>You must provide accurate registration details and keep your password confidential.</li>
        <li>You are responsible for activity under your account.</li>
      </Ul>

      <H2>3. The service</H2>
      <P>
        Free features may include card/set search, browsing market prices, blog content, and
        contact forms. Premium features (typically R50 per month) may include portfolio
        tracking, watchlists, price alerts, AI-assisted card upload tools, and shareable
        portfolio views. Feature availability may change; we will update the Premium page
        when material changes occur.
      </P>
      <P>
        Catalogue and pricing data is sourced from third parties (including CardDex) and
        converted using configured exchange rates. Data may be delayed, incomplete, or
        incorrect. See our Financial &amp; Pricing Disclaimer.
      </P>

      <H2>4. Acceptable use</H2>
      <P>You agree not to:</P>
      <Ul>
        <li>Scrape, bulk-download, or resell our service or upstream data in violation of these Terms or third-party licences.</li>
        <li>Attempt unauthorised access, disrupt the service, or probe for vulnerabilities without written permission.</li>
        <li>Upload unlawful, infringing, or abusive content (including via contact forms or AI uploads).</li>
        <li>Misrepresent affiliation with Nintendo, Game Freak, The Pokémon Company, CardDex, or other rights holders.</li>
        <li>Use the service for fraud, money laundering, or any illegal purpose under South African or applicable law.</li>
      </Ul>

      <H2>5. Accounts &amp; termination</H2>
      <P>
        We may suspend or terminate accounts that breach these Terms, abuse the platform, or
        create legal risk. You may stop using the service at any time. Premium cancellation
        and refunds are governed by the Subscription &amp; Refund Policy.
      </P>

      <H2>6. Intellectual property</H2>
      <P>
        Our branding, UI, original copy, and software are owned by {LEGAL_OPERATOR} or our
        licensors. Pokemon names, characters, card artwork, and related marks belong to
        their respective owners. Third-party data and images remain subject to those
        providers’ terms. See the IP &amp; Fair Use Disclaimer.
      </P>

      <H2>7. Disclaimers</H2>
      <P>
        The service is provided “as is” and “as available”. To the fullest extent permitted
        by South African law (including the Consumer Protection Act where applicable), we
        disclaim warranties of merchantability, fitness for a particular purpose, and
        non-infringement. We do not warrant uninterrupted or error-free operation.
      </P>

      <H2>8. Limitation of liability</H2>
      <P>
        To the fullest extent permitted by law, {LEGAL_OPERATOR} and its operators are not
        liable for indirect, incidental, special, consequential, or punitive damages, or for
        lost profits, lost data, or trading losses arising from use of the service or reliance
        on prices. Our aggregate liability for any claim relating to the service is limited
        to the greater of (a) fees you paid us for Premium in the three (3) months before the
        claim, or (b) ZAR 500.
      </P>
      <P>
        Nothing in these Terms excludes liability that cannot be excluded under applicable
        law (including for gross negligence or wilful misconduct where such exclusion is
        prohibited).
      </P>

      <H2>9. Indemnity</H2>
      <P>
        You agree to indemnify and hold us harmless from claims arising out of your misuse
        of the service, your content, or your breach of these Terms, except to the extent
        caused by our wilful misconduct.
      </P>

      <H2>10. Changes</H2>
      <P>
        We may update these Terms by posting a revised version with a new “Last updated”
        date. Continued use after changes constitutes acceptance, except where mandatory
        consumer law requires additional notice.
      </P>

      <H2>11. Governing law</H2>
      <P>
        These Terms are governed by the laws of the Republic of South Africa. Courts of
        South Africa have exclusive jurisdiction, subject to mandatory consumer protections
        that cannot be waived.
      </P>
    </LegalDoc>
  );
}
