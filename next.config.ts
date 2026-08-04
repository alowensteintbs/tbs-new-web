import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactCompiler: true,
  serverExternalPackages: ["@prisma/client", "@prisma/adapter-mariadb", "mariadb"],
  // Product images are served locally from /public/uploads (same origin), so
  // next/image needs no remotePatterns.
};

export default nextConfig;
