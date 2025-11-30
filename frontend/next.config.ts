import type { NextConfig } from 'next'

// RUNTIME_MODE=runtime のとき → Next と Django が同じコンテナ（Render / runtime Docker）
// それ以外 → docker-compose の dev（frontend コンテナ → backend コンテナ）
const runtimeMode = process.env.RUNTIME_MODE;

const backendOrigin =
  runtimeMode === 'runtime'
    ? 'http://127.0.0.1:10001'  // Render / runtime コンテナ内の Django
    : 'http://backend:8000';    // ローカル docker-compose の backend サービス

const nextConfig: NextConfig = {
  output: 'standalone',
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: `${backendOrigin}/api/:path*`,
      },
      {
        source: '/media/:path*',
        destination: `${backendOrigin}/media/:path*`,
      },
    ]
  },
  eslint: { ignoreDuringBuilds: true },
}

module.exports = nextConfig
