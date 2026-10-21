/** Rewrite remote CardDex / Cardmarket image URLs through our proxy so they load on Hostinger. */
export function mediaUrl(url?: string | null): string {
  if (!url) return "/images/card-placeholder.svg";
  if (url.startsWith("/images/") || url.startsWith("/api/media")) return url;
  if (url.startsWith("/")) return url;

  try {
    const parsed = new URL(url);
    const host = parsed.hostname.toLowerCase();
    const allowed =
      host === "images.carddex.dev" ||
      host.endsWith(".carddex.dev") ||
      host === "product-images.s3.cardmarket.com";
    if (!allowed) return "/images/card-placeholder.svg";
    return `/api/media?src=${encodeURIComponent(parsed.toString())}`;
  } catch {
    return "/images/card-placeholder.svg";
  }
}

export function isAllowedMediaHost(hostname: string): boolean {
  const host = hostname.toLowerCase();
  return (
    host === "images.carddex.dev" ||
    host.endsWith(".carddex.dev") ||
    host === "product-images.s3.cardmarket.com"
  );
}
