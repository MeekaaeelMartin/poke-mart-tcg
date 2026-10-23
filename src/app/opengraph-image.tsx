import { renderOgImage, seededSeries } from "@/lib/og";

export const alt = "Poke Mart TCG — Pokemon card prices South Africa (ZAR)";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function Image() {
  return renderOgImage({
    title: "Pokemon Card Prices in ZAR",
    subtitle: "Live singles, ETBs & sealed product charts for South African collectors",
    badge: "Price Tracker",
    priceLabel: "Live market",
    series: seededSeries("poke-mart-home"),
  });
}
