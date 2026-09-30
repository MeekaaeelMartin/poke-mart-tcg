import { NextRequest, NextResponse } from "next/server";
import { searchCards } from "@/lib/sync";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const sp = req.nextUrl.searchParams;
  const result = await searchCards({
    q: sp.get("q") || undefined,
    set: sp.get("set") || undefined,
    type: sp.get("type") || undefined,
    rarity: sp.get("rarity") || undefined,
    minPrice: sp.get("min") ? Number(sp.get("min")) : undefined,
    maxPrice: sp.get("max") ? Number(sp.get("max")) : undefined,
    sort: sp.get("sort") || "price_desc",
    page: Number(sp.get("page") || 1),
    pageSize: Number(sp.get("pageSize") || 12),
  });
  return NextResponse.json(result);
}

export async function POST(req: NextRequest) {
  // Manual add-by-id for portfolio search
  const body = await req.json().catch(() => ({}));
  const q = String(body.q || "").trim();
  if (!q) return NextResponse.json({ cards: [] });

  const cards = await prisma.card.findMany({
    where: {
      OR: [
        { name: { contains: q } },
        { id: { contains: q } },
      ],
    },
    take: 10,
    orderBy: { priceZar: "desc" },
  });
  return NextResponse.json({ cards });
}
