/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  transpilePackages: ["@vedicneev/ui", "@vedicneev/engine", "@vedicneev/db"],
};

module.exports = nextConfig;
