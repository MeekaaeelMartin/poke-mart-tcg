import { Suspense } from "react";
import { prisma } from "@/lib/db";
import { CardsBrowser } from "./CardsBrowser";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Poke Card Database",
};

export default async function CardsPage() {
  const sets = await prisma.set.findMany({
    orderBy: { name: "asc" },
    select: {
      id: true,
      name: true,
      setCode: true,
      totalCards: true,
    },
  });

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
