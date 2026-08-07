import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "export",
  images: { unoptimized: true },
  // Cloudflare Pages serves directory-style URLs; export index.html per route.
  trailingSlash: true,
};

export default nextConfig;
