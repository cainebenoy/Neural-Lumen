import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  reactCompiler: true,
  // Prevent TensorFlow.js from being bundled server-side (browser-only library)
  serverExternalPackages: ['@tensorflow/tfjs'],
  // Empty turbopack config to enable Turbopack (Next.js 16 default)
  turbopack: {},
};

export default nextConfig;
