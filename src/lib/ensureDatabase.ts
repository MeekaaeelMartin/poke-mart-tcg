import { execFile } from "child_process";
import { promisify } from "util";
import path from "path";
import { prisma } from "./db";

const execFileAsync = promisify(execFile);

let ensuring: Promise<void> | null = null;
let ready = false;

/** Hostinger standalone uses a different cwd than build — recreate SQLite tables if missing. */
export async function ensureDatabase(): Promise<void> {
  if (ready) return;
  if (ensuring) return ensuring;

  ensuring = (async () => {
    try {
      await prisma.card.findFirst({ select: { id: true } });
      ready = true;
      return;
    } catch {
      /* tables missing — push schema */
    }

    try {
      const prismaCli = path.join(process.cwd(), "node_modules", "prisma", "build", "index.js");
      await execFileAsync(process.execPath, [prismaCli, "db", "push", "--skip-generate", "--accept-data-loss"], {
        env: process.env,
        cwd: process.cwd(),
        timeout: 60_000,
      });
    } catch (err) {
      console.error("[ensureDatabase] prisma db push failed", err);
      // Last resort: create minimal tables so public pages don't 500
      await createMinimalSchema();
    }

    try {
      await prisma.card.findFirst({ select: { id: true } });
      ready = true;
    } catch (err) {
      console.error("[ensureDatabase] schema still missing", err);
    }
  })();

  return ensuring;
}

async function createMinimalSchema() {
  const statements = [
    `CREATE TABLE IF NOT EXISTS "User" (
      "id" TEXT PRIMARY KEY NOT NULL,
      "email" TEXT NOT NULL UNIQUE,
      "name" TEXT,
      "passwordHash" TEXT NOT NULL,
      "image" TEXT,
      "isPremium" BOOLEAN NOT NULL DEFAULT 0,
      "premiumUntil" DATETIME,
      "username" TEXT UNIQUE,
      "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
    )`,
    `CREATE TABLE IF NOT EXISTS "Set" (
      "id" TEXT PRIMARY KEY NOT NULL,
      "name" TEXT NOT NULL,
      "series" TEXT,
      "releaseDate" TEXT,
      "officialCards" INTEGER,
      "totalCards" INTEGER,
      "logoUrl" TEXT,
      "symbolUrl" TEXT,
      "setCode" TEXT,
      "lastSyncedAt" DATETIME,
      "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
    )`,
    `CREATE TABLE IF NOT EXISTS "Card" (
      "id" TEXT PRIMARY KEY NOT NULL,
      "setId" TEXT NOT NULL,
      "name" TEXT NOT NULL,
      "number" TEXT,
      "supertype" TEXT,
      "subtypes" TEXT,
      "hp" INTEGER,
      "types" TEXT,
      "rarity" TEXT,
      "artist" TEXT,
      "imageSmall" TEXT,
      "imageLarge" TEXT,
      "imageThumb" TEXT,
      "setName" TEXT,
      "setCode" TEXT,
      "priceZar" REAL,
      "priceEur" REAL,
      "avg7dZar" REAL,
      "avg30dZar" REAL,
      "pctChange1d" REAL,
      "pctChange7d" REAL,
      "pctChange30d" REAL,
      "lastSyncedAt" DATETIME,
      "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
    )`,
    `CREATE TABLE IF NOT EXISTS "BlogPost" (
      "id" TEXT PRIMARY KEY NOT NULL,
      "slug" TEXT NOT NULL UNIQUE,
      "title" TEXT NOT NULL,
      "excerpt" TEXT NOT NULL,
      "content" TEXT NOT NULL,
      "category" TEXT NOT NULL,
      "author" TEXT NOT NULL,
      "authorRole" TEXT,
      "authorImage" TEXT,
      "imageUrl" TEXT,
      "readMinutes" INTEGER NOT NULL DEFAULT 5,
      "featured" BOOLEAN NOT NULL DEFAULT 0,
      "publishedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
    )`,
    `CREATE TABLE IF NOT EXISTS "PortfolioItem" (
      "id" TEXT PRIMARY KEY NOT NULL,
      "userId" TEXT NOT NULL,
      "cardId" TEXT NOT NULL,
      "quantity" INTEGER NOT NULL DEFAULT 1,
      "condition" TEXT NOT NULL DEFAULT 'Raw',
      "purchasePrice" REAL,
      "notes" TEXT,
      "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
    )`,
    `CREATE TABLE IF NOT EXISTS "WatchlistItem" (
      "id" TEXT PRIMARY KEY NOT NULL,
      "userId" TEXT NOT NULL,
      "cardId" TEXT NOT NULL,
      "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
    )`,
    `CREATE TABLE IF NOT EXISTS "Activity" (
      "id" TEXT PRIMARY KEY NOT NULL,
      "userId" TEXT NOT NULL,
      "message" TEXT NOT NULL,
      "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
    )`,
    `CREATE TABLE IF NOT EXISTS "PriceAlert" (
      "id" TEXT PRIMARY KEY NOT NULL,
      "userId" TEXT NOT NULL,
      "cardId" TEXT NOT NULL,
      "targetPrice" REAL NOT NULL,
      "direction" TEXT NOT NULL DEFAULT 'below',
      "active" BOOLEAN NOT NULL DEFAULT 1,
      "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
    )`,
    `CREATE TABLE IF NOT EXISTS "ContactMessage" (
      "id" TEXT PRIMARY KEY NOT NULL,
      "name" TEXT NOT NULL,
      "email" TEXT NOT NULL,
      "subject" TEXT NOT NULL,
      "message" TEXT NOT NULL,
      "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
    )`,
    `CREATE TABLE IF NOT EXISTS "NewsletterSub" (
      "id" TEXT PRIMARY KEY NOT NULL,
      "email" TEXT NOT NULL UNIQUE,
      "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
    )`,
    `CREATE TABLE IF NOT EXISTS "SyncLog" (
      "id" TEXT PRIMARY KEY NOT NULL,
      "type" TEXT NOT NULL,
      "status" TEXT NOT NULL,
      "cardsUpdated" INTEGER NOT NULL DEFAULT 0,
      "setsUpdated" INTEGER NOT NULL DEFAULT 0,
      "message" TEXT,
      "startedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      "finishedAt" DATETIME
    )`,
  ];

  for (const sql of statements) {
    try {
      await prisma.$executeRawUnsafe(sql);
    } catch (e) {
      console.warn("[ensureDatabase] create table warn", e);
    }
  }
}
