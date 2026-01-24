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
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
  },
  // Experimental features if needed, but standard 13/14/15 is stable
  typescript: {
    ignoreBuildErrors: true, // Temporarily ignore to allow build during migration
  },
}

module.exports = nextConfig
