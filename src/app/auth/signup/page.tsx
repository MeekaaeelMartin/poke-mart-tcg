"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import { useState } from "react";

export default function SignUpPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(data.error || "Registration failed");
      }

      const signInResult = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });

      if (signInResult?.error) {
        router.push("/auth/signin");
        return;
      }

      router.push("/premium");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="container-page flex min-h-[70vh] items-center justify-center py-12">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <h1
            className="text-3xl font-extrabold tracking-tight text-white"
            style={{ fontFamily: "var(--font-syne), sans-serif" }}
          >
            Create your account
          </h1>
          <p className="mt-2 text-sm text-zinc-400">
            Free search for everyone. Upgrade to Premium (R50/mo) for your dashboard.
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="rounded-2xl border border-white/8 bg-[#12151E] p-6 sm:p-8"
        >
          <div className="space-y-4">
            <div>
              <label htmlFor="name" className="mb-1.5 block text-xs font-medium text-zinc-400">
                Name
              </label>
              <input
                id="name"
                required
                autoComplete="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full rounded-xl border border-white/10 bg-[#0B0E14] px-4 py-2.5 text-sm text-white placeholder:text-zinc-600 focus:border-[#FFD700]/40 focus:outline-none focus:ring-1 focus:ring-[#FFD700]/30"
                placeholder="Ash Ketchum"
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
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-xl border border-white/10 bg-[#0B0E14] px-4 py-2.5 text-sm text-white placeholder:text-zinc-600 focus:border-[#FFD700]/40 focus:outline-none focus:ring-1 focus:ring-[#FFD700]/30"
                placeholder="you@example.com"
              />
            </div>
            <div>
              <label htmlFor="password" className="mb-1.5 block text-xs font-medium text-zinc-400">
                Password
              </label>
              <input
                id="password"
                type="password"
                required
                minLength={6}
                autoComplete="new-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-xl border border-white/10 bg-[#0B0E14] px-4 py-2.5 text-sm text-white placeholder:text-zinc-600 focus:border-[#FFD700]/40 focus:outline-none focus:ring-1 focus:ring-[#FFD700]/30"
                placeholder="At least 6 characters"
              />
            </div>
          </div>

          {error && <p className="mt-4 text-sm text-red-400">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="mt-6 w-full rounded-lg bg-[#FFD700] px-6 py-3 text-sm font-semibold text-[#0B0E14] glow-yellow transition hover:brightness-105 disabled:opacity-60"
          >
            {loading ? "Creating account…" : "Sign Up"}
          </button>

          <p className="mt-6 text-center text-sm text-zinc-500">
            Already have an account?{" "}
            <Link href="/auth/signin" className="font-medium text-[#FFD700] hover:underline">
              Sign in
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
}
