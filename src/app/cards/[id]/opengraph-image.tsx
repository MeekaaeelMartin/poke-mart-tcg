import { fetchCardById, normalizeCardPrices } from "@/lib/carddex";
import { eurToZar, formatZar } from "@/lib/format";
import { renderOgImage, seededSeries } from "@/lib/og";
import { prisma } from "@/lib/db";

export const alt = "Pokemon card price chart ZAR | Poke Mart TCG";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

type Props = { params: Promise<{ id: string }> };

export default async function Image({ params }: Props) {
  const { id } = await params;
  let name = "Pokemon Card";
  let setName = "Pokemon TCG";
  let priceLabel: string | undefined;
  let number = "";

  try {
    const { data } = await fetchCardById(id, "images");
    name = data.name;
    setName = data.set_name || setName;
    number = data.number ? ` #${data.number}` : "";
    const row = normalizeCardPrices(data.prices);
    const zar = eurToZar(row?.trend_price ?? row?.avg_price ?? null);
    if (zar != null) priceLabel = formatZar(zar);
  } catch {
    const local = await prisma.card.findUnique({ where: { id } });
    if (local) {
      name = local.name;
      setName = local.setName || setName;
      number = local.number ? ` #${local.number}` : "";
      if (local.priceZar != null) priceLabel = formatZar(local.priceZar);
    }
  }

  return renderOgImage({
    title: `${name}${number}`,
    subtitle: `${setName} — live Pokemon card price & history chart (ZAR)`,
    badge: "Singles",
    priceLabel,
    series: seededSeries(`card-${id}`),
  });
}
