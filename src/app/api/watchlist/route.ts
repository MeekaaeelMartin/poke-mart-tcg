import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { ensureCardInDb } from "@/lib/ensureCard";
import { requirePremiumSession } from "@/lib/requirePremium";

export async function GET() {
  const gate = await requirePremiumSession();
  if (gate.error) return gate.error;

  const items = await prisma.watchlistItem.findMany({
    where: { userId: gate.session.user.id },
    include: { card: true },
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json({ items });
}

export async function POST(req: NextRequest) {
  const gate = await requirePremiumSession();
  if (gate.error) return gate.error;

  const { cardId } = await req.json();
  if (!cardId) return NextResponse.json({ error: "cardId required" }, { status: 400 });

  try {
    await ensureCardInDb(cardId);
  } catch {
    return NextResponse.json({ error: "Card not found on CardDex" }, { status: 404 });
  }

  const item = await prisma.watchlistItem.upsert({
    where: { userId_cardId: { userId: gate.session.user.id, cardId } },
    create: { userId: gate.session.user.id, cardId },
    update: {},
    include: { card: true },
  });

  return NextResponse.json({ item });
}

export async function DELETE(req: NextRequest) {
  const gate = await requirePremiumSession();
  if (gate.error) return gate.error;

  const id = req.nextUrl.searchParams.get("id");
  if (!id) return NextResponse.json({ error: "id required" }, { status: 400 });
  await prisma.watchlistItem.deleteMany({ where: { id, userId: gate.session.user.id } });
  return NextResponse.json({ ok: true });
}
