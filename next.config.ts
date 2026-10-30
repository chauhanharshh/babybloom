import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  poweredByHeader: false,
  productionBrowserSourceMaps: false,
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
  async headers() {
    const securityHeaders = [
      {
        key: "X-Frame-Options",
        value: "SAMEORIGIN",
      },
      {
        key: "X-Content-Type-Options",
        value: "nosniff",
      },
      {
        key: "Referrer-Policy",
        value: "strict-origin-when-cross-origin",
      },
      {
        key: "X-XSS-Protection",
        value: "1; mode=block",
      },
      {
        key: "Permissions-Policy",
        value: "camera=(), microphone=(), geolocation=()",
      },
      {
        key: "Strict-Transport-Security",
        value: "max-age=63072000; includeSubDomains; preload",
      },
    ];
    const noIndexHeaders = [
      ...securityHeaders,
      {
        key: "X-Robots-Tag",
        value: "noindex, nofollow, noarchive, nosnippet, noimageindex, nocache",
      },
    ];
    return [
      {
        source: "/:path*",
        headers: securityHeaders,
      },
      {
        source: "/admin",
        headers: noIndexHeaders,
      },
      {
        source: "/admin/:path*",
        headers: noIndexHeaders,
      },
      {
        source: "/admin-7xK9mP2qL4vN8wT3yR1_5z",
        headers: noIndexHeaders,
      },
      {
        source: "/admin-7xK9mP2qL4vN8wT3yR1_5z/:path*",
        headers: noIndexHeaders,
      },
      {
        source: "/admin7xK9mP2qL4vN8wT3yR1_5z",
        headers: noIndexHeaders,
      },
      {
        source: "/admin7xK9mP2qL4vN8wT3yR1_5z/:path*",
        headers: noIndexHeaders,
      },
      {
        source: "/api/:path*",
        headers: noIndexHeaders,
      },
    ];
  },
  async rewrites() {
    return [
      {
        source: "/admin-7xK9mP2qL4vN8wT3yR1_5z",
        destination: "/admin/7xK9mP2qL4vN8wT3yR1_5z",
      },
      {
        source: "/admin-7xK9mP2qL4vN8wT3yR1_5z/:path*",
        destination: "/admin/7xK9mP2qL4vN8wT3yR1_5z/:path*",
      },
      {
        source: "/admin7xK9mP2qL4vN8wT3yR1_5z",
        destination: "/admin/7xK9mP2qL4vN8wT3yR1_5z",
      },
      {
        source: "/admin7xK9mP2qL4vN8wT3yR1_5z/:path*",
        destination: "/admin/7xK9mP2qL4vN8wT3yR1_5z/:path*",
      },
    ];
  },
};

// Reload trigger for Prisma client schema sync
export default nextConfig;
