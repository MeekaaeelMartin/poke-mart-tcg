import { Suspense } from "react";
import { ensureDatabase } from "@/lib/ensureDatabase";
import { loadSetsCatalog } from "@/lib/setsCatalog";
import { CardsBrowser } from "./CardsBrowser";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Poke Card Database",
};

export default async function CardsPage() {
  await ensureDatabase();

  const catalog = await loadSetsCatalog({ pageSize: 100 });
  const sets = catalog
    .map((s) => ({
      id: s.id,
      name: s.name,
      setCode: s.setCode,
      totalCards: s.totalCards,
    }))
    .sort((a, b) => a.name.localeCompare(b.name));

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
