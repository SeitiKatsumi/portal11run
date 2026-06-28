import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  generateBuildId: async () => {
    return process.env.CAPROVER_GIT_COMMIT_SHA || process.env.GIT_COMMIT_SHA || "portal11run-local";
  },
  images: {
    unoptimized: true
  }
};

export default nextConfig;
