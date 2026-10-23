import { SITE_NAME, SITE_TAGLINE, getSiteUrl } from "@/lib/site";

export function OrganizationJsonLd() {
  const site = getSiteUrl();
  const data = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: SITE_NAME,
    url: site,
    description: SITE_TAGLINE,
    logo: `${site}/opengraph-image`,
    sameAs: [],
    areaServed: {
      "@type": "Country",
      name: "South Africa",
    },
  };
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}

export function WebsiteJsonLd() {
  const site = getSiteUrl();
  const data = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: SITE_NAME,
    url: site,
    description: SITE_TAGLINE,
    potentialAction: {
      "@type": "SearchAction",
      target: `${site}/cards?q={search_term_string}`,
      "query-input": "required name=search_term_string",
    },
  };
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}

export function ProductJsonLd({
  name,
  description,
  image,
  url,
  priceZar,
  category,
}: {
  name: string;
  description: string;
  image?: string | null;
  url: string;
  priceZar?: number | null;
  category?: string;
}) {
  const data = {
    "@context": "https://schema.org",
    "@type": "Product",
    name,
    description,
    image: image || undefined,
    url,
    category: category || "Pokemon Trading Card Game",
    brand: { "@type": "Brand", name: "Pokémon TCG" },
    ...(priceZar != null
      ? {
          offers: {
            "@type": "Offer",
            priceCurrency: "ZAR",
            price: Number(priceZar.toFixed(2)),
            availability: "https://schema.org/InStock",
            url,
          },
        }
      : {}),
  };
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}
