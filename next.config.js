/** @type {import('next').NextConfig} */
const nextConfig = {
  // Enable standalone output for Docker
  // output: 'standalone',
  // Allow loading images from existing uploads folder (if served securely) or external sources
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production',
  },
  // Disable source maps in production
  productionBrowserSourceMaps: false,
  images: {
    qualities: [75, 90],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
      {
        protocol: 'http',
        hostname: '**',
      },
      {
        protocol: 'https',
        hostname: 'fademanufacture.com',
        pathname: '/uploads/**', // Allows all paths under uploads
      },
      {
        protocol: 'http',
        hostname: 'fademanufacture.com',
        pathname: '/uploads/**', // Also allow HTTP for development
      },
    ],
    unoptimized: process.env.NODE_ENV === 'development',
  },
  // Experimental features if needed, but standard 13/14/15 is stable
  typescript: {
    ignoreBuildErrors: true, // Temporarily ignore to allow build during migration
  },
}

module.exports = nextConfig
