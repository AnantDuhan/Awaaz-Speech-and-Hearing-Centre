import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Build the whole site as plain HTML/CSS/JS into the `out` folder, so it can be
  // hosted anywhere (Netlify, Cloudflare Pages, any static host) with no server.
  output: "export",
  images: {
    // Static hosts have no image optimiser. Needed once photos use next/image.
    unoptimized: true,
  },
};

export default nextConfig;
