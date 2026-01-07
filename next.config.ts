import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "cdn.sanity.io",
      },
      {
        protocol: "https",
        hostname: "img.clerk.com",
      },
    ],
  },
  // Skip TypeScript errors during production build
  typescript: {
    ignoreBuildErrors: true,
  },
  // Skip ESLint during production build
  eslint: {
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;
