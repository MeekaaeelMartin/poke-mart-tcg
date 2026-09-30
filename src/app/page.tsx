import Link from "next/link";
import { prisma } from "@/lib/db";
import { CardTile, SectionHeading } from "@/components/CardUI";
import { formatZar, formatPct } from "@/lib/format";
import { Search, TrendingUp, Briefcase } from "lucide-react";
import { HomeSearch } from "@/components/HomeSearch";
import { fetchSealed, sealedPriceZar } from "@/lib/carddex";

export const dynamic = "force-dynamic";

async function getHomeData() {
  const [trending, sets, blog] = await Promise.all([
    prisma.card.findMany({
      where: { priceZar: { not: null } },
      orderBy: { pctChange1d: "desc" },
      take: 5,
    }),
    prisma.set.findMany({
      orderBy: { releaseDate: "desc" },
      take: 3,
    }),
    prisma.blogPost.findMany({
      orderBy: { publishedAt: "desc" },
      take: 2,
    }),
  ]);

  const cards =
    trending.length > 0
      ? trending
      : await prisma.card.findMany({
          where: { imageSmall: { not: null } },
          orderBy: { priceZar: "desc" },
          take: 5,
        });

  let etbs: Array<{
    id: string;
    name: string;
    price: number | null;
    pct: number | null;
    img: string | null;
  }> = [];
  try {
    const sealed = await fetchSealed({ type: "elite_trainer_box", pageSize: 8 });
    etbs = (sealed.data || []).slice(0, 4).map((p) => ({
      id: p.id,
      name: p.name,
      price: sealedPriceZar(p),
      pct: p.latest_price?.price_change_7d ?? p.latest_price?.price_change_1d ?? null,
      img: p.image_url || p.source_image_url || null,
    }));
  } catch {
    etbs = [];
  }

  return { cards, sets, blog, etbs };
}

export default async function HomePage() {
  const { cards, sets, blog, etbs } = await getHomeData();

  return (
    <div>
      {/* Hero */}
      <section className="container-page grid items-center gap-10 py-14 lg:grid-cols-2 lg:py-20">
        <div className="animate-fade-up">
          <span className="inline-flex rounded-full border border-violet-500/30 bg-violet-500/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-wider text-violet-300">
            All-in-one tracker
          </span>
          <h1
            className="mt-5 font-display text-4xl font-extrabold leading-[1.05] tracking-tight text-white sm:text-5xl lg:text-6xl"
            style={{ fontFamily: "var(--font-syne), sans-serif" }}
          >
            Track. Collect.{" "}
            <span className="text-[#FFD700]">Dominate.</span>
          </h1>
          <p className="mt-5 max-w-lg text-base leading-relaxed text-zinc-400">
            South Africa&apos;s Pokemon TCG companion — live ZAR pricing, set
            completion metrics, and a premium portfolio dashboard for serious collectors.
          </p>
          <div className="mt-8">
            <HomeSearch />
          </div>
        </div>

        <div className="relative mx-auto flex h-[360px] w-full max-w-md items-center justify-center lg:h-[420px]">
          <div className="absolute inset-0 rounded-full bg-[#FFD700]/10 blur-3xl" />
          {(cards.length ? cards : [{ id: "1", imageLarge: null, imageSmall: null, name: "Card" }])
            .slice(0, 3)
            .map((c, i) => (
              <div
                key={c.id}
                className={`absolute h-56 w-40 overflow-hidden rounded-xl border border-white/10 bg-[#12151E] shadow-2xl sm:h-64 sm:w-44 ${
                  i === 0
                    ? "z-20 animate-float -rotate-6"
                    : i === 1
                      ? "z-10 translate-x-16 animate-float-delayed rotate-6 sm:translate-x-24"
                      : "z-0 -translate-x-14 translate-y-6 rotate-[-12deg] opacity-80 sm:-translate-x-20"
                }`}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={
                    ("imageLarge" in c && c.imageLarge) ||
                    ("imageSmall" in c && c.imageSmall) ||
                    "https://images.carddex.dev/cards/base1/base1-4--sm.webp"
                  }
                  alt={"name" in c ? String(c.name) : "Pokemon card"}
                  className="h-full w-full object-cover"
                />
              </div>
            ))}
        </div>
      </section>

      {/* Trending */}
      <section className="container-page py-12">
        <SectionHeading
          title="Trending Now"
          action={
            <Link href="/prices" className="text-sm font-medium text-[#FFD700] hover:underline">
              View market →
            </Link>
          }
        />
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
          {cards.length === 0 ? (
            <p className="col-span-full text-sm text-zinc-500">
              Prices sync nightly at 3:00 AM. Run{" "}
              <code className="text-[#FFD700]">npm run sync</code> to load data now.
            </p>
          ) : (
            cards.map((card) => <CardTile key={card.id} card={card} showRarity={false} />)
          )}
        </div>
      </section>

      {/* Featured expansions */}
      <section className="container-page py-12">
        <SectionHeading title="Featured Expansions" />
        <div className="grid gap-5 md:grid-cols-3">
          {(sets.length
            ? sets
            : [
                { id: "sv3", name: "Obsidian Flames", setCode: "SV3", totalCards: 230, logoUrl: null },
                { id: "sv2", name: "Paldea Evolved", setCode: "SV2", totalCards: 279, logoUrl: null },
                { id: "sv3pt5", name: "151 Special", setCode: "SV3.5", totalCards: 207, logoUrl: null },
              ]
          ).map((s) => (
            <Link
              key={s.id}
              href={`/sets/${encodeURIComponent(s.id)}`}
              className="group relative overflow-hidden rounded-2xl border border-white/8 bg-[#12151E]"
            >
              <div className="relative aspect-[16/9] bg-gradient-to-br from-[#1a1f2e] to-[#0B0E14]">
                {s.logoUrl && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={s.logoUrl}
                    alt={s.name}
                    className="absolute inset-0 m-auto max-h-[70%] max-w-[70%] object-contain opacity-90 transition group-hover:scale-105"
                  />
                )}
                <span className="absolute left-3 top-3 rounded-md bg-black/50 px-2 py-0.5 text-[10px] font-semibold text-[#FFD700] backdrop-blur">
                  {s.setCode || s.id.toUpperCase()}
                </span>
              </div>
              <div className="flex items-center justify-between p-4">
                <div>
                  <h3 className="font-semibold text-white">{s.name}</h3>
                  <p className="text-xs text-zinc-500">{s.totalCards || "—"} Cards</p>
                </div>
                <span className="text-sm font-medium text-[#FFD700]">Explore Set</span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* ETBs */}
      <section className="container-page py-12">
        <SectionHeading
          title="Top Elite Trainer Boxes"
          action={
            <Link href="/prices" className="text-sm font-medium text-[#FFD700] hover:underline">
              View sealed →
            </Link>
          }
        />
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          {etbs.length === 0 ? (
            <p className="col-span-full text-sm text-zinc-500">
              Sealed ETB data loads live from CardDex. Check your API key if this stays empty.
            </p>
          ) : (
            etbs.map((etb) => (
              <Link
                key={etb.id}
                href={`/sealed/${encodeURIComponent(etb.id)}`}
                className="overflow-hidden rounded-2xl border border-white/8 bg-[#12151E] p-4 transition hover:border-[#FFD700]/35"
              >
                <div className="flex aspect-square items-center justify-center rounded-xl bg-[#0B0E14] p-4">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={etb.img || "/images/card-placeholder.svg"}
                    alt={etb.name}
                    className="max-h-full max-w-full object-contain"
                  />
                </div>
                <h3 className="mt-3 line-clamp-2 text-sm font-semibold text-white">{etb.name}</h3>
                <div className="mt-2 flex items-center justify-between">
                  <span className="text-sm font-bold">{formatZar(etb.price)}</span>
                  {etb.pct != null && (
                    <span
                      className={`text-xs font-semibold ${
                        etb.pct >= 0 ? "text-emerald-400" : "text-red-400"
                      }`}
                    >
                      {formatPct(etb.pct)}
                    </span>
                  )}
                </div>
              </Link>
            ))
          )}
        </div>
      </section>

      {/* How it works */}
      <section className="container-page py-12">
        <SectionHeading title="How Poke Mart Works" />
        <div className="grid gap-5 md:grid-cols-3">
          {[
            {
              n: "01",
              icon: Search,
              title: "Search Cards",
              body: "Browse and filter the full CardDex catalogue for free — names, sets, types, and rarities.",
            },
            {
              n: "02",
              icon: TrendingUp,
              title: "Analyze Live Trends",
              body: "Nightly 3:00 AM sync overwrites local prices so your ZAR market view stays current.",
            },
            {
              n: "03",
              icon: Briefcase,
              title: "Build Portfolio",
              body: "Premium members (R50/mo) unlock the dashboard to save cards, watchlists, and track value.",
            },
          ].map((step) => (
            <div
              key={step.n}
              className="relative rounded-2xl border border-white/8 bg-[#12151E] p-6"
            >
              <span className="absolute right-5 top-5 font-display text-3xl font-bold text-white/10">
                {step.n}
              </span>
              <span className="flex h-10 w-10 items-center justify-center rounded-full bg-[#FFD700]/15 text-[#FFD700]">
                <step.icon size={18} />
              </span>
              <h3 className="mt-4 text-lg font-semibold text-white">{step.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-zinc-400">{step.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Testimonials */}
      <section className="container-page py-12">
        <SectionHeading title="Verified Trainers" />
        <div className="grid gap-5 md:grid-cols-2">
          {[
            {
              q: "Poke Mart finally gives SA collectors ZAR pricing I can trust. The portfolio view paid for itself in a week.",
              name: "Alex B.",
              role: "Pro Collector",
            },
            {
              q: "Price drop alerts and nightly syncs mean I never miss a chase single at my local shop again.",
              name: "Devon K.",
              role: "Competitive Player",
            },
          ].map((t) => (
            <blockquote
              key={t.name}
              className="rounded-2xl border border-white/8 bg-[#12151E] p-6"
            >
              <p className="text-base leading-relaxed text-zinc-200">&ldquo;{t.q}&rdquo;</p>
              <footer className="mt-5 flex items-center gap-3">
                <span className="flex h-10 w-10 items-center justify-center rounded-full bg-[#FFD700]/20 text-sm font-bold text-[#FFD700]">
                  {t.name[0]}
                </span>
                <div>
                  <p className="text-sm font-semibold text-white">{t.name}</p>
                  <p className="text-xs text-zinc-500">{t.role}</p>
                </div>
              </footer>
            </blockquote>
          ))}
        </div>
      </section>

      {/* Blog teaser */}
      <section className="container-page py-12">
        <SectionHeading
          title="Latest from the Lab"
          action={
            <Link href="/blog" className="text-sm font-medium text-[#FFD700] hover:underline">
              View all articles →
            </Link>
          }
        />
        <div className="grid gap-5 md:grid-cols-2">
          {(blog.length
            ? blog
            : [
                {
                  id: "1",
                  slug: "sealed-product-sa",
                  category: "Market Analysis",
                  title: "The Evolution of Sealed Product: SA Premium Trajectories",
                  excerpt: "How booster boxes and ETBs are pricing across South African hobby shops.",
                  imageUrl: null,
                },
                {
                  id: "2",
                  slug: "grading-guide",
                  category: "Collecting Tips",
                  title: "A Complete Local Grading Submission Guide",
                  excerpt: "What to know before you send modern chase cards for PSA or CGC.",
                  imageUrl: null,
                },
              ]
          ).map((post) => (
            <Link
              key={post.id}
              href={`/blog/${post.slug}`}
              className="flex gap-4 overflow-hidden rounded-2xl border border-white/8 bg-[#12151E] p-3 transition hover:border-[#FFD700]/30"
            >
              <div className="h-28 w-36 shrink-0 overflow-hidden rounded-xl bg-gradient-to-br from-[#1a1f2e] to-[#0B0E14]">
                {post.imageUrl && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={post.imageUrl} alt="" className="h-full w-full object-cover" />
                )}
              </div>
              <div className="flex flex-col justify-center py-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#FFD700]">
                  {post.category}
                </span>
                <h3 className="mt-1 text-sm font-semibold text-white line-clamp-2">{post.title}</h3>
                <p className="mt-1 text-xs text-zinc-500 line-clamp-2">{post.excerpt}</p>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="container-page py-8 pb-16">
        <div className="rounded-3xl border border-white/8 bg-gradient-to-br from-[#151a28] to-[#0d1018] px-6 py-14 text-center sm:px-12">
          <h2
            className="text-3xl font-bold text-white sm:text-4xl"
            style={{ fontFamily: "var(--font-syne), sans-serif" }}
          >
            Master Your Collection Today
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-sm text-zinc-400">
            Free search for everyone. Premium dashboard for R50/month — save cards,
            watchlists, and portfolio value in ZAR.
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <Link
              href="/auth/signup"
              className="rounded-lg bg-[#FFD700] px-6 py-3 text-sm font-semibold text-[#0B0E14] glow-yellow"
            >
              Create Your Account
            </Link>
            <Link
              href="/prices"
              className="rounded-lg border border-white/15 px-6 py-3 text-sm font-medium text-white hover:bg-white/5"
            >
              Explore Prices
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
