import { prisma } from "@/lib/db";
import {
  fetchCardById,
  normalizeCardPrices,
  type CardDexCard,
} from "@/lib/carddex";
import { eurToZar } from "@/lib/format";

export async function ensureCardInDb(cardId: string) {
  const existing = await prisma.card.findUnique({ where: { id: cardId } });
  if (existing) return existing;

  const { data: c } = await fetchCardById(cardId, "images,prices");
  return upsertCardDex(c);
}

async function upsertCardDex(c: CardDexCard) {
  const setExists = await prisma.set.findUnique({ where: { id: c.set_id } });
  if (!setExists) {
    await prisma.set.create({
      data: {
        id: c.set_id,
        name: c.set_name || c.set_id,
        setCode: c.set_code || null,
      },
    });
  }

  const price = normalizeCardPrices(c.prices);
  const img = c.images?.[0];
  return prisma.card.upsert({
    where: { id: c.id },
    create: {
      id: c.id,
      setId: c.set_id,
      name: c.name,
      number: c.number || null,
      rarity: c.rarity || null,
      artist: c.artist || null,
      hp: c.hp ?? null,
      types: c.types ? JSON.stringify(c.types) : null,
      subtypes: c.subtypes ? JSON.stringify(c.subtypes) : null,
      setName: c.set_name || null,
      setCode: c.set_code || null,
      imageSmall: img?.small_url || c.image_url || null,
      imageLarge: img?.large_url || null,
      imageThumb: img?.thumb_url || img?.small_url || null,
      priceEur: price?.trend_price ?? null,
      priceZar: eurToZar(price?.trend_price ?? null),
      avg7dZar: eurToZar(price?.avg_7d ?? null),
      avg30dZar: eurToZar(price?.avg_30d ?? null),
      pctChange1d: price?.pct_change_1d ?? null,
      pctChange7d: price?.pct_change_7d ?? null,
      lastSyncedAt: new Date(),
    },
    update: {
      name: c.name,
      imageSmall: img?.small_url || c.image_url || undefined,
      imageLarge: img?.large_url || undefined,
      priceEur: price?.trend_price ?? undefined,
      priceZar: eurToZar(price?.trend_price ?? null) ?? undefined,
      lastSyncedAt: new Date(),
    },
  });
}
