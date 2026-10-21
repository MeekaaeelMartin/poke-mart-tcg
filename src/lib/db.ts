import fs from "fs";
import path from "path";
import { PrismaClient } from "@prisma/client";

/** Make SQLite paths work when Hostinger runs from `.next/standalone`. */
function resolveSqliteUrl() {
  const raw = process.env.DATABASE_URL || "file:./prisma/prod.db";
  if (!raw.startsWith("file:")) return;

  let filePath = raw.slice("file:".length);
  // Strip optional query params
  const q = filePath.indexOf("?");
  if (q >= 0) filePath = filePath.slice(0, q);

  if (!path.isAbsolute(filePath)) {
    filePath = path.join(process.cwd(), filePath);
  }

  try {
    fs.mkdirSync(path.dirname(filePath), { recursive: true });
  } catch {
    /* ignore */
  }

  process.env.DATABASE_URL = `file:${filePath}`;
}

resolveSqliteUrl();

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient };

export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
  });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;

export async function dbReady(): Promise<boolean> {
  try {
    await prisma.$queryRaw`SELECT 1`;
    return true;
  } catch {
    return false;
  }
}
