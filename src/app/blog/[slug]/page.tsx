import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Clock } from "lucide-react";
import { prisma } from "@/lib/db";
import { BLOG_COVERS } from "@/lib/blogPosts";
import { ensureBlogPosts } from "@/lib/ensureBlogPosts";
import { ensureDatabase } from "@/lib/ensureDatabase";
import { cn } from "@/lib/format";
import { mediaUrl } from "@/lib/media";
import { buildMetadata } from "@/lib/seo";

export const dynamic = "force-dynamic";

const CATEGORY_BADGE: Record<string, string> = {
  "Market Analysis": "text-[#FFD700] bg-[#FFD700]/10 border-[#FFD700]/25",
  "Collecting Tips": "text-emerald-400 bg-emerald-500/10 border-emerald-500/25",
  "Set Review": "text-blue-400 bg-blue-500/10 border-blue-500/25",
  News: "text-red-400 bg-red-500/10 border-red-500/25",
  "Grading Info": "text-purple-400 bg-purple-500/10 border-purple-500/25",
};

const DEMO_CONTENT: Record<
  string,
  {
    title: string;
    excerpt: string;
    content: string;
    category: string;
    author: string;
    authorRole?: string;
    readMinutes: number;
    imageUrl?: string | null;
    publishedAt: Date;
  }
> = {
  "sealed-product-sa": {
    title: "The Evolution of Sealed Product: SA Premium Trajectories",
    excerpt:
      "How booster boxes and ETBs are pricing across South African hobby shops — and where smart collectors are finding value in 2025.",
    content: `Sealed Pokemon TCG product in South Africa carries a persistent premium over international MSRP. Booster boxes that retail abroad for roughly €145 often land locally between R2,800 and R3,400 depending on distributor margins, import duties, and shop overhead.

Elite Trainer Boxes tell a similar story. Modern SV-era ETBs typically sit in the R1,200–R1,700 band, with chase sets like 151 and Crown Zenith commanding higher premiums due to sustained demand.

## What drives the SA premium?

1. **Import costs** — Shipping, customs, and VAT stack on top of wholesale.
2. **Limited allocation** — Popular sets sell out quickly at distributors, pushing resale higher.
3. **Collector culture** — Sealed product is treated as both a gift item and a long-term hold.

## Where value remains

Collectors who track nightly CardDex ZAR syncs can spot when sealed prices diverge from underlying singles markets. When box EV (expected value) drops below retail, holding sealed becomes a longer play — but chase sets with illustration rares often buck that trend.

Watch local Facebook groups and Takealot listings alongside Poke Mart price data to time entries. Premium members can add sealed-equivalent singles to a portfolio to approximate box exposure without storage risk.`,
    category: "Market Analysis",
    author: "Thabo M.",
    authorRole: "Market Analyst",
    readMinutes: 8,
    imageUrl: BLOG_COVERS.sealed,
    publishedAt: new Date("2025-09-15"),
  },
  "obsidian-flames-review": {
    title: "Obsidian Flames Set Review: Chase Cards in ZAR",
    excerpt:
      "A deep dive into SV3 chase singles, pull rates, and what sealed product is worth opening locally.",
    content: `Obsidian Flames (SV3) brought Charizard ex back into the spotlight with a stunning special illustration rare. Locally, raw copies trade between R450 and R900 depending on centreing and print lines.

The set's double rare Charizard ex is more accessible — typically R80–R150 — making it a popular binder piece for collectors who don't chase grades.

## Opening vs buying singles

At current SA ETB prices (~R1,299), opening for profit is unlikely unless you hit a SIR or high-grade ex. Most trainers buy singles for completion and crack packs for fun.

Use Poke Mart's free search to compare ZAR prices before you buy — our nightly sync keeps listings current.`,
    category: "Set Review",
    author: "Sarah K.",
    authorRole: "Set Reviewer",
    readMinutes: 6,
    imageUrl: BLOG_COVERS.chase,
    publishedAt: new Date("2025-09-10"),
  },
  "grading-guide": {
    title: "A Complete Local Grading Submission Guide",
    excerpt:
      "What to know before you send modern chase cards for PSA or CGC — shipping, costs, and turnaround from SA.",
    content: `Submitting cards from South Africa requires planning around shipping, insurance, and realistic turnaround times.

## Before you send

- Inspect surface, corners, and centreing under good light.
- Sleeve and semi-rigid the card — never ship raw in a toploader alone.
- Document photos and declared value for insurance.

## PSA vs CGC locally

PSA slabs still command the highest resale premium at SA shows. CGC is gaining ground online, especially for modern IRs and SIRs where subgrades matter less.

Budget R350–R600 per card all-in (grading fee + shipping share) for economy tiers. Premium members tracking portfolio value can log graded copies separately once we expand grading fields.`,
    category: "Collecting Tips",
    author: "Devon K.",
    authorRole: "Competitive Player",
    readMinutes: 10,
    imageUrl: BLOG_COVERS.grading,
    publishedAt: new Date("2025-09-05"),
  },
  "carddex-sync-news": {
    title: "Nightly CardDex Sync: What It Means for Your Prices",
    excerpt:
      "Our 3:00 AM SAST sync overwrites local ZAR prices so your market view stays aligned with CardDex data.",
    content: `Every night at 3:00 AM South Africa Standard Time, Poke Mart pulls fresh pricing from CardDex and overwrites local ZAR values using our configured EUR→ZAR rate.

That means:

- Trending cards on the homepage reflect the latest market move.
- Portfolio and watchlist valuations update automatically for premium users.
- Free search always shows current catalogue pricing without manual refreshes.

If you self-host, run \`npm run sync\` to trigger an on-demand update during development.`,
    category: "News",
    author: "Poke Mart Team",
    authorRole: "Editorial",
    readMinutes: 4,
    imageUrl: BLOG_COVERS.sync,
    publishedAt: new Date("2025-08-28"),
  },
  "psa-vs-cgc-sa": {
    title: "PSA vs CGC for South African Submissions",
    excerpt:
      "Comparing grading premiums, resale liquidity, and which slabs local buyers prefer at shows and online.",
    content: `South African buyers still lean PSA-first for vintage and high-end modern. CGC Black Label hype hasn't fully translated locally, but CGC 10 modern cards sell steadily on Facebook Marketplace.

Rule of thumb: submit cards you plan to sell within 6–12 months to PSA if the raw card has R500+ upside. For personal collections, grade what you love — CGC's pricing can make multi-card batches more affordable.`,
    category: "Grading Info",
    author: "Alex B.",
    authorRole: "Pro Collector",
    readMinutes: 7,
    imageUrl: BLOG_COVERS.psa,
    publishedAt: new Date("2025-08-20"),
  },
  "151-investment-outlook": {
    title: "151 Special: Long-Term SA Investment Outlook",
    excerpt:
      "Charizard ex and illustration rares — are they still worth holding in a cooling global market?",
    content: `SV 151 remains a flagship set for SA collectors. Special illustration Charizard ex copies still trade well above R1,000 in raw NM condition, though growth has slowed from 2024 peaks.

Sealed 151 product holds a floor thanks to gift-season demand and set nostalgia. Singles may consolidate sideways — a good entry for completionists using Poke Mart price alerts (premium feature).

This is not financial advice — treat Pokemon cards as collectibles first, investments second.`,
    category: "Market Analysis",
    author: "Thabo M.",
    authorRole: "Market Analyst",
    readMinutes: 9,
    imageUrl: BLOG_COVERS.investment,
    publishedAt: new Date("2025-08-12"),
  },
};

async function getPost(slug: string) {
  try {
    await ensureDatabase();
    await ensureBlogPosts();
    const post = await prisma.blogPost.findUnique({ where: { slug } });
    if (post) return post;
  } catch {
    /* fall through to demo */
  }
  const demo = DEMO_CONTENT[slug];
  if (!demo) return null;
  return {
    id: `demo-${slug}`,
    slug,
    ...demo,
    authorRole: demo.authorRole ?? null,
    authorImage: null,
    featured: slug === "sealed-product-sa",
    createdAt: demo.publishedAt,
  };
}

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPost(slug);
  if (!post) {
    return buildMetadata({
      title: "Article Not Found",
      description: "This TCG Price Lab article could not be found.",
      path: `/blog/${encodeURIComponent(slug)}`,
      noIndex: true,
    });
  }
  return buildMetadata({
    title: post.title,
    description: post.excerpt,
    path: `/blog/${encodeURIComponent(slug)}`,
    type: "article",
    keywords: [
      post.category,
      "Pokemon TCG blog",
      "Pokemon market South Africa",
      post.title,
    ],
    image: post.imageUrl || undefined,
    imageAlt: post.title,
    publishedTime: post.publishedAt.toISOString(),
  });
}

export default async function BlogArticlePage({ params }: Props) {
  const { slug } = await params;
  const post = await getPost(slug);
  if (!post) notFound();

  const badge = CATEGORY_BADGE[post.category] || CATEGORY_BADGE["Market Analysis"];
  const published = post.publishedAt.toLocaleDateString("en-ZA", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  return (
    <article className="container-page py-10 pb-16">
      <Link
        href="/blog"
        className="inline-flex items-center gap-2 text-sm text-zinc-400 transition hover:text-[#FFD700]"
      >
        <ArrowLeft size={16} />
        Back to TCG Price Lab
      </Link>

      <header className="mx-auto mt-8 max-w-3xl">
        <span
          className={cn(
            "inline-flex rounded-full border px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider",
            badge
          )}
        >
          {post.category}
        </span>
        <h1
          className="mt-4 text-3xl font-extrabold leading-tight tracking-tight text-white sm:text-4xl lg:text-5xl"
          style={{ fontFamily: "var(--font-syne), sans-serif" }}
        >
          {post.title}
        </h1>
        <p className="mt-4 text-lg leading-relaxed text-zinc-400">{post.excerpt}</p>
        <div className="mt-6 flex flex-wrap items-center gap-4 border-b border-white/8 pb-8 text-sm text-zinc-500">
          <div className="flex items-center gap-2">
            <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[#FFD700]/20 text-sm font-bold text-[#FFD700]">
              {post.author[0]}
            </span>
            <div>
              <p className="font-medium text-zinc-200">{post.author}</p>
              {post.authorRole && <p className="text-xs text-zinc-500">{post.authorRole}</p>}
            </div>
          </div>
          <span className="hidden sm:inline">·</span>
          <time dateTime={post.publishedAt.toISOString()}>{published}</time>
          <span>·</span>
          <span className="inline-flex items-center gap-1">
            <Clock size={14} />
            {post.readMinutes} min read
          </span>
        </div>
      </header>

      {post.imageUrl && (
        <div className="mx-auto mt-8 max-w-4xl overflow-hidden rounded-2xl border border-white/8">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={mediaUrl(post.imageUrl)} alt={post.title} className="w-full object-cover" />
        </div>
      )}

      <div className="prose prose-invert mx-auto mt-10 max-w-3xl">
        <div className="whitespace-pre-wrap text-base leading-relaxed text-zinc-300">
          {post.content.split("\n").map((paragraph, i) => {
            if (paragraph.startsWith("## ")) {
              return (
                <h2
                  key={i}
                  className="mb-4 mt-10 text-xl font-bold text-white"
                  style={{ fontFamily: "var(--font-syne), sans-serif" }}
                >
                  {paragraph.replace("## ", "")}
                </h2>
              );
            }
            if (paragraph.startsWith("- ")) {
              return (
                <p key={i} className="mb-2 ml-4 text-zinc-300">
                  • {paragraph.replace("- ", "")}
                </p>
              );
            }
            if (!paragraph.trim()) return <br key={i} />;
            return (
              <p key={i} className="mb-4">
                {paragraph}
              </p>
            );
          })}
        </div>
      </div>
    </article>
  );
}
