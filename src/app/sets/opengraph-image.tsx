import { renderOgImage, seededSeries } from "@/lib/og";

export const alt = "Pokemon TCG sets directory South Africa | Poke Mart TCG";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function Image() {
  return renderOgImage({
    title: "Pokemon TCG Sets",
    subtitle: "Expansion checklists, logos, card counts & sealed product links",
    badge: "Sets",
    series: seededSeries("sets-index"),
  });
}
