import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Hostinger also injects standalone; keeping it explicit helps local prod builds.
  output: "standalone",
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "images.carddex.dev" },
      { protocol: "https", hostname: "**.carddex.dev" },
      { protocol: "https", hostname: "product-images.s3.cardmarket.com" },
    ],
  },
};

export default nextConfig;
