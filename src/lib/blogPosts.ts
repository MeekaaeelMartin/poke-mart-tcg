/** Shared blog catalog — cool CardDex / Unsplash covers for seed + demo fallback. */

export type BlogSeedPost = {
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  category: string;
  author: string;
  authorRole: string;
  readMinutes: number;
  featured: boolean;
  imageUrl: string;
  publishedAt: string;
};

export const BLOG_COVERS = {
  sealed: "/images/blog/sealed.svg",
  chase: "/images/blog/chase.svg",
  grading: "/images/blog/grading.svg",
  sync: "/images/blog/sync.svg",
  psa: "/images/blog/psa.svg",
  investment: "/images/blog/investment.svg",
  checklist: "/images/blog/chase.svg",
  leaks: "/images/blog/sync.svg",
  counterfeit: "/images/blog/grading.svg",
  modern: "/images/blog/investment.svg",
} as const;

export const BLOG_SEED_POSTS: BlogSeedPost[] = [
  {
    slug: "sealed-product-sa",
    title: "The Evolution of Sealed Product: SA Premium Trajectories",
    excerpt:
      "How booster boxes and ETBs are pricing across South African hobby shops — and where smart collectors are finding value in 2025.",
    content: `South Africa's sealed market has matured quickly. Local shops now price ETBs and booster boxes with tighter spreads against international guides, but logistics and forex still create windows for collectors.

This masterclass walks through Obsidian Flames, 151, and Crown Zenith trajectories in ZAR, what "SA premium" really means, and how nightly CardDex syncs help Poke Mart keep your dashboard honest.

Key takeaways:
- Track sealed separately from singles — correlation is imperfect.
- Watch 7-day averages, not just day-one spikes.
- Premium portfolio alerts beat refreshing shop Instagram pages.`,
    category: "Market Analysis",
    author: "Thabo M.",
    authorRole: "Market Analyst",
    readMinutes: 8,
    featured: true,
    imageUrl: BLOG_COVERS.sealed,
    publishedAt: "2025-09-15T10:00:00.000Z",
  },
  {
    slug: "obsidian-flames-review",
    title: "Obsidian Flames Set Review: Chase Cards in ZAR",
    excerpt:
      "A deep dive into SV3 chase singles, pull rates, and what sealed product is worth opening locally.",
    content:
      "Deep dive into Obsidian Flames chase singles and relative value versus set completion demand on the SA secondary market.",
    category: "Set Review",
    author: "Sarah K.",
    authorRole: "Set Reviewer",
    readMinutes: 6,
    featured: false,
    imageUrl: BLOG_COVERS.chase,
    publishedAt: "2025-09-10T10:00:00.000Z",
  },
  {
    slug: "grading-guide",
    title: "A Complete Local Grading Submission Guide",
    excerpt:
      "What to know before you send modern chase cards for PSA or CGC — shipping, costs, and turnaround from SA.",
    content:
      "Grading modern chase cards can unlock premiums, but shipping and turnaround matter. Here's a practical SA checklist.",
    category: "Collecting Tips",
    author: "Devon K.",
    authorRole: "Competitive Player",
    readMinutes: 10,
    featured: false,
    imageUrl: BLOG_COVERS.grading,
    publishedAt: "2025-09-05T10:00:00.000Z",
  },
  {
    slug: "carddex-sync-news",
    title: "Nightly CardDex Sync: What It Means for Your Prices",
    excerpt:
      "Our 3:00 AM SAST sync overwrites local ZAR prices so your market view stays aligned with CardDex data.",
    content:
      "Every night at 03:00 SAST we pull CardDex sets and prices, convert EUR→ZAR, and refresh the catalog so search and portfolio stay honest.",
    category: "News",
    author: "Poke Mart Team",
    authorRole: "Editorial",
    readMinutes: 4,
    featured: false,
    imageUrl: BLOG_COVERS.sync,
    publishedAt: "2025-08-28T10:00:00.000Z",
  },
  {
    slug: "psa-vs-cgc-sa",
    title: "PSA vs CGC for South African Submissions",
    excerpt:
      "Comparing grading premiums, resale liquidity, and which slabs local buyers prefer at shows and online.",
    content:
      "PSA still leads liquidity at SA shows, but CGC turnaround and cost can win for mid-tier modern. Pick based on exit plan, not hype.",
    category: "Grading Info",
    author: "Alex B.",
    authorRole: "Pro Collector",
    readMinutes: 7,
    featured: false,
    imageUrl: BLOG_COVERS.psa,
    publishedAt: "2025-08-20T10:00:00.000Z",
  },
  {
    slug: "151-investment-outlook",
    title: "151 Special: Long-Term SA Investment Outlook",
    excerpt:
      "Charizard ex and illustration rares — are they still worth holding in a cooling global market?",
    content:
      "151 remains a nostalgia engine. Watch sealed supply and SIR liquidity before averaging up in ZAR.",
    category: "Market Analysis",
    author: "Thabo M.",
    authorRole: "Market Analyst",
    readMinutes: 9,
    featured: false,
    imageUrl: BLOG_COVERS.investment,
    publishedAt: "2025-08-12T10:00:00.000Z",
  },
];
