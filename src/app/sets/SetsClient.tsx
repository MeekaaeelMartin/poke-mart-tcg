"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Search } from "lucide-react";
import { cn } from "@/lib/format";
import { mediaUrl } from "@/lib/media";

export type SetRow = {
  id: string;
  name: string;
  series: string | null;
  releaseDate: string | null;
  totalCards: number | null;
  officialCards: number | null;
  logoUrl: string | null;
  setCode: string | null;
};

const SERIES_COLORS = ["bg-[#FFD700]", "bg-violet-500", "bg-sky-500"] as const;

function seriesColor(index: number) {
  return SERIES_COLORS[index % SERIES_COLORS.length];
}

function formatReleaseDate(date: string | null): string {
  if (!date) return "TBA";
  const parsed = new Date(date);
  if (Number.isNaN(parsed.getTime())) return date;
  return parsed.toLocaleDateString("en-ZA", {
    month: "short",
    year: "numeric",
  });
}

export function SetsClient({ sets }: { sets: SetRow[] }) {
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return sets;
    return sets.filter(
      (s) =>
        s.name.toLowerCase().includes(q) ||
        (s.series || "").toLowerCase().includes(q) ||
        (s.setCode || "").toLowerCase().includes(q)
    );
  }, [sets, query]);

  const grouped = useMemo(() => {
    const map = new Map<string, SetRow[]>();
    for (const set of filtered) {
      const key = set.series || "Other";
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(set);
    }
    return Array.from(map.entries());
  }, [filtered]);

  const seriesIndex = useMemo(() => {
    const unique = Array.from(new Set(sets.map((s) => s.series || "Other")));
    return new Map(unique.map((s, i) => [s, i]));
  }, [sets]);

  return (
    <div>
      <div className="relative mb-10 max-w-xl">
        <Search
          size={18}
          className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500"
        />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search sets by name or series..."
          className="w-full rounded-2xl border border-white/10 bg-[#12151E] py-3.5 pl-11 pr-4 text-sm text-white placeholder:text-zinc-500 focus:border-[#FFD700]/40 focus:outline-none"
        />
      </div>

      {grouped.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-white/10 bg-[#12151E]/50 px-6 py-16 text-center text-sm text-zinc-400">
          No sets match &ldquo;{query}&rdquo;. Try a different search.
        </div>
      ) : (
        <div className="space-y-12">
          {grouped.map(([series, seriesSets]) => {
            const colorIdx = seriesIndex.get(series) ?? 0;
            return (
              <section key={series} id={series.replace(/\s+/g, "-").toLowerCase()}>
                <div className="mb-5 flex items-center gap-3">
                  <span
                    className={cn("h-3 w-3 shrink-0 rounded-full", seriesColor(colorIdx))}
                  />
                  <h2 className="text-lg font-semibold text-white">{series}</h2>
                  <span className="text-xs text-zinc-500">
                    {seriesSets.length} set{seriesSets.length === 1 ? "" : "s"}
                  </span>
                </div>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                  {seriesSets.map((set) => (
                    <Link
                      key={set.id}
                      href={`/sets/${encodeURIComponent(set.id)}`}
                      id={set.id}
                      className="group flex flex-col overflow-hidden rounded-2xl border border-white/8 bg-[#12151E] transition hover:border-[#FFD700]/35 hover:shadow-[0_0_30px_rgba(255,215,0,0.08)]"
                    >
                      <div className="relative aspect-[16/10] bg-gradient-to-br from-[#1a1f2e] to-[#0B0E14]">
                        {set.logoUrl ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={mediaUrl(set.logoUrl)}
                            alt={set.name}
                            className="absolute inset-0 m-auto max-h-[65%] max-w-[75%] object-contain opacity-90 transition duration-300 group-hover:scale-105"
                          />
                        ) : (
                          <div className="absolute inset-0 flex items-center justify-center text-2xl font-bold text-white/10">
                            {set.setCode || set.id.slice(0, 4).toUpperCase()}
                          </div>
                        )}
                        <span className="absolute left-3 top-3 flex items-center gap-1.5 rounded-full bg-black/55 px-2.5 py-0.5 text-[10px] font-medium text-zinc-200 backdrop-blur">
                          <span
                            className={cn(
                              "h-1.5 w-1.5 rounded-full",
                              seriesColor(colorIdx)
                            )}
                          />
                          {series}
                        </span>
                        {set.releaseDate && (
                          <span className="absolute right-3 top-3 rounded-full bg-[#FFD700]/15 px-2.5 py-0.5 text-[10px] font-semibold text-[#FFD700]">
                            {formatReleaseDate(set.releaseDate)}
                          </span>
                        )}
                      </div>
                      <div className="flex flex-1 flex-col p-4">
                        <p className="text-xs text-zinc-500">
                          {set.totalCards ?? set.officialCards ?? "—"} cards
                        </p>
                        <h3 className="mt-1 line-clamp-2 text-sm font-semibold text-white">
                          {set.name}
                        </h3>
                        <span className="mt-auto pt-3 text-sm font-medium text-[#FFD700] transition group-hover:underline">
                          View Set →
                        </span>
                      </div>
                    </Link>
                  ))}
                </div>
              </section>
            );
          })}
        </div>
      )}
    </div>
  );
}
