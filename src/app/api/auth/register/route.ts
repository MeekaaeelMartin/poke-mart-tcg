import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/db";
import { z } from "zod";

const schema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  name: z.string().min(1).max(80),
  username: z.string().min(3).max(30).optional(),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const data = schema.parse(body);
    const email = data.email.toLowerCase().trim();

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return NextResponse.json({ error: "Email already registered" }, { status: 400 });
    }

    const username =
      data.username?.replace(/[^a-zA-Z0-9_]/g, "") ||
      email.split("@")[0].replace(/[^a-zA-Z0-9_]/g, "").slice(0, 20);

    const passwordHash = await bcrypt.hash(data.password, 10);
    const user = await prisma.user.create({
      data: {
        email,
        name: data.name,
        username,
        passwordHash,
      },
      select: { id: true, email: true, name: true, username: true },
    });

    await prisma.activity.create({
      data: {
        userId: user.id,
        message: "Welcome to Poke Mart TCG! Upgrade to Premium (R50/mo) to unlock your portfolio dashboard.",
      },
    });

    return NextResponse.json({ user });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues[0]?.message || "Invalid input" }, { status: 400 });
    }
    return NextResponse.json({ error: "Registration failed" }, { status: 500 });
  }
}
