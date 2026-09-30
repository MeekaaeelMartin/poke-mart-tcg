"use client";

import Link from "next/link";
import { useState } from "react";
import { Logo } from "./Header";

export function Footer() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "ok" | "err">("idle");

  async function subscribe(e: React.FormEvent) {
    e.preventDefault();
    try {
      const res = await fetch("/api/newsletter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      setStatus(res.ok ? "ok" : "err");
      if (res.ok) setEmail("");
    } catch {
      setStatus("err");
    }
  }

  return (
    <footer className="mt-auto border-t border-white/5 bg-[#07090E]">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-14 sm:px-6 md:grid-cols-2 lg:grid-cols-4 lg:px-8">
        <div>
          <Logo />
          <p className="mt-4 max-w-xs text-sm leading-relaxed text-zinc-400">
            South Africa&apos;s premier Pokemon trading card companion. Track live
            market values, manage your personal collection, and secure master sets
            effortlessly.
          </p>
          <div className="mt-5 flex gap-3">
            {["facebook", "instagram", "x", "discord"].map((s) => (
              <a
                key={s}
                href="#"
                aria-label={s}
                className="flex h-9 w-9 items-center justify-center rounded-full border border-white/10 text-zinc-400 transition hover:border-[#FFD700]/40 hover:text-[#FFD700]"
              >
                <span className="text-xs uppercase">{s[0]}</span>
              </a>
            ))}
          </div>
        </div>

        <div>
          <h4 className="text-sm font-semibold uppercase tracking-wider text-white">
            Resources
          </h4>
          <ul className="mt-4 space-y-2 text-sm text-zinc-400">
            <li><Link href="/prices" className="hover:text-[#FFD700]">Market Pricing</Link></li>
            <li><Link href="/cards" className="hover:text-[#FFD700]">Card Directory</Link></li>
            <li><Link href="/sets" className="hover:text-[#FFD700]">TCG Sets</Link></li>
            <li><Link href="/blog" className="hover:text-[#FFD700]">Price Lab Blog</Link></li>
            <li><a href="https://carddex.dev/docs" target="_blank" rel="noreferrer" className="hover:text-[#FFD700]">API Access</a></li>
          </ul>
        </div>

        <div>
          <h4 className="text-sm font-semibold uppercase tracking-wider text-white">
            Company
          </h4>
          <ul className="mt-4 space-y-2 text-sm text-zinc-400">
            <li><Link href="/contact" className="hover:text-[#FFD700]">About Us</Link></li>
            <li><Link href="/contact" className="hover:text-[#FFD700]">Privacy Policy</Link></li>
            <li><Link href="/contact" className="hover:text-[#FFD700]">Terms of Use</Link></li>
            <li><Link href="/premium" className="hover:text-[#FFD700]">Premium R50/mo</Link></li>
            <li><Link href="/contact" className="hover:text-[#FFD700]">Contact Us</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="text-sm font-semibold text-white">Stay ahead of the meta</h4>
          <p className="mt-2 text-sm text-zinc-400">
            Weekly market digests for South African trainers.
          </p>
          <form onSubmit={subscribe} className="mt-4 flex gap-2">
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your trainer email..."
              className="w-full rounded-lg border border-white/10 bg-[#12151E] px-3 py-2 text-sm text-white placeholder:text-zinc-500 focus:border-[#FFD700]/50 focus:outline-none"
            />
            <button
              type="submit"
              className="shrink-0 rounded-lg bg-[#FFD700] px-4 py-2 text-sm font-semibold text-[#0B0E14]"
            >
              Subscribe
            </button>
          </form>
          {status === "ok" && (
            <p className="mt-2 text-xs text-emerald-400">You&apos;re on the list.</p>
          )}
          {status === "err" && (
            <p className="mt-2 text-xs text-red-400">Could not subscribe. Try again.</p>
          )}
        </div>
      </div>

      <div className="border-t border-white/5">
        <div className="mx-auto flex max-w-7xl flex-col gap-2 px-4 py-5 text-xs text-zinc-500 sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-8">
          <p>© {new Date().getFullYear()} Poke Mart TCG</p>
          <p className="max-w-xl sm:text-right">
            Not affiliated with Nintendo, Game Freak, or The Pokémon Company. All
            trademarks belong to their respective owners.
          </p>
        </div>
      </div>
    </footer>
  );
}
