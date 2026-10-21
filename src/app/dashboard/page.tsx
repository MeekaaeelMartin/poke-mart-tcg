"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { formatZar, formatPct } from "@/lib/format";
import { mediaUrl } from "@/lib/media";
import { Camera, Search, Upload } from "lucide-react";

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

export default function DashboardPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [data, setData] = useState<PortfolioPayload | null>(null);
  const [error, setError] = useState("");
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Array<{ id: string; name: string; setName?: string | null; priceZar?: number | null; imageSmall?: string | null }>>([]);
  const [busy, setBusy] = useState(false);

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
      if (!session?.user?.isPremium) router.push("/premium");
      else load();
    }
  }, [status, session, router, load]);

  async function searchManual(e: React.FormEvent) {
    e.preventDefault();
    if (!query.trim()) return;
    const res = await fetch(`/api/cards?q=${encodeURIComponent(query)}&pageSize=8`);
    const json = await res.json();
    setResults(json.cards || []);
  }

  async function addCard(cardId: string) {
    setBusy(true);
    try {
      const res = await fetch("/api/portfolio", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ cardId, quantity: 1 }),
      });
      if (res.ok) {
        setResults([]);
        setQuery("");
        await load();
      } else {
        const j = await res.json();
        setError(j.error || "Could not add card");
      }
    } finally {
      setBusy(false);
    }
  }

  async function addWatch(cardId: string) {
    await fetch("/api/watchlist", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ cardId }),
    });
    await load();
  }

  async function removeItem(id: string) {
    await fetch(`/api/portfolio?id=${id}`, { method: "DELETE" });
    await load();
  }

  if (status === "loading" || !data) {
    return (
      <div className="container-page py-20 text-center text-zinc-400">
        Loading your portfolio…
      </div>
    );
  }

  const displayName = data.user.username || data.user.name || "Trainer";

  return (
    <div className="container-page py-10">
      {error && (
        <p className="mb-4 rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-2 text-sm text-red-300">
          {error}
        </p>
      )}

      {/* Profile header */}
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
        <button className="rounded-lg border border-[#FFD700]/50 px-4 py-2 text-sm font-medium text-[#FFD700] hover:bg-[#FFD700]/10">
          Share Portfolio Publicly
        </button>
      </div>

      {/* Stats */}
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
            value: `+${data.items.length}`,
            badge: "Holdings this account",
          },
          {
            label: "Estimated Profit",
            value: formatZar(data.stats.estimatedProfit),
            badge: "+24.1% Holdings performance",
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
          {/* Add cards */}
          <section className="rounded-2xl border border-white/8 bg-[#12151E] p-6">
            <h2 className="text-lg font-semibold text-white">Add Cards to Portfolio</h2>
            <div className="mt-4 grid gap-4 md:grid-cols-2">
              <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-[#FFD700]/40 bg-[#0B0E14] px-4 py-10 text-center">
                <Camera className="text-[#FFD700]" size={28} />
                <p className="mt-3 max-w-xs text-sm text-zinc-400">
                  Drag & drop card photo here. AI will auto-recognize card artwork, set, and condition.
                </p>
                <button
                  type="button"
                  className="mt-4 inline-flex items-center gap-2 rounded-lg bg-[#FFD700] px-4 py-2 text-sm font-semibold text-[#0B0E14]"
                  onClick={() => alert("AI scanner coming soon — use manual search below for now.")}
                >
                  <Upload size={14} /> Upload Image
                </button>
              </div>
              <div>
                <form onSubmit={searchManual} className="flex gap-2">
                  <div className="relative flex-1">
                    <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
                    <input
                      value={query}
                      onChange={(e) => setQuery(e.target.value)}
                      placeholder="Search manual database..."
                      className="w-full rounded-lg border border-white/10 bg-[#0B0E14] py-2.5 pl-9 pr-3 text-sm text-white placeholder:text-zinc-500 focus:border-[#FFD700]/40 focus:outline-none"
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={busy}
                    className="rounded-lg bg-[#FFD700] px-4 py-2 text-sm font-semibold text-[#0B0E14] disabled:opacity-60"
                  >
                    Add
                  </button>
                </form>
                {results.length > 0 && (
                  <ul className="mt-3 max-h-56 space-y-2 overflow-y-auto">
                    {results.map((c) => (
                      <li
                        key={c.id}
                        className="flex items-center gap-3 rounded-lg border border-white/5 bg-[#0B0E14] p-2"
                      >
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={mediaUrl(c.imageSmall)}
                          alt=""
                          className="h-10 w-8 rounded object-cover"
                        />
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm text-white">{c.name}</p>
                          <p className="truncate text-xs text-zinc-500">
                            {c.setName} · {formatZar(c.priceZar)}
                          </p>
                        </div>
                        <div className="flex gap-1">
                          <button
                            onClick={() => addCard(c.id)}
                            className="rounded-md bg-[#FFD700] px-2 py-1 text-xs font-semibold text-[#0B0E14]"
                          >
                            + Portfolio
                          </button>
                          <button
                            onClick={() => addWatch(c.id)}
                            className="rounded-md border border-white/10 px-2 py-1 text-xs text-zinc-300"
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
          </section>

          {/* Collection */}
          <section>
            <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
              <div>
                <h2 className="text-xl font-bold text-white">My Collection</h2>
                <p className="text-sm text-zinc-500">
                  {data.stats.totalCards} items matching your inventory
                </p>
              </div>
              <div className="flex gap-2">
                <span className="rounded-lg border border-white/10 bg-[#12151E] px-3 py-1.5 text-xs text-zinc-300">
                  Condition: Raw
                </span>
                <span className="rounded-lg border border-white/10 bg-[#12151E] px-3 py-1.5 text-xs text-zinc-300">
                  Sorted: Value (High)
                </span>
              </div>
            </div>
            {data.items.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-white/10 px-6 py-16 text-center text-sm text-zinc-500">
                No cards yet. Search above to add your first card.
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-4">
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
                          onClick={() => removeItem(item.id)}
                          className="text-[11px] text-red-400 opacity-0 transition group-hover:opacity-100"
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

        {/* Sidebar */}
        <aside className="space-y-6">
          <div className="rounded-2xl border border-white/8 bg-[#12151E] p-5">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-white">My Watchlist</h3>
              <Link href="/cards" className="text-xs text-[#FFD700]">
                Edit
              </Link>
            </div>
            <ul className="mt-4 space-y-3">
              {data.watchlist.length === 0 && (
                <li className="text-xs text-zinc-500">Watch cards from search results.</li>
              )}
              {data.watchlist.map((w) => (
                <li key={w.id} className="flex items-center gap-3">
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
                  <p className="mt-1 text-[11px] text-zinc-560 text-zinc-500">
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
