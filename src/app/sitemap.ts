import type { MetadataRoute } from "next";
import { BLOG_SEED_POSTS } from "@/lib/blogPosts";
import { prisma } from "@/lib/db";
import { loadSealedCatalog } from "@/lib/sealedCatalog";
import { isDisplayableSet, loadSetsCatalog } from "@/lib/setsCatalog";
import { getSiteUrl } from "@/lib/site";

export const dynamic = "force-dynamic";

const STATIC: Array<{
  path: string;
  changeFrequency: MetadataRoute.Sitemap[number]["changeFrequency"];
  priority: number;
}> = [
  { path: "/", changeFrequency: "daily", priority: 1 },
  { path: "/cards", changeFrequency: "hourly", priority: 0.95 },
  { path: "/sets", changeFrequency: "daily", priority: 0.9 },
  { path: "/prices", changeFrequency: "hourly", priority: 0.95 },
  { path: "/blog", changeFrequency: "weekly", priority: 0.75 },
  { path: "/premium", changeFrequency: "monthly", priority: 0.7 },
  { path: "/contact", changeFrequency: "monthly", priority: 0.55 },
  { path: "/legal", changeFrequency: "yearly", priority: 0.3 },
  { path: "/legal/terms", changeFrequency: "yearly", priority: 0.25 },
  { path: "/legal/privacy", changeFrequency: "yearly", priority: 0.25 },
  { path: "/legal/subscription", changeFrequency: "yearly", priority: 0.25 },
  { path: "/legal/intellectual-property", changeFrequency: "yearly", priority: 0.25 },
  { path: "/legal/financial-disclaimer", changeFrequency: "yearly", priority: 0.25 },
];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const site = getSiteUrl();
  const now = new Date();
  const entries: MetadataRoute.Sitemap = STATIC.map((s) => ({
    url: `${site}${s.path}`,
    lastModified: now,
    changeFrequency: s.changeFrequency,
    priority: s.priority,
  }));

  entries.push({
    url: `${site}/llms.txt`,
    lastModified: now,
    changeFrequency: "monthly",
    priority: 0.2,
  });

  try {
    const sets = (await loadSetsCatalog({ pageSize: 100 })).filter(isDisplayableSet);
    for (const set of sets) {
      entries.push({
        url: `${site}/sets/${encodeURIComponent(set.id)}`,
        lastModified: now,
        changeFrequency: "daily",
        priority: 0.8,
      });
    }
  } catch {
    /* keep static entries */
  }

  try {
    const sealed = await loadSealedCatalog({ pageSize: 50, maxPages: 4, limit: 200 });
    for (const product of sealed) {
      entries.push({
        url: `${site}/sealed/${encodeURIComponent(product.id)}`,
        lastModified: now,
        changeFrequency: "daily",
        priority: 0.75,
      });
    }
  } catch {
    /* sealed optional */
  }

  try {
    const cards = await prisma.card.findMany({
      where: { OR: [{ priceZar: { not: null } }, { priceEur: { not: null } }] },
      orderBy: [{ priceZar: "desc" }, { priceEur: "desc" }],
      take: 1500,
      select: { id: true, updatedAt: true },
    });
    for (const card of cards) {
      entries.push({
        url: `${site}/cards/${encodeURIComponent(card.id)}`,
        lastModified: card.updatedAt || now,
        changeFrequency: "daily",
        priority: 0.7,
      });
    }
  } catch {
    /* cards optional */
  }

  try {
    const posts = await prisma.blogPost.findMany({
      select: { slug: true, publishedAt: true, createdAt: true },
    });
    const list =
      posts.length > 0
        ? posts
        : BLOG_SEED_POSTS.map((p) => ({
            slug: p.slug,
            publishedAt: new Date(p.publishedAt),
            createdAt: new Date(p.publishedAt),
          }));
    for (const post of list) {
      entries.push({
        url: `${site}/blog/${encodeURIComponent(post.slug)}`,
        lastModified: post.publishedAt || post.createdAt || now,
        changeFrequency: "weekly",
        priority: 0.65,
      });
    }
  } catch {
    for (const post of BLOG_SEED_POSTS) {
      entries.push({
        url: `${site}/blog/${encodeURIComponent(post.slug)}`,
        lastModified: new Date(post.publishedAt),
        changeFrequency: "weekly",
        priority: 0.65,
      });
    }
  }

  return entries;
}
