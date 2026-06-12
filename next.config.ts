import type { NextConfig } from "next";

// Allow next/image to optimize images served from the Bunny CDN. The hostname
// is derived from BUNNY_CDN_URL (e.g. https://tu-zona.b-cdn.net).
const bunnyHost = process.env.BUNNY_CDN_URL
  ? new URL(process.env.BUNNY_CDN_URL).hostname
  : undefined;

const nextConfig: NextConfig = {
  reactCompiler: true,
  serverExternalPackages: ["@prisma/client", "@prisma/adapter-mariadb", "mariadb"],
  images: {
    remotePatterns: bunnyHost
      ? [{ protocol: "https", hostname: bunnyHost }]
      : [],
  },
};

export default nextConfig;
