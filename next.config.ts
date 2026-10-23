import path from "path";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Hostinger also injects standalone; keep export as a plain object (not a function).
  output: "standalone",
  // Prevent Hostinger parent lockfiles from breaking the standalone layout.
  outputFileTracingRoot: path.join(process.cwd()),
  // Ensure Prisma engines ship inside the standalone server bundle.
  outputFileTracingIncludes: {
    "/*": [
      "./node_modules/.prisma/**/*",
      "./node_modules/@prisma/client/**/*",
      "./node_modules/prisma/**/*",
      "./prisma/**/*",
    ],
  },
  // Shared hosts (Hostinger) hit process/thread caps when Next spawns ~NCPU workers
  // during "Collecting page data" → EAGAIN / SIGABRT. Keep parallelism low.
  experimental: {
    cpus: 2,
    workerThreads: false,
  },
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "images.carddex.dev" },
      { protocol: "https", hostname: "**.carddex.dev" },
      { protocol: "https", hostname: "product-images.s3.cardmarket.com" },
    ],
  },
};

export default nextConfig;
