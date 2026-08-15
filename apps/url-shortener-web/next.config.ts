import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Standalone output is only enabled for container (Docker/Podman) builds.
  // Vercel manages serverless bundling and nft tracing natively.
  output: process.env.NEXT_OUTPUT_STANDALONE === "true" ? "standalone" : undefined,
};

export default nextConfig;
