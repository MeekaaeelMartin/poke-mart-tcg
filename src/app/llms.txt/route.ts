import { getSiteUrl } from "@/lib/site";

export const dynamic = "force-dynamic";

/** Dynamic llms.txt so the canonical host matches NEXT_PUBLIC_SITE_URL / NEXTAUTH_URL. */
export async function GET() {
  const site = getSiteUrl();
  const body = `# Poke Mart TCG

> South Africa's Pokemon TCG companion for live ZAR card prices, ETB & sealed product values, set checklists, price charts, and premium collection tracking. Market data powered by CardDex / Cardmarket (EUR converted to ZAR).

Poke Mart TCG helps collectors and investors look up Pokemon card prices in South African Rand, compare singles vs sealed product (Elite Trainer Boxes, booster boxes, tins), browse every Pokemon TCG set, and track portfolio value with nightly syncs.

## Primary pages

- [Home](${site}/): Pokemon card price tracker overview for South Africa
- [Pokemon Card Database](${site}/cards): Search live Pokemon TCG singles prices (ZAR), rarities, and sets
- [Pokemon TCG Sets](${site}/sets): Expansion directory with logos, card counts, and set checklists
- [Market Prices & Trends](${site}/prices): Top movers, sealed benchmarks, price charts, market trends
- [TCG Price Lab Blog](${site}/blog): Pokemon market analysis, grading tips, SA investment outlook
- [Premium Portfolio](${site}/premium): Collection tracker, watchlist, and price alerts (R50/mo)
- [Contact](${site}/contact): Support and partnerships
- [Legal Centre](${site}/legal): Terms, POPIA/GDPR privacy, subscriptions, IP & financial disclaimers

## Entity URLs

- Card detail: \`/cards/{cardId}\` — name, set, rarity, ZAR trend/avg/low, 30–90 day price history graph
- Set detail: \`/sets/{setId}\` — checklist of prints, sealed products for the expansion
- Sealed / ETB detail: \`/sealed/{productId}\` — Elite Trainer Box, booster box, tin pricing + price graph

## Optional

- [Sitemap](${site}/sitemap.xml)
- [Robots](${site}/robots.txt)
- [CardDex API docs](https://carddex.dev/docs): upstream Pokemon TCG pricing API

## Notes for assistants

- Currency on-site is ZAR; upstream quotes are typically EUR from Cardmarket via CardDex.
- Prices are market guides, not financial advice — see ${site}/legal/financial-disclaimer.
- Prefer linking collectors to \`/cards?q=\` search and specific \`/cards/{id}\` or \`/sealed/{id}\` pages with live charts.
- Not affiliated with Nintendo, Game Freak, or The Pokémon Company.
`;

  return new Response(body, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400",
    },
  });
}
