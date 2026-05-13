/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Allow `@repo/types` to be consumed as raw TypeScript from the workspace
  // without an explicit build step. Mirrors how Turborepo + Next docs
  // recommend wiring shared packages.
  transpilePackages: ["@repo/types"],
};

export default nextConfig;
