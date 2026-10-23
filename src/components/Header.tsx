"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import { useEffect, useState } from "react";
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
    <Link href="/" className={cn("flex min-h-11 items-center gap-2.5 group", className)}>
      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#FFD700] text-[#0B0E14] shadow-[0_0_18px_rgba(255,215,0,0.35)]">
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

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  return (
    <header className="sticky top-0 z-50 border-b border-white/5 bg-[#0B0E14]/92 pt-[env(safe-area-inset-top)] backdrop-blur-md">
      <div className="mx-auto flex h-14 max-w-7xl items-center justify-between gap-3 px-4 sm:h-16 sm:px-6 lg:px-8">
        <Logo />

        <nav className="hidden items-center gap-0.5 lg:flex">
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

        <div className="hidden items-center gap-3 lg:flex">
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
          type="button"
          className="inline-flex min-h-11 min-w-11 items-center justify-center rounded-md text-zinc-300 lg:hidden"
          onClick={() => setOpen((v) => !v)}
          aria-expanded={open}
          aria-label="Toggle menu"
        >
          {open ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      {open && (
        <div className="border-t border-white/5 bg-[#0B0E14] px-4 pb-[max(1rem,env(safe-area-inset-bottom))] pt-3 lg:hidden">
          <div className="mx-auto flex max-w-7xl flex-col gap-1">
            {NAV.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setOpen(false)}
                className={cn(
                  "flex min-h-12 items-center rounded-lg px-3 text-base font-medium",
                  pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href))
                    ? "bg-[#FFD700]/10 text-[#FFD700]"
                    : "text-zinc-300"
                )}
              >
                {item.label}
              </Link>
            ))}
            <div className="mt-3 flex flex-col gap-2 sm:flex-row">
              {session?.user ? (
                <>
                  <button
                    type="button"
                    onClick={() => {
                      setOpen(false);
                      signOut({ callbackUrl: "/" });
                    }}
                    className="min-h-12 flex-1 rounded-lg border border-white/10 px-4 text-center text-sm text-zinc-300"
                  >
                    Sign Out
                  </button>
                  <Link
                    href={isPremium ? "/dashboard" : "/premium"}
                    onClick={() => setOpen(false)}
                    className="flex min-h-12 flex-1 items-center justify-center rounded-lg bg-[#FFD700] px-4 text-center text-sm font-semibold text-[#0B0E14]"
                  >
                    Dashboard
                  </Link>
                </>
              ) : (
                <>
                  <Link
                    href="/auth/signin"
                    onClick={() => setOpen(false)}
                    className="flex min-h-12 flex-1 items-center justify-center rounded-lg border border-white/10 px-4 text-center text-sm"
                  >
                    Sign In
                  </Link>
                  <Link
                    href="/auth/signup"
                    onClick={() => setOpen(false)}
                    className="flex min-h-12 flex-1 items-center justify-center rounded-lg bg-[#FFD700] px-4 text-center text-sm font-semibold text-[#0B0E14]"
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
