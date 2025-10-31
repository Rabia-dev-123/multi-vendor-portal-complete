import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // SVG handling: Transform SVG files into React components
  turbopack: {
    rules: {
      "*.svg": {
        loaders: ["@svgr/webpack"],
        as: "*.js",
      },
    },
  },
};

export default nextConfig;
