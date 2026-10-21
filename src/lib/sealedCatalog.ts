import { fetchAllPages, fetchSealed, type CardDexSealed } from "./carddex";

/** Load sealed products (ETBs, booster boxes, etc.) across CardDex pages. */
export async function loadSealedCatalog(opts?: {
  type?: string;
  setId?: string;
  pageSize?: number;
  maxPages?: number;
  limit?: number;
}): Promise<CardDexSealed[]> {
  const pageSize = opts?.pageSize ?? 50;
  const maxPages = opts?.maxPages ?? 10;

  const all = await fetchAllPages<CardDexSealed>(
    (page, size) =>
      fetchSealed({
        type: opts?.type,
        set_id: opts?.setId,
        page,
        pageSize: size,
      }),
    { pageSize, maxPages }
  );

  if (opts?.limit != null) return all.slice(0, opts.limit);
  return all;
}
