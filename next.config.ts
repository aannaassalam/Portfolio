import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  trailingSlash: false,
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "*"
      }
    ]
  },
  async headers() {
    return [
      {
        // Pre-sized screenshots in public/work: let browsers keep them for a
        // week instead of revalidating on every visit.
        source: "/work/:path*",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=604800, stale-while-revalidate=86400"
          }
        ]
      }
    ];
  },
  compress: true,
  compiler: {
    removeConsole: false
    // removeConsole: process.env.NODE_ENV === "production"
  },
  env: {
    NEXT_APP_BASE_URL: process.env.NEXT_APP_BASE_URL,
    NEXT_APP_ENCRYPTION_KEY: process.env.NEXT_APP_ENCRYPTION_KEY,
    NEXT_APP_TOKEN_NAME: process.env.NEXT_APP_TOKEN_NAME,
    NEXT_APP_CLIENT_ID: process.env.NEXT_APP_CLIENT_ID,
    NEXT_APP_CLIENT_SECRET: process.env.NEXT_APP_CLIENT_SECRET,
    NEXTAUTH_URL: process.env.NEXTAUTH_URL,
    NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET
  },
  typescript: { ignoreBuildErrors: false }
};

export default nextConfig;
