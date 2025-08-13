FROM node:20-alpine
WORKDIR /app

# ★ musl 由来の不具合回避（sharp など）
RUN apk add --no-cache libc6-compat
# （ネイティブ依存をビルドする可能性があるなら）
# RUN apk add --no-cache python3 make g++

# 依存インストール
COPY package.json package-lock.json* pnpm-lock.yaml* yarn.lock* .npmrc* ./
RUN if [ -f package-lock.json ]; then npm ci; \
  elif [ -f pnpm-lock.yaml ]; then npm i -g pnpm && pnpm i --frozen-lockfile; \
  elif [ -f yarn.lock ]; then yarn --frozen-lockfile; \
  else npm i; fi

# 残りのソース
COPY . /app

EXPOSE 3000
# 実行は compose の command に委ねる
