import Link from "next/link";
import { formatPct, formatZar, rarityBadge } from "@/lib/format";
import { mediaUrl } from "@/lib/media";

type CardLike = {
  id: string;
  name: string;
  number?: string | null;
  setName?: string | null;
  rarity?: string | null;
  imageSmall?: string | null;
  imageLarge?: string | null;
  priceZar?: number | null;
  pctChange1d?: number | null;
  pctChange7d?: number | null;
};

export function PriceBadge({ pct, hasPrice }: { pct?: number | null; hasPrice?: boolean }) {
  if (hasPrice === false) {
    return (
      <span className="inline-flex items-center rounded-full bg-white/5 px-2 py-0.5 text-xs font-semibold text-zinc-500">
        —
      </span>
    );
  }
  const value = pct ?? 0;
  const up = value >= 0;
  return (
    <span
      className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-semibold ${
        up ? "bg-emerald-500/15 text-emerald-400" : "bg-red-500/15 text-red-400"
      }`}
    >
      {formatPct(value)}
    </span>
  );
}

export function CardTile({
  card,
  showRarity = true,
}: {
  card: CardLike;
  showRarity?: boolean;
}) {
  const pct = card.pctChange1d ?? card.pctChange7d;
  const img = mediaUrl(card.imageSmall || card.imageLarge);

  return (
    <Link
      href={`/cards/${encodeURIComponent(card.id)}`}
      className="group overflow-hidden rounded-2xl border border-white/8 bg-[#12151E] transition hover:border-[#FFD700]/35 hover:shadow-[0_0_30px_rgba(255,215,0,0.08)]"
    >
      <div className="relative aspect-[3/4] overflow-hidden bg-[#0B0E14]">
        {showRarity && (
          <span className="absolute left-3 top-3 z-10 rounded-md bg-[#FFD700] px-2 py-0.5 text-[10px] font-bold text-[#0B0E14]">
            {rarityBadge(card.rarity)}
          </span>
        )}
        {card.setName && (
          <span className="absolute right-3 top-3 z-10 max-w-[55%] truncate rounded-md bg-black/55 px-2 py-0.5 text-[10px] text-zinc-200 backdrop-blur">
            {card.setName}
          </span>
        )}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={img}
          alt={card.name}
          className="h-full w-full object-contain p-3 transition duration-300 group-hover:scale-[1.03]"
          loading="lazy"
        />
      </div>
      <div className="space-y-1.5 p-4">
        <h3 className="truncate text-sm font-semibold text-white">
          {card.name}
          {card.number ? ` #${card.number}` : ""}
        </h3>
        <p className="truncate text-xs text-zinc-500">{card.setName || "Unknown set"}</p>
        <div className="flex items-center justify-between gap-2 pt-1">
          <span
            className={`text-sm font-bold ${
              card.priceZar == null ? "text-zinc-500" : "text-white"
            }`}
          >
            {formatZar(card.priceZar)}
          </span>
          <PriceBadge pct={pct} hasPrice={card.priceZar != null} />
        </div>
      </div>
    </Link>
  );
}

export function TrendRow({
  card,
  positive,
}: {
  card: CardLike;
  positive?: boolean;
}) {
  const pct = card.pctChange1d ?? card.pctChange7d ?? 0;
  return (
    <Link
      href={`/cards/${encodeURIComponent(card.id)}`}
      className="flex items-center gap-3 rounded-xl border border-white/5 bg-[#12151E]/80 px-3 py-2.5 transition hover:border-[#FFD700]/30"
    >
      <div className="h-12 w-10 shrink-0 overflow-hidden rounded-md bg-[#0B0E14]">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={mediaUrl(card.imageSmall || card.imageLarge)}
          alt={card.name}
          className="h-full w-full object-cover"
          loading="lazy"
        />
      </div>
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium text-white">
          {card.name}
          {card.number ? ` #${card.number}` : ""}
        </p>
        <p className="truncate text-xs text-zinc-500">{card.setName}</p>
      </div>
      <div className="text-right">
        <p className="text-sm font-semibold text-white">{formatZar(card.priceZar)}</p>
        <p className={`text-xs font-semibold ${positive ?? pct >= 0 ? "text-emerald-400" : "text-red-400"}`}>
          {formatPct(pct)}
        </p>
      </div>
    </Link>
  );
}

export function SectionHeading({
  title,
  subtitle,
  action,
}: {
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="mb-8 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <h2 className="text-2xl font-bold tracking-tight text-white sm:text-3xl">{title}</h2>
        {subtitle && <p className="mt-1 text-sm text-zinc-400">{subtitle}</p>}
      </div>
      {action}
    </div>
  );
}

export function EmptyState({ message }: { message: string }) {
  return (
    <div className="rounded-2xl border border-dashed border-white/10 bg-[#12151E]/50 px-6 py-16 text-center text-sm text-zinc-400">
      {message}
    </div>
  );
}
