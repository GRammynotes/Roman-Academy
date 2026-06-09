import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  outputFileTracingRoot: process.cwd(),
  typescript: {
    tsconfigPath: "./tsconfig.json"
  },
  webpack: (config) => {
    config.optimization.minimize = false;
    return config;
  }
};

export default nextConfig;
