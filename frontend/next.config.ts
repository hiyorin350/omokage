import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  async rewrites() {
    return [
      // ブラウザ → Next(3000) → Django(backend:8000) へ内部プロキシ
      { source: '/api/:path*', destination: 'http://backend:8000/api/:path*' },
    ]
  },
}

export default nextConfig