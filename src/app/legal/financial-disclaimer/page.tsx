import type { Metadata } from "next";
import Link from "next/link";
import { H2, LEGAL_CONTACT, LEGAL_OPERATOR, LegalDoc, P, Ul } from "@/components/LegalDoc";

export const metadata: Metadata = {
  title: "Financial & Pricing Disclaimer — Not Investment Advice",
  description:
    "Pokemon card and sealed product prices on Poke Mart TCG are informational market guides in ZAR — not investment, trading, or financial advice.",
  alternates: { canonical: "/legal/financial-disclaimer" },
};

export default function FinancialDisclaimerPage() {
  return (
    <LegalDoc
      title="Financial & Pricing Disclaimer"
      subtitle="How to understand ZAR prices, portfolio values, and market content on Poke Mart TCG."
    >
      <H2>1. Informational purpose only</H2>
      <P>
        Prices, trends, portfolio totals, blog commentary, and sealed-product metrics on{" "}
        {LEGAL_OPERATOR} are provided for{" "}
        <strong className="text-zinc-200">general informational and entertainment
        purposes</strong> for Pokemon TCG collectors. They are{" "}
        <strong className="text-zinc-200">not</strong> financial advice, investment advice,
        tax advice, accounting advice, or a recommendation to buy, sell, or hold any card,
        sealed product, or other collectible.
      </P>

      <H2>2. How prices are derived</H2>
      <Ul>
        <li>Market figures are typically sourced from third-party providers such as CardDex / Cardmarket-style feeds.</li>
        <li>Values may be denominated in EUR (or another foreign currency) and converted to ZAR using a configured exchange rate (for example an EUR→ZAR factor set in our environment).</li>
        <li>We may sync data on a schedule (e.g. nightly around 03:00 SAST). Prices can be delayed relative to live marketplaces.</li>
        <li>Not every print has a listed market price; some cards show as “Unlisted” or similar when no reliable quote exists.</li>
      </Ul>

      <H2>3. No guarantee of accuracy</H2>
      <P>
        Collectible markets are volatile and opaque. Listings, FX rates, fees, shipping,
        condition, grading, regional premiums (including South African retail premiums),
        and liquidity all affect what you might actually pay or receive. We do{" "}
        <strong className="text-zinc-200">not guarantee</strong> that any displayed price
        matches a shop, auction, private sale, or future value.
      </P>

      <H2>4. Portfolio &amp; alerts</H2>
      <P>
        Premium portfolio valuations and price alerts are estimates based on available
        synced data and your inputs (quantity, condition notes, etc.). They may omit
        grading premiums, local markups, or cards without market rows. Do not treat
        dashboard totals as audited net worth or insurance valuations.
      </P>

      <H2>5. No broker / no exchange</H2>
      <P>
        Poke Mart TCG is not a stock exchange, crypto exchange, broker-dealer, or
        financial services provider. We do not execute trades in cards on your behalf. Any
        purchase or sale you make is between you and third-party sellers/buyers.
      </P>

      <H2>6. Risk warning</H2>
      <P>
        Collectibles can lose value, become illiquid, or be counterfeited. Past performance
        (including percentage badges on cards) is not indicative of future results. Only
        spend what you can afford; consider professional advice for significant decisions.
      </P>

      <H2>7. Blog &amp; editorial content</H2>
      <P>
        Articles in the Price Lab / blog express opinions and market observations. Authors
        may discuss sealed product, grading, or “investment outlooks” in a hobby sense —
        that language does not convert content into regulated financial advice under South
        African or other law.
      </P>

      <H2>8. Limitation</H2>
      <P>
        To the fullest extent permitted by law, {LEGAL_OPERATOR} is not liable for losses
        arising from reliance on prices, FX conversions, alerts, or editorial content. See
        also the liability limits in our{" "}
        <Link href="/legal/terms" className="text-[#FFD700] hover:underline">
          Terms of Service
        </Link>
        .
      </P>

      <H2>9. Questions</H2>
      <P>
        For product questions (not personalised financial advice), contact{" "}
        <a href={`mailto:${LEGAL_CONTACT}`} className="text-[#FFD700] hover:underline">
          {LEGAL_CONTACT}
        </a>
        .
      </P>
    </LegalDoc>
  );
}
