import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  serverExternalPackages: ["@copilotkit/runtime"],
  // Ensure Turbopack can resolve workspace-level node_modules in pnpm monorepo.
  turbopack: {
    root: path.join(__dirname, "../.."),
    resolveAlias: {
      'lightningcss$': require.resolve('lightningcss-wasm'),
    },
  },
  webpack: (config, { isServer }) => {
    // Fix for lightningcss module resolution
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        path: false,
      };
    }
    
    return config;
  },
};

export default nextConfig;
