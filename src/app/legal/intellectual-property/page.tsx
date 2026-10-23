import type { Metadata } from "next";
import Link from "next/link";
import { H2, LEGAL_CONTACT, LEGAL_OPERATOR, LegalDoc, P, Ul } from "@/components/LegalDoc";

export const metadata: Metadata = {
  title: "Intellectual Property & Fair Use — Pokemon Trademarks",
  description:
    "IP ownership, Pokémon trademarks, CardDex market data, and fair use notice for Poke Mart TCG. Not affiliated with The Pokémon Company.",
  alternates: { canonical: "/legal/intellectual-property" },
};

export default function IntellectualPropertyPage() {
  return (
    <LegalDoc
      title="Intellectual Property & Fair Use Disclaimer"
      subtitle="Ownership, third-party rights, and how you may use content from Poke Mart TCG."
    >
      <H2>1. No affiliation</H2>
      <P>
        {LEGAL_OPERATOR} is an <strong className="text-zinc-200">independent</strong>{" "}
        South African fan/companion service. We are{" "}
        <strong className="text-zinc-200">not</strong> affiliated with, endorsed by, or
        sponsored by Nintendo Co., Ltd., Game Freak, Creatures Inc., The Pokémon Company,
        The Pokémon Company International, or any official Pokemon TCG licensee.
      </P>
      <P>
        “Pokémon”, “Pokemon”, Pokemon character names, card names, set names, and related
        logos/artwork are trademarks and/or copyrighted works of their respective owners.
        All rights remain with those owners.
      </P>

      <H2>2. Our intellectual property</H2>
      <Ul>
        <li>Poke Mart TCG name, logo treatments, site design, original articles, and software code we create are owned by {LEGAL_OPERATOR} or our licensors.</li>
        <li>You may not copy, scrape, mirror, or commercially exploit our original content or UI without prior written permission, except as allowed by fair dealing/fair use or other mandatory exceptions.</li>
        <li>Linking to public pages is welcome if done fairly and not in a way that implies endorsement.</li>
      </Ul>

      <H2>3. Third-party data &amp; images</H2>
      <P>
        Card metadata, market prices, set logos, and card images may be provided via{" "}
        <strong className="text-zinc-200">CardDex</strong> and/or other data/image sources
        (including Cardmarket-related assets where linked). Those materials remain subject
        to the providers’ terms and the underlying rights of Pokemon rights holders.
      </P>
      <Ul>
        <li>We display this information to help collectors identify cards and understand market context.</li>
        <li>You may not bulk-harvest, redistribute, or resell CardDex or other provider data obtained through our Service in violation of their terms or ours.</li>
        <li>Image URLs may be proxied for reliability; that does not transfer ownership to you or us.</li>
      </Ul>

      <H2>4. Fair use / fair dealing</H2>
      <P>
        References to Pokemon cards, set names, and marketplace prices are intended for
        informational, referential, and collectible-tracking purposes. Where South African
        fair dealing or other jurisdictions’ fair use doctrines apply, they do so only to
        the extent permitted by law. Fair use is a limited exception — it is not a licence
        to reproduce entire card databases, artwork packs, or commercial sets.
      </P>

      <H2>5. User content</H2>
      <P>
        If you upload images or text (e.g. contact messages, portfolio notes, AI upload
        photos), you retain ownership of your content but grant us a limited licence to
        host, process, and display it as needed to operate the feature. You confirm you
        have the rights to upload that content and that it does not infringe others’ IP.
      </P>

      <H2>6. Copyright complaints</H2>
      <P>
        If you believe content on the Service infringes your copyright or trademark, email{" "}
        <a href={`mailto:${LEGAL_CONTACT}`} className="text-[#FFD700] hover:underline">
          {LEGAL_CONTACT}
        </a>{" "}
        with: (a) identification of the work, (b) the URL/location on our site, (c) your
        contact details, and (d) a good-faith statement of ownership/authority. We will
        review and take appropriate action, which may include removal.
      </P>

      <H2>7. Related policies</H2>
      <P>
        See our{" "}
        <Link href="/legal/terms" className="text-[#FFD700] hover:underline">
          Terms of Service
        </Link>{" "}
        for acceptable use and our{" "}
        <Link href="/legal/financial-disclaimer" className="text-[#FFD700] hover:underline">
          Financial &amp; Pricing Disclaimer
        </Link>{" "}
        regarding market data.
      </P>
    </LegalDoc>
  );
}
