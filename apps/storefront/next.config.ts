import { NextConfig } from "next";

const nextConfig: NextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  // Required for Docker deployment
  output: "standalone",
};

export default nextConfig;
