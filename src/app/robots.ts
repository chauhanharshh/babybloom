import type { MetadataRoute } from "next";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://babybloom.in";

export default function robots(): MetadataRoute.Robots {
  const disallowedPaths = ["/admin", "/admin/", "/admin-*", "/admin*", "/api/", "/api"];

  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: disallowedPaths,
      },
      {
        userAgent: [
          "Googlebot",
          "Googlebot-Image",
          "Bingbot",
          "Slurp",
          "DuckDuckBot",
          "Baiduspider",
          "YandexBot",
          "Applebot",
          "GPTBot",
          "ChatGPT-User",
          "CCBot",
          "ClaudeBot",
          "PerplexityBot",
          "Google-Extended",
          "facebookexternalhit",
          "Twitterbot",
        ],
        allow: "/",
        disallow: disallowedPaths,
      },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}

