import type { NextConfig } from 'next'

const API_TARGET =
  process.env.API_TARGET ||
  (process.env.NODE_ENV === 'production'
    ? 'http://127.0.0.1:10001' // Render runtime コンテナから見た Django
    : 'http://backend:8000')   // docker compose 開発時の backend サービス

const nextConfig: NextConfig = {
  output: 'standalone',
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: `${API_TARGET}/api/:path*`,
      },
    ]
  },
  eslint: { ignoreDuringBuilds: true },
}

module.exports = nextConfig
