import { prisma } from "@/lib/db";
import { SetsClient } from "./SetsClient";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Pokémon TCG Sets",
};

export default async function SetsPage() {
  const sets = await prisma.set.findMany({
    orderBy: { releaseDate: "desc" },
    select: {
      id: true,
      name: true,
      series: true,
      releaseDate: true,
      totalCards: true,
      officialCards: true,
      logoUrl: true,
      setCode: true,
    },
  });

  return (
    <div className="container-page py-10 pb-16">
      <span className="inline-flex rounded-full border border-[#FFD700]/30 bg-[#FFD700]/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-wider text-[#FFD700]">
        TCG Sets Directory
      </span>
      <h1
        className="mt-4 text-3xl font-bold tracking-tight text-white sm:text-4xl"
        style={{ fontFamily: "var(--font-syne), sans-serif" }}
      >
        Pokémon TCG Sets
      </h1>
      <p className="mt-2 max-w-2xl text-sm text-zinc-400">
        Every expansion synced from CardDex — grouped by series with release dates
        and card counts. Jump straight into the card browser for any set.
      </p>

      <div className="mt-10">
        <SetsClient sets={sets} />
      </div>
    </div>
  );
}
