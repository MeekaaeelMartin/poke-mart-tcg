"use client";

import { useSession } from "next-auth/react";
import Link from "next/link";
import { useState } from "react";

export function AddToCollection({
  cardId,
  cardName,
}: {
  cardId: string;
  cardName: string;
}) {
  const { data: session, status } = useSession();
  const [msg, setMsg] = useState("");
  const [busy, setBusy] = useState(false);

  async function add(kind: "portfolio" | "watchlist") {
    if (!session?.user) return;
    if (!session.user.isPremium) {
      setMsg("Premium required — upgrade for R50/mo");
      return;
    }
    setBusy(true);
    setMsg("");
    try {
      const res = await fetch(kind === "portfolio" ? "/api/portfolio" : "/api/watchlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ cardId }),
      });
      if (!res.ok) {
        const j = await res.json().catch(() => ({}));
        throw new Error(j.error || "Failed");
      }
      setMsg(
        kind === "portfolio"
          ? `${cardName} added to your portfolio`
          : `${cardName} added to watchlist`
      );
    } catch (e) {
      setMsg(e instanceof Error ? e.message : "Could not save card");
    } finally {
      setBusy(false);
    }
  }

  if (status === "loading") return null;

  if (!session?.user) {
    return (
      <Link
        href={`/auth/signin?callbackUrl=/cards/${encodeURIComponent(cardId)}`}
        className="block rounded-xl border border-white/10 px-4 py-3 text-center text-sm text-zinc-300 hover:border-[#FFD700]/40 hover:text-[#FFD700]"
      >
        Sign in to save this card
      </Link>
    );
  }

  if (!session.user.isPremium) {
    return (
      <Link
        href="/premium"
        className="block rounded-xl bg-[#FFD700] px-4 py-3 text-center text-sm font-semibold text-[#0B0E14]"
      >
        Unlock portfolio — R50/mo
      </Link>
    );
  }

  return (
    <div className="space-y-2">
      <div className="grid grid-cols-2 gap-2">
        <button
          disabled={busy}
          onClick={() => add("portfolio")}
          className="rounded-xl bg-[#FFD700] px-4 py-3 text-sm font-semibold text-[#0B0E14] disabled:opacity-60"
        >
          + Portfolio
        </button>
        <button
          disabled={busy}
          onClick={() => add("watchlist")}
          className="rounded-xl border border-white/15 px-4 py-3 text-sm font-medium text-white hover:border-[#FFD700]/40 disabled:opacity-60"
        >
          + Watchlist
        </button>
      </div>
      {msg && <p className="text-center text-xs text-zinc-400">{msg}</p>}
    </div>
  );
}
