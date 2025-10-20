FROM node:22-bookworm-slim AS runtime
WORKDIR /app
ENV NODE_ENV=production PYTHONDONTWRITEBYTECODE=1 PYTHONUNBUFFERED=1 PORT=10000

# venv 作成に必要なパッケージ
RUN apt-get update && apt-get install -y --no-install-recommends \
    supervisor ca-certificates curl python3 python3-venv build-essential libpq-dev \
 && rm -rf /var/lib/apt/lists/*

# Frontend 配置（推奨レイアウト：/app 直下）
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

# （任意）存在確認をビルド時に実行：失敗すればここで気づける
RUN /app/venv/bin/python -V && /app/venv/bin/python -c "import gunicorn; print('gunicorn ok')"

# Supervisor 設定
COPY deploy/supervisord.conf /etc/supervisor/conf.d/supervisord.conf

RUN mkdir -p /var/log/supervisor
EXPOSE 10000
CMD ["supervisord","-c","/etc/supervisor/conf.d/supervisord.conf"]
