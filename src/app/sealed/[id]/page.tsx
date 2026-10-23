import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  fetchSealed,
  fetchSealedById,
  fetchSealedPriceHistory,
  sealedPriceZar,
} from "@/lib/carddex";
import { eurToZar, formatPct, formatZar } from "@/lib/format";
import { mediaUrl } from "@/lib/media";
import { mapSealedHistoryRows, sealedSnapshotHistory } from "@/lib/priceHistory";
import { absoluteUrl, buildMetadata } from "@/lib/seo";
import { PriceHistoryChart } from "@/components/PriceHistoryChart";
import { ProductJsonLd } from "@/components/JsonLd";
import { ArrowLeft } from "lucide-react";

export const dynamic = "force-dynamic";

type Props = { params: Promise<{ id: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  try {
    const { data } = await fetchSealedById(id);
    const type = (data.product_type || "sealed").replace(/_/g, " ");
    const zar = sealedPriceZar(data);
    const priceBit = zar != null ? ` Guide price: ${formatZar(zar)}.` : "";
    return buildMetadata({
      title: `${data.name} Price (ZAR) — Pokemon ${type}`,
      description: `Live ${data.name} sealed Pokemon TCG product price in South African Rand (${type}). Includes price history graph and Cardmarket-backed averages.${priceBit}`,
      path: `/sealed/${encodeURIComponent(id)}`,
      keywords: [
        "Pokemon ETB price",
        "Elite Trainer Box price South Africa",
        "Pokemon booster box price ZAR",
        "Pokemon sealed product price",
        `${data.name} price`,
        type,
      ],
      image: data.image_url || data.source_image_url || undefined,
      imageAlt: data.name,
    });
  } catch {
    return buildMetadata({
      title: "Pokemon Sealed Product Price (ZAR)",
      description:
        "Live Pokemon ETB, booster box & sealed product prices in South African Rand with price charts.",
      path: `/sealed/${encodeURIComponent(id)}`,
    });
  }
}

export default async function SealedDetailPage({ params }: Props) {
  const { id } = await params;
  let product;
  try {
    product = (await fetchSealedById(id)).data;
  } catch {
    notFound();
  }

  const price = product.latest_price;
  const trendZar = sealedPriceZar(product);
  const avgZar = eurToZar(price?.avg ?? null);
  const lowZar = eurToZar(price?.low ?? null);
  const change =
    price?.price_change_7d ?? price?.price_change_1d ?? price?.price_change_30d ?? null;

  let historyPoints = sealedSnapshotHistory(product);
  let snapshotMode = true;
  try {
    const hist = await fetchSealedPriceHistory(id, 90);
    const mapped = mapSealedHistoryRows(hist.data || []);
    if (mapped.length >= 2) {
      historyPoints = mapped;
      snapshotMode = false;
    }
  } catch {
    // CardDex often 404s sealed daily history — keep snapshot chart
  }

  let related: typeof product[] = [];
  try {
    const res = await fetchSealed({
      type: product.product_type || undefined,
      set_id: product.set_id || undefined,
      pageSize: 5,
    });
    related = (res.data || []).filter((p) => p.id !== product.id).slice(0, 4);
  } catch {
    related = [];
  }

  return (
    <div className="container-page py-6 pb-24 sm:py-10 sm:pb-16">
      <ProductJsonLd
        name={product.name}
        description={`${(product.product_type || "sealed").replace(/_/g, " ")} — live ZAR sealed Pokemon TCG price and chart on Poke Mart TCG.`}
        image={mediaUrl(product.image_url || product.source_image_url)}
        url={absoluteUrl(`/sealed/${encodeURIComponent(product.id)}`)}
        priceZar={trendZar}
        category={product.product_type || "Pokemon Sealed Product"}
      />
      <Link
        href={product.set_id ? `/sets/${encodeURIComponent(product.set_id)}` : "/prices"}
        className="inline-flex min-h-11 items-center gap-2 text-sm text-zinc-400 transition hover:text-[#FFD700]"
      >
        <ArrowLeft size={16} />
        {product.set_id ? "Back to set" : "Back to prices"}
      </Link>

      <div className="mt-6 grid gap-8 lg:mt-8 lg:grid-cols-[minmax(0,420px)_1fr] lg:gap-10">
        <div className="overflow-hidden rounded-2xl border border-white/8 bg-[#12151E] p-4 sm:rounded-3xl sm:p-6 lg:sticky lg:top-24 lg:self-start">
          <div className="flex aspect-square items-center justify-center rounded-2xl bg-[#0B0E14] p-4 sm:p-6">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={mediaUrl(product.image_url || product.source_image_url)}
              alt={product.name}
              className="max-h-full max-w-full object-contain"
            />
          </div>
        </div>

        <div className="min-w-0">
          <span className="inline-flex rounded-full border border-[#FFD700]/30 bg-[#FFD700]/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-wider text-[#FFD700]">
            {(product.product_type || "sealed").replace(/_/g, " ")}
          </span>
          <h1
            className="mt-4 text-2xl font-bold text-white sm:text-3xl lg:text-4xl"
            style={{ fontFamily: "var(--font-syne), sans-serif" }}
          >
            {product.name}
          </h1>
          {product.cardmarket_expansion && (
            <p className="mt-2 text-sm text-zinc-400">{product.cardmarket_expansion}</p>
          )}
          {product.set_id && (
            <Link
              href={`/sets/${encodeURIComponent(product.set_id)}`}
              className="mt-2 inline-flex min-h-11 items-center text-sm font-medium text-[#FFD700] hover:underline"
            >
              View related set →
            </Link>
          )}

          <div className="mt-6 grid grid-cols-2 gap-2.5 sm:mt-8 sm:grid-cols-3 sm:gap-3">
            <div className="col-span-2 rounded-2xl border border-white/8 bg-[#12151E] p-3 sm:col-span-1 sm:p-4">
              <p className="text-[10px] uppercase tracking-wider text-zinc-500 sm:text-[11px]">
                Trend (ZAR)
              </p>
              <p className="mt-1 text-xl font-bold text-[#FFD700] sm:text-2xl">
                {formatZar(trendZar)}
              </p>
            </div>
            <div className="rounded-2xl border border-white/8 bg-[#12151E] p-3 sm:p-4">
              <p className="text-[10px] uppercase tracking-wider text-zinc-500 sm:text-[11px]">
                Average
              </p>
              <p className="mt-1 text-lg font-bold text-white sm:text-xl">
                {formatZar(avgZar)}
              </p>
            </div>
            <div className="rounded-2xl border border-white/8 bg-[#12151E] p-3 sm:p-4">
              <p className="text-[10px] uppercase tracking-wider text-zinc-500 sm:text-[11px]">
                Low
              </p>
              <p className="mt-1 text-lg font-bold text-white sm:text-xl">
                {formatZar(lowZar)}
              </p>
            </div>
          </div>

          {change != null && (
            <p
              className={`mt-4 text-sm font-semibold ${
                change >= 0 ? "text-emerald-400" : "text-red-400"
              }`}
            >
              Recent move: {formatPct(change)}
            </p>
          )}

          <div className="mt-6">
            <PriceHistoryChart
              points={historyPoints}
              title="Price history (ZAR)"
              subtitle={
                snapshotMode
                  ? "CardDex averages over time — tap points to inspect"
                  : "Daily CardDex trend — drag or tap to inspect"
              }
              snapshotMode={snapshotMode}
            />
          </div>

          <div className="mt-6 rounded-2xl border border-white/8 bg-[#12151E] p-4 sm:mt-8 sm:p-5">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-zinc-400">
              Product info
            </h2>
            <dl className="mt-4 space-y-3 text-sm">
              <div className="flex justify-between gap-4">
                <dt className="text-zinc-500">Product ID</dt>
                <dd className="break-all font-mono text-zinc-200">{product.id}</dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-zinc-500">Type</dt>
                <dd className="text-white capitalize">
                  {(product.product_type || "—").replace(/_/g, " ")}
                </dd>
              </div>
              {product.cardmarket_id && (
                <div className="flex justify-between gap-4">
                  <dt className="text-zinc-500">Cardmarket ID</dt>
                  <dd className="text-white">{product.cardmarket_id}</dd>
                </div>
              )}
              {price?.recorded_at && (
                <div className="flex justify-between gap-4">
                  <dt className="shrink-0 text-zinc-500">Price recorded</dt>
                  <dd className="text-right text-white">
                    {new Date(price.recorded_at).toLocaleString("en-ZA")}
                  </dd>
                </div>
              )}
              {price?.currency && (
                <div className="flex justify-between gap-4">
                  <dt className="text-zinc-500">Source currency</dt>
                  <dd className="text-right text-white">
                    {price.currency} (converted to ZAR @ site rate)
                  </dd>
                </div>
              )}
            </dl>
          </div>
        </div>
      </div>

      {related.length > 0 && (
        <section className="mt-10 sm:mt-14">
          <h2 className="text-lg font-bold text-white sm:text-xl">Related sealed products</h2>
          <div className="mt-5 grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
            {related.map((p) => (
              <Link
                key={p.id}
                href={`/sealed/${encodeURIComponent(p.id)}`}
                className="overflow-hidden rounded-2xl border border-white/8 bg-[#12151E] transition hover:border-[#FFD700]/35"
              >
                <div className="flex aspect-square items-center justify-center bg-[#0B0E14] p-3 sm:p-4">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={mediaUrl(p.image_url || p.source_image_url)}
                    alt={p.name}
                    className="max-h-full max-w-full object-contain"
                  />
                </div>
                <div className="p-3 sm:p-4">
                  <h3 className="line-clamp-2 text-xs font-semibold text-white sm:text-sm">
                    {p.name}
                  </h3>
                  <p className="mt-2 text-sm font-bold">{formatZar(sealedPriceZar(p))}</p>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
