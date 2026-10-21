export const EUR_TO_ZAR = Number(process.env.EUR_TO_ZAR || 20.5);

export function eurToZar(eur: number | null | undefined): number | null {
  if (eur == null || Number.isNaN(eur)) return null;
  return Math.round(eur * EUR_TO_ZAR * 100) / 100;
}

export function formatZar(amount: number | null | undefined): string {
  if (amount == null || Number.isNaN(amount)) return "Unlisted";
  return `R ${amount.toLocaleString("en-ZA", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

export function formatPct(pct: number | null | undefined): string {
  if (pct == null || Number.isNaN(pct)) return "0.0%";
  const capped = Math.max(-99.9, Math.min(99.9, pct));
  const sign = capped > 0 ? "+" : "";
  return `${sign}${capped.toFixed(1)}%`;
}

export function parseJsonArray(value: string | null | undefined): string[] {
  if (!value) return [];
  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) ? parsed.map(String) : [];
  } catch {
    return [];
  }
}

export function rarityBadge(rarity: string | null | undefined): string {
  if (!rarity) return "—";
  const r = rarity.toLowerCase();
  if (r.includes("special illustration")) return "SIR";
  if (r.includes("illustration")) return "IR";
  if (r.includes("ultra")) return "UR";
  if (r.includes("double rare") || r.includes("double")) return "RR";
  if (r.includes("hyper")) return "HR";
  if (r.includes("secret")) return "SR";
  if (r.includes("rare holo") || r.includes("holo")) return "RH";
  if (r.includes("rare")) return "R";
  if (r.includes("uncommon")) return "U";
  if (r.includes("common")) return "C";
  return rarity.slice(0, 3).toUpperCase();
}

export function cn(...parts: Array<string | false | null | undefined>) {
  return parts.filter(Boolean).join(" ");
}
