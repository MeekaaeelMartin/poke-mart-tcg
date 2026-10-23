import { fetchSetById } from "@/lib/carddex";
import { prisma } from "@/lib/db";
import { renderOgImage, seededSeries } from "@/lib/og";

export const alt = "Pokemon TCG set checklist & prices | Poke Mart TCG";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

type Props = { params: Promise<{ id: string }> };

export default async function Image({ params }: Props) {
  const { id } = await params;
  let name = "Pokemon TCG Set";
  let series = "Pokemon TCG";
  let cardsLabel = "Set checklist";

  try {
    const { data } = await fetchSetById(id);
    name = data.name;
    series = data.series || series;
    const n = data.total_cards || data.official_cards;
    if (n) cardsLabel = `${n} cards · live ZAR prices`;
  } catch {
    const local = await prisma.set.findUnique({ where: { id } });
    if (local) {
      name = local.name;
      series = local.series || series;
      if (local.totalCards) cardsLabel = `${local.totalCards} cards · live ZAR prices`;
    }
  }

  return renderOgImage({
    title: name,
    subtitle: `${series} — ${cardsLabel}`,
    badge: "Set",
    series: seededSeries(`set-${id}`),
  });
}
