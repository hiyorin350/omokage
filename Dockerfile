# =======================
#  Frontend dev stage
# =======================
FROM node:22-alpine AS fe-dev
WORKDIR /app

RUN apk add --no-cache libc6-compat python3 make g++ pkgconfig

# 依存インストール
COPY frontend/package.json frontend/package-lock.json ./
RUN npm ci

# ソースをコピー（初期状態）
COPY frontend/ ./

ENV NEXT_TELEMETRY_DISABLED=1

# dev 用エントリポイント
CMD ["npm", "run", "dev", "--", "-H", "0.0.0.0"]


# =======================
#  Frontend build stage (fe)
# =======================
FROM node:22-alpine AS fe
WORKDIR /fe/frontend
RUN apk add --no-cache libc6-compat python3 make g++ pkgconfig

# lockfile 前提（npm ci）
COPY frontend/package.json frontend/package-lock.json ./
RUN npm ci

# ソース投入→standalone ビルド（next.config.js: output: 'standalone' 必須）
COPY frontend/ ./
RUN npm run build


# =======================
#  Runtime (Next 入口 + Django 同居)  ← ★ 最後にする
# =======================
FROM node:22-bookworm-slim AS runtime
WORKDIR /app
ENV NODE_ENV=production PYTHONDONTWRITEBYTECODE=1 PYTHONUNBUFFERED=1 PORT=10000

# venv 作成に必要なパッケージ
RUN apt-get update && apt-get install -y --no-install-recommends \
    supervisor ca-certificates curl python3 python3-venv build-essential libpq-dev \
 && rm -rf /var/lib/apt/lists/*

# Frontend 配置（/app 直下に揃える）
COPY --from=fe /fe/frontend/.next/standalone/. ./
COPY --from=fe /fe/frontend/.next/static       ./.next/static
COPY --from=fe /fe/frontend/public             ./public

# Backend: 先に requirements をコピーしてキャッシュを効かせる
COPY backend/requirements.txt ./backend/requirements.txt
RUN python3 -m venv /app/venv \
 && /app/venv/bin/pip install --upgrade pip \
 && /app/venv/bin/pip install --no-cache-dir -r ./backend/requirements.txt \
 && /app/venv/bin/pip install --no-cache-dir "gunicorn>=22,<24"

# アプリ本体
COPY backend/ ./backend

# （任意）存在確認
RUN /app/venv/bin/python -V && /app/venv/bin/python -c "import gunicorn; print('gunicorn ok')"

# Supervisor 設定
COPY deploy/supervisord.conf /etc/supervisor/conf.d/supervisord.conf
RUN mkdir -p /var/log/supervisor

EXPOSE 10000
CMD ["supervisord","-c","/etc/supervisor/conf.d/supervisord.conf"]
