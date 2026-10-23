import { renderOgImage, seededSeries } from "@/lib/og";

export const alt = "Pokemon card database — live ZAR prices | Poke Mart TCG";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function Image() {
  return renderOgImage({
    title: "Pokemon Card Database",
    subtitle: "Search every print — Charizard, Pikachu, chase rares — with live ZAR prices",
    badge: "Singles",
    priceLabel: "Cardmarket → ZAR",
    series: seededSeries("cards-index"),
  });
}
