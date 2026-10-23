"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { formatZar, formatPct } from "@/lib/format";
import { mediaUrl } from "@/lib/media";
import { Camera, Loader2, Search, Upload, X } from "lucide-react";

type SearchCard = {
  id: string;
  name: string;
  number?: string | null;
  setName?: string | null;
  priceZar?: number | null;
  imageSmall?: string | null;
};

type PortfolioPayload = {
  user: { name?: string | null; username?: string | null; email: string };
  items: Array<{
    id: string;
    quantity: number;
    condition: string;
    card: {
      id: string;
      name: string;
      number?: string | null;
      setName?: string | null;
      imageSmall?: string | null;
      priceZar?: number | null;
      pctChange1d?: number | null;
      pctChange7d?: number | null;
    };
  }>;
  watchlist: Array<{
    id: string;
    card: {
      id: string;
      name: string;
      setName?: string | null;
      imageThumb?: string | null;
      imageSmall?: string | null;
      priceZar?: number | null;
      pctChange1d?: number | null;
      pctChange7d?: number | null;
    };
  }>;
  activities: Array<{ id: string; message: string; createdAt: string }>;
  stats: {
    portfolioValue: number;
    totalCards: number;
    sets: number;
    estimatedProfit: number;
    pct30d: number;
  };
};

function guessNameFromFile(file: File): string {
  const base = file.name.replace(/\.[^.]+$/, "");
  return base
    .replace(/[_-]+/g, " ")
    .replace(/\b(pokemon|pokémon|card|scan|photo|img|image|front|back|tcg)\b/gi, " ")
    .replace(/\d{3,}/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export default function DashboardPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [data, setData] = useState<PortfolioPayload | null>(null);
  const [error, setError] = useState("");
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchCard[]>([]);
  const [searching, setSearching] = useState(false);
  const [searched, setSearched] = useState(false);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [uploadPreview, setUploadPreview] = useState<string | null>(null);
  const [uploadHint, setUploadHint] = useState("");
  const [dragOver, setDragOver] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const searchReq = useRef(0);

  const load = useCallback(async () => {
    const res = await fetch("/api/portfolio");
    if (res.status === 401) {
      router.push("/auth/signin?callbackUrl=/dashboard");
      return;
    }
    if (res.status === 403) {
      router.push("/premium");
      return;
    }
    if (!res.ok) {
      setError("Failed to load portfolio");
      return;
    }
    setData(await res.json());
  }, [router]);

  useEffect(() => {
    if (status === "unauthenticated") router.push("/auth/signin?callbackUrl=/dashboard");
    if (status === "authenticated") {
      // DB-backed portfolio API is the source of truth for premium access
      load();
    }
  }, [status, router, load]);

  const runSearch = useCallback(async (raw: string) => {
    const q = raw.trim();
    if (!q) {
      setResults([]);
      setSearched(false);
      return;
    }
    const id = ++searchReq.current;
    setSearching(true);
    setError("");
    try {
      const res = await fetch(
        `/api/cards?q=${encodeURIComponent(q)}&pageSize=12&sort=price_desc`
      );
      const json = await res.json().catch(() => ({}));
      if (id !== searchReq.current) return;
      const cards = Array.isArray(json.cards) ? json.cards : [];
      setResults(cards);
      setSearched(true);
      if (!res.ok && json.error) setError(String(json.error));
    } catch {
      if (id !== searchReq.current) return;
      setResults([]);
      setSearched(true);
      setError("Search failed — check your connection and try again.");
    } finally {
      if (id === searchReq.current) setSearching(false);
    }
  }, []);

  // Debounced search while typing
  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      setSearched(false);
      return;
    }
    const t = setTimeout(() => runSearch(query), 350);
    return () => clearTimeout(t);
  }, [query, runSearch]);

  function onSearchSubmit(e: React.FormEvent) {
    e.preventDefault();
    void runSearch(query);
  }

  async function addCard(cardId: string) {
    setBusyId(cardId);
    setError("");
    try {
      const res = await fetch("/api/portfolio", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ cardId, quantity: 1 }),
      });
      const j = await res.json().catch(() => ({}));
      if (res.ok) {
        setResults([]);
        setQuery("");
        setSearched(false);
        setUploadPreview(null);
        setUploadHint("");
        await load();
      } else {
        setError(j.error || "Could not add card to portfolio");
      }
    } finally {
      setBusyId(null);
    }
  }

  async function addWatch(cardId: string) {
    setBusyId(`w-${cardId}`);
    setError("");
    try {
      const res = await fetch("/api/watchlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ cardId }),
      });
      if (!res.ok) {
        const j = await res.json().catch(() => ({}));
        setError(j.error || "Could not add to watchlist");
        return;
      }
      await load();
    } finally {
      setBusyId(null);
    }
  }

  async function removeItem(id: string) {
    await fetch(`/api/portfolio?id=${id}`, { method: "DELETE" });
    await load();
  }

  function clearUpload() {
    if (uploadPreview) URL.revokeObjectURL(uploadPreview);
    setUploadPreview(null);
    setUploadHint("");
    if (fileRef.current) fileRef.current.value = "";
  }

  function handleFiles(files: FileList | File[] | null) {
    const file = files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setError("Please upload an image file (JPG, PNG, WEBP).");
      return;
    }
    if (file.size > 8 * 1024 * 1024) {
      setError("Image is too large — keep under 8MB.");
      return;
    }

    if (uploadPreview) URL.revokeObjectURL(uploadPreview);
    const url = URL.createObjectURL(file);
    setUploadPreview(url);
    setError("");

    const guess = guessNameFromFile(file);
    if (guess.length >= 2) {
      setUploadHint(`Matched filename → searching “${guess}”. Pick the right print below.`);
      setQuery(guess);
      void runSearch(guess);
    } else {
      setUploadHint("Photo ready — type the card name in the search box to find a match.");
    }
  }

  if (status === "loading" || (status === "authenticated" && !data && !error)) {
    return (
      <div className="container-page py-20 text-center text-zinc-400">
        Loading your portfolio…
      </div>
    );
  }

  if (status === "authenticated" && !data && error) {
    return (
      <div className="container-page py-20 text-center">
        <p className="text-red-300">{error}</p>
        <button
          type="button"
          onClick={() => {
            setError("");
            void load();
          }}
          className="mt-4 rounded-lg bg-[#FFD700] px-4 py-2 text-sm font-semibold text-[#0B0E14]"
        >
          Retry
        </button>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="container-page py-20 text-center text-zinc-400">
        Loading your portfolio…
      </div>
    );
  }

  const displayName = data.user.username || data.user.name || "Trainer";

  return (
    <div className="container-page py-6 pb-24 sm:py-10 sm:pb-16">
      {error && (
        <p className="mb-4 rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-2 text-sm text-red-300">
          {error}
        </p>
      )}

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-4">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-[#FFD700] to-amber-600 text-2xl font-bold text-[#0B0E14]">
            {displayName[0]?.toUpperCase()}
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-2xl font-bold text-white">{displayName}</h1>
              <span className="rounded-full bg-violet-500/20 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-violet-300">
                Pro Collector
              </span>
            </div>
            <p className="mt-1 text-sm text-zinc-400">
              Welcome back. Your TCG portfolio value is up-to-date with SA merchant values.
            </p>
          </div>
        </div>
        <button
          type="button"
          className="min-h-11 rounded-lg border border-[#FFD700]/50 px-4 py-2 text-sm font-medium text-[#FFD700] hover:bg-[#FFD700]/10"
          onClick={() =>
            setError("Public share links are coming next — your portfolio is private for now.")
          }
        >
          Share Portfolio Publicly
        </button>
      </div>

      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          {
            label: "Portfolio Value",
            value: formatZar(data.stats.portfolioValue),
            badge: `+${data.stats.pct30d}% Past 30 days`,
          },
          {
            label: "Total Cards Owned",
            value: String(data.stats.totalCards),
            sub: `Across ${data.stats.sets} expansions`,
          },
          {
            label: "Cards in Portfolio",
            value: String(data.items.length),
            badge: "Holdings this account",
          },
          {
            label: "Estimated Profit",
            value: formatZar(data.stats.estimatedProfit),
            badge: "Vs estimated cost basis",
          },
        ].map((s) => (
          <div key={s.label} className="rounded-2xl border border-white/8 bg-[#12151E] p-5">
            <p className="text-xs uppercase tracking-wider text-zinc-500">{s.label}</p>
            <p className="mt-2 text-2xl font-bold text-white">{s.value}</p>
            {s.badge && (
              <span className="mt-2 inline-flex rounded-full bg-emerald-500/15 px-2 py-0.5 text-[11px] font-semibold text-emerald-400">
                {s.badge}
              </span>
            )}
            {s.sub && <p className="mt-2 text-xs text-zinc-500">{s.sub}</p>}
          </div>
        ))}
      </div>

      <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_320px]">
        <div className="space-y-8">
          <section className="rounded-2xl border border-white/8 bg-[#12151E] p-5 sm:p-6">
            <h2 className="text-lg font-semibold text-white">Add Cards to Portfolio</h2>
            <p className="mt-1 text-sm text-zinc-500">
              Upload a photo (we guess from the filename) or search CardDex by name, then tap
              + Portfolio.
            </p>

            <div className="mt-4 grid gap-4 md:grid-cols-2">
              <div
                className={`relative flex flex-col items-center justify-center rounded-xl border border-dashed px-4 py-8 text-center transition ${
                  dragOver
                    ? "border-[#FFD700] bg-[#FFD700]/10"
                    : "border-[#FFD700]/40 bg-[#0B0E14]"
                }`}
                onDragOver={(e) => {
                  e.preventDefault();
                  setDragOver(true);
                }}
                onDragLeave={() => setDragOver(false)}
                onDrop={(e) => {
                  e.preventDefault();
                  setDragOver(false);
                  handleFiles(e.dataTransfer.files);
                }}
              >
                <input
                  ref={fileRef}
                  type="file"
                  accept="image/*"
                  capture="environment"
                  className="hidden"
                  onChange={(e) => handleFiles(e.target.files)}
                />
                {uploadPreview ? (
                  <div className="w-full">
                    <div className="relative mx-auto h-40 w-28 overflow-hidden rounded-lg border border-white/10 bg-black/40">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={uploadPreview}
                        alt="Uploaded card"
                        className="h-full w-full object-contain"
                      />
                      <button
                        type="button"
                        onClick={clearUpload}
                        className="absolute right-1 top-1 rounded-full bg-black/70 p-1 text-white"
                        aria-label="Clear upload"
                      >
                        <X size={14} />
                      </button>
                    </div>
                    <p className="mt-3 text-xs leading-relaxed text-zinc-400">{uploadHint}</p>
                  </div>
                ) : (
                  <>
                    <Camera className="text-[#FFD700]" size={28} />
                    <p className="mt-3 max-w-xs text-sm text-zinc-400">
                      Drag & drop a card photo, or upload from your camera roll.
                    </p>
                  </>
                )}
                <button
                  type="button"
                  className="mt-4 inline-flex min-h-11 items-center gap-2 rounded-lg bg-[#FFD700] px-4 py-2 text-sm font-semibold text-[#0B0E14]"
                  onClick={() => fileRef.current?.click()}
                >
                  <Upload size={14} /> {uploadPreview ? "Replace Image" : "Upload Image"}
                </button>
              </div>

              <div>
                <form onSubmit={onSearchSubmit} className="flex gap-2">
                  <div className="relative min-w-0 flex-1">
                    <Search
                      size={16}
                      className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500"
                    />
                    <input
                      value={query}
                      onChange={(e) => setQuery(e.target.value)}
                      placeholder="Search card name, e.g. Charizard…"
                      enterKeyHint="search"
                      className="w-full rounded-lg border border-white/10 bg-[#0B0E14] py-2.5 pl-9 pr-3 text-sm text-white placeholder:text-zinc-500 focus:border-[#FFD700]/40 focus:outline-none"
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={searching || !query.trim()}
                    className="inline-flex min-h-11 shrink-0 items-center gap-2 rounded-lg bg-[#FFD700] px-4 py-2 text-sm font-semibold text-[#0B0E14] disabled:opacity-60"
                  >
                    {searching ? <Loader2 size={16} className="animate-spin" /> : "Search"}
                  </button>
                </form>

                <div className="mt-3 min-h-[3rem]">
                  {searching && (
                    <p className="flex items-center gap-2 text-xs text-zinc-500">
                      <Loader2 size={14} className="animate-spin text-[#FFD700]" />
                      Searching CardDex…
                    </p>
                  )}
                  {!searching && searched && results.length === 0 && (
                    <p className="text-xs text-zinc-500">
                      No cards found for “{query.trim()}”. Try another spelling or set name.
                    </p>
                  )}
                  {results.length > 0 && (
                    <ul className="max-h-64 space-y-2 overflow-y-auto overscroll-contain">
                      {results.map((c) => (
                        <li
                          key={c.id}
                          className="flex items-center gap-3 rounded-lg border border-white/5 bg-[#0B0E14] p-2"
                        >
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={mediaUrl(c.imageSmall)}
                            alt=""
                            className="h-12 w-9 shrink-0 rounded object-cover"
                          />
                          <div className="min-w-0 flex-1">
                            <p className="truncate text-sm text-white">
                              {c.name}
                              {c.number ? ` #${c.number}` : ""}
                            </p>
                            <p className="truncate text-xs text-zinc-500">
                              {c.setName || "Unknown set"} · {formatZar(c.priceZar)}
                            </p>
                          </div>
                          <div className="flex shrink-0 flex-col gap-1 sm:flex-row">
                            <button
                              type="button"
                              disabled={busyId === c.id}
                              onClick={() => addCard(c.id)}
                              className="rounded-md bg-[#FFD700] px-2 py-1.5 text-xs font-semibold text-[#0B0E14] disabled:opacity-60"
                            >
                              {busyId === c.id ? "…" : "+ Portfolio"}
                            </button>
                            <button
                              type="button"
                              disabled={busyId === `w-${c.id}`}
                              onClick={() => addWatch(c.id)}
                              className="rounded-md border border-white/10 px-2 py-1.5 text-xs text-zinc-300 disabled:opacity-60"
                            >
                              Watch
                            </button>
                          </div>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>
            </div>
          </section>

          <section>
            <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
              <div>
                <h2 className="text-xl font-bold text-white">My Collection</h2>
                <p className="text-sm text-zinc-500">
                  {data.stats.totalCards} items matching your inventory
                </p>
              </div>
            </div>
            {data.items.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-white/10 px-6 py-16 text-center text-sm text-zinc-500">
                No cards yet. Search or upload above to add your first card.
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 xl:grid-cols-4">
                {data.items
                  .slice()
                  .sort((a, b) => (b.card.priceZar || 0) - (a.card.priceZar || 0))
                  .map((item) => (
                    <div
                      key={item.id}
                      className="group overflow-hidden rounded-2xl border border-white/8 bg-[#12151E]"
                    >
                      <Link href={`/cards/${encodeURIComponent(item.card.id)}`}>
                        <div className="aspect-[3/4] bg-[#0B0E14] p-2">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={mediaUrl(item.card.imageSmall)}
                            alt={item.card.name}
                            className="h-full w-full object-contain"
                          />
                        </div>
                        <div className="space-y-1 p-3">
                          <p className="truncate text-sm font-semibold text-white">
                            {item.card.name}
                            {item.card.number ? ` #${item.card.number}` : ""}
                          </p>
                          <p className="truncate text-xs text-zinc-500">{item.card.setName}</p>
                          <div className="flex items-center justify-between pt-1">
                            <span className="text-sm font-bold">
                              {formatZar(item.card.priceZar)}
                            </span>
                            <span
                              className={`text-xs font-semibold ${
                                (item.card.pctChange1d ?? 0) >= 0
                                  ? "text-emerald-400"
                                  : "text-red-400"
                              }`}
                            >
                              {formatPct(item.card.pctChange1d ?? item.card.pctChange7d)}
                            </span>
                          </div>
                          <p className="text-[11px] text-zinc-500">
                            Qty {item.quantity} · {item.condition}
                          </p>
                        </div>
                      </Link>
                      <div className="px-3 pb-3">
                        <button
                          type="button"
                          onClick={() => removeItem(item.id)}
                          className="text-[11px] text-red-400 sm:opacity-0 sm:transition sm:group-hover:opacity-100"
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  ))}
              </div>
            )}
          </section>
        </div>

        <aside className="space-y-6">
          <div className="rounded-2xl border border-white/8 bg-[#12151E] p-5">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-white">My Watchlist</h3>
              <Link href="/cards" className="text-xs text-[#FFD700]">
                Browse
              </Link>
            </div>
            <ul className="mt-4 space-y-3">
              {data.watchlist.length === 0 && (
                <li className="text-xs text-zinc-500">
                  Use Watch on search results to track chase cards.
                </li>
              )}
              {data.watchlist.map((w) => (
                <li key={w.id}>
                  <Link
                    href={`/cards/${encodeURIComponent(w.card.id)}`}
                    className="flex items-center gap-3"
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={mediaUrl(w.card.imageThumb || w.card.imageSmall)}
                      alt=""
                      className="h-10 w-8 rounded object-cover"
                    />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm text-white">{w.card.name}</p>
                      <p className="truncate text-xs text-zinc-500">{w.card.setName}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs font-semibold">{formatZar(w.card.priceZar)}</p>
                      <p
                        className={`text-[11px] ${
                          (w.card.pctChange1d ?? 0) >= 0 ? "text-emerald-400" : "text-red-400"
                        }`}
                      >
                        {formatPct(w.card.pctChange1d ?? w.card.pctChange7d)}
                      </p>
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="rounded-2xl border border-white/8 bg-[#12151E] p-5">
            <h3 className="font-semibold text-white">Portfolio Activity</h3>
            <ul className="mt-4 space-y-4">
              {data.activities.map((a) => (
                <li key={a.id} className="relative border-l border-white/10 pl-4">
                  <span className="absolute -left-1 top-1.5 h-2 w-2 rounded-full bg-[#FFD700]" />
                  <p className="text-sm text-zinc-300">{a.message}</p>
                  <p className="mt-1 text-[11px] text-zinc-500">
                    {new Date(a.createdAt).toLocaleString("en-ZA")}
                  </p>
                </li>
              ))}
            </ul>
          </div>
        </aside>
      </div>
    </div>
  );
}
