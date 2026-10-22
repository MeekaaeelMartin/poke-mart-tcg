import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";

/** Gate premium APIs using DB status (JWT can lag right after upgrade). */
export async function requirePremiumSession() {
  const session = await auth();
  if (!session?.user?.id) {
    return {
      error: NextResponse.json({ error: "Sign in required" }, { status: 401 }),
      session: null as null,
    };
  }

  try {
    const dbUser = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { isPremium: true, premiumUntil: true },
    });
    const active =
      !!dbUser?.isPremium && (!dbUser.premiumUntil || dbUser.premiumUntil > new Date());
    if (!active && !session.user.isPremium) {
      return {
        error: NextResponse.json(
          { error: "Premium required", code: "PREMIUM_REQUIRED" },
          { status: 403 }
        ),
        session: null as null,
      };
    }
  } catch {
    if (!session.user.isPremium) {
      return {
        error: NextResponse.json(
          { error: "Premium required", code: "PREMIUM_REQUIRED" },
          { status: 403 }
        ),
        session: null as null,
      };
    }
  }

  return { error: null as null, session };
}
