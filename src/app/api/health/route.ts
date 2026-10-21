import { NextResponse } from "next/server";
import { dbReady } from "@/lib/db";
import { ensureDatabase } from "@/lib/ensureDatabase";
import { fetchTopPrices } from "@/lib/carddex";

export const dynamic = "force-dynamic";

export async function GET() {
  await ensureDatabase();
  const database = await dbReady();

  let carddexOk = false;
  let sampleCard: string | null = null;
  try {
    const top = await fetchTopPrices({ pageSize: 1 });
    sampleCard = top.data?.[0]?.card_name || null;
    carddexOk = Boolean(sampleCard);
  } catch {
    carddexOk = false;
  }

  let tablesOk = false;
  try {
    const { prisma } = await import("@/lib/db");
    await prisma.card.findFirst({ select: { id: true } });
    tablesOk = true;
  } catch {
    tablesOk = false;
  }

  return NextResponse.json({
    ok: true,
    database,
    tablesOk,
    carddexOk,
    sampleCard,
    hasCarddexKey: Boolean(
      process.env.CARDDEX_API_KEY && !process.env.CARDDEX_API_KEY.includes("YOUR_KEY")
    ),
    hasAuthSecret: Boolean(process.env.AUTH_SECRET || process.env.NEXTAUTH_SECRET),
    nextAuthUrl: process.env.NEXTAUTH_URL || null,
    nodeEnv: process.env.NODE_ENV,
    cwd: process.cwd(),
  });
}
