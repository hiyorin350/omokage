FROM python:3.11-slim

WORKDIR /app
ENV PYTHONDONTWRITEBYTECODE=1 PYTHONUNBUFFERED=1

# psycopg2-binary を使うので本来は不要だが、将来ビルド系が要る時のために残してOK
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential libpq-dev \
 && rm -rf /var/lib/apt/lists/*

COPY requirements.txt /app/
RUN pip install --upgrade pip && \
    pip install --no-cache-dir -r requirements.txt

# プロジェクト一式
COPY . /app

EXPOSE 8000
# 起動コマンドは docker-compose.yml 側で渡す
