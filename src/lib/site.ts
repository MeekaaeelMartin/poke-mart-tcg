/** Canonical public origin for SEO, sitemaps, and absolute OG URLs. */
export function getSiteUrl(): string {
  const raw =
    process.env.NEXT_PUBLIC_SITE_URL ||
    process.env.NEXTAUTH_URL ||
    "https://white-mouse-613181.hostingersite.com";
  return raw.replace(/\/$/, "");
}

export const SITE_NAME = "Poke Mart TCG";
export const SITE_TAGLINE = "South Africa's Pokemon TCG Price Tracker";

export const DEFAULT_KEYWORDS = [
  "Pokemon cards South Africa",
  "Pokemon TCG prices ZAR",
  "Pokemon card value calculator",
  "Pokemon ETB price",
  "Elite Trainer Box price South Africa",
  "Pokemon booster box price",
  "Pokemon sealed product prices",
  "Cardmarket prices ZAR",
  "Pokemon card price chart",
  "Pokemon set checklist",
  "Pokemon TCG market trends",
  "Charizard card price South Africa",
  "Pokemon collection tracker",
  "Pokemon card portfolio",
  "live Pokemon card prices",
  "Poke Mart TCG",
] as const;
