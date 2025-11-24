import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  output: 'standalone',
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: 'http://backend:8000/api/:path*',  // 開発中は固定でOK
      },
      {
        source: '/media/:path*',
        destination: 'http://backend:8000/media/:path*',
      },
    ]
  },
  eslint: { ignoreDuringBuilds: true },
}

module.exports = nextConfig
