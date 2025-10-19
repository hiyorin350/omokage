# =========================================================
#  Frontend build (Next + npm / lockfile 前提: npm ci)
# =========================================================
FROM node:22-alpine AS fe
WORKDIR /fe/frontend
ENV NEXT_TELEMETRY_DISABLED=1

# ネイティブ依存の互換層（必要に応じて）
RUN apk add --no-cache libc6-compat

# 依存は先にコピー（キャッシュ最適化）
# ※ A方針：必ず package-lock.json をコミットしておくこと
COPY frontend/package.json frontend/package-lock.json ./
RUN npm ci

# ソースをコピーして build（standalone 生成）
COPY frontend/ ./
# next.config.js 側で output: 'standalone' を設定しておく
RUN npm run build
# → .next/standalone, .next/static, public が生成される想定


# =========================================================
#  Backend build (Django + pip)
# =========================================================
FROM python:3.11-slim AS be
WORKDIR /be

# psycopg2 等のビルドに必要（不要なら削除可能）
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential libpq-dev \
 && rm -rf /var/lib/apt/lists/*

# 依存インストール（venv）
COPY backend/requirements.txt .
RUN python -m venv /venv \
 && /venv/bin/pip install --upgrade pip \
 && /venv/bin/pip install --no-cache-dir -r requirements.txt

# アプリ本体
COPY backend/ ./backend
# 必要なら静的収集（環境変数が要る場合は適宜設定）
# RUN /venv/bin/python backend/manage.py collectstatic --noinput || true


# =========================================================
#  Runtime (単一コンテナ: Node(Next) + Gunicorn を Supervisor で管理)
# =========================================================
# ランタイムは Debian 系にして、be ステージの venv をそのまま持ち込む
FROM node:22-bookworm-slim AS runtime
WORKDIR /app

ENV NODE_ENV=production \
    PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    PORT=10000

# Supervisor と Python ランタイム（venv 実行に必要）
RUN apt-get update && apt-get install -y --no-install-recommends \
    supervisor ca-certificates curl python3 libpython3.11 \
 && rm -rf /var/lib/apt/lists/*

# ---- Frontend (standalone server + static + public) ----
COPY --from=fe /fe/frontend/.next/standalone ./frontend/.next/standalone
COPY --from=fe /fe/frontend/.next/static     ./frontend/.next/static
COPY --from=fe /fe/frontend/public           ./frontend/public

# ---- Backend (venv + app) ----
COPY --from=be /venv /venv
COPY --from=be /be/backend ./backend

# ---- Supervisor 設定 ----
# リポジトリ直下の deploy/supervisord.conf を参照
# [program:backend] で `gunicorn config.wsgi:application -b 0.0.0.0:10001`
# [program:frontend] で `node server.js -p ${PORT}`
COPY deploy/supervisord.conf /etc/supervisor/conf.d/supervisord.conf

# 任意のヘルスチェック（Next 側の / に対して）
# HEALTHCHECK --interval=30s --timeout=3s --start-period=20s \
#   CMD curl -fsS http://127.0.0.1:${PORT}/ || exit 1

EXPOSE 10000
CMD ["supervisord","-c","/etc/supervisor/conf.d/supervisord.conf"]
