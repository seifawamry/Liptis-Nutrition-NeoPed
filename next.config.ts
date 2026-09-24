import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  images: {
    unoptimized: true,
  },
  eslint: {
    // Allows production builds to successfully complete without blocking on unconfigured ESLint
    ignoreDuringBuilds: true,
  },
  typescript: {
    // Guarantees type checking passes strictly
    ignoreBuildErrors: false,
  },
};

export default nextConfig;

