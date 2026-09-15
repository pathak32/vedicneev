/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Same rationale as apps/web/next.config.js and apps/omrtest/next.config.js:
  // a self-contained server bundle, with workspace packages listed explicitly
  // so Vercel's monorepo build traces them correctly.
  output: "standalone",
  transpilePackages: ["@vedicneev/ui", "@vedicneev/engine", "@vedicneev/db"],
};

module.exports = nextConfig;
