from pathlib import Path
import os
from dotenv import load_dotenv

# === パス設定 ===
BASE_DIR = Path(__file__).resolve().parent.parent  # .../backend
# backend/.env を明示的に読む（manage.py と同じ階層）
load_dotenv(BASE_DIR / ".env")

# --- 小ユーティリティ ---
def _csv_env(key: str, default: str = ""):
    raw = os.getenv(key, default)
    return [x.strip() for x in raw.split(",") if x.strip()]

# --- 基本 ---
SECRET_KEY = os.getenv("DJANGO_SECRET_KEY", "dev-secret-key")
DEBUG = os.getenv("DJANGO_DEBUG", "1") == "1"
ALLOWED_HOSTS = _csv_env("ALLOWED_HOSTS", "omokage-webapp.onrender.com,localhost,127.0.0.1,backend")
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY", "")
OPENAI_ORG_ID  = os.getenv("OPENAI_ORG_ID", "")

# --- アプリ ---
INSTALLED_APPS = [
    "django.contrib.admin",
    "django.contrib.auth",
    "django.contrib.contenttypes",
    "django.contrib.sessions",
    "django.contrib.messages",
    "django.contrib.staticfiles",
    "rest_framework",
    "corsheaders",
    "api",
]

# --- ミドルウェア（corsheadersは最上位に） ---
MIDDLEWARE = [
    "corsheaders.middleware.CorsMiddleware",
    "django.middleware.security.SecurityMiddleware",
    "django.contrib.sessions.middleware.SessionMiddleware",
    "django.middleware.common.CommonMiddleware",
    "django.middleware.csrf.CsrfViewMiddleware",
    "django.contrib.auth.middleware.AuthenticationMiddleware",
    "django.contrib.messages.middleware.MessageMiddleware",
    "django.middleware.clickjacking.XFrameOptionsMiddleware",
]

# --- CORS/CSRF ---
# 環境変数で切替え。開発中(デフォルト)は全許可、
# 本番は明示リストに制限することを推奨。
if os.getenv("CORS_ALLOW_ALL_ORIGINS", "1" if DEBUG else "0") == "1":
    CORS_ALLOW_ALL_ORIGINS = True
    # CSRF は必要なオリジンを別途列挙（空なら無設定）
    _csrf_list = _csv_env("CSRF_TRUSTED_ORIGINS", "")
    if _csrf_list:
        CSRF_TRUSTED_ORIGINS = _csrf_list
else:
    CORS_ALLOWED_ORIGINS = _csv_env(
        "CORS_ALLOWED_ORIGINS",
        "http://localhost:3000,http://127.0.0.1:3000",
    )
    CSRF_TRUSTED_ORIGINS = _csv_env(
        "CSRF_TRUSTED_ORIGINS",
        ",".join(CORS_ALLOWED_ORIGINS),
    )

ROOT_URLCONF = "config.urls"

TEMPLATES = [{
    "BACKEND": "django.template.backends.django.DjangoTemplates",
    "DIRS": [],
    "APP_DIRS": True,
    "OPTIONS": {"context_processors": [
        "django.template.context_processors.debug",
        "django.template.context_processors.request",
        "django.contrib.auth.context_processors.auth",
        "django.contrib.messages.context_processors.messages",
    ],},
}]

WSGI_APPLICATION = "config.wsgi.application"

# --- DB（PostgreSQL; docker-composeの環境変数で上書き） ---
DATABASES = {
    "default": {
        "ENGINE": "django.db.backends.postgresql",
        "NAME": os.getenv("POSTGRES_DB", "app"),
        "USER": os.getenv("POSTGRES_USER", "app"),
        "PASSWORD": os.getenv("POSTGRES_PASSWORD", "app"),
        "HOST": os.getenv("POSTGRES_HOST", "db"),
        "PORT": os.getenv("POSTGRES_PORT", "5432"),
    }
}

# --- i18n ---
LANGUAGE_CODE = "ja"
TIME_ZONE = "Asia/Tokyo"
USE_I18N = True
USE_TZ = True

# --- 静的/メディア ---
STATIC_URL = "static/"
STATIC_ROOT = BASE_DIR / "staticfiles"

MEDIA_URL = "/media/"
MEDIA_ROOT = BASE_DIR / "media"

# --- DRF（MVPでは無認証）---
REST_FRAMEWORK = {
    "DEFAULT_AUTHENTICATION_CLASSES": [],
    "DEFAULT_PERMISSION_CLASSES": [],
}

DEFAULT_AUTO_FIELD = "django.db.models.BigAutoField"

# --- OpenAI 画像生成 ---
# 標準の OPENAI_API_KEY を優先。互換のため OPENAI_KEY もフォールバックで読む。
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY") or os.getenv("OPENAI_KEY", "")
IMAGES_MODEL = os.getenv("IMAGES_MODEL", "gpt-image-1")
IMAGES_SIZE  = os.getenv("IMAGES_SIZE", "1024x1024")  # ← ここを追加

# 本番で鍵が未設定なら停止して気づけるように（任意）
if not DEBUG and not OPENAI_API_KEY:
    raise RuntimeError("OPENAI_API_KEY is not set. Put it in backend/.env or environment.")
