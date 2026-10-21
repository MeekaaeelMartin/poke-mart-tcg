import { eurToZar } from "./format";

const BASE = process.env.CARDDEX_BASE_URL || "https://api.carddex.dev";

function headers(): HeadersInit {
  const h: HeadersInit = { Accept: "application/json" };
  const key = process.env.CARDDEX_API_KEY;
  if (key && !key.includes("YOUR_KEY")) {
    h["X-API-Key"] = key;
  }
  return h;
}

async function carddexFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    ...init,
    headers: { ...headers(), ...(init?.headers || {}) },
    next: { revalidate: 0 },
  });
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`CardDex ${res.status}: ${text || res.statusText}`);
  }
  return res.json() as Promise<T>;
}

export type CardDexPriceRow = {
  id?: number;
  card_id?: string;
  source?: string;
  currency?: string;
  trend_price?: number | null;
  avg_price?: number | null;
  low_price?: number | null;
  avg_1d?: number | null;
  avg_7d?: number | null;
  avg_30d?: number | null;
  price_change_1d?: number | null;
  price_change_7d?: number | null;
  price_change_30d?: number | null;
  pct_change_1d?: number | null;
  pct_change_7d?: number | null;
  pct_change_30d?: number | null;
  recorded_at?: string | null;
};

export type CardDexCard = {
  id: string;
  set_id: string;
  name: string;
  number?: string | null;
  supertype?: string | null;
  subtypes?: string[] | null;
  hp?: number | null;
  types?: string[] | null;
  rarity?: string | null;
  artist?: string | null;
  set_name?: string | null;
  set_code?: string | null;
  image_url?: string | null;
  flavor_text?: string | null;
  rules?: string[] | string | null;
  evolves_from?: string | null;
  evolves_to?: string[] | string | null;
  retreat_cost?: number | null;
  legalities?: Record<string, boolean | string> | null;
  cardmarket_url?: string | null;
  images?: Array<{
    thumb_url?: string;
    small_url?: string;
    large_url?: string;
  }>;
  prices?:
    | {
        trend?: number;
        avg_7d?: number;
        avg_30d?: number;
      }
    | CardDexPriceRow
    | CardDexPriceRow[];
  attacks?: Array<{
    name: string;
    cost?: string[];
    damage?: string | null;
    text?: string | null;
  }>;
  abilities?: Array<{
    name: string;
    text?: string | null;
    type?: string | null;
  }>;
  weaknesses?: Array<{ type: string; value?: string | null }>;
  resistances?: Array<{ type: string; value?: string | null }>;
  variants?: Array<{
    id: string;
    variant_type?: string | null;
    rarity?: string | null;
  }>;
};

export type CardDexSet = {
  id: string;
  name: string;
  series?: string | null;
  release_date?: string | null;
  official_cards?: number | null;
  total_cards?: number | null;
  logo_url?: string | null;
  symbol_url?: string | null;
  set_code?: string | null;
};

export type CardDexPrice = {
  card_id: string;
  card_name?: string;
  number?: string;
  set_id?: string;
  rarity?: string;
  image_thumb?: string;
  image_small?: string;
  image_large?: string;
  trend_price?: number;
  avg_price?: number;
  avg_7d?: number;
  avg_30d?: number;
  pct_change_1d?: number;
  pct_change_7d?: number;
  pct_change_30d?: number;
  currency?: string;
};

export type CardDexSealed = {
  id: string;
  set_id?: string | null;
  name: string;
  product_type?: string | null;
  cardmarket_id?: number | null;
  cardmarket_expansion?: string | null;
  image_url?: string | null;
  source_image_url?: string | null;
  latest_price?: {
    source?: string;
    currency?: string;
    trend?: number | null;
    avg?: number | null;
    low?: number | null;
    avg_1d?: number | null;
    avg_7d?: number | null;
    avg_30d?: number | null;
    price_change_1d?: number | null;
    price_change_7d?: number | null;
    price_change_30d?: number | null;
    recorded_at?: string | null;
  } | null;
};

export type ListMeta = { total: number; page: number; pageSize: number; totalPages: number };

export async function fetchCards(params: Record<string, string | number | undefined> = {}) {
  const sp = new URLSearchParams();
  Object.entries(params).forEach(([k, v]) => {
    if (v !== undefined && v !== "") sp.set(k, String(v));
  });
  if (!sp.has("pageSize")) sp.set("pageSize", "50");
  return carddexFetch<{ data: CardDexCard[]; meta: ListMeta }>(`/v1/cards?${sp}`);
}

export async function fetchSets(params: Record<string, string | number | undefined> = {}) {
  const sp = new URLSearchParams();
  Object.entries(params).forEach(([k, v]) => {
    if (v !== undefined && v !== "") sp.set(k, String(v));
  });
  if (!sp.has("pageSize")) sp.set("pageSize", "100");
  return carddexFetch<{ data: CardDexSet[]; meta?: ListMeta }>(`/v1/sets?${sp}`);
}

/** Walk every CardDex list page (sets, sealed, cards) up to maxPages. */
export async function fetchAllPages<T>(
  fetcher: (page: number, pageSize: number) => Promise<{ data?: T[] | null; meta?: ListMeta | null }>,
  opts?: { pageSize?: number; maxPages?: number }
): Promise<T[]> {
  const pageSize = opts?.pageSize ?? 100;
  const maxPages = opts?.maxPages ?? 40;
  const all: T[] = [];
  let page = 1;
  let totalPages = 1;

  do {
    const res = await fetcher(page, pageSize);
    const batch = res.data || [];
    all.push(...batch);
    totalPages = res.meta?.totalPages || (batch.length < pageSize ? page : page + 1);
    if (batch.length === 0) break;
    page += 1;
  } while (page <= totalPages && page <= maxPages);

  return all;
}

export async function fetchPriceTrends(params: Record<string, string | number | undefined> = {}) {
  const sp = new URLSearchParams();
  Object.entries(params).forEach(([k, v]) => {
    if (v !== undefined && v !== "") sp.set(k, String(v));
  });
  return carddexFetch<{ data: CardDexPrice[] }>(`/v1/prices/trends?${sp}`);
}

export async function fetchTopPrices(params: Record<string, string | number | undefined> = {}) {
  const sp = new URLSearchParams();
  Object.entries(params).forEach(([k, v]) => {
    if (v !== undefined && v !== "") sp.set(k, String(v));
  });
  return carddexFetch<{ data: CardDexPrice[] }>(`/v1/prices/top?${sp}`);
}

export async function fetchCardPrices(cardId: string) {
  return carddexFetch<{ data: CardDexPrice | CardDexPrice[] }>(`/v1/cards/${cardId}/prices`);
}

export async function fetchCardById(
  id: string,
  include = "prices,images,attacks,abilities,weaknesses,resistances,variants"
) {
  const sp = new URLSearchParams({ include });
  return carddexFetch<{ data: CardDexCard }>(`/v1/cards/${encodeURIComponent(id)}?${sp}`);
}

export async function fetchSetById(id: string) {
  return carddexFetch<{ data: CardDexSet }>(`/v1/sets/${encodeURIComponent(id)}`);
}

export async function fetchSetCards(
  setId: string,
  params: Record<string, string | number | undefined> = {}
) {
  const sp = new URLSearchParams();
  Object.entries(params).forEach(([k, v]) => {
    if (v !== undefined && v !== "") sp.set(k, String(v));
  });
  if (!sp.has("pageSize")) sp.set("pageSize", "24");
  if (!sp.has("include")) sp.set("include", "images,prices");
  return carddexFetch<{ data: CardDexCard[]; meta: ListMeta }>(
    `/v1/sets/${encodeURIComponent(setId)}/cards?${sp}`
  );
}

export async function fetchSealed(params: Record<string, string | number | undefined> = {}) {
  const sp = new URLSearchParams();
  Object.entries(params).forEach(([k, v]) => {
    if (v !== undefined && v !== "") sp.set(k, String(v));
  });
  if (!sp.has("pageSize")) sp.set("pageSize", "24");
  return carddexFetch<{ data: CardDexSealed[]; meta: ListMeta }>(`/v1/sealed?${sp}`);
}

export async function fetchSealedById(id: string) {
  return carddexFetch<{ data: CardDexSealed }>(`/v1/sealed/${encodeURIComponent(id)}`);
}

export async function fetchCardPriceHistory(cardId: string, days = 90) {
  return carddexFetch<{
    data: Array<{
      date: string;
      trend_price?: number | null;
      avg_price?: number | null;
      low_price?: number | null;
      source?: string;
      currency?: string;
    }>;
  }>(`/v1/cards/${encodeURIComponent(cardId)}/prices/history?days=${days}`);
}

export function normalizeCardPrices(prices: CardDexCard["prices"]): CardDexPriceRow | null {
  if (!prices) return null;
  if (Array.isArray(prices)) {
    // Prefer a row that actually has a market value
    const withPrice =
      prices.find((p) => p.trend_price != null || p.avg_price != null) || prices[0];
    return withPrice || null;
  }
  if ("trend_price" in prices || "avg_price" in prices) return prices as CardDexPriceRow;
  if ("trend" in prices) {
    return {
      trend_price: prices.trend ?? null,
      avg_7d: prices.avg_7d ?? null,
      avg_30d: prices.avg_30d ?? null,
      pct_change_1d: (prices as { price_change_1d?: number }).price_change_1d ?? null,
      pct_change_7d: (prices as { price_change_7d?: number }).price_change_7d ?? null,
      pct_change_30d: (prices as { price_change_30d?: number }).price_change_30d ?? null,
    };
  }
  return null;
}

export function mapPriceToZar(p: CardDexPrice | CardDexPriceRow) {
  const eur = p.trend_price ?? p.avg_price ?? null;
  const row = p as CardDexPriceRow & CardDexPrice;
  return {
    priceZar: eurToZar(eur),
    priceEur: eur,
    avg7dZar: eurToZar(row.avg_7d ?? null),
    avg30dZar: eurToZar(row.avg_30d ?? null),
    pctChange1d: row.pct_change_1d ?? row.price_change_1d ?? null,
    pctChange7d: row.pct_change_7d ?? row.price_change_7d ?? null,
    pctChange30d: row.pct_change_30d ?? row.price_change_30d ?? null,
  };
}

export function sealedPriceZar(sealed: CardDexSealed) {
  const eur = sealed.latest_price?.trend ?? sealed.latest_price?.avg ?? sealed.latest_price?.low ?? null;
  return eurToZar(eur);
}

export function sleep(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}
