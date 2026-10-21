import { prisma } from "./db";
import { BLOG_SEED_POSTS } from "./blogPosts";

let seeding: Promise<void> | null = null;
let seeded = false;

/** Upsert editorial posts with cover art so Hostinger never shows empty lightning placeholders. */
export async function ensureBlogPosts(): Promise<void> {
  if (seeded) return;
  if (seeding) return seeding;

  seeding = (async () => {
    try {
      for (const post of BLOG_SEED_POSTS) {
        await prisma.blogPost.upsert({
          where: { slug: post.slug },
          create: {
            slug: post.slug,
            title: post.title,
            excerpt: post.excerpt,
            content: post.content,
            category: post.category,
            author: post.author,
            authorRole: post.authorRole,
            imageUrl: post.imageUrl,
            readMinutes: post.readMinutes,
            featured: post.featured,
            publishedAt: new Date(post.publishedAt),
          },
          update: {
            title: post.title,
            excerpt: post.excerpt,
            content: post.content,
            category: post.category,
            author: post.author,
            authorRole: post.authorRole,
            imageUrl: post.imageUrl,
            readMinutes: post.readMinutes,
            featured: post.featured,
          },
        });
      }

      // Backfill / refresh covers on older seed slugs (and any post still missing art)
      const legacyCovers: Record<string, string> = {
        "sealed-product-sa-premium": BLOG_SEED_POSTS[0].imageUrl,
        "obsidian-flames-chase-singles": BLOG_SEED_POSTS[1].imageUrl,
        "local-grading-submission-guide": BLOG_SEED_POSTS[2].imageUrl,
        "sv151-checklist": BLOG_SEED_POSTS[5].imageUrl,
        "expansion-leaks-meta": BLOG_SEED_POSTS[3].imageUrl,
        "graded-modern-premium": BLOG_SEED_POSTS[4].imageUrl,
        "detect-counterfeit-cards": BLOG_SEED_POSTS[2].imageUrl,
      };
      for (const [slug, imageUrl] of Object.entries(legacyCovers)) {
        try {
          await prisma.blogPost.updateMany({
            where: { slug },
            data: { imageUrl },
          });
        } catch {
          /* ignore */
        }
      }

      try {
        const bare = await prisma.blogPost.findMany({
          where: { OR: [{ imageUrl: null }, { imageUrl: "" }] },
          select: { id: true },
        });
        for (let i = 0; i < bare.length; i++) {
          const cover = BLOG_SEED_POSTS[i % BLOG_SEED_POSTS.length].imageUrl;
          await prisma.blogPost.update({
            where: { id: bare[i].id },
            data: { imageUrl: cover },
          });
        }
      } catch {
        /* ignore */
      }

      seeded = true;
    } catch (err) {
      console.warn("[ensureBlogPosts] failed", err);
    }
  })();

  return seeding;
}
