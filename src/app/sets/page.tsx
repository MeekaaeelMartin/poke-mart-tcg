import { prisma } from "@/lib/db";
import { ensureDatabase } from "@/lib/ensureDatabase";
import { fetchSets } from "@/lib/carddex";
import { SetsClient } from "./SetsClient";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Pokémon TCG Sets",
};

export default async function SetsPage() {
  await ensureDatabase();

  let sets: Array<{
    id: string;
    name: string;
    series: string | null;
    releaseDate: string | null;
    totalCards: number | null;
    officialCards: number | null;
    logoUrl: string | null;
    setCode: string | null;
  }> = [];

  try {
    sets = await prisma.set.findMany({
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
  } catch {
    sets = [];
  }

  if (sets.length === 0) {
    try {
      const remote = await fetchSets({ pageSize: 100 });
      sets = (remote.data || []).map((s) => ({
        id: s.id,
        name: s.name,
        series: s.series || null,
        releaseDate: s.release_date || null,
        totalCards: s.total_cards ?? null,
        officialCards: s.official_cards ?? null,
        logoUrl: s.logo_url || null,
        setCode: s.set_code || null,
      }));
      for (const s of remote.data || []) {
        try {
          await prisma.set.upsert({
            where: { id: s.id },
            create: {
              id: s.id,
              name: s.name,
              series: s.series || null,
              releaseDate: s.release_date || null,
              officialCards: s.official_cards ?? null,
              totalCards: s.total_cards ?? null,
              logoUrl: s.logo_url || null,
              symbolUrl: s.symbol_url || null,
              setCode: s.set_code || null,
              lastSyncedAt: new Date(),
            },
            update: {
              name: s.name,
              logoUrl: s.logo_url || null,
              totalCards: s.total_cards ?? null,
              lastSyncedAt: new Date(),
            },
          });
        } catch {
          /* ignore */
        }
      }
    } catch {
      /* empty */
    }
  }

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
