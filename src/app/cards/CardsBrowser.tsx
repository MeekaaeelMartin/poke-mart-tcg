"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ChevronLeft, ChevronRight, Loader2, SlidersHorizontal } from "lucide-react";
import { CardTile, EmptyState } from "@/components/CardUI";
import { cn } from "@/lib/format";

type SetOption = {
  id: string;
  name: string;
  setCode: string | null;
  totalCards: number | null;
};

type CardResult = {
  id: string;
  name: string;
  number?: string | null;
  setName?: string | null;
  setId?: string;
  rarity?: string | null;
  imageSmall?: string | null;
  imageLarge?: string | null;
  priceZar?: number | null;
  pctChange1d?: number | null;
  pctChange7d?: number | null;
  types?: string | null;
};

type ApiResponse = {
  cards: CardResult[];
  meta: {
    total: number;
    page: number;
    pageSize: number;
    totalPages: number;
  };
};

const POKEMON_TYPES = [
  "Fire",
  "Water",
  "Psychic",
  "Lightning",
  "Grass",
  "Fighting",
  "Darkness",
  "Metal",
  "Dragon",
  "Fairy",
  "Colorless",
] as const;

const RARITIES = [
  "Common",
  "Uncommon",
  "Rare",
  "Rare Holo",
  "Double Rare",
  "Ultra Rare",
  "Illustration Rare",
  "Special Illustration Rare",
  "Secret Rare",
] as const;

const SORT_OPTIONS = [
  { value: "price_desc", label: "Price: High to Low" },
  { value: "price_asc", label: "Price: Low to High" },
  { value: "name", label: "Name (A–Z)" },
] as const;

function toggleInList(list: string[], item: string): string[] {
  return list.includes(item) ? list.filter((x) => x !== item) : [...list, item];
}

function matchesClientFilters(
  card: CardResult,
  selectedSets: string[],
  selectedTypes: string[],
  selectedRarities: string[]
): boolean {
  if (selectedSets.length > 1 && !selectedSets.includes(card.setId || "")) {
    return false;
  }
  if (selectedTypes.length > 1) {
    const typesRaw = (card.types || "").toLowerCase();
    const match = selectedTypes.some((t) => typesRaw.includes(t.toLowerCase()));
    if (!match) return false;
  }
  if (selectedRarities.length > 1) {
    const rarity = (card.rarity || "").toLowerCase();
    const match = selectedRarities.some((r) => rarity.includes(r.toLowerCase()));
    if (!match) return false;
  }
  return true;
}

export function CardsBrowser({ sets }: { sets: SetOption[] }) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const initialQ = searchParams.get("q") || "";
  const initialSet = searchParams.get("set") || "";
  const initialType = searchParams.get("type") || "";
  const initialRarity = searchParams.get("rarity") || "";
  const initialMin = searchParams.get("min") || "";
  const initialMax = searchParams.get("max") || "";
  const initialSort = searchParams.get("sort") || "price_desc";
  const initialPage = Number(searchParams.get("page") || 1);

  const [q, setQ] = useState(initialQ);
  const [debouncedQ, setDebouncedQ] = useState(initialQ);
  const [selectedSets, setSelectedSets] = useState<string[]>(
    initialSet ? [initialSet] : []
  );
  const [selectedTypes, setSelectedTypes] = useState<string[]>(
    initialType ? [initialType] : []
  );
  const [selectedRarities, setSelectedRarities] = useState<string[]>(
    initialRarity ? [initialRarity] : []
  );
  const [minPrice, setMinPrice] = useState(initialMin);
  const [maxPrice, setMaxPrice] = useState(initialMax);
  const [sort, setSort] = useState(initialSort);
  const [page, setPage] = useState(initialPage);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const [data, setData] = useState<ApiResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const skipQPageReset = useRef(true);
  useEffect(() => {
    const t = setTimeout(() => setDebouncedQ(q), 350);
    return () => clearTimeout(t);
  }, [q]);

  useEffect(() => {
    if (skipQPageReset.current) {
      skipQPageReset.current = false;
      return;
    }
    setPage(1);
  }, [debouncedQ]);

  useEffect(() => {
    const params = new URLSearchParams();
    if (debouncedQ.trim()) params.set("q", debouncedQ.trim());
    if (selectedSets.length === 1) params.set("set", selectedSets[0]);
    if (selectedTypes.length === 1) params.set("type", selectedTypes[0]);
    if (selectedRarities.length === 1) params.set("rarity", selectedRarities[0]);
    if (minPrice.trim()) params.set("min", minPrice.trim());
    if (maxPrice.trim()) params.set("max", maxPrice.trim());
    if (sort !== "price_desc") params.set("sort", sort);
    if (page > 1) params.set("page", String(page));
    const qs = params.toString();
    router.replace(qs ? `/cards?${qs}` : "/cards", { scroll: false });
  }, [
    debouncedQ,
    selectedSets,
    selectedTypes,
    selectedRarities,
    minPrice,
    maxPrice,
    sort,
    page,
    router,
  ]);

  useEffect(() => {
    const controller = new AbortController();

    async function load() {
      setLoading(true);
      setError(null);

      const params = new URLSearchParams();
      if (debouncedQ.trim()) params.set("q", debouncedQ.trim());
      if (selectedSets.length === 1) params.set("set", selectedSets[0]);
      if (selectedTypes.length === 1) params.set("type", selectedTypes[0]);
      if (selectedRarities.length === 1) params.set("rarity", selectedRarities[0]);
      if (minPrice.trim()) params.set("min", minPrice.trim());
      if (maxPrice.trim()) params.set("max", maxPrice.trim());
      params.set("sort", sort);
      params.set("page", String(page));
      params.set("pageSize", "24");

      try {
        const res = await fetch(`/api/cards?${params.toString()}`, {
          signal: controller.signal,
        });
        if (!res.ok) throw new Error("Failed to load cards");
        const json: ApiResponse = await res.json();
        setData(json);
      } catch (e) {
        if ((e as Error).name !== "AbortError") {
          setError("Could not load cards. Try again shortly.");
        }
      } finally {
        setLoading(false);
      }
    }

    load();
    return () => controller.abort();
  }, [debouncedQ, selectedSets, selectedTypes, selectedRarities, minPrice, maxPrice, sort, page]);

  const cards = useMemo(() => {
    if (!data?.cards) return [];
    const needsClientFilter =
      selectedSets.length > 1 ||
      selectedTypes.length > 1 ||
      selectedRarities.length > 1;
    if (!needsClientFilter) return data.cards;
    return data.cards.filter((card) =>
      matchesClientFilters(card, selectedSets, selectedTypes, selectedRarities)
    );
  }, [data, selectedSets, selectedTypes, selectedRarities]);

  const totalPages = data?.meta.totalPages ?? 1;
  const total = data?.meta.total ?? 0;

  function resetPage() {
    setPage(1);
  }

  function clearFilters() {
    setQ("");
    setSelectedSets([]);
    setSelectedTypes([]);
    setSelectedRarities([]);
    setMinPrice("");
    setMaxPrice("");
    setSort("price_desc");
    setPage(1);
  }

  const hasFilters =
    q.trim() ||
    selectedSets.length > 0 ||
    selectedTypes.length > 0 ||
    selectedRarities.length > 0 ||
    minPrice.trim() ||
    maxPrice.trim();

  const sidebar = (
    <aside className="space-y-6">
      {/* Expansions */}
      <div className="rounded-2xl border border-white/8 bg-[#12151E] p-4">
        <h3 className="text-xs font-bold uppercase tracking-wider text-[#FFD700]">
          Expansions
        </h3>
        <div className="mt-3 max-h-52 space-y-2 overflow-y-auto pr-1">
          {sets.length === 0 ? (
            <p className="text-xs text-zinc-500">No sets synced yet.</p>
          ) : (
            sets.map((set) => (
              <label
                key={set.id}
                className="flex cursor-pointer items-start gap-2.5 rounded-lg px-1 py-1 transition hover:bg-white/5"
              >
                <input
                  type="checkbox"
                  checked={selectedSets.includes(set.id)}
                  onChange={() => {
                    setSelectedSets((prev) => toggleInList(prev, set.id));
                    resetPage();
                  }}
                  className="mt-0.5 h-4 w-4 shrink-0 rounded border-white/20 bg-[#0B0E14] accent-[#FFD700]"
                />
                <span className="min-w-0 text-sm text-zinc-300">
                  <span className="block truncate">{set.name}</span>
                  {set.setCode && (
                    <span className="text-[10px] text-zinc-500">{set.setCode}</span>
                  )}
                </span>
              </label>
            ))
          )}
        </div>
      </div>

      {/* Pokemon Type */}
      <div className="rounded-2xl border border-white/8 bg-[#12151E] p-4">
        <h3 className="text-xs font-bold uppercase tracking-wider text-[#FFD700]">
          Pokémon Type
        </h3>
        <div className="mt-3 flex flex-wrap gap-2">
          {POKEMON_TYPES.map((type) => {
            const active = selectedTypes.includes(type);
            return (
              <button
                key={type}
                type="button"
                onClick={() => {
                  setSelectedTypes((prev) => toggleInList(prev, type));
                  resetPage();
                }}
                className={cn(
                  "rounded-full px-3 py-1 text-xs font-semibold transition",
                  active
                    ? "bg-[#FFD700] text-[#0B0E14]"
                    : "border border-white/10 bg-[#0B0E14] text-zinc-400 hover:border-[#FFD700]/40 hover:text-white"
                )}
              >
                {type}
              </button>
            );
          })}
        </div>
      </div>

      {/* Rarity */}
      <div className="rounded-2xl border border-white/8 bg-[#12151E] p-4">
        <h3 className="text-xs font-bold uppercase tracking-wider text-[#FFD700]">
          Rarity
        </h3>
        <div className="mt-3 space-y-2">
          {RARITIES.map((rarity) => (
            <label
              key={rarity}
              className="flex cursor-pointer items-center gap-2.5 rounded-lg px-1 py-1 transition hover:bg-white/5"
            >
              <input
                type="checkbox"
                checked={selectedRarities.includes(rarity)}
                onChange={() => {
                  setSelectedRarities((prev) => toggleInList(prev, rarity));
                  resetPage();
                }}
                className="h-4 w-4 shrink-0 rounded border-white/20 bg-[#0B0E14] accent-[#FFD700]"
              />
              <span className="text-sm text-zinc-300">{rarity}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Price Range */}
      <div className="rounded-2xl border border-white/8 bg-[#12151E] p-4">
        <h3 className="text-xs font-bold uppercase tracking-wider text-[#FFD700]">
          Price Range (ZAR)
        </h3>
        <div className="mt-3 flex items-center gap-2">
          <input
            type="number"
            min={0}
            placeholder="Min"
            value={minPrice}
            onChange={(e) => {
              setMinPrice(e.target.value);
              resetPage();
            }}
            className="w-full rounded-lg border border-white/10 bg-[#0B0E14] px-3 py-2 text-sm text-white placeholder:text-zinc-500 focus:border-[#FFD700]/50 focus:outline-none"
          />
          <span className="text-zinc-500">–</span>
          <input
            type="number"
            min={0}
            placeholder="Max"
            value={maxPrice}
            onChange={(e) => {
              setMaxPrice(e.target.value);
              resetPage();
            }}
            className="w-full rounded-lg border border-white/10 bg-[#0B0E14] px-3 py-2 text-sm text-white placeholder:text-zinc-500 focus:border-[#FFD700]/50 focus:outline-none"
          />
        </div>
      </div>

      {hasFilters && (
        <button
          type="button"
          onClick={clearFilters}
          className="w-full rounded-lg border border-white/10 py-2 text-sm text-zinc-400 transition hover:border-[#FFD700]/30 hover:text-white"
        >
          Clear all filters
        </button>
      )}
    </aside>
  );

  return (
    <div>
      <div className="mb-8">
        <h1
          className="text-3xl font-bold tracking-tight text-white sm:text-4xl"
          style={{ fontFamily: "var(--font-syne), sans-serif" }}
        >
          Poke Card Database
        </h1>
        <p className="mt-2 max-w-2xl text-sm text-zinc-400">
          Browse the full CardDex catalogue — filter by expansion, type, rarity, and
          ZAR price. Free for all trainers.
        </p>
      </div>

      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            resetPage();
          }}
          className="flex flex-1 max-w-xl items-center gap-2 rounded-xl border border-white/10 bg-[#12151E] px-3 py-1.5"
        >
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search card name, number, or set..."
            className="w-full bg-transparent py-2 text-sm text-white placeholder:text-zinc-500 focus:outline-none"
          />
          <button
            type="submit"
            className="shrink-0 rounded-lg bg-[#FFD700]/15 px-3 py-1.5 text-xs font-semibold text-[#FFD700] hover:bg-[#FFD700]/25"
          >
            Search
          </button>
        </form>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setSidebarOpen((v) => !v)}
            className="flex items-center gap-2 rounded-lg border border-white/10 px-3 py-2 text-sm text-zinc-300 lg:hidden"
          >
            <SlidersHorizontal size={16} />
            Filters
          </button>
          <select
            value={sort}
            onChange={(e) => {
              setSort(e.target.value);
              resetPage();
            }}
            className="rounded-lg border border-white/10 bg-[#12151E] px-3 py-2 text-sm text-white focus:border-[#FFD700]/50 focus:outline-none"
          >
            {SORT_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid gap-8 lg:grid-cols-[260px_1fr]">
        <div className={cn("hidden lg:block", sidebarOpen && "!block")}>{sidebar}</div>

        <div>
          <div className="mb-4 flex items-center justify-between text-sm text-zinc-500">
            <span>
              {loading ? "Loading…" : `${total.toLocaleString()} cards found`}
            </span>
            {!loading && totalPages > 1 && (
              <span>
                Page {page} of {totalPages}
              </span>
            )}
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-24 text-zinc-400">
              <Loader2 className="mr-2 h-5 w-5 animate-spin text-[#FFD700]" />
              Loading cards…
            </div>
          ) : error ? (
            <EmptyState message={error} />
          ) : cards.length === 0 ? (
            <EmptyState message="No cards match your filters. Try adjusting your search or run npm run sync to load data." />
          ) : (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {cards.map((card) => (
                <CardTile key={card.id} card={card} />
              ))}
            </div>
          )}

          {!loading && totalPages > 1 && (
            <div className="mt-10 flex items-center justify-center gap-3">
              <button
                type="button"
                disabled={page <= 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                className="flex items-center gap-1 rounded-lg border border-white/10 px-4 py-2 text-sm text-white transition hover:border-[#FFD700]/40 disabled:cursor-not-allowed disabled:opacity-40"
              >
                <ChevronLeft size={16} />
                Previous
              </button>
              <span className="text-sm text-zinc-400">
                {page} / {totalPages}
              </span>
              <button
                type="button"
                disabled={page >= totalPages}
                onClick={() => setPage((p) => p + 1)}
                className="flex items-center gap-1 rounded-lg border border-white/10 px-4 py-2 text-sm text-white transition hover:border-[#FFD700]/40 disabled:cursor-not-allowed disabled:opacity-40"
              >
                Next
                <ChevronRight size={16} />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
