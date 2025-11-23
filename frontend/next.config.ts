import type { NextConfig } from 'next'

const API_TARGET =
  process.env.API_TARGET ||
  (process.env.NODE_ENV === 'production'
    ? 'http://127.0.0.1:10001'   // Render runtime の Django
    : 'http://backend:8000')     // docker-compose 開発用

const nextConfig: NextConfig = {
  output: 'standalone',
  async rewrites() {
    return [
      // API
      {
        source: '/api/:path*',
        destination: `${API_TARGET}/api/:path*`,
      },
      // ★ 画像(media)も Django に飛ばす
      {
        source: '/media/:path*',
        destination: `${API_TARGET}/media/:path*`,
      },
    ]
  },
  eslint: { ignoreDuringBuilds: true },
}

module.exports = nextConfig
