# =======================
#  Frontend build (Next + npm)
# =======================
FROM node:22-alpine AS fe
WORKDIR /fe/frontend
ENV NEXT_TELEMETRY_DISABLED=1
# 一部ネイティブ依存の互換層
RUN apk add --no-cache libc6-compat

# 依存は先にコピー（キャッシュ最適化）
COPY frontend/package.json frontend/package-lock.json ./
# dev 依存も含めて確実に再現（CI向け）
RUN npm ci

# ソースをコピーして build（standalone 生成）
COPY frontend/ ./
# next.config.js で output: 'standalone' を設定しておくこと
RUN npm run build
# → .next/standalone, .next/static, public が生成される想定


# =======================
#  Backend build (Django + pip)
# =======================
FROM python:3.11-slim AS be
WORKDIR /be

# psycopg2 等のビルドに必要（不要なら削る）
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential libpq-dev \
 && rm -rf /var/lib/apt/lists/*

# 依存インストール
COPY backend/requirements.txt .
RUN python -m venv /venv \
 && /venv/bin/pip install --upgrade pip \
 && /venv/bin/pip install --no-cache-dir -r requirements.txt

# アプリ本体
COPY backend/ ./backend
# 必要なら静的収集（環境変数が要る場合は適宜設定）
# RUN /venv/bin/python backend/manage.py collectstatic --noinput || true


# =======================
#  Runtime (single container: Node + Gunicorn via Supervisor)
# =======================
# Node 22 ベースに Python ランタイムも入れて venv を動かす
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
# 例:
# [program:backend]  command=/venv/bin/gunicorn config.wsgi:application -b 0.0.0.0:10001 --workers 3 --timeout 60
# [program:frontend] command=node server.js -p ${PORT}
COPY deploy/supervisord.conf /etc/supervisor/conf.d/supervisord.conf

EXPOSE 10000
CMD ["supervisord","-c","/etc/supervisor/conf.d/supervisord.conf"]
