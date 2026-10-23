"use client";

import { useId, useMemo, useState } from "react";
import { formatZar } from "@/lib/format";

export type HistoryPoint = {
  date: string;
  trendZar: number | null;
  avgZar?: number | null;
  lowZar?: number | null;
};

type Props = {
  points: HistoryPoint[];
  title?: string;
  subtitle?: string;
  /** When true, points are snapshot averages (sealed), not daily history */
  snapshotMode?: boolean;
};

const HISTORY_RANGES = [
  { key: "30", label: "30D", days: 30 },
  { key: "90", label: "90D", days: 90 },
  { key: "all", label: "All", days: 9999 },
] as const;

const SNAPSHOT_RANGES = [{ key: "all", label: "Snapshot", days: 9999 }] as const;

function pickRange(points: HistoryPoint[], days: number) {
  if (points.length <= days) return points;
  return points.slice(-days);
}

function niceDomain(values: number[]) {
  if (!values.length) return { min: 0, max: 1 };
  const min = Math.min(...values);
  const max = Math.max(...values);
  if (min === max) {
    const pad = Math.max(min * 0.08, 1);
    return { min: Math.max(0, min - pad), max: max + pad };
  }
  const pad = (max - min) * 0.12;
  return { min: Math.max(0, min - pad), max: max + pad };
}

export function PriceHistoryChart({
  points,
  title = "Price history",
  subtitle,
  snapshotMode = false,
}: Props) {
  const ranges = snapshotMode ? SNAPSHOT_RANGES : HISTORY_RANGES;
  const fillId = useId().replace(/:/g, "");

  const [range, setRange] = useState<string>(ranges[0].key);
  const [active, setActive] = useState<number | null>(null);

  const series = useMemo(() => {
    const days = ranges.find((r) => r.key === range)?.days ?? 30;
    return pickRange(
      points.filter((p) => p.trendZar != null && Number.isFinite(p.trendZar as number)),
      days
    );
  }, [points, range, ranges]);

  const values = series.map((p) => p.trendZar as number);
  const { min, max } = niceDomain(values);
  const first = values[0];
  const last = values[values.length - 1];
  const changePct =
    first && last != null && first !== 0 ? ((last - first) / first) * 100 : null;
  const high = values.length ? Math.max(...values) : null;
  const low = values.length ? Math.min(...values) : null;

  const W = 640;
  const H = 220;
  const pad = { t: 16, r: 12, b: 28, l: 12 };
  const innerW = W - pad.l - pad.r;
  const innerH = H - pad.t - pad.b;

  const coords = series.map((p, i) => {
    const x =
      series.length === 1
        ? pad.l + innerW / 2
        : pad.l + (i / (series.length - 1)) * innerW;
    const y =
      pad.t +
      (1 - ((p.trendZar as number) - min) / (max - min || 1)) * innerH;
    return { x, y, p, i };
  });

  const linePath = coords
    .map((c, i) => `${i === 0 ? "M" : "L"} ${c.x.toFixed(2)} ${c.y.toFixed(2)}`)
    .join(" ");

  const areaPath =
    coords.length > 0
      ? `${linePath} L ${coords[coords.length - 1].x.toFixed(2)} ${(pad.t + innerH).toFixed(2)} L ${coords[0].x.toFixed(2)} ${(pad.t + innerH).toFixed(2)} Z`
      : "";

  const activePoint = active != null ? coords[active] : null;

  function onPointer(clientX: number, rect: DOMRect) {
    if (!coords.length) return;
    const x = ((clientX - rect.left) / rect.width) * W;
    let best = 0;
    let bestDist = Infinity;
    coords.forEach((c, i) => {
      const d = Math.abs(c.x - x);
      if (d < bestDist) {
        bestDist = d;
        best = i;
      }
    });
    setActive(best);
  }

  if (!series.length) {
    return (
      <div className="rounded-2xl border border-dashed border-white/10 bg-[#12151E]/60 px-5 py-10 text-center">
        <p className="text-sm font-medium text-zinc-300">{title}</p>
        <p className="mt-2 text-xs text-zinc-500">
          No price history available from CardDex for this product yet.
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-white/8 bg-[#12151E] p-4 sm:p-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-zinc-400">
            {title}
          </h2>
          {subtitle && <p className="mt-1 text-xs text-zinc-500">{subtitle}</p>}
        </div>
        {!snapshotMode && (
          <div className="flex shrink-0 gap-1 self-start rounded-lg border border-white/10 bg-[#0B0E14] p-1">
            {ranges.map((r) => (
              <button
                key={r.key}
                type="button"
                onClick={() => {
                  setRange(r.key);
                  setActive(null);
                }}
                className={`min-h-9 min-w-[3rem] rounded-md px-3 text-xs font-semibold transition ${
                  range === r.key
                    ? "bg-[#FFD700] text-[#0B0E14]"
                    : "text-zinc-400 hover:text-white"
                }`}
              >
                {r.label}
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-4">
        <div className="rounded-xl bg-[#0B0E14] px-3 py-2">
          <p className="text-[10px] uppercase tracking-wider text-zinc-500">Now</p>
          <p className="text-sm font-bold text-[#FFD700]">{formatZar(last)}</p>
        </div>
        <div className="rounded-xl bg-[#0B0E14] px-3 py-2">
          <p className="text-[10px] uppercase tracking-wider text-zinc-500">Period</p>
          <p
            className={`text-sm font-bold ${
              (changePct ?? 0) >= 0 ? "text-emerald-400" : "text-red-400"
            }`}
          >
            {changePct == null
              ? "—"
              : `${changePct >= 0 ? "+" : ""}${changePct.toFixed(1)}%`}
          </p>
        </div>
        <div className="rounded-xl bg-[#0B0E14] px-3 py-2">
          <p className="text-[10px] uppercase tracking-wider text-zinc-500">High</p>
          <p className="text-sm font-bold text-white">{formatZar(high)}</p>
        </div>
        <div className="rounded-xl bg-[#0B0E14] px-3 py-2">
          <p className="text-[10px] uppercase tracking-wider text-zinc-500">Low</p>
          <p className="text-sm font-bold text-white">{formatZar(low)}</p>
        </div>
      </div>

      <div
        className="relative mt-4 touch-pan-y select-none"
        onPointerLeave={() => setActive(null)}
      >
        <svg
          viewBox={`0 0 ${W} ${H}`}
          className="h-[200px] w-full sm:h-[240px]"
          role="img"
          aria-label={title}
          onPointerMove={(e) => onPointer(e.clientX, e.currentTarget.getBoundingClientRect())}
          onPointerDown={(e) => {
            e.currentTarget.setPointerCapture(e.pointerId);
            onPointer(e.clientX, e.currentTarget.getBoundingClientRect());
          }}
        >
          <defs>
            <linearGradient id={fillId} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#FFD700" stopOpacity="0.35" />
              <stop offset="100%" stopColor="#FFD700" stopOpacity="0" />
            </linearGradient>
          </defs>

          {[0.25, 0.5, 0.75].map((t) => {
            const y = pad.t + innerH * t;
            return (
              <line
                key={t}
                x1={pad.l}
                x2={W - pad.r}
                y1={y}
                y2={y}
                stroke="rgba(255,255,255,0.06)"
                strokeWidth="1"
              />
            );
          })}

          {areaPath && <path d={areaPath} fill={`url(#${fillId})`} />}
          {linePath && (
            <path
              d={linePath}
              fill="none"
              stroke="#FFD700"
              strokeWidth="2.5"
              strokeLinejoin="round"
              strokeLinecap="round"
            />
          )}

          {activePoint && (
            <>
              <line
                x1={activePoint.x}
                x2={activePoint.x}
                y1={pad.t}
                y2={pad.t + innerH}
                stroke="rgba(255,215,0,0.35)"
                strokeDasharray="4 4"
              />
              <circle
                cx={activePoint.x}
                cy={activePoint.y}
                r="5"
                fill="#0B0E14"
                stroke="#FFD700"
                strokeWidth="2"
              />
            </>
          )}

          {series.length > 1 && (
            <>
              <text
                x={pad.l}
                y={H - 8}
                fill="#71717a"
                fontSize="11"
                fontFamily="system-ui,sans-serif"
              >
                {series[0].date.slice(0, 10)}
              </text>
              <text
                x={W - pad.r}
                y={H - 8}
                fill="#71717a"
                fontSize="11"
                textAnchor="end"
                fontFamily="system-ui,sans-serif"
              >
                {series[series.length - 1].date.slice(0, 10)}
              </text>
            </>
          )}
        </svg>

        {activePoint && (
          <div className="pointer-events-none absolute left-1/2 top-2 z-10 w-[min(100%,14rem)] -translate-x-1/2 rounded-xl border border-[#FFD700]/30 bg-[#0B0E14]/95 px-3 py-2 text-center shadow-lg backdrop-blur sm:left-auto sm:right-3 sm:top-3 sm:translate-x-0 sm:text-left">
            <p className="text-[10px] uppercase tracking-wider text-zinc-500">
              {activePoint.p.date.slice(0, 10)}
              {snapshotMode ? " · avg level" : ""}
            </p>
            <p className="text-sm font-bold text-[#FFD700]">
              {formatZar(activePoint.p.trendZar)}
            </p>
            {activePoint.p.avgZar != null && (
              <p className="text-[11px] text-zinc-400">
                Avg {formatZar(activePoint.p.avgZar)}
                {activePoint.p.lowZar != null
                  ? ` · Low ${formatZar(activePoint.p.lowZar)}`
                  : ""}
              </p>
            )}
          </div>
        )}
      </div>

      <p className="mt-2 text-[11px] leading-relaxed text-zinc-500">
        {snapshotMode
          ? "Snapshot from CardDex averages (30d → 7d → 1d → trend). Daily sealed history is not published by the API yet."
          : "Drag or tap the chart to inspect daily ZAR trend. Source: CardDex / Cardmarket EUR converted at site rate."}
      </p>
    </div>
  );
}
