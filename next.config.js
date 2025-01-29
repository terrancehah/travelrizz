/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: ['places.googleapis.com'],
  },
  // Handle static files
  async rewrites() {
    return [
      {
        source: '/api/stripe/verify/:path*',
        destination: '/api/stripe/verify/:path*',
      },
      {
        source: '/api/stripe/webhook',
        destination: '/api/stripe/webhook',
      },
      {
        source: '/api/chat',
        destination: '/api/chat',
      },
      {
        source: '/api/weather/:path*',
        destination: '/api/weather/:path*',
      }
    ]
  },
  async redirects() {
    return [
      {
        source: '/travel-rizz.html',
        destination: '/travel-form',
        permanent: true,
      },
      // Ensure consistent trailing slash handling
      {
        source: '/:path+/',
        destination: '/:path+',
        permanent: true,
      }
    ]
  },
  webpack: (config) => {
    config.watchOptions = {
      poll: 1000,
      aggregateTimeout: 300,
      ignored: ['**/.git/**', '**/node_modules/**', '**/.next/**']
    };
    return config;
  },
  // Remove assetPrefix if not needed for production
  trailingSlash: false,
}

module.exports = nextConfig