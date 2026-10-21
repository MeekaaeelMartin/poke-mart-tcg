import type { Metadata } from "next";
import { prisma } from "@/lib/db";
import { BlogLab, type BlogPostItem } from "@/components/BlogLab";
import { BLOG_SEED_POSTS } from "@/lib/blogPosts";
import { ensureBlogPosts } from "@/lib/ensureBlogPosts";
import { ensureDatabase } from "@/lib/ensureDatabase";

export const metadata: Metadata = {
  title: "TCG Price Lab",
  description: "Market analysis, set reviews, and collecting insights for South African Pokemon TCG collectors.",
};

export const dynamic = "force-dynamic";

const DEMO_POSTS: BlogPostItem[] = BLOG_SEED_POSTS.map((post, index) => ({
  id: `demo-${index + 1}`,
  slug: post.slug,
  title: post.title,
  excerpt: post.excerpt,
  category: post.category,
  author: post.author,
  authorRole: post.authorRole,
  imageUrl: post.imageUrl,
  readMinutes: post.readMinutes,
  featured: post.featured,
  publishedAt: post.publishedAt,
}));

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
    await ensureDatabase();
    await ensureBlogPosts();
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
