import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // output: "standalone", // 👈 THIS IS MANDATORY FOR NETLIFY
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "cdn.sanity.io" },
      { protocol: "https", hostname: "img.clerk.com" },
      { protocol: "https", hostname: "placehold.co" },
    ],
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;