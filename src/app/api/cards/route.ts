import { NextRequest, NextResponse } from "next/server";
import { searchCards } from "@/lib/sync";
import { prisma } from "@/lib/db";
import { ensureDatabase } from "@/lib/ensureDatabase";
import { fetchCards } from "@/lib/carddex";
import { eurToZar } from "@/lib/format";
import { normalizeCardPrices } from "@/lib/carddex";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  await ensureDatabase();
  const sp = req.nextUrl.searchParams;
  try {
    const result = await searchCards({
      q: sp.get("q") || undefined,
      set: sp.get("set") || undefined,
      type: sp.get("type") || undefined,
      rarity: sp.get("rarity") || undefined,
      minPrice: sp.get("min") ? Number(sp.get("min")) : undefined,
      maxPrice: sp.get("max") ? Number(sp.get("max")) : undefined,
      sort: sp.get("sort") || "price_desc",
      page: Number(sp.get("page") || 1),
      pageSize: Number(sp.get("pageSize") || 48),
    });
    return NextResponse.json(result);
  } catch (error) {
    // Absolute fallback: live CardDex only (no DB)
    try {
      const page = Number(sp.get("page") || 1);
      const pageSize = Number(sp.get("pageSize") || 48);
      const remote = await fetchCards({
        // Prefer `name` so images/prices embeds are returned
        name: sp.get("q") || undefined,
        set: sp.get("set") || undefined,
        type: sp.get("type") || undefined,
        rarity: sp.get("rarity") || undefined,
        page,
        pageSize,
        include: "images,prices",
      });
      const cards = (remote.data || []).map((c) => {
        const price = normalizeCardPrices(c.prices);
        return {
          id: c.id,
          setId: c.set_id,
          name: c.name,
          number: c.number || null,
          rarity: c.rarity || null,
          setName: c.set_name || null,
          imageSmall: c.images?.[0]?.small_url || c.image_url || null,
          imageLarge: c.images?.[0]?.large_url || null,
          priceZar: eurToZar(price?.trend_price ?? price?.avg_price ?? null),
          pctChange1d: price?.pct_change_1d ?? price?.price_change_1d ?? null,
          pctChange7d: price?.pct_change_7d ?? price?.price_change_7d ?? null,
          types: c.types ? JSON.stringify(c.types) : null,
        };
      });
      return NextResponse.json({
        cards,
        meta: remote.meta || {
          total: cards.length,
          page,
          pageSize,
          totalPages: 1,
        },
      });
    } catch (e) {
      const message = error instanceof Error ? error.message : "cards failed";
      return NextResponse.json(
        { cards: [], meta: { total: 0, page: 1, pageSize: 48, totalPages: 1 }, error: message },
        { status: 200 }
      );
    }
  }
}

export async function POST(req: NextRequest) {
  await ensureDatabase();
  const body = await req.json().catch(() => ({}));
  const q = String(body.q || "").trim();
  if (!q) return NextResponse.json({ cards: [] });

  try {
    const result = await searchCards({ q, page: 1, pageSize: 12, sort: "price_desc" });
    return NextResponse.json({ cards: result.cards });
  } catch {
    try {
      const cards = await prisma.card.findMany({
        where: {
          OR: [{ name: { contains: q } }, { id: { contains: q } }],
        },
        take: 12,
        orderBy: { priceZar: "desc" },
      });
      return NextResponse.json({ cards });
    } catch {
      return NextResponse.json({ cards: [] });
    }
  }
}
