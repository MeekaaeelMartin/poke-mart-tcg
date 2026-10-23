import type { Metadata } from "next";
import { Suspense } from "react";
import { ensureDatabase } from "@/lib/ensureDatabase";
import { buildMetadata } from "@/lib/seo";
import { loadSetsCatalog } from "@/lib/setsCatalog";
import { CardsBrowser } from "./CardsBrowser";

export const dynamic = "force-dynamic";

export const metadata: Metadata = buildMetadata({
  title: "Pokemon Card Database — Live ZAR Prices & Search",
  description:
    "Search every Pokemon TCG card with live South African Rand prices. Find Charizard, Pikachu, chase rares, and set prints with Cardmarket-backed ZAR values and price trends.",
  path: "/cards",
  keywords: [
    "Pokemon card database",
    "Pokemon card search",
    "Pokemon card prices South Africa",
    "Charizard price ZAR",
    "Pikachu card value",
    "Pokemon singles prices",
  ],
});

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
    <div className="container-page py-6 pb-24 sm:py-10 sm:pb-16">
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
