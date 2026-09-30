import type { Metadata } from "next";
import { prisma } from "@/lib/db";
import { BlogLab, type BlogPostItem } from "@/components/BlogLab";

export const metadata: Metadata = {
  title: "TCG Price Lab",
  description: "Market analysis, set reviews, and collecting insights for South African Pokemon TCG collectors.",
};

export const dynamic = "force-dynamic";

const DEMO_POSTS: BlogPostItem[] = [
  {
    id: "demo-1",
    slug: "sealed-product-sa",
    title: "The Evolution of Sealed Product: SA Premium Trajectories",
    excerpt:
      "How booster boxes and ETBs are pricing across South African hobby shops — and where smart collectors are finding value in 2025.",
    category: "Market Analysis",
    author: "Thabo M.",
    authorRole: "Market Analyst",
    imageUrl: null,
    readMinutes: 8,
    featured: true,
    publishedAt: new Date("2025-09-15").toISOString(),
  },
  {
    id: "demo-2",
    slug: "obsidian-flames-review",
    title: "Obsidian Flames Set Review: Chase Cards in ZAR",
    excerpt:
      "A deep dive into SV3 chase singles, pull rates, and what sealed product is worth opening locally.",
    category: "Set Review",
    author: "Sarah K.",
    authorRole: "Set Reviewer",
    imageUrl: null,
    readMinutes: 6,
    featured: false,
    publishedAt: new Date("2025-09-10").toISOString(),
  },
  {
    id: "demo-3",
    slug: "grading-guide",
    title: "A Complete Local Grading Submission Guide",
    excerpt:
      "What to know before you send modern chase cards for PSA or CGC — shipping, costs, and turnaround from SA.",
    category: "Collecting Tips",
    author: "Devon K.",
    authorRole: "Competitive Player",
    imageUrl: null,
    readMinutes: 10,
    featured: false,
    publishedAt: new Date("2025-09-05").toISOString(),
  },
  {
    id: "demo-4",
    slug: "carddex-sync-news",
    title: "Nightly CardDex Sync: What It Means for Your Prices",
    excerpt:
      "Our 3:00 AM SAST sync overwrites local ZAR prices so your market view stays aligned with CardDex data.",
    category: "News",
    author: "Poke Mart Team",
    authorRole: "Editorial",
    imageUrl: null,
    readMinutes: 4,
    featured: false,
    publishedAt: new Date("2025-08-28").toISOString(),
  },
  {
    id: "demo-5",
    slug: "psa-vs-cgc-sa",
    title: "PSA vs CGC for South African Submissions",
    excerpt:
      "Comparing grading premiums, resale liquidity, and which slabs local buyers prefer at shows and online.",
    category: "Grading Info",
    author: "Alex B.",
    authorRole: "Pro Collector",
    imageUrl: null,
    readMinutes: 7,
    featured: false,
    publishedAt: new Date("2025-08-20").toISOString(),
  },
  {
    id: "demo-6",
    slug: "151-investment-outlook",
    title: "151 Special: Long-Term SA Investment Outlook",
    excerpt:
      "Charizard ex and illustration rares — are they still worth holding in a cooling global market?",
    category: "Market Analysis",
    author: "Thabo M.",
    authorRole: "Market Analyst",
    imageUrl: null,
    readMinutes: 9,
    featured: false,
    publishedAt: new Date("2025-08-12").toISOString(),
  },
];

function toBlogPostItem(post: {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  category: string;
  author: string;
  authorRole?: string | null;
  imageUrl?: string | null;
  readMinutes: number;
  featured: boolean;
  publishedAt: Date;
}): BlogPostItem {
  return {
    id: post.id,
    slug: post.slug,
    title: post.title,
    excerpt: post.excerpt,
    category: post.category,
    author: post.author,
    authorRole: post.authorRole,
    imageUrl: post.imageUrl,
    readMinutes: post.readMinutes,
    featured: post.featured,
    publishedAt: post.publishedAt.toISOString(),
  };
}

async function getPosts(): Promise<BlogPostItem[]> {
  try {
    const rows = await prisma.blogPost.findMany({
      orderBy: { publishedAt: "desc" },
    });
    if (rows.length === 0) return DEMO_POSTS;
    return rows.map(toBlogPostItem);
  } catch {
    return DEMO_POSTS;
  }
}

export default async function BlogPage() {
  const posts = await getPosts();
  const featured =
    posts.find((p) => p.featured) ?? posts[0] ?? DEMO_POSTS[0];

  return (
    <div className="container-page py-12 pb-16">
      <div className="mb-10 max-w-2xl">
        <span className="inline-flex rounded-full border border-[#FFD700]/30 bg-[#FFD700]/10 px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-[#FFD700]">
          Featured Masterclass
        </span>
        <h1
          className="mt-4 text-4xl font-extrabold tracking-tight text-white sm:text-5xl"
          style={{ fontFamily: "var(--font-syne), sans-serif" }}
        >
          TCG <span className="text-[#FFD700]">Price Lab</span>
        </h1>
        <p className="mt-4 text-base leading-relaxed text-zinc-400">
          Market analysis, set reviews, and collecting strategies — written for South
          African trainers with ZAR pricing in mind.
        </p>
      </div>

      <BlogLab posts={posts} featured={featured} />
    </div>
  );
}
