// frontend/next.config.ts
import type { NextConfig } from 'next'

const BACKEND_INTERNAL_ORIGIN =
  process.env.BACKEND_INTERNAL_ORIGIN || 'http://backend:8000';

const nextConfig: NextConfig = {
  output: 'standalone',
  async rewrites() {
    return [
      // ★ /api を rewrite 方式でやっているならここも揃える
      // いまは API Route 経由ならこれは不要
      // {
      //   source: '/api/:path*',
      //   destination: `${BACKEND_INTERNAL_ORIGIN}/api/:path*`,
      // },

      {
        source: '/media/:path*',
        destination: `${BACKEND_INTERNAL_ORIGIN}/media/:path*`,
      },
    ]
  },
  eslint: { ignoreDuringBuilds: true },
}

module.exports = nextConfig
