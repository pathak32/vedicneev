/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Same rationale as apps/web/next.config.js: a self-contained server
  // bundle, with workspace packages listed explicitly so Vercel's monorepo
  // build traces them correctly.
  output: "standalone",
  transpilePackages: ["@vedicneev/ui", "@vedicneev/engine", "@vedicneev/db", "@vedicneev/auth"],
  // sharp ships a native binary — webpack must not try to bundle it into
  // the Route Handler's JS chunk (it can't); this tells Next to require()
  // it at runtime from node_modules instead, the documented fix for any
  // native addon used from a Server Component/Route Handler.
  experimental: {
    serverComponentsExternalPackages: ["sharp"],
  },
};

module.exports = nextConfig;
