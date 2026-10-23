import type { Metadata } from "next";
import { DEFAULT_KEYWORDS, SITE_NAME, getSiteUrl } from "./site";

type BuildOpts = {
  title: string;
  description: string;
  path?: string;
  keywords?: string[];
  image?: string;
  imageAlt?: string;
  type?: "website" | "article";
  noIndex?: boolean;
  publishedTime?: string;
  modifiedTime?: string;
  /** Skip the root `%s | Site` title template (use for the homepage). */
  absoluteTitle?: boolean;
};

/** Build consistent title / description / Open Graph / Twitter / canonical metadata. */
export function buildMetadata(opts: BuildOpts): Metadata {
  const site = getSiteUrl();
  const url = opts.path ? `${site}${opts.path.startsWith("/") ? opts.path : `/${opts.path}`}` : site;
  const keywords = [...new Set([...(opts.keywords || []), ...DEFAULT_KEYWORDS])];
  const ogImage = opts.image
    ? opts.image.startsWith("http")
      ? opts.image
      : `${site}${opts.image.startsWith("/") ? opts.image : `/${opts.image}`}`
    : undefined;

  return {
    title: opts.absoluteTitle ? { absolute: opts.title } : opts.title,
    description: opts.description,
    keywords,
    alternates: { canonical: url },
    robots: opts.noIndex
      ? { index: false, follow: false, googleBot: { index: false, follow: false } }
      : {
          index: true,
          follow: true,
          googleBot: {
            index: true,
            follow: true,
            "max-image-preview": "large",
            "max-snippet": -1,
            "max-video-preview": -1,
          },
        },
    openGraph: {
      type: opts.type || "website",
      locale: "en_ZA",
      url,
      siteName: SITE_NAME,
      title: opts.title.includes(SITE_NAME) ? opts.title : `${opts.title} | ${SITE_NAME}`,
      description: opts.description,
      ...(ogImage
        ? {
            images: [
              {
                url: ogImage,
                width: 1200,
                height: 630,
                alt: opts.imageAlt || opts.title,
              },
            ],
          }
        : {}),
      ...(opts.publishedTime ? { publishedTime: opts.publishedTime } : {}),
      ...(opts.modifiedTime ? { modifiedTime: opts.modifiedTime } : {}),
    },
    twitter: {
      card: "summary_large_image",
      title: opts.title.includes(SITE_NAME) ? opts.title : `${opts.title} | ${SITE_NAME}`,
      description: opts.description,
      ...(ogImage ? { images: [ogImage] } : {}),
    },
  };
}

export function absoluteUrl(path: string): string {
  const site = getSiteUrl();
  if (path.startsWith("http")) return path;
  return `${site}${path.startsWith("/") ? path : `/${path}`}`;
}
