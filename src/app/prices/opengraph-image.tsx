import { renderOgImage, seededSeries } from "@/lib/og";

export const alt = "Pokemon TCG market prices & trends ZAR | Poke Mart TCG";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function Image() {
  return renderOgImage({
    title: "Market Prices & Trends",
    subtitle: "Top movers, sealed ETB benchmarks, and nightly CardDex sync charts",
    badge: "Trends",
    priceLabel: "Hot movers",
    series: seededSeries("prices-index"),
  });
}
