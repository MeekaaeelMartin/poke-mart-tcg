import { NextRequest, NextResponse } from "next/server";
import { runNightlySync } from "@/lib/sync";

export const maxDuration = 300;
export const dynamic = "force-dynamic";

/**
 * Nightly CardDex sync endpoint.
 * Call at 3:00 AM SAST via cron / Vercel Cron / system crontab.
 *
 * Authorization: Bearer $CRON_SECRET  OR  ?secret=$CRON_SECRET
 */
export async function GET(req: NextRequest) {
  const secret = process.env.CRON_SECRET || "poke-mart-cron-secret";
  const auth = req.headers.get("authorization");
  const qs = req.nextUrl.searchParams.get("secret");
  const ok =
    auth === `Bearer ${secret}` || qs === secret || process.env.NODE_ENV === "development";

  if (!ok) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const full = req.nextUrl.searchParams.get("full") !== "0";
    const maxPages = Number(req.nextUrl.searchParams.get("pages") || 8);
    const result = await runNightlySync({ fullCards: full, maxCardPages: maxPages });
    return NextResponse.json({ success: true, ...result, at: new Date().toISOString() });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Sync failed";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  return GET(req);
}
