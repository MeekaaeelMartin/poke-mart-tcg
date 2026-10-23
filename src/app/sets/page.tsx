import type { Metadata } from "next";
import { ensureDatabase } from "@/lib/ensureDatabase";
import { buildMetadata } from "@/lib/seo";
import { loadSetsCatalog } from "@/lib/setsCatalog";
import { SetsClient } from "./SetsClient";

export const dynamic = "force-dynamic";

export const metadata: Metadata = buildMetadata({
  title: "Pokemon TCG Sets — Checklists, Logos & Card Counts",
  description:
    "Browse every Pokemon TCG expansion with set logos, release dates, card counts, and links to live ZAR prices. Find ETBs and sealed product for each set.",
  path: "/sets",
  keywords: [
    "Pokemon TCG sets",
    "Pokemon set checklist",
    "Pokemon expansion list",
    "Scarlet Violet sets",
    "Pokemon set card list South Africa",
  ],
});

export default async function SetsPage() {
  await ensureDatabase();

  const sets = await loadSetsCatalog({ pageSize: 100 });

  return (
    <div className="container-page py-6 pb-24 sm:py-10 sm:pb-16">
      <span className="inline-flex rounded-full border border-[#FFD700]/30 bg-[#FFD700]/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-wider text-[#FFD700]">
        TCG Sets Directory
      </span>
      <h1
        className="mt-4 text-2xl font-bold tracking-tight text-white sm:text-3xl lg:text-4xl"
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
