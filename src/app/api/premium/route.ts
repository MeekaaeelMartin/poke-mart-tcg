import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";

/** Activate R50/mo premium for the signed-in user (demo checkout). */
export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Sign in required" }, { status: 401 });
  }

  const body = await req.json().catch(() => ({}));
  const months = Math.max(1, Number(body.months || 1));
  const until = new Date();
  until.setMonth(until.getMonth() + months);

  const user = await prisma.user.update({
    where: { id: session.user.id },
    data: {
      isPremium: true,
      premiumUntil: until,
    },
    select: { id: true, email: true, isPremium: true, premiumUntil: true },
  });

  await prisma.activity.create({
    data: {
      userId: user.id,
      message: `Premium activated for R${process.env.PREMIUM_PRICE_ZAR || 50}/mo until ${until.toLocaleDateString("en-ZA")}`,
    },
  });

  return NextResponse.json({
    success: true,
    user,
    message: "Premium unlocked. Refresh your session to access the dashboard.",
  });
}

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ premium: false });
  }
  const user = await prisma.user.findUnique({ where: { id: session.user.id } });
  const active =
    !!user?.isPremium && (!user.premiumUntil || user.premiumUntil > new Date());
  return NextResponse.json({
    premium: active,
    premiumUntil: user?.premiumUntil,
    priceZar: Number(process.env.PREMIUM_PRICE_ZAR || 50),
  });
}
