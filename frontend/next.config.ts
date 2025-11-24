import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  output: 'standalone',
  async rewrites() {
    return [
      // ★ /api の rewrite は一旦やめる
      // {
      //   source: '/api/:path*',
      //   destination: 'http://backend:8000/api/:path*',
      // },

      // /media だけ Django に飛ばす（これはこのままでOK）
      {
        source: '/media/:path*',
        destination: 'http://backend:8000/media/:path*',
      },
    ]
  },
  eslint: { ignoreDuringBuilds: true },
}

module.exports = nextConfig
