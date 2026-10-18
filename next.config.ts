import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // Modern formats keep the big photography fast.
    formats: ["image/avif", "image/webp"],
    remotePatterns: [
      { protocol: "https", hostname: "images.unsplash.com" },
      // Supabase Storage (admin-uploaded photos)
      { protocol: "https", hostname: "*.supabase.co" },
    ],
  },
  poweredByHeader: false,
};

export default nextConfig;
