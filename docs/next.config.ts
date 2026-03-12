import { fileURLToPath } from "node:url";
import type { NextConfig } from "next";

const repoRoot = fileURLToPath(new URL("..", import.meta.url));

const nextConfig: NextConfig = {
  transpilePackages: ['next-query-sync'],
  experimental: {
    externalDir: true,
  },
  turbopack: {
    root: repoRoot,
  },
};

export default nextConfig;
