import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Remove static export to allow dynamic pages
  trailingSlash: true,
  images: {
    unoptimized: true,
  },
};

export default nextConfig;