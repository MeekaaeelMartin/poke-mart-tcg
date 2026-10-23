import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  fetchCardById,
  fetchCardPriceHistory,
  normalizeCardPrices,
  type CardDexCard,
} from "@/lib/carddex";
import { eurToZar, formatPct, formatZar, rarityBadge } from "@/lib/format";
import { prisma } from "@/lib/db";
import { mediaUrl } from "@/lib/media";
import { mapCardHistoryRows } from "@/lib/priceHistory";
import { absoluteUrl, buildMetadata } from "@/lib/seo";
import { AddToCollection } from "@/components/AddToCollection";
import { PriceHistoryChart } from "@/components/PriceHistoryChart";
import { ProductJsonLd } from "@/components/JsonLd";
import { ArrowLeft } from "lucide-react";

export const dynamic = "force-dynamic";

type Props = { params: Promise<{ id: string }> };

function cardImage(card: CardDexCard) {
  return mediaUrl(
    card.images?.[0]?.large_url ||
      card.images?.[0]?.small_url ||
      card.image_url
  );
}

function pctFromPrices(row: ReturnType<typeof normalizeCardPrices>) {
  if (!row) return null;
  if (row.pct_change_1d != null) return row.pct_change_1d;
  if (row.price_change_1d != null && Math.abs(row.price_change_1d) < 500) return row.price_change_1d;
  if (row.pct_change_7d != null) return row.pct_change_7d;
  if (row.price_change_7d != null && Math.abs(row.price_change_7d) < 500) return row.price_change_7d;
  return null;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  try {
    const { data } = await fetchCardById(id, "images");
    const label = `${data.name}${data.number ? ` #${data.number}` : ""}`;
    const set = data.set_name || "Pokemon TCG";
    const rarity = data.rarity ? ` Rarity: ${data.rarity}.` : "";
    const row = normalizeCardPrices(data.prices);
    const zar = eurToZar(row?.trend_price ?? row?.avg_price ?? null);
    const priceBit =
      zar != null ? ` Current market guide: ${formatZar(zar)}.` : "";
    const img =
      data.images?.[0]?.large_url ||
      data.images?.[0]?.small_url ||
      data.image_url ||
      undefined;
    return buildMetadata({
      title: `${label} Price (ZAR) — ${set}`,
      description: `Live ${label} Pokemon card price in South African Rand from ${set}.${rarity} Includes price history chart, trend, average & low.${priceBit} Track on Poke Mart TCG.`,
      path: `/cards/${encodeURIComponent(id)}`,
      keywords: [
        `${data.name} card price`,
        `${data.name} Pokemon card value`,
        `${set} Pokemon cards`,
        "Pokemon card price chart",
        "Pokemon card price South Africa",
      ],
      image: img,
      imageAlt: `${label} Pokemon card`,
    });
  } catch {
    return buildMetadata({
      title: "Pokemon Card Price (ZAR)",
      description:
        "Live Pokemon TCG card price in South African Rand with price history chart.",
      path: `/cards/${encodeURIComponent(id)}`,
    });
  }
}

export default async function CardDetailPage({ params }: Props) {
  const { id } = await params;
  let card: CardDexCard;
  try {
    const res = await fetchCardById(id);
    card = res.data;
  } catch {
    const local = await prisma.card.findUnique({ where: { id } });
    if (!local) notFound();
    card = {
      id: local.id,
      set_id: local.setId,
      name: local.name,
      number: local.number,
      rarity: local.rarity,
      set_name: local.setName,
      set_code: local.setCode,
      image_url: local.imageSmall,
      images: [
        {
          small_url: local.imageSmall || undefined,
          large_url: local.imageLarge || undefined,
          thumb_url: local.imageThumb || undefined,
        },
      ],
      prices: local.priceEur
        ? { trend_price: local.priceEur, avg_7d: null, avg_30d: null }
        : undefined,
      types: local.types ? JSON.parse(local.types) : undefined,
      subtypes: local.subtypes ? JSON.parse(local.subtypes) : undefined,
      hp: local.hp,
      artist: local.artist,
      supertype: local.supertype,
    };
  }

  const priceRow = normalizeCardPrices(card.prices);
  const trendZar = eurToZar(priceRow?.trend_price ?? null);
  const avgZar = eurToZar(priceRow?.avg_price ?? null);
  const lowZar = eurToZar(priceRow?.low_price ?? null);
  const avg7Zar = eurToZar(priceRow?.avg_7d ?? null);
  const avg30Zar = eurToZar(priceRow?.avg_30d ?? null);
  const pct = pctFromPrices(priceRow);

  let historyPoints = mapCardHistoryRows([]);
  try {
    const hist = await fetchCardPriceHistory(id, 90);
    historyPoints = mapCardHistoryRows(hist.data || []);
  } catch {
    historyPoints = [];
  }

  return (
    <div className="container-page py-6 pb-24 sm:py-10 sm:pb-16">
      <ProductJsonLd
        name={`${card.name}${card.number ? ` #${card.number}` : ""}`}
        description={`${card.set_name || "Pokemon TCG"} card — live ZAR market price and history on Poke Mart TCG.`}
        image={cardImage(card)}
        url={absoluteUrl(`/cards/${encodeURIComponent(card.id)}`)}
        priceZar={trendZar}
        category={card.rarity || "Pokemon Trading Card"}
      />
      <Link
        href="/cards"
        className="inline-flex min-h-11 items-center gap-2 text-sm text-zinc-400 transition hover:text-[#FFD700]"
      >
        <ArrowLeft size={16} /> Back to card database
      </Link>

      <div className="mt-6 grid gap-8 lg:mt-8 lg:grid-cols-[minmax(0,380px)_1fr] lg:gap-10">
        <div className="space-y-4 lg:sticky lg:top-24 lg:self-start">
          <div className="overflow-hidden rounded-2xl border border-white/8 bg-[#12151E] p-3 shadow-[0_0_40px_rgba(255,215,0,0.06)] sm:rounded-3xl sm:p-4">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={cardImage(card)}
              alt={card.name}
              className="mx-auto w-full max-w-[280px] object-contain sm:max-w-sm"
            />
          </div>
          <AddToCollection cardId={card.id} cardName={card.name} />
        </div>

        <div>
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-md bg-[#FFD700] px-2 py-0.5 text-[11px] font-bold text-[#0B0E14]">
              {rarityBadge(card.rarity)}
            </span>
            {card.rarity && (
              <span className="rounded-full border border-white/10 px-2.5 py-0.5 text-[11px] text-zinc-300">
                {card.rarity}
              </span>
            )}
            {card.supertype && (
              <span className="rounded-full border border-white/10 px-2.5 py-0.5 text-[11px] text-zinc-300">
                {card.supertype}
              </span>
            )}
          </div>

          <h1
            className="mt-3 text-2xl font-bold tracking-tight text-white sm:text-3xl lg:text-4xl"
            style={{ fontFamily: "var(--font-syne), sans-serif" }}
          >
            {card.name}
            {card.number ? (
              <span className="text-zinc-500"> #{card.number}</span>
            ) : null}
          </h1>

          {card.set_id && (
            <Link
              href={`/sets/${encodeURIComponent(card.set_id)}`}
              className="mt-2 inline-block text-sm font-medium text-[#FFD700] hover:underline"
            >
              {card.set_name || card.set_id}
              {card.set_code ? ` (${card.set_code})` : ""} →
            </Link>
          )}

          {/* Price panel */}
          <div className="mt-6 grid grid-cols-2 gap-2.5 sm:gap-3 lg:grid-cols-4">
            {[
              { label: "Trend (ZAR)", value: formatZar(trendZar), accent: true },
              { label: "Average", value: formatZar(avgZar) },
              { label: "Low", value: formatZar(lowZar) },
              {
                label: "24h change",
                value: pct != null ? formatPct(pct) : "—",
                up: (pct ?? 0) >= 0,
              },
            ].map((s) => (
              <div
                key={s.label}
                className="rounded-2xl border border-white/8 bg-[#12151E] p-3 sm:p-4"
              >
                <p className="text-[10px] uppercase tracking-wider text-zinc-500 sm:text-[11px]">
                  {s.label}
                </p>
                <p
                  className={`mt-1 text-base font-bold sm:text-lg ${
                    s.accent
                      ? "text-[#FFD700]"
                      : s.up === true
                        ? "text-emerald-400"
                        : s.up === false
                          ? "text-red-400"
                          : "text-white"
                  }`}
                >
                  {s.value}
                </p>
              </div>
            ))}
          </div>

          <div className="mt-3 grid grid-cols-2 gap-2.5 sm:gap-3">
            <div className="rounded-2xl border border-white/8 bg-[#12151E] p-3 sm:p-4">
              <p className="text-[10px] uppercase tracking-wider text-zinc-500 sm:text-[11px]">
                7-day avg
              </p>
              <p className="mt-1 text-sm font-semibold text-white sm:text-base">
                {formatZar(avg7Zar)}
              </p>
            </div>
            <div className="rounded-2xl border border-white/8 bg-[#12151E] p-3 sm:p-4">
              <p className="text-[10px] uppercase tracking-wider text-zinc-500 sm:text-[11px]">
                30-day avg
              </p>
              <p className="mt-1 text-sm font-semibold text-white sm:text-base">
                {formatZar(avg30Zar)}
              </p>
            </div>
          </div>

          <div className="mt-6">
            <PriceHistoryChart
              points={historyPoints}
              title="Price history (ZAR)"
              subtitle="Daily CardDex trend — drag or tap to inspect"
            />
          </div>

          {/* Specs */}
          <div className="mt-8 rounded-2xl border border-white/8 bg-[#12151E] p-5">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-zinc-400">
              Card details
            </h2>
            <dl className="mt-4 grid gap-3 sm:grid-cols-2">
              {[
                { k: "HP", v: card.hp?.toString() },
                { k: "Types", v: card.types?.join(", ") },
                { k: "Subtypes", v: card.subtypes?.join(", ") },
                { k: "Artist", v: card.artist },
                { k: "Evolves from", v: card.evolves_from },
                {
                  k: "Retreat",
                  v: card.retreat_cost != null ? String(card.retreat_cost) : null,
                },
              ]
                .filter((x) => x.v)
                .map((row) => (
                  <div key={row.k}>
                    <dt className="text-xs text-zinc-500">{row.k}</dt>
                    <dd className="text-sm text-white">{row.v}</dd>
                  </div>
                ))}
            </dl>
            {card.flavor_text && (
              <p className="mt-4 border-t border-white/5 pt-4 text-sm italic text-zinc-400">
                {card.flavor_text}
              </p>
            )}
          </div>

          {/* Abilities */}
          {card.abilities && card.abilities.length > 0 && (
            <div className="mt-6 space-y-3">
              <h2 className="text-sm font-semibold uppercase tracking-wider text-zinc-400">
                Abilities
              </h2>
              {card.abilities.map((a) => (
                <div
                  key={`${a.name}-${a.type}`}
                  className="rounded-2xl border border-violet-500/20 bg-violet-500/5 p-4"
                >
                  <div className="flex items-center gap-2">
                    <p className="font-semibold text-white">{a.name}</p>
                    {a.type && (
                      <span className="text-[10px] uppercase text-violet-300">{a.type}</span>
                    )}
                  </div>
                  {a.text && <p className="mt-2 text-sm text-zinc-400">{a.text}</p>}
                </div>
              ))}
            </div>
          )}

          {/* Attacks */}
          {card.attacks && card.attacks.length > 0 && (
            <div className="mt-6 space-y-3">
              <h2 className="text-sm font-semibold uppercase tracking-wider text-zinc-400">
                Attacks
              </h2>
              {card.attacks.map((a) => (
                <div
                  key={a.name}
                  className="rounded-2xl border border-white/8 bg-[#12151E] p-4"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div>
                      <p className="font-semibold text-white">{a.name}</p>
                      {a.cost && a.cost.length > 0 && (
                        <p className="mt-1 text-xs text-zinc-500">Cost: {a.cost.join(" · ")}</p>
                      )}
                    </div>
                    {a.damage && (
                      <span className="text-lg font-bold text-[#FFD700]">{a.damage}</span>
                    )}
                  </div>
                  {a.text && <p className="mt-2 text-sm text-zinc-400">{a.text}</p>}
                </div>
              ))}
            </div>
          )}

          {/* Weak / Resist */}
          <div className="mt-6 grid gap-3 sm:grid-cols-2">
            {card.weaknesses && card.weaknesses.length > 0 && (
              <div className="rounded-2xl border border-red-500/20 bg-red-500/5 p-4">
                <p className="text-xs uppercase tracking-wider text-red-300">Weaknesses</p>
                <p className="mt-2 text-sm text-white">
                  {card.weaknesses.map((w) => `${w.type} ${w.value || ""}`).join(", ")}
                </p>
              </div>
            )}
            {card.resistances && card.resistances.length > 0 && (
              <div className="rounded-2xl border border-sky-500/20 bg-sky-500/5 p-4">
                <p className="text-xs uppercase tracking-wider text-sky-300">Resistances</p>
                <p className="mt-2 text-sm text-white">
                  {card.resistances.map((w) => `${w.type} ${w.value || ""}`).join(", ")}
                </p>
              </div>
            )}
          </div>

          {card.cardmarket_url && (
            <a
              href={card.cardmarket_url}
              target="_blank"
              rel="noreferrer"
              className="mt-6 inline-flex text-sm text-zinc-400 hover:text-[#FFD700]"
            >
              View on Cardmarket →
            </a>
          )}
        </div>
      </div>
    </div>
  );
}
