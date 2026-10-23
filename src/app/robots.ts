import type { MetadataRoute } from "next";
import { getSiteUrl } from "@/lib/site";

export default function robots(): MetadataRoute.Robots {
  const site = getSiteUrl();
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/api/", "/dashboard", "/auth/"],
      },
      {
        userAgent: "GPTBot",
        allow: ["/", "/llms.txt", "/cards", "/sets", "/prices", "/blog", "/sealed"],
        disallow: ["/api/", "/dashboard", "/auth/"],
      },
      {
        userAgent: "Google-Extended",
        allow: "/",
        disallow: ["/api/", "/dashboard", "/auth/"],
      },
    ],
    sitemap: `${site}/sitemap.xml`,
    host: site,
  };
}
