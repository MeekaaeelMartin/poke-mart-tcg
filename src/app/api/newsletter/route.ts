import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function POST(req: NextRequest) {
  const { email } = await req.json().catch(() => ({}));
  if (!email || typeof email !== "string" || !email.includes("@")) {
    return NextResponse.json({ error: "Valid email required" }, { status: 400 });
  }
  await prisma.newsletterSub.upsert({
    where: { email: email.toLowerCase().trim() },
    create: { email: email.toLowerCase().trim() },
    update: {},
  });
  return NextResponse.json({ success: true });
}
