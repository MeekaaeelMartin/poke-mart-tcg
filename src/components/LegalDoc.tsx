import Link from "next/link";
import type { ReactNode } from "react";

export const LEGAL_UPDATED = "21 October 2026";
export const LEGAL_CONTACT = "hello@poke-mart-tcg.co.za";
export const LEGAL_OPERATOR = "Poke Mart TCG";

const NAV = [
  { href: "/legal/terms", label: "Terms of Service" },
  { href: "/legal/privacy", label: "Privacy Policy" },
  { href: "/legal/subscription", label: "Subscription & Refunds" },
  { href: "/legal/intellectual-property", label: "IP & Fair Use" },
  { href: "/legal/financial-disclaimer", label: "Financial Disclaimer" },
] as const;

export function LegalDoc({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle?: string;
  children: ReactNode;
}) {
  return (
    <div className="container-page py-12 pb-20">
      <div className="mb-8">
        <Link
          href="/legal"
          className="text-sm text-zinc-500 transition hover:text-[#FFD700]"
        >
          ← Legal centre
        </Link>
        <h1
          className="mt-4 text-3xl font-extrabold tracking-tight text-white sm:text-4xl"
          style={{ fontFamily: "var(--font-syne), sans-serif" }}
        >
          {title}
        </h1>
        {subtitle && (
          <p className="mt-3 max-w-2xl text-sm leading-relaxed text-zinc-400">{subtitle}</p>
        )}
        <p className="mt-2 text-xs text-zinc-500">Last updated: {LEGAL_UPDATED}</p>
      </div>

      <div className="grid gap-10 lg:grid-cols-[220px_1fr]">
        <nav className="h-fit space-y-1 lg:sticky lg:top-24">
          <p className="mb-3 text-[10px] font-bold uppercase tracking-widest text-zinc-500">
            Policies
          </p>
          {NAV.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="block rounded-lg px-3 py-2 text-sm text-zinc-400 transition hover:bg-white/5 hover:text-[#FFD700]"
            >
              {item.label}
            </Link>
          ))}
          <Link
            href="/contact"
            className="mt-4 block rounded-lg px-3 py-2 text-sm text-zinc-500 transition hover:text-white"
          >
            Contact us
          </Link>
        </nav>

        <article className="legal-prose max-w-3xl rounded-2xl border border-white/8 bg-[#12151E]/80 px-6 py-8 sm:px-8 sm:py-10">
          {children}
          <p className="mt-10 border-t border-white/8 pt-6 text-xs leading-relaxed text-zinc-500">
            These documents are provided for transparency. They are not a substitute for
            formal legal advice. For questions, email{" "}
            <a href={`mailto:${LEGAL_CONTACT}`} className="text-[#FFD700] hover:underline">
              {LEGAL_CONTACT}
            </a>
            .
          </p>
        </article>
      </div>
    </div>
  );
}

export function H2({ children }: { children: ReactNode }) {
  return (
    <h2 className="mt-10 text-lg font-bold text-white first:mt-0" style={{ fontFamily: "var(--font-syne), sans-serif" }}>
      {children}
    </h2>
  );
}

export function P({ children }: { children: ReactNode }) {
  return <p className="mt-3 text-sm leading-relaxed text-zinc-400">{children}</p>;
}

export function Ul({ children }: { children: ReactNode }) {
  return <ul className="mt-3 list-disc space-y-2 pl-5 text-sm leading-relaxed text-zinc-400">{children}</ul>;
}
