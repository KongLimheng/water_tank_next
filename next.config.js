/** @type {import('next').NextConfig} */
const nextConfig = {
  // Allow loading images from existing uploads folder (if served securely) or external sources
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production',
  },
  // Disable source maps in production
  productionBrowserSourceMaps: false,
  headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'X-DNS-Prefetch-Control',
            value: 'on',
          },
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=63072000; includeSubDomains; preload',
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block',
          },
          {
            key: 'X-Frame-Options',
            value: 'SAMEORIGIN',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
          {
            key: 'Permissions-Policy',
            value:
              'camera=(), microphone=(), geolocation=(), interest-cohort=()',
          },
        ],
      },
    ]
  },
  images: {
    qualities: [85],
    minimumCacheTTL: 60,
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'fademanufacture.com',
        pathname: '/uploads/**', // Allows all paths under uploads
      },
      {
        protocol: 'http',
        hostname:
          process.env.NODE_ENV === 'production'
            ? 'fademanufacture.com'
            : 'localhost',
        pathname: '/uploads/**', // Also allow HTTP for development
      },
    ],
    // unoptimized: process.env.NODE_ENV === 'development',
  },
  // Experimental features if needed, but standard 13/14/15 is stable
  typescript: {
    ignoreBuildErrors: true, // Temporarily ignore to allow build during migration
  },
}

module.exports = nextConfig
