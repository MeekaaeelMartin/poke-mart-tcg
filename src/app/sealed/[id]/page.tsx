import Link from "next/link";
import { notFound } from "next/navigation";
import { fetchSealed, fetchSealedById, sealedPriceZar } from "@/lib/carddex";
import { eurToZar, formatPct, formatZar } from "@/lib/format";
import { ArrowLeft } from "lucide-react";

export const dynamic = "force-dynamic";

type Props = { params: Promise<{ id: string }> };

export async function generateMetadata({ params }: Props) {
  const { id } = await params;
  try {
    const { data } = await fetchSealedById(id);
    return {
      title: data.name,
      description: `${data.product_type || "Sealed"} product — live ZAR pricing from CardDex`,
    };
  } catch {
    return { title: "Sealed product" };
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
    <div className="container-page py-10 pb-16">
      <Link
        href={product.set_id ? `/sets/${encodeURIComponent(product.set_id)}` : "/prices"}
        className="inline-flex items-center gap-2 text-sm text-zinc-400 transition hover:text-[#FFD700]"
      >
        <ArrowLeft size={16} />
        {product.set_id ? "Back to set" : "Back to prices"}
      </Link>

      <div className="mt-8 grid gap-10 lg:grid-cols-[minmax(0,420px)_1fr]">
        <div className="overflow-hidden rounded-3xl border border-white/8 bg-[#12151E] p-6">
          <div className="flex aspect-square items-center justify-center rounded-2xl bg-[#0B0E14] p-6">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={
                product.image_url ||
                product.source_image_url ||
                "/images/card-placeholder.svg"
              }
              alt={product.name}
              className="max-h-full max-w-full object-contain"
            />
          </div>
        </div>

        <div>
          <span className="inline-flex rounded-full border border-[#FFD700]/30 bg-[#FFD700]/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-wider text-[#FFD700]">
            {(product.product_type || "sealed").replace(/_/g, " ")}
          </span>
          <h1
            className="mt-4 text-3xl font-bold text-white sm:text-4xl"
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
              className="mt-2 inline-block text-sm font-medium text-[#FFD700] hover:underline"
            >
              View related set →
            </Link>
          )}

          <div className="mt-8 grid gap-3 sm:grid-cols-3">
            <div className="rounded-2xl border border-white/8 bg-[#12151E] p-4">
              <p className="text-[11px] uppercase tracking-wider text-zinc-500">Trend (ZAR)</p>
              <p className="mt-1 text-2xl font-bold text-[#FFD700]">{formatZar(trendZar)}</p>
            </div>
            <div className="rounded-2xl border border-white/8 bg-[#12151E] p-4">
              <p className="text-[11px] uppercase tracking-wider text-zinc-500">Average</p>
              <p className="mt-1 text-xl font-bold text-white">{formatZar(avgZar)}</p>
            </div>
            <div className="rounded-2xl border border-white/8 bg-[#12151E] p-4">
              <p className="text-[11px] uppercase tracking-wider text-zinc-500">Low</p>
              <p className="mt-1 text-xl font-bold text-white">{formatZar(lowZar)}</p>
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

          <div className="mt-8 rounded-2xl border border-white/8 bg-[#12151E] p-5">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-zinc-400">
              Product info
            </h2>
            <dl className="mt-4 space-y-3 text-sm">
              <div className="flex justify-between gap-4">
                <dt className="text-zinc-500">Product ID</dt>
                <dd className="font-mono text-zinc-200">{product.id}</dd>
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
                  <dt className="text-zinc-500">Price recorded</dt>
                  <dd className="text-white">
                    {new Date(price.recorded_at).toLocaleString("en-ZA")}
                  </dd>
                </div>
              )}
              {price?.currency && (
                <div className="flex justify-between gap-4">
                  <dt className="text-zinc-500">Source currency</dt>
                  <dd className="text-white">
                    {price.currency} (converted to ZAR @ site rate)
                  </dd>
                </div>
              )}
            </dl>
          </div>
        </div>
      </div>

      {related.length > 0 && (
        <section className="mt-14">
          <h2 className="text-xl font-bold text-white">Related sealed products</h2>
          <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {related.map((p) => (
              <Link
                key={p.id}
                href={`/sealed/${encodeURIComponent(p.id)}`}
                className="overflow-hidden rounded-2xl border border-white/8 bg-[#12151E] transition hover:border-[#FFD700]/35"
              >
                <div className="flex aspect-square items-center justify-center bg-[#0B0E14] p-4">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={p.image_url || p.source_image_url || "/images/card-placeholder.svg"}
                    alt={p.name}
                    className="max-h-full max-w-full object-contain"
                  />
                </div>
                <div className="p-4">
                  <h3 className="line-clamp-2 text-sm font-semibold text-white">{p.name}</h3>
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
