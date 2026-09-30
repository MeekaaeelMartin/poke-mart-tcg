import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

const posts = [
  {
    slug: "sealed-product-sa-premium",
    title: "The Evolution of Sealed Product: SA Premium Trajectories",
    excerpt:
      "How booster boxes and ETBs are pricing across South African hobby shops — and why master set spikes still surprise the market.",
    content: `South Africa's sealed market has matured quickly. Local shops now price ETBs and booster boxes with tighter spreads against international guides, but logistics and forex still create windows for collectors.

This masterclass walks through Obsidian Flames, 151, and Crown Zenith trajectories in ZAR, what "SA premium" really means, and how nightly CardDex syncs help Poke Mart keep your dashboard honest.

Key takeaways:
- Track sealed separately from singles — correlation is imperfect.
- Watch 7-day averages, not just day-one spikes.
- Premium portfolio alerts beat refreshing shop Instagram pages.`,
    category: "Market Analysis",
    author: "Professor Rowan",
    authorRole: "Head of Price Intelligence, Durban",
    readMinutes: 12,
    featured: true,
    imageUrl: "https://images.carddex.dev/sets/sv3/logo.png",
  },
  {
    slug: "obsidian-flames-chase-singles",
    title: "Obsidian Flames: Undervalued Chase Singles",
    excerpt: "Which SIRs still look cheap against 30-day averages on the SA secondary market.",
    content: "Deep dive into Obsidian Flames chase singles and relative value versus set completion demand.",
    category: "Market Analysis",
    author: "Devon K.",
    authorRole: "Market Analyst",
    readMinutes: 8,
    featured: false,
    imageUrl: "https://images.carddex.dev/sets/sv3/logo.png",
  },
  {
    slug: "local-grading-submission-guide",
    title: "A Complete Local Grading Submission Guide",
    excerpt: "PSA, CGC, and local options — what SA collectors should prepare before submitting.",
    content: "Grading modern chase cards can unlock premiums, but shipping and turnaround matter. Here's a practical SA checklist.",
    category: "Collecting Tips",
    author: "Sarah L.",
    authorRole: "Collector Coach",
    readMinutes: 10,
    featured: false,
  },
  {
    slug: "sv151-checklist",
    title: "Scarlet & Violet 151 Special Set Checklist",
    excerpt: "Master set roadmap with rarity breakdowns and completion tips.",
    content: "Use this checklist alongside Poke Mart set tracking to finish 151 without overpaying on commons.",
    category: "Set Review",
    author: "Devon K.",
    authorRole: "Market Analyst",
    readMinutes: 7,
    featured: false,
  },
  {
    slug: "expansion-leaks-meta",
    title: "Upcoming Expansion Leaks & Meta Predictions",
    excerpt: "What rumoured sets could mean for sealed demand in Q2.",
    content: "Leak culture moves markets. Separate signal from noise before you pre-order sealed product.",
    category: "News",
    author: "Lab Desk",
    authorRole: "Editors",
    readMinutes: 5,
    featured: false,
  },
  {
    slug: "graded-modern-premium",
    title: "Is Graded Modern Really Worth the Premium?",
    excerpt: "Comparing raw vs PSA 10 premiums on recent chase cards in ZAR terms.",
    content: "Sometimes yes. Often no. We break down the break-even math for SA collectors.",
    category: "Grading Info",
    author: "Sarah L.",
    authorRole: "Collector Coach",
    readMinutes: 9,
    featured: false,
  },
  {
    slug: "detect-counterfeit-cards",
    title: "How to Detect Counterfeit TCG Cards Safely",
    excerpt: "Texture, font, and holo tells every trainer should know.",
    content: "Counterfeits hit local Facebook groups hard. Learn the tells before you buy.",
    category: "Collecting Tips",
    author: "Alex B.",
    authorRole: "Pro Collector",
    readMinutes: 6,
    featured: false,
  },
];

async function main() {
  for (const post of posts) {
    await prisma.blogPost.upsert({
      where: { slug: post.slug },
      create: post,
      update: post,
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

  console.log(`Seeded ${posts.length} blog posts.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
