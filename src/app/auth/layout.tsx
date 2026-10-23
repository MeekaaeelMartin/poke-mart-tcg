import type { Metadata } from "next";
import { buildMetadata } from "@/lib/seo";

export const metadata: Metadata = buildMetadata({
  title: "Account",
  description: "Sign in or create a Poke Mart TCG account to track your Pokemon card portfolio.",
  path: "/auth/signin",
  noIndex: true,
});

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return children;
}
