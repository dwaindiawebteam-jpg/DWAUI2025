import { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    qualities: [75, 100],
    remotePatterns: [

      // ImageKit
      {
        protocol: "https",
        hostname: "ik.imagekit.io",
      },
    ],
  },

  experimental: {
    serverActions: {
      bodySizeLimit: "10mb",
    },
    useLightningcss: false, // ✅ Correct property name for Next 16+
  },
};

export default nextConfig;