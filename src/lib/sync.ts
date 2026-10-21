import { prisma } from "./db";
import {
  fetchCardById,
  fetchCards,
  fetchCardPrices,
  fetchPriceTrends,
  fetchSets,
  fetchTopPrices,
  mapPriceToZar,
  normalizeCardPrices,
  sleep,
  type CardDexCard,
  type CardDexPrice,
} from "./carddex";
import { eurToZar } from "./format";

function priceFromCard(c: CardDexCard) {
  const row = normalizeCardPrices(c.prices);
  if (!row) return undefined;
  const mapped = mapPriceToZar(row);
  if (mapped.priceZar == null && mapped.priceEur == null) return undefined;
  return mapped;
}

function cardImages(c: CardDexCard) {
  const img = c.images?.[0];
  return {
    imageSmall: img?.small_url || c.image_url || null,
    imageLarge: img?.large_url || null,
    imageThumb: img?.thumb_url || img?.small_url || c.image_url || null,
  };
}

async function upsertCardFromDex(c: CardDexCard, price?: Partial<ReturnType<typeof mapPriceToZar>>) {
  const images = cardImages(c);
  await prisma.card.upsert({
    where: { id: c.id },
    create: {
      id: c.id,
      setId: c.set_id,
      name: c.name,
      number: c.number || null,
      supertype: c.supertype || null,
      subtypes: c.subtypes ? JSON.stringify(c.subtypes) : null,
      hp: c.hp ?? null,
      types: c.types ? JSON.stringify(c.types) : null,
      rarity: c.rarity || null,
      artist: c.artist || null,
      setName: c.set_name || null,
      setCode: c.set_code || null,
      ...images,
      ...price,
      lastSyncedAt: new Date(),
    },
    update: {
      name: c.name,
      number: c.number || null,
      supertype: c.supertype || null,
      subtypes: c.subtypes ? JSON.stringify(c.subtypes) : null,
      hp: c.hp ?? null,
      types: c.types ? JSON.stringify(c.types) : null,
      rarity: c.rarity || null,
      artist: c.artist || null,
      setName: c.set_name || null,
      setCode: c.set_code || null,
      ...images,
      ...(price || {}),
      lastSyncedAt: new Date(),
    },
  });
}

async function ensureSetExists(setId: string, setName?: string | null) {
  const existing = await prisma.set.findUnique({ where: { id: setId } });
  if (existing) {
    // Upgrade stub rows (name === id) when we learn a real set name
    if (
      setName &&
      setName !== setId &&
      (!existing.name || existing.name.toLowerCase() === existing.id.toLowerCase())
    ) {
      await prisma.set.update({
        where: { id: setId },
        data: { name: setName, lastSyncedAt: new Date() },
      });
    }
    return;
  }
  await prisma.set.create({
    data: {
      id: setId,
      name: setName || setId,
      lastSyncedAt: new Date(),
    },
  });
}

async function backfillMissingPrices<T extends { id: string; priceZar?: number | null }>(
  cards: T[]
): Promise<T[]> {
  const missing = cards.filter((c) => c.priceZar == null);
  // Parallel but bounded — one page of results
  const concurrency = 8;
  for (let i = 0; i < missing.length; i += concurrency) {
    const chunk = missing.slice(i, i + concurrency);
    await Promise.all(
      chunk.map(async (card) => {
        try {
          const res = await fetchCardPrices(card.id);
          const rows = Array.isArray(res.data) ? res.data : res.data ? [res.data] : [];
          const row =
            rows.find((r) => r.trend_price != null || r.avg_price != null) || rows[0];
          if (!row) return;
          const mapped = mapPriceToZar(row);
          if (mapped.priceZar == null) return;
          try {
            await prisma.card.update({
              where: { id: card.id },
              data: { ...mapped, lastSyncedAt: new Date() },
            });
          } catch {
            /* ignore persist */
          }
          Object.assign(card, mapped);
        } catch {
          /* CardDex has no market row for some prints */
        }
      })
    );
  }
  return cards;
}

function mapRemoteCard(c: CardDexCard) {
  const price = priceFromCard(c);
  const images = cardImages(c);
  return {
    id: c.id,
    setId: c.set_id,
    name: c.name,
    number: c.number || null,
    rarity: c.rarity || null,
    setName: c.set_name || null,
    setCode: c.set_code || null,
    imageSmall: images.imageSmall,
    imageLarge: images.imageLarge,
    imageThumb: images.imageThumb,
    priceZar: price?.priceZar ?? null,
    priceEur: price?.priceEur ?? null,
    pctChange1d: price?.pctChange1d ?? null,
    pctChange7d: price?.pctChange7d ?? null,
    pctChange30d: price?.pctChange30d ?? null,
    types: c.types ? JSON.stringify(c.types) : null,
  };
}

async function upsertFromPriceRow(p: CardDexPrice) {
  if (!p.card_id) return;
  await ensureSetExists(p.set_id || "unknown", p.set_id);
  const mapped = mapPriceToZar(p);
  const existing = await prisma.card.findUnique({ where: { id: p.card_id } });
  if (existing) {
    await prisma.card.update({
      where: { id: p.card_id },
      data: { ...mapped, lastSyncedAt: new Date() },
    });
    return;
  }
  await prisma.card.create({
    data: {
      id: p.card_id,
      setId: p.set_id || "unknown",
      name: p.card_name || p.card_id,
      number: p.number || null,
      rarity: p.rarity || null,
      imageThumb: p.image_thumb || null,
      imageSmall: p.image_small || null,
      imageLarge: p.image_large || null,
      ...mapped,
      lastSyncedAt: new Date(),
    },
  });
}

/** Nightly sync: sets + prices overwrite local DB */
export async function runNightlySync(options?: { maxCardPages?: number; fullCards?: boolean }) {
  const log = await prisma.syncLog.create({
    data: { type: "nightly", status: "running" },
  });

  let setsUpdated = 0;
  let cardsUpdated = 0;

  try {
    // 1) Sync all sets
    let page = 1;
    let totalPages = 1;
    do {
      const res = await fetchSets({ page, pageSize: 100 });
      const sets = res.data || [];
      totalPages = res.meta?.totalPages || 1;
      for (const s of sets) {
        await prisma.set.upsert({
          where: { id: s.id },
          create: {
            id: s.id,
            name: s.name,
            series: s.series || null,
            releaseDate: s.release_date || null,
            officialCards: s.official_cards ?? null,
            totalCards: s.total_cards ?? null,
            logoUrl: s.logo_url || null,
            symbolUrl: s.symbol_url || null,
            setCode: s.set_code || null,
            lastSyncedAt: new Date(),
          },
          update: {
            name: s.name,
            series: s.series || null,
            releaseDate: s.release_date || null,
            officialCards: s.official_cards ?? null,
            totalCards: s.total_cards ?? null,
            logoUrl: s.logo_url || null,
            symbolUrl: s.symbol_url || null,
            setCode: s.set_code || null,
            lastSyncedAt: new Date(),
          },
        });
        setsUpdated++;
      }
      page++;
      await sleep(200);
    } while (page <= totalPages);

    // 2) Overwrite prices from trends + top (covers movers and high value)
    for (const fetcher of [fetchPriceTrends, fetchTopPrices]) {
      try {
        for (let page = 1; page <= 3; page++) {
          const res = await fetcher({ pageSize: 100, page });
          const rows = res.data || [];
          if (!rows.length) break;
          for (const p of rows) {
            await upsertFromPriceRow(p);
            cardsUpdated++;
          }
          await sleep(250);
        }
      } catch (e) {
        console.warn("Price batch failed", e);
      }
    }

    // 3) Pull card catalogue pages with prices + images
    if (options?.fullCards !== false) {
      const maxPages = options?.maxCardPages ?? 20;
      for (let p = 1; p <= maxPages; p++) {
        try {
          const res = await fetchCards({
            page: p,
            pageSize: 50,
            include: "images,prices",
            sort: "release_date",
            order: "desc",
          });
          for (const c of res.data || []) {
            await ensureSetExists(c.set_id, c.set_name);
            await upsertCardFromDex(c, priceFromCard(c));
            cardsUpdated++;
          }
          if ((res.meta?.totalPages || 1) <= p) break;
          await sleep(300);
        } catch (e) {
          console.warn(`Card page ${p} failed`, e);
          break;
        }
      }
    }

    // 4) Backfill ZAR prices for cards still missing them (live CardDex)
    const missing = await prisma.card.findMany({
      where: { priceZar: null },
      take: 80,
      select: { id: true },
    });
    for (const row of missing) {
      try {
        const { data } = await fetchCardById(row.id, "prices,images");
        const price = normalizeCardPrices(data.prices);
        if (price?.trend_price != null || price?.avg_price != null) {
          const eur = price.trend_price ?? price.avg_price ?? null;
          await prisma.card.update({
            where: { id: row.id },
            data: {
              priceEur: eur,
              priceZar: eurToZar(eur),
              avg7dZar: eurToZar(price.avg_7d ?? null),
              avg30dZar: eurToZar(price.avg_30d ?? null),
              pctChange1d: price.pct_change_1d ?? price.price_change_1d ?? null,
              pctChange7d: price.pct_change_7d ?? price.price_change_7d ?? null,
              pctChange30d: price.pct_change_30d ?? price.price_change_30d ?? null,
              lastSyncedAt: new Date(),
            },
          });
          cardsUpdated++;
        }
        await sleep(120);
      } catch {
        /* ignore single-card failures */
      }
    }

    await prisma.syncLog.update({
      where: { id: log.id },
      data: {
        status: "success",
        cardsUpdated,
        setsUpdated,
        message: `Synced ${setsUpdated} sets, updated ${cardsUpdated} card/price rows`,
        finishedAt: new Date(),
      },
    });

    return { ok: true, setsUpdated, cardsUpdated };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown sync error";
    await prisma.syncLog.update({
      where: { id: log.id },
      data: { status: "error", message, finishedAt: new Date(), cardsUpdated, setsUpdated },
    });
    throw error;
  }
}

/**
 * Live CardDex is the source of truth for catalogue totals.
 * Important: use `name=` (not `q=`) — CardDex `q` omits images/prices embeds.
 */
export async function searchCards(opts: {
  q?: string;
  set?: string;
  type?: string;
  rarity?: string;
  minPrice?: number;
  maxPrice?: number;
  sort?: string;
  page?: number;
  pageSize?: number;
}) {
  const { ensureDatabase } = await import("./ensureDatabase");
  await ensureDatabase();

  const page = Math.max(1, opts.page || 1);
  const pageSize = Math.min(50, Math.max(1, opts.pageSize || 24));
  const hasPriceFilter = opts.minPrice != null || opts.maxPrice != null;

  // Price-range filters need ZAR rows in SQLite — hydrate matching CardDex pages first.
  if (hasPriceFilter && (opts.q || opts.set || opts.type || opts.rarity)) {
    try {
      await hydrateCardDexQuery(
        {
          name: opts.q || undefined,
          set: opts.set,
          type: opts.type,
          rarity: opts.rarity,
        },
        8
      );
    } catch {
      /* continue with whatever is cached */
    }
  } else {
    // Normal browse/search: one live page with images+prices, then cache
    try {
      const remote = await fetchCards({
        // `name` returns embeds; bare `q` does not
        name: opts.q || undefined,
        set: opts.set,
        type: opts.type,
        rarity: opts.rarity,
        page,
        pageSize,
        include: "images,prices",
        sort: opts.sort === "name" ? "name" : undefined,
      });

      for (const c of remote.data || []) {
        try {
          await ensureSetExists(c.set_id, c.set_name);
          await upsertCardFromDex(c, priceFromCard(c));
        } catch {
          /* ignore cache errors */
        }
      }

      let cards = (remote.data || []).map(mapRemoteCard);
      cards = await backfillMissingPrices(cards);

      if (opts.sort === "price_desc") {
        cards = [...cards].sort((a, b) => (b.priceZar ?? -1) - (a.priceZar ?? -1));
      } else if (opts.sort === "price_asc") {
        cards = [...cards].sort((a, b) => (a.priceZar ?? Number.POSITIVE_INFINITY) - (b.priceZar ?? Number.POSITIVE_INFINITY));
      }

      const meta = remote.meta || {
        total: cards.length,
        page,
        pageSize,
        totalPages: 1,
      };

      return { cards, meta };
    } catch (e) {
      console.warn("Live CardDex search failed, falling back to local DB", e);
    }
  }

  // Local DB path (price filters, or live API unavailable)
  const where: Record<string, unknown> = {};
  if (opts.q) {
    where.OR = [
      { name: { contains: opts.q } },
      { setName: { contains: opts.q } },
      { id: { contains: opts.q } },
    ];
  }
  if (opts.set) where.setId = opts.set;
  if (opts.rarity) where.rarity = { contains: opts.rarity };
  if (opts.type) where.types = { contains: opts.type };
  if (hasPriceFilter) {
    where.priceZar = {
      ...(opts.minPrice != null ? { gte: opts.minPrice } : {}),
      ...(opts.maxPrice != null ? { lte: opts.maxPrice } : {}),
    };
  }

  let orderBy: Record<string, string> = { updatedAt: "desc" };
  if (opts.sort === "price_desc") orderBy = { priceZar: "desc" };
  if (opts.sort === "price_asc") orderBy = { priceZar: "asc" };
  if (opts.sort === "name") orderBy = { name: "asc" };

  try {
    const [total, cards] = await Promise.all([
      prisma.card.count({ where }),
      prisma.card.findMany({
        where,
        orderBy,
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
    ]);

    const enriched = await backfillMissingPrices(cards);
    return {
      cards: enriched,
      meta: {
        total,
        page,
        pageSize,
        totalPages: Math.max(1, Math.ceil(total / pageSize)),
      },
    };
  } catch {
    return {
      cards: [],
      meta: { total: 0, page, pageSize, totalPages: 1 },
    };
  }
}

/** Pull several CardDex pages into SQLite so ZAR filters / offline browse work. */
async function hydrateCardDexQuery(
  params: {
    name?: string;
    set?: string;
    type?: string;
    rarity?: string;
  },
  maxPages = 8
) {
  let page = 1;
  let totalPages = 1;
  do {
    const remote = await fetchCards({
      ...params,
      page,
      pageSize: 50,
      include: "images,prices",
    });
    for (const c of remote.data || []) {
      try {
        await ensureSetExists(c.set_id, c.set_name);
        await upsertCardFromDex(c, priceFromCard(c));
      } catch {
        /* ignore */
      }
    }
    totalPages = remote.meta?.totalPages || 1;
    page += 1;
  } while (page <= totalPages && page <= maxPages);
}
