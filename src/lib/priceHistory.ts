import { eurToZar } from "./format";
import type { CardDexSealed } from "./carddex";
import type { HistoryPoint } from "@/components/PriceHistoryChart";

export function mapCardHistoryRows(
  rows: Array<{
    date: string;
    trend_price?: number | null;
    avg_price?: number | null;
    low_price?: number | null;
  }>
): HistoryPoint[] {
  return rows
    .map((h) => ({
      date: h.date,
      trendZar: eurToZar(h.trend_price ?? null),
      avgZar: eurToZar(h.avg_price ?? null),
      lowZar: eurToZar(h.low_price ?? null),
    }))
    .filter((h) => h.trendZar != null)
    .sort((a, b) => a.date.localeCompare(b.date));
}

/** Normalize sealed history rows (API field names vary) into chart points. */
export function mapSealedHistoryRows(
  rows: Array<{
    date: string;
    trend_price?: number | null;
    trend?: number | null;
    avg_price?: number | null;
    avg?: number | null;
    low_price?: number | null;
    low?: number | null;
  }>
): HistoryPoint[] {
  return rows
    .map((h) => ({
      date: h.date,
      trendZar: eurToZar(h.trend_price ?? h.trend ?? null),
      avgZar: eurToZar(h.avg_price ?? h.avg ?? null),
      lowZar: eurToZar(h.low_price ?? h.low ?? null),
    }))
    .filter((h) => h.trendZar != null)
    .sort((a, b) => a.date.localeCompare(b.date));
}

/** Build labeled snapshot points from sealed latest_price averages when daily history is unavailable. */
export function sealedSnapshotHistory(product: CardDexSealed): HistoryPoint[] {
  const lp = product.latest_price;
  if (!lp) return [];

  const now = new Date();
  const mk = (
    daysAgo: number,
    eur: number | null | undefined,
    label: string
  ): HistoryPoint | null => {
    if (eur == null || Number.isNaN(eur)) return null;
    const trendZar = eurToZar(eur);
    if (trendZar == null) return null;
    const d = new Date(now);
    d.setDate(d.getDate() - daysAgo);
    return {
      date: `${d.toISOString().slice(0, 10)} (${label})`,
      trendZar,
      avgZar: eurToZar(eur),
      lowZar: eurToZar(lp.low ?? null),
    };
  };

  return [
    mk(30, lp.avg_30d ?? lp.avg ?? null, "30d avg"),
    mk(7, lp.avg_7d ?? null, "7d avg"),
    mk(1, lp.avg_1d ?? null, "1d avg"),
    mk(0, lp.trend ?? lp.avg ?? null, "trend"),
  ].filter((p): p is HistoryPoint => p != null);
}
