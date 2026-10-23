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
    <div className="container-page py-8 pb-20 sm:py-12">
      <div className="mb-6 sm:mb-8">
        <Link
          href="/legal"
          className="inline-flex min-h-11 items-center text-sm text-zinc-500 transition hover:text-[#FFD700]"
        >
          ← Legal centre
        </Link>
        <h1
          className="mt-3 text-2xl font-extrabold tracking-tight text-white sm:mt-4 sm:text-3xl lg:text-4xl"
          style={{ fontFamily: "var(--font-syne), sans-serif" }}
        >
          {title}
        </h1>
        {subtitle && (
          <p className="mt-3 max-w-2xl text-sm leading-relaxed text-zinc-400">{subtitle}</p>
        )}
        <p className="mt-2 text-xs text-zinc-500">Last updated: {LEGAL_UPDATED}</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-[220px_1fr] lg:gap-10">
        <nav className="-mx-1 overflow-x-auto pb-1 lg:mx-0 lg:sticky lg:top-24 lg:h-fit lg:space-y-1 lg:overflow-visible lg:pb-0">
          <p className="mb-2 hidden text-[10px] font-bold uppercase tracking-widest text-zinc-500 lg:mb-3 lg:block">
            Policies
          </p>
          <div className="flex gap-2 px-1 lg:flex-col lg:gap-1 lg:px-0">
            {NAV.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="shrink-0 rounded-lg border border-white/10 px-3 py-2.5 text-sm text-zinc-400 transition hover:bg-white/5 hover:text-[#FFD700] lg:border-0 lg:px-3 lg:py-2"
              >
                {item.label}
              </Link>
            ))}
            <Link
              href="/contact"
              className="hidden rounded-lg px-3 py-2 text-sm text-zinc-500 transition hover:text-white lg:mt-4 lg:block"
            >
              Contact us
            </Link>
          </div>
        </nav>

        <article className="legal-prose max-w-3xl overflow-x-auto rounded-2xl border border-white/8 bg-[#12151E]/80 px-4 py-6 sm:px-8 sm:py-10">
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
