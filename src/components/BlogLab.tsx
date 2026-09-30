"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { Search } from "lucide-react";
import { cn } from "@/lib/format";

export type BlogPostItem = {
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
  publishedAt: string;
};

const CATEGORIES = [
  "All",
  "Market Analysis",
  "Set Review",
  "Collecting Tips",
  "News",
  "Grading Info",
] as const;

const CATEGORY_STYLES: Record<string, { card: string; badge: string }> = {
  "Market Analysis": {
    card: "border-[#FFD700]/35 hover:shadow-[0_0_28px_rgba(255,215,0,0.18)]",
    badge: "text-[#FFD700] bg-[#FFD700]/10 border-[#FFD700]/25",
  },
  "Collecting Tips": {
    card: "border-emerald-500/35 hover:shadow-[0_0_28px_rgba(16,185,129,0.18)]",
    badge: "text-emerald-400 bg-emerald-500/10 border-emerald-500/25",
  },
  "Set Review": {
    card: "border-blue-500/35 hover:shadow-[0_0_28px_rgba(59,130,246,0.18)]",
    badge: "text-blue-400 bg-blue-500/10 border-blue-500/25",
  },
  News: {
    card: "border-red-500/35 hover:shadow-[0_0_28px_rgba(239,68,68,0.18)]",
    badge: "text-red-400 bg-red-500/10 border-red-500/25",
  },
  "Grading Info": {
    card: "border-purple-500/35 hover:shadow-[0_0_28px_rgba(168,85,247,0.18)]",
    badge: "text-purple-400 bg-purple-500/10 border-purple-500/25",
  },
};

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-ZA", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function PostImage({ src, alt }: { src?: string | null; alt: string }) {
  return (
    <div className="relative aspect-[16/10] overflow-hidden bg-gradient-to-br from-[#1a1f2e] to-[#0B0E14]">
      {src ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={src} alt={alt} className="h-full w-full object-cover transition duration-300 group-hover:scale-[1.03]" />
      ) : (
        <div className="flex h-full items-center justify-center">
          <span className="text-4xl opacity-20">⚡</span>
        </div>
      )}
    </div>
  );
}

export function BlogLab({
  posts,
  featured,
}: {
  posts: BlogPostItem[];
  featured: BlogPostItem;
}) {
  const [category, setCategory] = useState<string>("All");
  const [query, setQuery] = useState("");

  const gridPosts = useMemo(() => {
    const rest = posts.filter((p) => p.id !== featured.id);
    const q = query.trim().toLowerCase();

    return rest.filter((post) => {
      const matchesCategory = category === "All" || post.category === category;
      const matchesQuery =
        !q ||
        post.title.toLowerCase().includes(q) ||
        post.excerpt.toLowerCase().includes(q) ||
        post.author.toLowerCase().includes(q) ||
        post.category.toLowerCase().includes(q);
      return matchesCategory && matchesQuery;
    });
  }, [posts, featured.id, category, query]);

  const featuredStyles = CATEGORY_STYLES[featured.category] || CATEGORY_STYLES["Market Analysis"];

  return (
    <div>
      {/* Featured */}
      <Link
        href={`/blog/${featured.slug}`}
        className={cn(
          "group block overflow-hidden rounded-3xl border bg-[#12151E] transition duration-300",
          featuredStyles.card
        )}
      >
        <div className="grid lg:grid-cols-2">
          <PostImage src={featured.imageUrl} alt={featured.title} />
          <div className="flex flex-col justify-center p-6 sm:p-8 lg:p-10">
            <span className="inline-flex w-fit rounded-full border border-[#FFD700]/40 bg-[#FFD700]/10 px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-[#FFD700]">
              Featured Masterclass
            </span>
            <span
              className={cn(
                "mt-4 inline-flex w-fit rounded-full border px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider",
                featuredStyles.badge
              )}
            >
              {featured.category}
            </span>
            <h2
              className="mt-4 text-2xl font-bold leading-tight text-white sm:text-3xl"
              style={{ fontFamily: "var(--font-syne), sans-serif" }}
            >
              {featured.title}
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-zinc-400 line-clamp-3">{featured.excerpt}</p>
            <div className="mt-6 flex flex-wrap items-center gap-4 text-xs text-zinc-500">
              <span>{featured.readMinutes} min read</span>
              <span>·</span>
              <span>{formatDate(featured.publishedAt)}</span>
              <span>·</span>
              <span className="text-zinc-300">{featured.author}</span>
            </div>
            <span className="mt-6 text-sm font-semibold text-[#FFD700] group-hover:underline">
              Read masterclass →
            </span>
          </div>
        </div>
      </Link>

      {/* Filters */}
      <div className="mt-12 flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap gap-2">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setCategory(cat)}
              className={cn(
                "rounded-full border px-3.5 py-1.5 text-xs font-medium transition",
                category === cat
                  ? "border-[#FFD700]/50 bg-[#FFD700]/15 text-[#FFD700]"
                  : "border-white/10 bg-[#12151E] text-zinc-400 hover:border-white/20 hover:text-white"
              )}
            >
              {cat}
            </button>
          ))}
        </div>
        <div className="relative w-full sm:max-w-xs">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" />
          <input
            type="search"
            placeholder="Search articles…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full rounded-xl border border-white/10 bg-[#12151E] py-2.5 pl-10 pr-4 text-sm text-white placeholder:text-zinc-500 focus:border-[#FFD700]/40 focus:outline-none focus:ring-1 focus:ring-[#FFD700]/30"
          />
        </div>
      </div>

      {/* Grid */}
      <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {gridPosts.length === 0 ? (
          <p className="col-span-full rounded-2xl border border-dashed border-white/10 bg-[#12151E]/50 py-16 text-center text-sm text-zinc-500">
            No articles match your filters.
          </p>
        ) : (
          gridPosts.map((post) => {
            const styles = CATEGORY_STYLES[post.category] || CATEGORY_STYLES["Market Analysis"];
            return (
              <Link
                key={post.id}
                href={`/blog/${post.slug}`}
                className={cn(
                  "group overflow-hidden rounded-2xl border bg-[#12151E] transition duration-300 hover:-translate-y-0.5",
                  styles.card
                )}
              >
                <PostImage src={post.imageUrl} alt={post.title} />
                <div className="p-5">
                  <div className="flex items-center justify-between gap-2">
                    <span
                      className={cn(
                        "rounded-full border px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider",
                        styles.badge
                      )}
                    >
                      {post.category}
                    </span>
                    <span className="text-[10px] text-zinc-500">{post.readMinutes} min</span>
                  </div>
                  <h3 className="mt-3 text-base font-semibold leading-snug text-white line-clamp-2 group-hover:text-[#FFD700]">
                    {post.title}
                  </h3>
                  <p className="mt-2 text-xs leading-relaxed text-zinc-500 line-clamp-2">{post.excerpt}</p>
                  <p className="mt-4 text-xs text-zinc-400">
                    By <span className="text-zinc-300">{post.author}</span>
                  </p>
                </div>
              </Link>
            );
          })
        )}
      </div>
    </div>
  );
}
