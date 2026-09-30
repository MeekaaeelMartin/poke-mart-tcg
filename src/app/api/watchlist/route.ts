import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { ensureCardInDb } from "@/lib/ensureCard";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!session.user.isPremium) {
    return NextResponse.json({ error: "Premium required" }, { status: 403 });
  }

  const items = await prisma.watchlistItem.findMany({
    where: { userId: session.user.id },
    include: { card: true },
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json({ items });
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!session.user.isPremium) {
    return NextResponse.json({ error: "Premium required" }, { status: 403 });
  }

  const { cardId } = await req.json();
  if (!cardId) return NextResponse.json({ error: "cardId required" }, { status: 400 });

  try {
    await ensureCardInDb(cardId);
  } catch {
    return NextResponse.json({ error: "Card not found on CardDex" }, { status: 404 });
  }

  const item = await prisma.watchlistItem.upsert({
    where: { userId_cardId: { userId: session.user.id, cardId } },
    create: { userId: session.user.id, cardId },
    update: {},
    include: { card: true },
  });

  return NextResponse.json({ item });
}

export async function DELETE(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const id = req.nextUrl.searchParams.get("id");
  if (!id) return NextResponse.json({ error: "id required" }, { status: 400 });
  await prisma.watchlistItem.deleteMany({ where: { id, userId: session.user.id } });
  return NextResponse.json({ ok: true });
}
