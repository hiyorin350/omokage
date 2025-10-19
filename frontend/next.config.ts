import type { NextConfig } from 'next'

/** @type {import('next').NextConfig} */
const nextConfig = {
    // Node.js runtime 前提（standalone を推奨）
    output: 'standalone',
    async rewrites() {
      return [
        {
          source: '/api/:path*',
          destination: 'http://127.0.0.1:10001/api/:path*',
        },
      ]
    },
    eslint: { ignoreDuringBuilds: true },
  }
  module.exports = nextConfig;

const API_TARGET = process.env.API_TARGET || 'http://localhost:8000'
// Docker内で動かす時は compose から API_TARGET=http://backend:8000 を渡す