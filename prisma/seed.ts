import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import { BLOG_SEED_POSTS } from "../src/lib/blogPosts";

const prisma = new PrismaClient();

async function main() {
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

  const demoEmail = "trainer@poke-mart-tcg.co.za";
  const existing = await prisma.user.findUnique({ where: { email: demoEmail } });
  if (!existing) {
    const passwordHash = await bcrypt.hash("demo1234", 10);
    const until = new Date();
    until.setMonth(until.getMonth() + 1);
    await prisma.user.create({
      data: {
        email: demoEmail,
        name: "Ash Ketchum",
        username: "AshKetchum_GP",
        passwordHash,
        isPremium: true,
        premiumUntil: until,
        activities: {
          create: {
            message: "Demo premium account ready. Password: demo1234",
          },
        },
      },
    });
    console.log("Created demo premium user: trainer@poke-mart-tcg.co.za / demo1234");
  }

  console.log(`Seeded ${BLOG_SEED_POSTS.length} blog posts with cover art.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
