/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Self-contained server bundle (only the files a `next start` needs) — the
  // Vercel monorepo build traces workspace deps below correctly only once
  // they're also listed here, since Next doesn't compile packages outside
  // apps/web by default.
  output: "standalone",
  transpilePackages: ["@vedicneev/ui", "@vedicneev/engine", "@vedicneev/db"],
};

module.exports = nextConfig;
