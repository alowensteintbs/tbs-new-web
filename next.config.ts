import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactCompiler: true,
  serverExternalPackages: ["@prisma/client", "@prisma/adapter-mariadb", "mariadb"],
  images: {
    remotePatterns: [new URL("https://i.ytimg.com/vi/4nfPF4XUc7M/**")],
  },
};

export default nextConfig;
