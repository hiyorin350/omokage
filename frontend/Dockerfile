FROM node:20-alpine
WORKDIR /app

# ★ musl 由来の不具合回避（sharp など）
RUN apk add --no-cache libc6-compat
# （ネイティブ依存をビルドする可能性があるなら）
# RUN apk add --no-cache python3 make g++

# 依存インストール
COPY package.json package-lock.json ./
RUN npm ci --no-audit --no-fund
# 残りのソース
COPY . /app

EXPOSE 3000
# 実行は compose の command に委ねる
