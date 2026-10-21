import { Suspense } from "react";
import { prisma } from "@/lib/db";
import { ensureDatabase } from "@/lib/ensureDatabase";
import { fetchSets } from "@/lib/carddex";
import { CardsBrowser } from "./CardsBrowser";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Poke Card Database",
};

export default async function CardsPage() {
  await ensureDatabase();

  let sets: Array<{
    id: string;
    name: string;
    setCode: string | null;
    totalCards: number | null;
  }> = [];

  try {
    sets = await prisma.set.findMany({
      orderBy: { name: "asc" },
      select: {
        id: true,
        name: true,
        setCode: true,
        totalCards: true,
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
        setCode: s.set_code || null,
        totalCards: s.total_cards ?? null,
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
            update: { name: s.name, logoUrl: s.logo_url || null, lastSyncedAt: new Date() },
          });
        } catch {
          /* ignore */
        }
      }
    } catch {
      /* empty filters */
    }
  }

  return (
    <div className="container-page py-10 pb-16">
      <Suspense
        fallback={
          <div className="py-24 text-center text-sm text-zinc-400">Loading card browser…</div>
        }
      >
        <CardsBrowser sets={sets} />
      </Suspense>
    </div>
  );
}
