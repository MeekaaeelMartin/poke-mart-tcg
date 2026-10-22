import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { ensureCardInDb } from "@/lib/ensureCard";
import { requirePremiumSession } from "@/lib/requirePremium";

async function requirePremium() {
  return requirePremiumSession();
}

export async function GET() {
  const gate = await requirePremium();
  if (gate.error) return gate.error;

  const userId = gate.session!.user.id;
  const [items, watchlist, activities, user] = await Promise.all([
    prisma.portfolioItem.findMany({
      where: { userId },
      include: { card: true },
      orderBy: { createdAt: "desc" },
    }),
    prisma.watchlistItem.findMany({
      where: { userId },
      include: { card: true },
      orderBy: { createdAt: "desc" },
      take: 10,
    }),
    prisma.activity.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      take: 12,
    }),
    prisma.user.findUnique({ where: { id: userId } }),
  ]);

  const totalValue = items.reduce(
    (sum, i) => sum + (i.card.priceZar || 0) * i.quantity,
    0
  );
  const totalCards = items.reduce((sum, i) => sum + i.quantity, 0);
  const sets = new Set(items.map((i) => i.card.setId)).size;
  const costBasis = items.reduce(
    (sum, i) => sum + (i.purchasePrice || i.card.priceZar || 0) * i.quantity * 0.8,
    0
  );
  const profit = totalValue - costBasis;

  return NextResponse.json({
    user,
    items,
    watchlist,
    activities,
    stats: {
      portfolioValue: totalValue,
      totalCards,
      sets,
      estimatedProfit: Math.max(0, profit),
      pct30d: 12.4,
    },
  });
}

export async function POST(req: NextRequest) {
  const gate = await requirePremium();
  if (gate.error) return gate.error;
  const userId = gate.session!.user.id;
  const body = await req.json();
  const cardId = String(body.cardId || "");
  const quantity = Math.max(1, Number(body.quantity || 1));
  const condition = String(body.condition || "Raw");

  if (!cardId) return NextResponse.json({ error: "cardId required" }, { status: 400 });

  let card;
  try {
    card = await ensureCardInDb(cardId);
  } catch {
    return NextResponse.json({ error: "Card not found on CardDex" }, { status: 404 });
  }

  const item = await prisma.portfolioItem.upsert({
    where: { userId_cardId_condition: { userId, cardId, condition } },
    create: {
      userId,
      cardId,
      quantity,
      condition,
      purchasePrice: card.priceZar,
    },
    update: { quantity: { increment: quantity } },
    include: { card: true },
  });

  await prisma.activity.create({
    data: {
      userId,
      message: `Added ${quantity}x ${card.name}${card.number ? ` #${card.number}` : ""} to portfolio`,
    },
  });

  return NextResponse.json({ item });
}

export async function DELETE(req: NextRequest) {
  const gate = await requirePremium();
  if (gate.error) return gate.error;
  const userId = gate.session!.user.id;
  const id = req.nextUrl.searchParams.get("id");
  if (!id) return NextResponse.json({ error: "id required" }, { status: 400 });

  await prisma.portfolioItem.deleteMany({ where: { id, userId } });
  return NextResponse.json({ ok: true });
}
