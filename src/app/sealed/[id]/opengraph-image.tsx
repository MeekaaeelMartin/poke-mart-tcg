import { fetchSealedById, sealedPriceZar } from "@/lib/carddex";
import { formatZar } from "@/lib/format";
import { renderOgImage, seededSeries } from "@/lib/og";

export const alt = "Pokemon sealed ETB price chart ZAR | Poke Mart TCG";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

type Props = { params: Promise<{ id: string }> };

export default async function Image({ params }: Props) {
  const { id } = await params;
  let name = "Pokemon Sealed Product";
  let type = "Sealed";
  let priceLabel: string | undefined;

  try {
    const { data } = await fetchSealedById(id);
    name = data.name;
    type = (data.product_type || "sealed").replace(/_/g, " ");
    const zar = sealedPriceZar(data);
    if (zar != null) priceLabel = formatZar(zar);
  } catch {
    /* fallback title */
  }

  return renderOgImage({
    title: name,
    subtitle: `${type} — Elite Trainer Box & sealed product price graph (ZAR)`,
    badge: "Sealed / ETB",
    priceLabel,
    series: seededSeries(`sealed-${id}`),
  });
}
