// frontend/next.config.ts
import type { NextConfig } from 'next'

const BACKEND_INTERNAL_ORIGIN =
  process.env.BACKEND_INTERNAL_ORIGIN || 'http://backend:8000';

const nextConfig: NextConfig = {
  output: 'standalone',
  async rewrites() {
    return [
      // ※ /api は API Route でやっているなら消してOK
      //   まだ rewrite 方式ならここも BACKEND_INTERNAL_ORIGIN に合わせてね

      {
        source: '/media/:path*',
        destination: `${BACKEND_INTERNAL_ORIGIN}/media/:path*`,
      },
    ]
  },
  eslint: { ignoreDuringBuilds: true },
}

module.exports = nextConfig
