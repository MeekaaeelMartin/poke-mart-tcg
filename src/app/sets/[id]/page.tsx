import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  fetchAllPages,
  fetchCards,
  fetchSetById,
  normalizeCardPrices,
  sealedPriceZar,
  type CardDexCard,
} from "@/lib/carddex";
import { loadSealedCatalog } from "@/lib/sealedCatalog";
import { eurToZar, formatZar } from "@/lib/format";
import { mediaUrl } from "@/lib/media";
import { buildMetadata } from "@/lib/seo";
import { CardTile } from "@/components/CardUI";
import { prisma } from "@/lib/db";
import { ArrowLeft } from "lucide-react";

export const dynamic = "force-dynamic";

type Props = { params: Promise<{ id: string }> };

function toTile(card: CardDexCard) {
  const price = normalizeCardPrices(card.prices);
  return {
    id: card.id,
    name: card.name,
    number: card.number,
    setName: card.set_name,
    rarity: card.rarity,
    imageSmall: card.images?.[0]?.small_url || card.image_url,
    imageLarge: card.images?.[0]?.large_url,
    priceZar: eurToZar(price?.trend_price ?? price?.avg_price ?? null),
    pctChange1d: price?.pct_change_1d ?? price?.price_change_1d ?? null,
    pctChange7d: price?.pct_change_7d ?? price?.price_change_7d ?? null,
  };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  try {
    const { data } = await fetchSetById(id);
    const count = data.total_cards || data.official_cards || "?";
    const series = data.series || "Pokemon TCG";
    return buildMetadata({
      title: `${data.name} Set Checklist & Card Prices (ZAR)`,
      description: `${data.name} Pokemon TCG set (${series}) — ${count} cards with live South African Rand prices, sealed ETB links, and set checklist. Browse every print on Poke Mart TCG.`,
      path: `/sets/${encodeURIComponent(id)}`,
      keywords: [
        `${data.name} Pokemon set`,
        `${data.name} checklist`,
        `${data.name} card list`,
        "Pokemon set prices South Africa",
        "Pokemon expansion checklist",
      ],
      image: data.logo_url || undefined,
      imageAlt: `${data.name} set logo`,
    });
  } catch {
    return buildMetadata({
      title: "Pokemon TCG Set Checklist & Prices",
      description:
        "Pokemon TCG set checklist with live ZAR card prices and sealed product links.",
      path: `/sets/${encodeURIComponent(id)}`,
    });
  }
}

export default async function SetDetailPage({ params }: Props) {
  const { id } = await params;

  let set = null as Awaited<ReturnType<typeof fetchSetById>>["data"] | null;
  try {
    set = (await fetchSetById(id)).data;
  } catch {
    const local = await prisma.set.findUnique({ where: { id } });
    if (!local) notFound();
    set = {
      id: local.id,
      name: local.name,
      series: local.series,
      release_date: local.releaseDate,
      official_cards: local.officialCards,
      total_cards: local.totalCards,
      logo_url: local.logoUrl,
      symbol_url: local.symbolUrl,
      set_code: local.setCode,
    };
  }

  // Use /v1/cards?set=…&include=images,prices — set /cards endpoint omits embeds
  let cards: CardDexCard[] = [];
  let totalCards = 0;
  try {
    cards = await fetchAllPages<CardDexCard>(
      (page, pageSize) =>
        fetchCards({
          set: id,
          page,
          pageSize,
          include: "images,prices",
        }),
      { pageSize: 50, maxPages: 20 }
    );
    totalCards = cards.length;
  } catch {
    const localCards = await prisma.card.findMany({
      where: { setId: id },
      orderBy: { name: "asc" },
    });
    cards = localCards.map((c) => ({
      id: c.id,
      set_id: c.setId,
      name: c.name,
      number: c.number,
      rarity: c.rarity,
      set_name: c.setName,
      image_url: c.imageSmall,
      images: [{ small_url: c.imageSmall || undefined, large_url: c.imageLarge || undefined }],
      prices: c.priceEur ? { trend_price: c.priceEur } : undefined,
    }));
    totalCards = localCards.length;
  }

  let sealed: Awaited<ReturnType<typeof loadSealedCatalog>> = [];
  try {
    sealed = await loadSealedCatalog({ setId: id, pageSize: 50, maxPages: 4, limit: 24 });
  } catch {
    sealed = [];
  }

  const release = set.release_date
    ? new Date(set.release_date).toLocaleDateString("en-ZA", {
        day: "numeric",
        month: "long",
        year: "numeric",
      })
    : "TBA";

  return (
    <div className="container-page py-10 pb-16">
      <Link
        href="/sets"
        className="inline-flex items-center gap-2 text-sm text-zinc-400 transition hover:text-[#FFD700]"
      >
        <ArrowLeft size={16} /> Back to sets
      </Link>

      <div className="mt-8 overflow-hidden rounded-3xl border border-white/8 bg-[#12151E]">
        <div className="grid gap-6 p-6 md:grid-cols-[220px_1fr] md:p-8">
          <div className="flex aspect-square items-center justify-center rounded-2xl bg-[#0B0E14] p-6">
            {set.logo_url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={mediaUrl(set.logo_url)} alt={set.name} className="max-h-full max-w-full object-contain" />
            ) : (
              <span className="text-3xl font-bold text-white/20">
                {set.set_code || set.id.slice(0, 4).toUpperCase()}
              </span>
            )}
          </div>
          <div>
            {set.series && (
              <span className="inline-flex rounded-full border border-[#FFD700]/30 bg-[#FFD700]/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-wider text-[#FFD700]">
                {set.series}
              </span>
            )}
            <h1
              className="mt-3 text-3xl font-bold text-white sm:text-4xl"
              style={{ fontFamily: "var(--font-syne), sans-serif" }}
            >
              {set.name}
            </h1>
            <dl className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
              <div>
                <dt className="text-xs text-zinc-500">Set code</dt>
                <dd className="text-sm font-semibold text-white">{set.set_code || set.id}</dd>
              </div>
              <div>
                <dt className="text-xs text-zinc-500">Release</dt>
                <dd className="text-sm font-semibold text-white">{release}</dd>
              </div>
              <div>
                <dt className="text-xs text-zinc-500">Official cards</dt>
                <dd className="text-sm font-semibold text-white">
                  {set.official_cards ?? "—"}
                </dd>
              </div>
              <div>
                <dt className="text-xs text-zinc-500">Total prints</dt>
                <dd className="text-sm font-semibold text-white">{set.total_cards ?? "—"}</dd>
              </div>
            </dl>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link
                href={`/cards?set=${encodeURIComponent(set.id)}`}
                className="rounded-lg bg-[#FFD700] px-4 py-2 text-sm font-semibold text-[#0B0E14]"
              >
                Browse in database
              </Link>
              {set.symbol_url && (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={mediaUrl(set.symbol_url)} alt="" className="h-9 w-9 object-contain opacity-80" />
              )}
            </div>
          </div>
        </div>
      </div>

      {sealed.length > 0 && (
        <section className="mt-12">
          <h2 className="text-xl font-bold text-white">Sealed products</h2>
          <p className="mt-1 text-sm text-zinc-500">
            ETBs, booster boxes, and collections for this set (CardDex).
          </p>
          <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {sealed.map((p) => (
              <Link
                key={p.id}
                href={`/sealed/${encodeURIComponent(p.id)}`}
                className="overflow-hidden rounded-2xl border border-white/8 bg-[#12151E] transition hover:border-[#FFD700]/35"
              >
                <div className="flex aspect-square items-center justify-center bg-[#0B0E14] p-4">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={mediaUrl(p.image_url || p.source_image_url)}
                    alt={p.name}
                    className="max-h-full max-w-full object-contain"
                  />
                </div>
                <div className="p-4">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-[#FFD700]">
                    {(p.product_type || "sealed").replace(/_/g, " ")}
                  </p>
                  <h3 className="mt-1 line-clamp-2 text-sm font-semibold text-white">{p.name}</h3>
                  <p className="mt-2 text-sm font-bold text-white">{formatZar(sealedPriceZar(p))}</p>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      <section className="mt-12">
        <div className="mb-5 flex items-end justify-between gap-3">
          <div>
            <h2 className="text-xl font-bold text-white">Cards in this set</h2>
            <p className="text-sm text-zinc-500">{totalCards} cards from CardDex</p>
          </div>
        </div>
        {cards.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-white/10 px-6 py-16 text-center text-sm text-zinc-500">
            No cards loaded for this set yet.
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
            {cards.map((c) => (
              <CardTile key={c.id} card={toTile(c)} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
