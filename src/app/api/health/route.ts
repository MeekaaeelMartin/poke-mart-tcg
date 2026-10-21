import { NextResponse } from "next/server";
import { dbReady } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET() {
  const database = await dbReady();
  return NextResponse.json({
    ok: true,
    database,
    hasCarddexKey: Boolean(
      process.env.CARDDEX_API_KEY && !process.env.CARDDEX_API_KEY.includes("YOUR_KEY")
    ),
    hasAuthSecret: Boolean(process.env.AUTH_SECRET || process.env.NEXTAUTH_SECRET),
    nextAuthUrl: process.env.NEXTAUTH_URL || null,
    nodeEnv: process.env.NODE_ENV,
    cwd: process.cwd(),
  });
}
