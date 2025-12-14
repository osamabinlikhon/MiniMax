/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  transpilePackages: ['@minimax/common'],
  experimental: {
    serverActions: true,
  },
  images: {
    domains: ['localhost', 'api.minimax.dev'],
  },
};

module.exports = nextConfig;
