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
      className="flex w-full max-w-xl flex-col gap-2 rounded-2xl border border-white/10 bg-[#12151E] p-1.5 shadow-[0_0_40px_rgba(0,0,0,0.35)] sm:flex-row sm:items-center"
    >
      <div className="flex min-w-0 flex-1 items-center gap-2 px-3">
        <Search size={18} className="shrink-0 text-zinc-500" />
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search cards, sets, prices…"
          className="w-full min-w-0 bg-transparent py-2.5 text-sm text-white placeholder:text-zinc-500 focus:outline-none"
          enterKeyHint="search"
        />
      </div>
      <button
        type="submit"
        className="min-h-11 w-full shrink-0 rounded-xl bg-[#FFD700] px-5 py-2.5 text-sm font-semibold text-[#0B0E14] transition hover:brightness-105 sm:w-auto"
      >
        Find Cards
      </button>
    </form>
  );
}
