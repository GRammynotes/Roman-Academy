import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  outputFileTracingRoot: process.cwd(),
  typescript: {
    tsconfigPath: "./tsconfig.json"
  }
};

export default nextConfig;
