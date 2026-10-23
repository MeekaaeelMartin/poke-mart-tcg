import { ImageResponse } from "next/og";

export const OG_SIZE = { width: 1200, height: 630 } as const;
export const OG_CONTENT_TYPE = "image/png";

type OgChartProps = {
  title: string;
  subtitle?: string;
  badge?: string;
  priceLabel?: string;
  /** 0–1 normalized series for sparkline (left → right) */
  series?: number[];
  accent?: string;
};

function SparkBars({ series, accent }: { series: number[]; accent: string }) {
  const min = Math.min(...series);
  const max = Math.max(...series);
  const span = max - min || 1;
  return (
    <div
      style={{
        display: "flex",
        alignItems: "flex-end",
        gap: 6,
        width: 400,
        height: 90,
      }}
    >
      {series.map((v, i) => {
        const h = Math.max(8, ((v - min) / span) * 90);
        return (
          <div
            key={i}
            style={{
              display: "flex",
              width: 18,
              height: h,
              borderRadius: 4,
              background: accent,
              opacity: 0.45 + (i / series.length) * 0.55,
            }}
          />
        );
      })}
    </div>
  );
}

/** Shared branded Open Graph / Twitter card with optional price sparkline. */
export function renderOgImage({
  title,
  subtitle,
  badge = "Poke Mart TCG",
  priceLabel,
  series = [0.42, 0.48, 0.45, 0.55, 0.52, 0.61, 0.58, 0.72, 0.68, 0.8, 0.76, 0.88],
  accent = "#FFD700",
}: OgChartProps) {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          background: "#0B0E14",
          color: "#fff",
          padding: "48px 56px",
          fontFamily: "sans-serif",
        }}
      >
        <div
          style={{
            display: "flex",
            width: "100%",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <div style={{ display: "flex", alignItems: "center" }}>
            <div
              style={{
                display: "flex",
                width: 48,
                height: 48,
                borderRadius: 999,
                background: accent,
                color: "#0B0E14",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 22,
                fontWeight: 800,
                marginRight: 14,
              }}
            >
              P
            </div>
            <div style={{ display: "flex", flexDirection: "column" }}>
              <div style={{ display: "flex", fontSize: 22, fontWeight: 700 }}>
                Poke Mart TCG
              </div>
              <div style={{ display: "flex", fontSize: 16, color: "#a1a1aa" }}>
                South Africa · ZAR market
              </div>
            </div>
          </div>
          <div
            style={{
              display: "flex",
              border: `1px solid ${accent}`,
              background: "rgba(255,215,0,0.12)",
              color: accent,
              borderRadius: 999,
              padding: "10px 18px",
              fontSize: 16,
              fontWeight: 700,
              textTransform: "uppercase",
              letterSpacing: 1,
            }}
          >
            {badge}
          </div>
        </div>

        <div
          style={{
            display: "flex",
            flexDirection: "column",
            maxWidth: 980,
            marginTop: 36,
            marginBottom: 24,
          }}
        >
          <div
            style={{
              display: "flex",
              fontSize: title.length > 48 ? 46 : 56,
              fontWeight: 800,
              lineHeight: 1.1,
              letterSpacing: -1,
            }}
          >
            {title}
          </div>
          {subtitle ? (
            <div
              style={{
                display: "flex",
                fontSize: 24,
                color: "#a1a1aa",
                lineHeight: 1.35,
                marginTop: 14,
              }}
            >
              {subtitle}
            </div>
          ) : null}
          {priceLabel ? (
            <div style={{ display: "flex", alignItems: "flex-end", marginTop: 18 }}>
              <div
                style={{
                  display: "flex",
                  fontSize: 40,
                  fontWeight: 800,
                  color: accent,
                  marginRight: 12,
                }}
              >
                {priceLabel}
              </div>
              <div style={{ display: "flex", fontSize: 20, color: "#71717a", marginBottom: 6 }}>
                live ZAR trend
              </div>
            </div>
          ) : null}
        </div>

        <div
          style={{
            display: "flex",
            width: "100%",
            alignItems: "flex-end",
            justifyContent: "space-between",
          }}
        >
          <div style={{ display: "flex", flexDirection: "column" }}>
            <div
              style={{
                display: "flex",
                fontSize: 14,
                color: "#71717a",
                textTransform: "uppercase",
                letterSpacing: 1.5,
                marginBottom: 6,
              }}
            >
              Price history graph
            </div>
            <div style={{ display: "flex", fontSize: 18, color: "#d4d4d8" }}>
              CardDex · Cardmarket EUR → ZAR
            </div>
          </div>
          <div
            style={{
              display: "flex",
              alignItems: "flex-end",
              justifyContent: "center",
              width: 440,
              height: 120,
              borderRadius: 16,
              border: "1px solid rgba(255,255,255,0.08)",
              background: "#12151E",
              padding: "14px 18px",
            }}
          >
            <SparkBars series={series} accent={accent} />
          </div>
        </div>
      </div>
    ),
    { ...OG_SIZE }
  );
}

/** Deterministic fake series from a seed string (stable OG charts per entity). */
export function seededSeries(seed: string, points = 14): number[] {
  let h = 0;
  for (let i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) >>> 0;
  const out: number[] = [];
  let v = 0.45 + (h % 20) / 100;
  for (let i = 0; i < points; i++) {
    h = (h * 1664525 + 1013904223) >>> 0;
    const delta = ((h % 100) - 45) / 400;
    v = Math.min(0.95, Math.max(0.12, v + delta));
    out.push(v);
  }
  return out;
}
