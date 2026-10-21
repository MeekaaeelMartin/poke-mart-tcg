import { prisma } from "./db";
import { fetchSets, type CardDexSet } from "./carddex";

export type SetSummary = {
  id: string;
  name: string;
  series: string | null;
  releaseDate: string | null;
  totalCards: number | null;
  officialCards: number | null;
  logoUrl: string | null;
  symbolUrl: string | null;
  setCode: string | null;
};

/** Stub rows created during price hydration use the set id as the display name. */
export function isStubSet(set: {
  id: string;
  name: string;
  logoUrl?: string | null;
  totalCards?: number | null;
  series?: string | null;
  releaseDate?: string | null;
}): boolean {
  const name = (set.name || "").trim();
  const id = (set.id || "").trim();
  if (!name || !id) return true;
  if (name.toLowerCase() === id.toLowerCase()) return true;
  return false;
}

export function isDisplayableSet(set: {
  id: string;
  name: string;
  logoUrl?: string | null;
  totalCards?: number | null;
  series?: string | null;
  releaseDate?: string | null;
}): boolean {
  if (isStubSet(set)) return false;
  return Boolean(set.logoUrl || set.totalCards || set.series || set.releaseDate);
}

function mapRemoteSet(s: CardDexSet): SetSummary {
  return {
    id: s.id,
    name: s.name,
    series: s.series || null,
    releaseDate: s.release_date || null,
    totalCards: s.total_cards ?? null,
    officialCards: s.official_cards ?? null,
    logoUrl: s.logo_url || null,
    symbolUrl: s.symbol_url || null,
    setCode: s.set_code || null,
  };
}

export async function persistRemoteSets(remote: CardDexSet[]): Promise<void> {
  for (const s of remote) {
    try {
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
    } catch {
      /* ignore single-row failures */
    }
  }
}

/** Prefer live CardDex catalog so stub DB rows never pollute Featured / Sets. */
export async function loadSetsCatalog(opts?: {
  pageSize?: number;
}): Promise<SetSummary[]> {
  const pageSize = opts?.pageSize ?? 100;

  try {
    const remote = await fetchSets({ pageSize });
    const rows = (remote.data || []).map(mapRemoteSet).filter(isDisplayableSet);
    if (rows.length > 0) {
      void persistRemoteSets(remote.data || []);
      return rows.sort((a, b) => {
        const ad = a.releaseDate || "";
        const bd = b.releaseDate || "";
        return bd.localeCompare(ad);
      });
    }
  } catch {
    /* fall through to local */
  }

  try {
    const local = await prisma.set.findMany({
      orderBy: { releaseDate: "desc" },
      select: {
        id: true,
        name: true,
        series: true,
        releaseDate: true,
        totalCards: true,
        officialCards: true,
        logoUrl: true,
        symbolUrl: true,
        setCode: true,
      },
    });
    return local.filter(isDisplayableSet);
  } catch {
    return [];
  }
}

export async function loadFeaturedSets(limit = 3): Promise<
  Array<{
    id: string;
    name: string;
    setCode: string | null;
    totalCards: number | null;
    logoUrl: string | null;
  }>
> {
  const catalog = await loadSetsCatalog({ pageSize: 24 });
  const withLogos = catalog.filter((s) => s.logoUrl);
  const pick = (withLogos.length >= limit ? withLogos : catalog).slice(0, limit);
  return pick.map((s) => ({
    id: s.id,
    name: s.name,
    setCode: s.setCode,
    totalCards: s.totalCards ?? s.officialCards,
    logoUrl: s.logoUrl,
  }));
}
