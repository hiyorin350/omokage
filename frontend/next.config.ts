import type { NextConfig } from 'next'

const API_TARGET = process.env.API_TARGET || 'http://localhost:8000'
// Docker内で動かす時は compose から API_TARGET=http://backend:8000 を渡す