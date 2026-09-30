"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Search } from "lucide-react";

export function HomeSearch() {
  const [q, setQ] = useState("");
  const router = useRouter();

  function submit(e: React.FormEvent) {
    e.preventDefault();
    router.push(`/cards?q=${encodeURIComponent(q.trim())}`);
  }

  return (
    <form
      onSubmit={submit}
      className="flex w-full max-w-xl items-center gap-2 rounded-2xl border border-white/10 bg-[#12151E] p-1.5 shadow-[0_0_40px_rgba(0,0,0,0.35)]"
    >
      <div className="flex flex-1 items-center gap-2 px-3">
        <Search size={18} className="text-zinc-500" />
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search cards, Pokémon, sets, or specific price..."
          className="w-full bg-transparent py-2.5 text-sm text-white placeholder:text-zinc-500 focus:outline-none"
        />
      </div>
      <button
        type="submit"
        className="shrink-0 rounded-xl bg-[#FFD700] px-5 py-2.5 text-sm font-semibold text-[#0B0E14] transition hover:brightness-105"
      >
        Find Cards
      </button>
    </form>
  );
}
