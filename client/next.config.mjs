/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    // Ignore ESLint checks during production build compiling
    ignoreDuringBuilds: true,
  },
  typescript: {
    // Ignore TypeScript type errors during production builds
    ignoreBuildErrors: true,
  },
};

export default nextConfig;
