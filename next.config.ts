import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  generateBuildId: async () => {
    return process.env.CAPROVER_GIT_COMMIT_SHA || `local-${Date.now()}`;
  },
  images: {
    unoptimized: true
  }
};

export default nextConfig;
