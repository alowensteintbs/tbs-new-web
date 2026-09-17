import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactCompiler: true,
  serverExternalPackages: ["@prisma/client", "@prisma/adapter-mariadb", "mariadb"],
  images: {
    remotePatterns: [new URL("https://i.ytimg.com/vi/4nfPF4XUc7M/**")],
    // Keep the default quality for general assets and allow a higher-quality
    // responsive variant for large portrait photography.
    qualities: [75, 90],
  },
};

export default nextConfig;
