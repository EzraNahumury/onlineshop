import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // Serve images directly (no Next.js image optimizer). The optimizer needs
    // sharp + a writable cache and often fails on shared/Node hosts (Hostinger),
    // breaking every <Image>. With this, /uploads/* and remote images load as-is.
    unoptimized: true,
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
    ],
  },
};

export default nextConfig;
