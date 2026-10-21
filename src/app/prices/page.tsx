import Link from "next/link";
import type { Card } from "@prisma/client";
import { prisma } from "@/lib/db";
import { ensureDatabase } from "@/lib/ensureDatabase";
import { SectionHeading, TrendRow } from "@/components/CardUI";
import { formatPct, formatZar } from "@/lib/format";
import { ArrowDownRight, ArrowUpRight, BarChart3, Crown, Layers } from "lucide-react";
import { fetchPriceTrends, fetchSealed, mapPriceToZar, sealedPriceZar } from "@/lib/carddex";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Market Prices & Trends",
};

async function hydrateLiveMovers() {
  try {
    const res = await fetchPriceTrends({ pageSize: 40 });
    for (const p of res.data || []) {
      if (!p.card_id) continue;
      const mapped = mapPriceToZar(p);
      try {
        await prisma.set.upsert({
          where: { id: p.set_id || "unknown" },
          create: { id: p.set_id || "unknown", name: p.set_id || "Unknown" },
          update: {},
        });
        await prisma.card.upsert({
          where: { id: p.card_id },
          create: {
            id: p.card_id,
            setId: p.set_id || "unknown",
            name: p.card_name || p.card_id,
            number: p.number || null,
            rarity: p.rarity || null,
            imageThumb: p.image_thumb || null,
            imageSmall: p.image_small || null,
            imageLarge: p.image_large || null,
            setName: p.set_id || null,
            ...mapped,
            lastSyncedAt: new Date(),
          },
          update: {
            ...mapped,
            imageSmall: p.image_small || undefined,
            imageLarge: p.image_large || undefined,
            lastSyncedAt: new Date(),
          },
        });
      } catch {
        /* ignore per-row persistence */
      }
    }
  } catch {
    /* use local cache */
  }
}

async function getMarketData() {
  await ensureDatabase();
  await hydrateLiveMovers();

  let totalTracked = 0;
  let avgShift = 0;
  let topCard: Card | null = null;
  let trendingUp: Card[] = [];
  let trendingDown: Card[] = [];

  try {
    const [tracked, avgAgg, top, up, down] = await Promise.all([
      prisma.card.count({ where: { priceZar: { not: null } } }),
      prisma.card.aggregate({
        _avg: { pctChange1d: true },
        where: { pctChange1d: { not: null } },
      }),
      prisma.card.findFirst({
        where: { priceZar: { not: null } },
        orderBy: { priceZar: "desc" },
      }),
      prisma.card.findMany({
        where: { pctChange1d: { not: null }, priceZar: { not: null } },
        orderBy: { pctChange1d: "desc" },
        take: 8,
      }),
      prisma.card.findMany({
        where: { pctChange1d: { not: null }, priceZar: { not: null } },
        orderBy: { pctChange1d: "asc" },
        take: 8,
      }),
    ]);
    totalTracked = tracked;
    avgShift = avgAgg._avg.pctChange1d ?? 0;
    topCard = top;
    trendingUp = up;
    trendingDown = down;
  } catch {
    /* empty market */
  }

  // Live fallback if DB empty
  if (trendingUp.length === 0) {
    try {
      const res = await fetchPriceTrends({ pageSize: 16 });
      trendingUp = (res.data || []).slice(0, 8).map((p) => {
        const mapped = mapPriceToZar(p);
        return {
          id: p.card_id,
          name: p.card_name || p.card_id,
          number: p.number || null,
          setName: p.set_id || null,
          imageSmall: p.image_small || null,
          imageLarge: p.image_large || null,
          priceZar: mapped.priceZar,
          pctChange1d: mapped.pctChange1d,
          pctChange7d: mapped.pctChange7d,
        } as Card;
      });
      trendingDown = [...trendingUp].reverse();
      totalTracked = Math.max(totalTracked, trendingUp.length);
      topCard = trendingUp[0] || null;
    } catch {
      /* keep empty */
    }
  }

  let sealed: Array<{
    id: string;
    name: string;
    subtitle: string;
    price: number | null;
    pct: number | null;
  }> = [];
  try {
    const res = await fetchSealed({ type: "booster_box", pageSize: 6 });
    sealed = (res.data || []).slice(0, 3).map((p) => ({
      id: p.id,
      name: p.name,
      subtitle: (p.product_type || "booster box").replace(/_/g, " "),
      price: sealedPriceZar(p),
      pct: p.latest_price?.price_change_7d ?? p.latest_price?.price_change_30d ?? null,
    }));
  } catch {
    sealed = [];
  }

  return {
    totalTracked,
    avgShift,
    topCard,
    trendingUp,
    trendingDown,
    sealed,
  };
}

export default async function PricesPage() {
  const { totalTracked, avgShift, topCard, trendingUp, trendingDown, sealed } =
    await getMarketData();

  const stats = [
    {
      label: "Total Cards Tracked",
      value: totalTracked.toLocaleString("en-ZA"),
      icon: Layers,
      accent: "text-sky-400 bg-sky-500/15",
    },
    {
      label: "Average Value Shift",
      value: formatPct(avgShift),
      sub: "24h market movement",
      icon: BarChart3,
      accent: avgShift >= 0 ? "text-emerald-400 bg-emerald-500/15" : "text-red-400 bg-red-500/15",
    },
    {
      label: "Top Portfolio Performer",
      value: topCard?.name ?? "—",
      sub: topCard ? formatZar(topCard.priceZar) : "Sync data to populate",
      href: topCard ? `/cards/${encodeURIComponent(topCard.id)}` : undefined,
      icon: Crown,
      accent: "text-[#FFD700] bg-[#FFD700]/15",
    },
  ];

  return (
    <div className="container-page py-10 pb-16">
      <SectionHeading
        title="Market Prices & Trends"
        subtitle="Live ZAR pricing synced nightly at 3:00 AM — spot movers, sealed product benchmarks, and portfolio standouts."
      />

      <div className="mb-12 grid gap-4 md:grid-cols-3">
        {stats.map((stat) => {
          const inner = (
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-xs font-medium uppercase tracking-wider text-zinc-500">
                  {stat.label}
                </p>
                <p className="mt-2 text-xl font-bold text-white line-clamp-2">{stat.value}</p>
                {stat.sub && <p className="mt-1 text-xs text-zinc-500">{stat.sub}</p>}
              </div>
              <span
                className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${stat.accent}`}
              >
                <stat.icon size={18} />
              </span>
            </div>
          );
          return stat.href ? (
            <Link
              key={stat.label}
              href={stat.href}
              className="rounded-2xl border border-white/8 bg-[#12151E] p-5 transition hover:border-[#FFD700]/35"
            >
              {inner}
            </Link>
          ) : (
            <div key={stat.label} className="rounded-2xl border border-white/8 bg-[#12151E] p-5">
              {inner}
            </div>
          );
        })}
      </div>

      <div className="mb-12 grid gap-8 lg:grid-cols-2">
        <section>
          <div className="mb-4 flex items-center gap-2">
            <ArrowUpRight size={18} className="text-emerald-400" />
            <h2 className="text-lg font-semibold text-white">Trending Up</h2>
          </div>
          <div className="space-y-2">
            {trendingUp.length === 0 ? (
              <p className="rounded-xl border border-dashed border-white/10 px-4 py-8 text-center text-sm text-zinc-500">
                No trend data yet. Run <code className="text-[#FFD700]">npm run sync</code> to
                populate prices.
              </p>
            ) : (
              trendingUp.map((card: Card) => (
                <TrendRow key={card.id} card={card} positive />
              ))
            )}
          </div>
        </section>

        <section>
          <div className="mb-4 flex items-center gap-2">
            <ArrowDownRight size={18} className="text-red-400" />
            <h2 className="text-lg font-semibold text-white">Trending Down</h2>
          </div>
          <div className="space-y-2">
            {trendingDown.length === 0 ? (
              <p className="rounded-xl border border-dashed border-white/10 px-4 py-8 text-center text-sm text-zinc-500">
                No trend data yet. Run <code className="text-[#FFD700]">npm run sync</code> to
                populate prices.
              </p>
            ) : (
              trendingDown.map((card: Card) => (
                <TrendRow key={card.id} card={card} positive={false} />
              ))
            )}
          </div>
        </section>
      </div>

      <section className="mb-12">
        <h2 className="mb-4 text-lg font-semibold text-white">Sealed Product Metrics</h2>
        <div className="grid gap-4 md:grid-cols-3">
          {sealed.length === 0 ? (
            <p className="col-span-full text-sm text-zinc-500">
              Booster box prices load live from CardDex.
            </p>
          ) : (
            sealed.map((product) => (
              <Link
                key={product.id}
                href={`/sealed/${encodeURIComponent(product.id)}`}
                className="rounded-2xl border border-white/8 bg-[#12151E] p-5 transition hover:border-[#FFD700]/35"
              >
                <p className="text-[10px] font-bold uppercase tracking-wider text-[#FFD700]">
                  {product.subtitle}
                </p>
                <h3 className="mt-2 text-sm font-semibold text-white">{product.name}</h3>
                <div className="mt-4 flex items-end justify-between">
                  <span className="text-lg font-bold text-white">
                    {formatZar(product.price)}
                  </span>
                  {product.pct != null && (
                    <span
                      className={`text-sm font-semibold ${
                        product.pct >= 0 ? "text-emerald-400" : "text-red-400"
                      }`}
                    >
                      {formatPct(product.pct)}
                    </span>
                  )}
                </div>
              </Link>
            ))
          )}
        </div>
      </section>

      <section>
        <div className="relative overflow-hidden rounded-3xl border border-white/8 bg-gradient-to-br from-[#151a28] via-[#12151E] to-[#0d1018] px-6 py-12 sm:px-10">
          <div className="absolute -right-8 -top-8 h-40 w-40 rounded-full bg-[#FFD700]/10 blur-3xl" />
          <span className="inline-flex rounded-full border border-[#FFD700]/40 bg-[#FFD700]/10 px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-[#FFD700]">
            Trainer Alerts
          </span>
          <h2
            className="mt-4 max-w-lg text-2xl font-bold text-white sm:text-3xl"
            style={{ fontFamily: "var(--font-syne), sans-serif" }}
          >
            Never miss a price drop again
          </h2>
          <p className="mt-3 max-w-xl text-sm leading-relaxed text-zinc-400">
            Premium members get price alerts, watchlists, and a full portfolio dashboard
            in ZAR — so you can buy the dip before the rest of the market catches on.
          </p>
          <Link
            href="/premium"
            className="mt-6 inline-flex rounded-lg bg-[#FFD700] px-6 py-3 text-sm font-semibold text-[#0B0E14] glow-yellow transition hover:brightness-105"
          >
            Unlock Premium Alerts
          </Link>
        </div>
      </section>
    </div>
  );
}
