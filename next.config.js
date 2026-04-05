/** @type {import('next').NextConfig} */
const nextConfig = {
  turbopack: {},
  // Webpack configuration for WASM modules
  webpack: (config, { isServer, webpack }) => {
    // Handle qpdf-wasm and other modules that use Node.js built-ins
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        path: false,
        crypto: false,
        module: false,
        url: false,
        worker_threads: false,
        canvas: false, // Required for pdfjs-dist-legacy
      }
    } else {
      // Mark canvas as external for server-side builds
      config.externals = config.externals || []
      config.externals.push({
        canvas: 'commonjs canvas',
      })
    }

    // Also add module and canvas to alias for some packages that use it
    config.resolve.alias = {
      ...config.resolve.alias,
      module: false,
    }

    // Ignore problematic modules that are not needed in browser
    config.plugins.push(
      new webpack.IgnorePlugin({
        resourceRegExp: /^module$/,
      }),
      new webpack.IgnorePlugin({
        resourceRegExp: /^canvas$/,
        contextRegExp: /pdfjs-dist-legacy/,
      }),
    )

    // Enable WebAssembly
    config.experiments = {
      ...config.experiments,
      asyncWebAssembly: true,
    }

    return config
  },
  transpilePackages: ['@react-pdf/renderer', 'pdfjs-dist'],
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
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'X-Frame-Options',
            value: 'SAMEORIGIN',
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block',
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
        ],
      },
      // fonts
      {
        source: '/fonts/:all*',
        headers: [
          {
            key: 'Access-Control-Allow-Origin',
            value: '*',
          },
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },

      // Static assets - long cache
      {
        source:
          '/:path*.(ico|jpg|jpeg|png|gif|svg|webp|avif|woff|woff2|ttf|eot)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
      // JavaScript and CSS - cache with revalidation
      {
        source: '/:path*.(js|css)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
      {
        // HTML pages - short cache with revalidation
        source: '/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=0, must-revalidate',
          },
        ],
      },
      {
        source: '/pdfjs/:all*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
    ]
  },
  images: {
    qualities: [85],
    // Define device sizes for responsive images
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    // Define image sizes for srcset
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    // Minimum cache TTL for optimized images (in seconds)
    minimumCacheTTL: 60 * 60 * 24 * 30, // 30 days
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
  },

  typescript: {
    ignoreBuildErrors: true, // Temporarily ignore to allow build during migration
  },
  allowedDevOrigins: [
    process.env.NODE_ENV === 'production' ? '' : '192.168.100.84',
  ],
}
export default nextConfig
