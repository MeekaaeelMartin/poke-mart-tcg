import type { MetadataRoute } from "next";
import { SITE_NAME, SITE_TAGLINE } from "@/lib/site";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: SITE_NAME,
    short_name: "Poke Mart",
    description: SITE_TAGLINE,
    start_url: "/",
    display: "standalone",
    background_color: "#0B0E14",
    theme_color: "#FFD700",
    lang: "en-ZA",
    categories: ["finance", "entertainment", "lifestyle"],
  };
}
