import type { Metadata, Viewport } from "next";
import { Outfit, Syne } from "next/font/google";
import "./globals.css";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Providers } from "@/components/Providers";
import { OrganizationJsonLd, WebsiteJsonLd } from "@/components/JsonLd";
import { DEFAULT_KEYWORDS, SITE_NAME, SITE_TAGLINE, getSiteUrl } from "@/lib/site";

const outfit = Outfit({
  variable: "--font-outfit",
  subsets: ["latin"],
});

const syne = Syne({
  variable: "--font-syne",
  subsets: ["latin"],
  weight: ["600", "700", "800"],
});

const site = getSiteUrl();

export const viewport: Viewport = {
  themeColor: "#0B0E14",
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

export const metadata: Metadata = {
  metadataBase: new URL(site),
  title: {
    default: `${SITE_NAME} — ${SITE_TAGLINE}`,
    template: `%s | ${SITE_NAME}`,
  },
  description:
    "Track live Pokemon card prices in South Africa (ZAR). Browse singles, ETBs, booster boxes & sealed product, set checklists, and price history charts. Powered by CardDex.",
  applicationName: SITE_NAME,
  keywords: [...DEFAULT_KEYWORDS],
  authors: [{ name: SITE_NAME }],
  creator: SITE_NAME,
  publisher: SITE_NAME,
  category: "Pokemon Trading Card Game",
  alternates: {
    canonical: site,
  },
  openGraph: {
    type: "website",
    locale: "en_ZA",
    url: site,
    siteName: SITE_NAME,
    title: `${SITE_NAME} — ${SITE_TAGLINE}`,
    description:
      "Live Pokemon TCG prices in ZAR for singles, Elite Trainer Boxes, booster boxes, and sets. Price charts and collection tracking for South African collectors.",
  },
  twitter: {
    card: "summary_large_image",
    title: `${SITE_NAME} — Pokemon Card Prices ZAR`,
    description:
      "Live Pokemon card & sealed product prices in South African Rand with price history graphs.",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
  other: {
    "llms-txt": `${site}/llms.txt`,
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en-ZA" className={`${outfit.variable} ${syne.variable} h-full antialiased`}>
      <head>
        <OrganizationJsonLd />
        <WebsiteJsonLd />
      </head>
      <body className="flex min-h-full flex-col font-sans">
        <Providers>
          <Header />
          <main className="flex-1">{children}</main>
          <Footer />
        </Providers>
      </body>
    </html>
  );
}
