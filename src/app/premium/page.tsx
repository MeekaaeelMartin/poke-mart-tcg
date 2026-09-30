"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { useState } from "react";
import {
  Bell,
  Briefcase,
  Camera,
  Eye,
  Share2,
  Sparkles,
} from "lucide-react";
import { formatZar } from "@/lib/format";

const PREMIUM_PRICE = Number(process.env.NEXT_PUBLIC_PREMIUM_PRICE_ZAR || 50);

const FEATURES = [
  {
    icon: Briefcase,
    title: "Portfolio dashboard",
    body: "Track total collection value in ZAR with nightly CardDex sync updates.",
  },
  {
    icon: Eye,
    title: "Watchlist",
    body: "Save chase cards and monitor price movement across sets.",
  },
  {
    icon: Bell,
    title: "Price alerts",
    body: "Get notified when cards cross your target thresholds after sync.",
  },
  {
    icon: Camera,
    title: "AI upload area",
    body: "Identify cards from photos and add them to your portfolio faster.",
  },
  {
    icon: Share2,
    title: "Share portfolio",
    body: "Generate a shareable view of your collection for friends or trades.",
  },
];

export default function PremiumPage() {
  const { data: session, status, update } = useSession();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const isPremium = Boolean(session?.user?.isPremium);
  const signedIn = status === "authenticated";

  async function handleUpgrade() {
    if (!signedIn) return;
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/premium", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ months: 1 }),
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(data.error || "Upgrade failed");
      }

      await update({ isPremium: true });
      router.push("/dashboard");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="container-page py-12 pb-16">
      <div className="mx-auto max-w-3xl text-center">
        <span className="inline-flex items-center gap-1.5 rounded-full border border-[#FFD700]/30 bg-[#FFD700]/10 px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-[#FFD700]">
          <Sparkles size={12} />
          Premium
        </span>
        <h1
          className="mt-4 text-4xl font-extrabold tracking-tight text-white sm:text-5xl"
          style={{ fontFamily: "var(--font-syne), sans-serif" }}
        >
          Unlock your{" "}
          <span className="text-[#FFD700]">trainer dashboard</span>
        </h1>
        <p className="mt-4 text-base leading-relaxed text-zinc-400">
          Free search lets everyone browse cards, sets, and live ZAR prices.
          Premium adds the tools serious collectors need to manage value.
        </p>
        <p className="mt-2 text-3xl font-bold text-white">
          {formatZar(PREMIUM_PRICE)}
          <span className="text-base font-normal text-zinc-500"> / month</span>
        </p>
      </div>

      <div className="mx-auto mt-12 grid max-w-4xl gap-5 sm:grid-cols-2">
        <div className="rounded-2xl border border-white/8 bg-[#12151E] p-6">
          <h2 className="text-lg font-semibold text-white">Free</h2>
          <p className="mt-1 text-sm text-zinc-500">Always available</p>
          <ul className="mt-5 space-y-3 text-sm text-zinc-400">
            <li className="flex gap-2">
              <span className="text-[#FFD700]">✓</span> Card & set search
            </li>
            <li className="flex gap-2">
              <span className="text-[#FFD700]">✓</span> Live ZAR market prices
            </li>
            <li className="flex gap-2">
              <span className="text-[#FFD700]">✓</span> Trending & blog access
            </li>
            <li className="flex gap-2 text-zinc-600">
              <span>—</span> No portfolio or alerts
            </li>
          </ul>
        </div>

        <div className="rounded-2xl border border-[#FFD700]/30 bg-gradient-to-br from-[#151a28] to-[#12151E] p-6">
          <h2 className="text-lg font-semibold text-[#FFD700]">Premium</h2>
          <p className="mt-1 text-sm text-zinc-500">{formatZar(PREMIUM_PRICE)}/mo</p>
          <ul className="mt-5 space-y-3">
            {FEATURES.map((f) => (
              <li key={f.title} className="flex gap-3 text-sm text-zinc-300">
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#FFD700]/15 text-[#FFD700]">
                  <f.icon size={16} />
                </span>
                <div>
                  <p className="font-medium text-white">{f.title}</p>
                  <p className="text-xs text-zinc-500">{f.body}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="mx-auto mt-10 max-w-md text-center">
        {status === "loading" ? (
          <div className="h-12 animate-pulse rounded-lg bg-[#12151E]" />
        ) : isPremium ? (
          <>
            <p className="mb-4 text-sm text-emerald-400">You already have Premium active.</p>
            <Link
              href="/dashboard"
              className="inline-block w-full rounded-lg bg-[#FFD700] px-6 py-3 text-sm font-semibold text-[#0B0E14] glow-yellow transition hover:brightness-105"
            >
              Go to Dashboard
            </Link>
          </>
        ) : signedIn ? (
          <>
            {error && <p className="mb-4 text-sm text-red-400">{error}</p>}
            <button
              type="button"
              onClick={handleUpgrade}
              disabled={loading}
              className="w-full rounded-lg bg-[#FFD700] px-6 py-3 text-sm font-semibold text-[#0B0E14] glow-yellow transition hover:brightness-105 disabled:opacity-60"
            >
              {loading ? "Activating…" : `Upgrade for ${formatZar(PREMIUM_PRICE)}/mo`}
            </button>
            <p className="mt-3 text-xs text-zinc-600">
              Demo checkout — no payment processor required.
            </p>
          </>
        ) : (
          <>
            <p className="mb-4 text-sm text-zinc-400">
              Sign in or create an account to upgrade.
            </p>
            <Link
              href="/auth/signup"
              className="inline-block w-full rounded-lg bg-[#FFD700] px-6 py-3 text-sm font-semibold text-[#0B0E14] glow-yellow transition hover:brightness-105"
            >
              Create Account & Upgrade
            </Link>
            <p className="mt-4 text-sm text-zinc-500">
              Already registered?{" "}
              <Link href="/auth/signin" className="text-[#FFD700] hover:underline">
                Sign in
              </Link>
            </p>
          </>
        )}
      </div>
    </div>
  );
}
