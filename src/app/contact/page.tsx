"use client";

import { useState } from "react";
import { ChevronDown, Mail, MessageCircle } from "lucide-react";
import { cn } from "@/lib/format";

function InstagramIcon({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
      <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
    </svg>
  );
}

const SUBJECTS = [
  "General Inquiry",
  "Partnership",
  "API",
  "Premium Support",
] as const;

const FAQ = [
  {
    q: "How are ZAR prices calculated?",
    a: "We sync nightly at 3:00 AM SAST from CardDex and convert EUR market values using our configured EUR→ZAR rate. Prices overwrite locally so your view stays current — free search and premium dashboards use the same underlying data.",
  },
  {
    q: "Does Poke Mart use AI card recognition?",
    a: "Premium members get an AI upload area in the dashboard to identify cards from photos (demo integration). It helps you add singles to your portfolio faster than manual search — recognition quality improves with clear, well-lit images.",
  },
  {
    q: "Is Poke Mart affiliated with The Pokémon Company?",
    a: "No. Poke Mart TCG is an independent South African companion app. Pokémon and related marks are trademarks of their respective owners. We are not sponsored or endorsed by The Pokémon Company International.",
  },
  {
    q: "How do price alerts work?",
    a: "Premium members (R50/mo) can set watchlist alerts on cards. When nightly sync moves a price above or below your threshold, we flag it in your dashboard activity feed. Free users can browse live prices but cannot save alerts.",
  },
];

function FaqItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="rounded-2xl border border-white/8 bg-[#12151E]">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left"
        aria-expanded={open}
      >
        <span className="text-sm font-semibold text-white">{q}</span>
        <ChevronDown
          size={18}
          className={cn("shrink-0 text-zinc-500 transition", open && "rotate-180")}
        />
      </button>
      <div className={cn("faq-content", open && "open")}>
        <div>
          <p className="px-5 pb-4 text-sm leading-relaxed text-zinc-400">{a}</p>
        </div>
      </div>
    </div>
  );
}

export default function ContactPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [subject, setSubject] = useState<string>(SUBJECTS[0]);
  const [message, setMessage] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("loading");
    setErrorMsg("");
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, subject, message }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Failed to send message");
      }
      setStatus("success");
      setName("");
      setEmail("");
      setSubject(SUBJECTS[0]);
      setMessage("");
    } catch (err) {
      setStatus("error");
      setErrorMsg(err instanceof Error ? err.message : "Something went wrong");
    }
  }

  return (
    <div className="container-page py-12 pb-16">
      <div className="mb-10 max-w-xl">
        <h1
          className="text-4xl font-extrabold tracking-tight text-white sm:text-5xl"
          style={{ fontFamily: "var(--font-syne), sans-serif" }}
        >
          Get in <span className="text-[#FFD700]">touch</span>
        </h1>
        <p className="mt-4 text-base leading-relaxed text-zinc-400">
          Questions about ZAR pricing, premium features, or partnerships? We&apos;re
          here to help South African collectors.
        </p>
      </div>

      <div className="grid gap-8 lg:grid-cols-2">
        {/* Contact form */}
        <form
          onSubmit={handleSubmit}
          className="rounded-2xl border border-white/8 bg-[#12151E] p-6 sm:p-8"
        >
          <h2 className="text-lg font-semibold text-white">Send a message</h2>
          <div className="mt-6 space-y-4">
            <div>
              <label htmlFor="name" className="mb-1.5 block text-xs font-medium text-zinc-400">
                Name
              </label>
              <input
                id="name"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full rounded-xl border border-white/10 bg-[#0B0E14] px-4 py-2.5 text-sm text-white placeholder:text-zinc-600 focus:border-[#FFD700]/40 focus:outline-none focus:ring-1 focus:ring-[#FFD700]/30"
                placeholder="Your name"
              />
            </div>
            <div>
              <label htmlFor="email" className="mb-1.5 block text-xs font-medium text-zinc-400">
                Email
              </label>
              <input
                id="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-xl border border-white/10 bg-[#0B0E14] px-4 py-2.5 text-sm text-white placeholder:text-zinc-600 focus:border-[#FFD700]/40 focus:outline-none focus:ring-1 focus:ring-[#FFD700]/30"
                placeholder="you@example.com"
              />
            </div>
            <div>
              <label htmlFor="subject" className="mb-1.5 block text-xs font-medium text-zinc-400">
                Subject
              </label>
              <select
                id="subject"
                required
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                className="w-full rounded-xl border border-white/10 bg-[#0B0E14] px-4 py-2.5 text-sm text-white focus:border-[#FFD700]/40 focus:outline-none focus:ring-1 focus:ring-[#FFD700]/30"
              >
                {SUBJECTS.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor="message" className="mb-1.5 block text-xs font-medium text-zinc-400">
                Message
              </label>
              <textarea
                id="message"
                required
                rows={5}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                className="w-full resize-none rounded-xl border border-white/10 bg-[#0B0E14] px-4 py-2.5 text-sm text-white placeholder:text-zinc-600 focus:border-[#FFD700]/40 focus:outline-none focus:ring-1 focus:ring-[#FFD700]/30"
                placeholder="How can we help?"
              />
            </div>
          </div>

          {status === "success" && (
            <p className="mt-4 text-sm text-emerald-400">
              Message sent — we&apos;ll get back to you soon.
            </p>
          )}
          {status === "error" && (
            <p className="mt-4 text-sm text-red-400">{errorMsg}</p>
          )}

          <button
            type="submit"
            disabled={status === "loading"}
            className="mt-6 w-full rounded-lg bg-[#FFD700] px-6 py-3 text-sm font-semibold text-[#0B0E14] glow-yellow transition hover:brightness-105 disabled:opacity-60"
          >
            {status === "loading" ? "Sending…" : "Send Message"}
          </button>
        </form>

        {/* Contact info */}
        <div className="space-y-6">
          <div className="rounded-2xl border border-white/8 bg-[#12151E] p-6 sm:p-8">
            <h2 className="text-lg font-semibold text-white">Contact info</h2>
            <ul className="mt-6 space-y-5">
              <li className="flex items-start gap-3">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#FFD700]/15 text-[#FFD700]">
                  <Mail size={18} />
                </span>
                <div>
                  <p className="text-xs font-medium uppercase tracking-wider text-zinc-500">Email</p>
                  <a
                    href="mailto:hello@poke-mart-tcg.co.za"
                    className="mt-1 block text-sm text-white hover:text-[#FFD700]"
                  >
                    hello@poke-mart-tcg.co.za
                  </a>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#FFD700]/15 text-[#FFD700]">
                  <MessageCircle size={18} />
                </span>
                <div>
                  <p className="text-xs font-medium uppercase tracking-wider text-zinc-500">Hours</p>
                  <p className="mt-1 text-sm text-zinc-300">Mon–Fri, 08:30–17:00 SAST</p>
                </div>
              </li>
            </ul>

            <div className="mt-8 flex flex-wrap gap-3">
              <a
                href="https://discord.gg/pokemart"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-lg border border-indigo-500/30 bg-indigo-500/10 px-4 py-2.5 text-sm font-medium text-indigo-300 transition hover:bg-indigo-500/20"
              >
                <MessageCircle size={16} />
                Discord
              </a>
              <a
                href="https://instagram.com/pokemarttcg"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-lg border border-pink-500/30 bg-pink-500/10 px-4 py-2.5 text-sm font-medium text-pink-300 transition hover:bg-pink-500/20"
              >
                <InstagramIcon size={16} />
                Instagram
              </a>
            </div>
          </div>

          <div className="rounded-2xl border border-[#FFD700]/20 bg-gradient-to-br from-[#151a28] to-[#0d1018] p-6">
            <p className="text-sm leading-relaxed text-zinc-400">
              Premium support requests are prioritised for R50/mo members. Include your
              account email so we can look up your subscription.
            </p>
          </div>
        </div>
      </div>

      {/* FAQ */}
      <section className="mt-16">
        <h2
          className="text-2xl font-bold text-white sm:text-3xl"
          style={{ fontFamily: "var(--font-syne), sans-serif" }}
        >
          Frequently asked questions
        </h2>
        <p className="mt-2 text-sm text-zinc-500">
          Quick answers about pricing, AI recognition, and premium alerts.
        </p>
        <div className="mt-8 space-y-3">
          {FAQ.map((item) => (
            <FaqItem key={item.q} q={item.q} a={item.a} />
          ))}
        </div>
      </section>
    </div>
  );
}
