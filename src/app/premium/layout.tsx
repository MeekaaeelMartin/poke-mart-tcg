import type { Metadata } from "next";
import { buildMetadata } from "@/lib/seo";

export const metadata: Metadata = buildMetadata({
  title: "Premium Pokemon Collection Tracker — R50/mo",
  description:
    "Unlock the Poke Mart TCG premium portfolio dashboard: track collection value in ZAR, watchlists, price alerts, and AI card upload tools for South African collectors.",
  path: "/premium",
  keywords: [
    "Pokemon collection tracker",
    "Pokemon portfolio app South Africa",
    "Pokemon price alerts",
    "Pokemon card inventory software",
  ],
});

export default function PremiumLayout({ children }: { children: React.ReactNode }) {
  return children;
}
