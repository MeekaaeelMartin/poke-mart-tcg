import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { z } from "zod";

const schema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
  subject: z.string().min(1),
  message: z.string().min(5),
});

export async function POST(req: NextRequest) {
  try {
    const data = schema.parse(await req.json());
    await prisma.contactMessage.create({ data });
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Invalid message" }, { status: 400 });
  }
}
