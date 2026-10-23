import type { Metadata } from "next";
import Link from "next/link";
import { LEGAL_CONTACT, LEGAL_UPDATED } from "@/components/LegalDoc";

export const metadata: Metadata = {
  title: "Legal Centre — Terms, Privacy & Disclaimers",
  description:
    "Terms of Service, Privacy Policy (POPIA & GDPR), Subscription & Refunds, IP & Fair Use, and financial pricing disclaimer for Poke Mart TCG South Africa.",
  alternates: { canonical: "/legal" },
  openGraph: {
    title: "Legal Centre | Poke Mart TCG",
    description:
      "Terms, POPIA/GDPR privacy, subscriptions, IP notice, and financial disclaimer for Poke Mart TCG.",
    url: "/legal",
  },
};

const DOCS = [
  {
    href: "/legal/terms",
    title: "Terms of Service",
    body: "Rules for using Poke Mart TCG, accounts, acceptable use, and liability limits.",
  },
  {
    href: "/legal/privacy",
    title: "Privacy Policy",
    body: "How we collect, use, store, and share personal information under POPIA and GDPR.",
  },
  {
    href: "/legal/subscription",
    title: "Subscription & Refund Policy",
    body: "Premium R50/month billing, renewals, cancellations, and refund rules.",
  },
  {
    href: "/legal/intellectual-property",
    title: "Intellectual Property & Fair Use",
    body: "Pokémon trademarks, CardDex data, our content, and fair-use expectations.",
  },
  {
    href: "/legal/financial-disclaimer",
    title: "Financial & Pricing Disclaimer",
    body: "Market prices are informational — not investment, tax, or trading advice.",
  },
] as const;

export default function LegalHubPage() {
  return (
    <div className="container-page py-12 pb-20">
      <span className="inline-flex rounded-full border border-[#FFD700]/30 bg-[#FFD700]/10 px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-[#FFD700]">
        Legal
      </span>
      <h1
        className="mt-4 text-4xl font-extrabold tracking-tight text-white sm:text-5xl"
        style={{ fontFamily: "var(--font-syne), sans-serif" }}
      >
        Legal <span className="text-[#FFD700]">centre</span>
      </h1>
      <p className="mt-4 max-w-2xl text-base leading-relaxed text-zinc-400">
        Policies for Poke Mart TCG — South Africa&apos;s Pokemon TCG companion for live ZAR
        pricing, free search, and Premium portfolio tools. Last updated {LEGAL_UPDATED}.
      </p>

      <div className="mt-12 grid gap-4 sm:grid-cols-2">
        {DOCS.map((doc) => (
          <Link
            key={doc.href}
            href={doc.href}
            className="group rounded-2xl border border-white/8 bg-[#12151E] p-6 transition hover:border-[#FFD700]/35"
          >
            <h2 className="text-lg font-semibold text-white group-hover:text-[#FFD700]">
              {doc.title}
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-zinc-400">{doc.body}</p>
            <span className="mt-4 inline-block text-sm font-medium text-[#FFD700]">
              Read policy →
            </span>
          </Link>
        ))}
      </div>

      <p className="mt-12 text-sm text-zinc-500">
        Questions?{" "}
        <a href={`mailto:${LEGAL_CONTACT}`} className="text-[#FFD700] hover:underline">
          {LEGAL_CONTACT}
        </a>{" "}
        or visit{" "}
        <Link href="/contact" className="text-[#FFD700] hover:underline">
          Contact
        </Link>
        .
      </p>
    </div>
  );
}
