import type { Metadata } from "next";
import { buildMetadata } from "@/lib/seo";

export const metadata: Metadata = buildMetadata({
  title: "Contact Poke Mart TCG — Support & Partnerships",
  description:
    "Contact Poke Mart TCG for support, partnerships, API questions, and premium help. South Africa's Pokemon card price tracker and collection companion.",
  path: "/contact",
  keywords: ["Poke Mart TCG contact", "Pokemon TCG support South Africa"],
});

export default function ContactLayout({ children }: { children: React.ReactNode }) {
  return children;
}
