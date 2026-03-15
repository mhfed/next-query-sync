import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import type { NextConfig } from "next";

const configDir = dirname(fileURLToPath(import.meta.url));
const repoRoot = resolve(configDir, "..");

const nextConfig: NextConfig = {
  outputFileTracingRoot: repoRoot,
  transpilePackages: ['next-query-sync'],
  experimental: {
    externalDir: true,
  },
  turbopack: {
    root: repoRoot,
  },
};

export default nextConfig;
