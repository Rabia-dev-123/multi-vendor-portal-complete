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

  // Webpack configuration for Prisma
  webpack: (config, { isServer }) => {
    if (isServer) {
      config.externals.push({
        // Ensure Prisma binaries are properly included
        "@prisma/client": "commonjs @prisma/client",
      });
    }

    // Don't parse Prisma query engine files
    config.module = {
      ...config.module,
      noParse: [/libquery_engine.*\.so\.node$/],
    };

    return config;
  },

  // // Ensure Prisma binaries are copied during build
  // outputFileTracingIncludes: {
  //   "/api/**/*": ["./app/generated/prisma/**/*"],
  // },
};

export default nextConfig;
