"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import { useState } from "react";
import { Menu, X } from "lucide-react";
import { cn } from "@/lib/format";

const NAV = [
  { href: "/", label: "Home" },
  { href: "/cards", label: "Cards" },
  { href: "/sets", label: "Sets" },
  { href: "/prices", label: "Prices" },
  { href: "/blog", label: "Blog" },
  { href: "/contact", label: "Contact" },
];

export function Logo({ className }: { className?: string }) {
  return (
    <Link href="/" className={cn("flex items-center gap-2.5 group", className)}>
      <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[#FFD700] text-[#0B0E14] shadow-[0_0_18px_rgba(255,215,0,0.35)]">
        <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2.4">
          <circle cx="12" cy="12" r="9" />
          <path d="M12 3v18M3 12h18" />
        </svg>
      </span>
      <span className="text-[15px] font-semibold tracking-tight text-white">
        Poke Mart <span className="text-[#FFD700]">TCG</span>
      </span>
    </Link>
  );
}

export function Header() {
  const pathname = usePathname();
  const { data: session } = useSession();
  const [open, setOpen] = useState(false);
  const isPremium = Boolean(session?.user?.isPremium);

  return (
    <header className="sticky top-0 z-50 border-b border-white/5 bg-[#0B0E14]/92 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
        <Logo />

        <nav className="hidden items-center gap-1 md:flex">
          {NAV.map((item) => {
            const active =
              item.href === "/"
                ? pathname === "/"
                : pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "rounded-md px-3 py-2 text-sm font-medium transition-colors",
                  active ? "text-[#FFD700]" : "text-zinc-300 hover:text-white"
                )}
              >
                {item.label}
                {active && (
                  <span className="mt-1 block h-0.5 rounded-full bg-[#FFD700]" />
                )}
              </Link>
            );
          })}
        </nav>

        <div className="hidden items-center gap-3 md:flex">
          {session?.user ? (
            <>
              <button
                onClick={() => signOut({ callbackUrl: "/" })}
                className="text-sm text-zinc-300 hover:text-white"
              >
                Sign Out
              </button>
              <Link
                href={isPremium ? "/dashboard" : "/premium"}
                className="rounded-lg bg-[#FFD700] px-4 py-2 text-sm font-semibold text-[#0B0E14] shadow-[0_0_20px_rgba(255,215,0,0.25)] transition hover:brightness-105"
              >
                Dashboard
              </Link>
            </>
          ) : (
            <>
              <Link href="/auth/signin" className="text-sm text-zinc-300 hover:text-white">
                Sign In
              </Link>
              <Link
                href="/auth/signup"
                className="rounded-lg bg-[#FFD700] px-4 py-2 text-sm font-semibold text-[#0B0E14] shadow-[0_0_20px_rgba(255,215,0,0.25)] transition hover:brightness-105"
              >
                Dashboard
              </Link>
            </>
          )}
        </div>

        <button
          className="rounded-md p-2 text-zinc-300 md:hidden"
          onClick={() => setOpen((v) => !v)}
          aria-label="Toggle menu"
        >
          {open ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      {open && (
        <div className="border-t border-white/5 bg-[#0B0E14] px-4 py-4 md:hidden">
          <div className="flex flex-col gap-1">
            {NAV.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setOpen(false)}
                className={cn(
                  "rounded-md px-3 py-2 text-sm",
                  pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href))
                    ? "text-[#FFD700]"
                    : "text-zinc-300"
                )}
              >
                {item.label}
              </Link>
            ))}
            <div className="mt-3 flex gap-2">
              {session?.user ? (
                <Link
                  href={isPremium ? "/dashboard" : "/premium"}
                  onClick={() => setOpen(false)}
                  className="flex-1 rounded-lg bg-[#FFD700] px-4 py-2 text-center text-sm font-semibold text-[#0B0E14]"
                >
                  Dashboard
                </Link>
              ) : (
                <>
                  <Link
                    href="/auth/signin"
                    onClick={() => setOpen(false)}
                    className="flex-1 rounded-lg border border-white/10 px-4 py-2 text-center text-sm"
                  >
                    Sign In
                  </Link>
                  <Link
                    href="/auth/signup"
                    onClick={() => setOpen(false)}
                    className="flex-1 rounded-lg bg-[#FFD700] px-4 py-2 text-center text-sm font-semibold text-[#0B0E14]"
                  >
                    Get Started
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
