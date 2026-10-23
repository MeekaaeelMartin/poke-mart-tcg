import { renderOgImage, seededSeries } from "@/lib/og";

export const alt = "Pokemon TCG Price Lab blog South Africa | Poke Mart TCG";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function Image() {
  return renderOgImage({
    title: "TCG Price Lab",
    subtitle: "Market analysis, grading guides & SA Pokemon investment outlook",
    badge: "Blog",
    series: seededSeries("blog-index"),
  });
}
