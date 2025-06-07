/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: { 
    unoptimized: true,
    domains: ['images.unsplash.com']
  },
  optimizeFonts: false,
  experimental: {
    serverActions: true,
  },
};

module.exports = nextConfig;