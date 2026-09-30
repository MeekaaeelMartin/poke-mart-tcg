import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "images.carddex.dev" },
      { protocol: "https", hostname: "**.carddex.dev" },
    ],
  },
};

export default nextConfig;
