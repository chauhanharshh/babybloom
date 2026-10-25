import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**", // Allow all HTTPS image sources
      },
      {
        protocol: "http",
        hostname: "**", // Allow HTTP sources (for local dev)
      },
    ],
  },
};

// Reload trigger for Prisma client schema sync
export default nextConfig;
