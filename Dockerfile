# =======================
#  Frontend build (Next)
# =======================
FROM node:22-alpine AS fe
WORKDIR /fe
ENV NEXT_TELEMETRY_DISABLED=1

# pnpm 用意（corepack）
RUN apk add --no-cache libc6-compat && corepack enable

# 依存は先にコピーしてキャッシュを効かせる
COPY frontend/package.json frontend/pnpm-lock.yaml ./frontend/
RUN pnpm --prefix ./frontend install --frozen-lockfile

# ソースをコピーして build（standalone 生成）
COPY frontend ./frontend
RUN pnpm --prefix ./frontend build
# → .next/standalone, .next/static, public ができる想定
#   ※ next.config.js にて output: 'standalone' を設定しておく


# =======================
#  Backend build (Django)
# =======================
FROM python:3.11-slim AS be
WORKDIR /be

# psycopg2 等のビルドに必要なもの（不要なら削除OK）
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential libpq-dev \
 && rm -rf /var/lib/apt/lists/*

# venv 構築 & 依存インストール
COPY backend/requirements.txt .
RUN python -m venv /venv \
 && /venv/bin/pip install --upgrade pip \
 && /venv/bin/pip install --no-cache-dir -r requirements.txt

# アプリ本体
COPY backend ./backend
# 静的をここで集めたい場合は環境変数を適切に与えた上で以下を有効化
# RUN /venv/bin/python backend/manage.py collectstatic --noinput || true


# =======================
#  Runtime (single container: Node + Gunicorn via Supervisor)
# =======================
# ランタイムは Debian 系にして、Python venv をそのまま持ち込む
FROM node:22-bookworm-slim AS runtime
WORKDIR /app

ENV NODE_ENV=production \
    PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    PORT=10000

# Supervisor など最低限の実行ツール
RUN apt-get update && apt-get install -y --no-install-recommends \
    supervisor ca-certificates curl \
 && rm -rf /var/lib/apt/lists/*

# ---- Frontend (standalone server + static + public) ----
COPY --from=fe /fe/frontend/.next/standalone ./frontend/.next/standalone
COPY --from=fe /fe/frontend/.next/static     ./frontend/.next/static
COPY --from=fe /fe/frontend/public           ./frontend/public

# ---- Backend (venv + app) ----
COPY --from=be /venv /venv
COPY --from=be /be/backend ./backend

# ---- Supervisor 設定 ----
# リポジトリのルートに deploy/supervisord.conf を置く想定
# [program:backend] で `gunicorn config.wsgi:application -b 0.0.0.0:10001`
# [program:frontend] で `node server.js -p ${PORT}`
COPY deploy/supervisord.conf /etc/supervisor/conf.d/supervisord.conf

# 任意のヘルスチェック（Next 側の / に対して）
# HEALTHCHECK --interval=30s --timeout=3s --start-period=20s \
#   CMD curl -fsS http://127.0.0.1:${PORT}/ || exit 1

EXPOSE 10000
CMD ["supervisord","-c","/etc/supervisor/conf.d/supervisord.conf"]
