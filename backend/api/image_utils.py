import io
import base64
import mimetypes
import requests
from urllib.parse import urlparse
from pathlib import Path
from typing import Any

from django.conf import settings
from django.http import HttpRequest

from .utils import save_base64_png

# サンプル画像（生成・修正が失敗した場合に使う）
FALLBACK_A = "/images/sample_a.PNG"
FALLBACK_B = "/images/sample_b.PNG"


def media_path(rel_path: str) -> str:
    """
    MEDIA_ROOT に保存したパスを、/media/～ の相対URLに正規化する。
    例: "generated/xxx.png" -> "/media/generated/xxx.png"
    """
    path = rel_path

    # "media/generated/xxx.png" → "generated/xxx.png"
    if path.startswith("media/"):
        path = path.split("/", 1)[1]

    # "/media/..." に揃える
    if not path.startswith("/"):
        path = settings.MEDIA_URL.rstrip("/") + "/" + path.lstrip("/")

    return path


def abs_url(request: HttpRequest, rel_path: str) -> str:
    """歴史的な命名を踏襲しつつ、相対URLだけ返す。"""
    return media_path(rel_path)


def prompt_from_payload(p: dict) -> str:
    gender = p.get("gender") or ""
    hair = p.get("hair") or ""
    age = p.get("age") or ""
    features = p.get("features") or ""
    similar = p.get("similarTo") or ""

    vibe = f"（{similar}に似ている）" if similar else ""
    return (
        "ポートレート写真。人種指定がなければ日本人。"
        "肌や髪の質感は自然、過度な補正なし。"
        f" 性別: {gender}。年齢: {age}。髪型/色: {hair}。特徴: {features}。{vibe}"
        " 背景はシンプル、正面から肩上、フォトリアル、照明は柔らかい。"
    )


def _download_to_bytes(url: str) -> bytes:
    r = requests.get(url, timeout=30)
    r.raise_for_status()
    return r.content


def load_image_filelike(selected_url: str) -> io.BytesIO:
    """
    /media/～ はファイル直読み、外部URLはHTTPで取得。
    BytesIO.name に拡張子付きの名前を必ずセット。
    """
    u = urlparse(selected_url)
    path = u.path

    media_url = settings.MEDIA_URL.rstrip("/")
    if path.startswith(media_url):
        rel = path[len(media_url):].lstrip("/")
        fs_path = Path(settings.MEDIA_ROOT) / rel
        with open(fs_path, "rb") as f:
            data = f.read()
        ext = Path(fs_path).suffix or ".png"
    else:
        r = requests.get(selected_url, timeout=20)
        r.raise_for_status()
        data = r.content
        ctype = r.headers.get("Content-Type", "").split(";")[0]
        ext = mimetypes.guess_extension(ctype) or Path(u.path).suffix or ".png"

    bio = io.BytesIO(data)
    bio.name = f"input{ext}"  # 拡張子でMIME推定されるため重要
    bio.seek(0)
    return bio


def save_item_to_media(request: HttpRequest, item: Any, subdir: str = "refined") -> str | None:
    """
    OpenAI 画像レスポンス（b64_json または一時URL）を MEDIA_ROOT に保存し、相対URLを返す。
    """
    if getattr(item, "b64_json", None):
        b64 = item.b64_json
        rel = save_base64_png(b64, subdir=subdir)
    elif getattr(item, "url", None):
        content = _download_to_bytes(item.url)
        rel = save_base64_png(base64.b64encode(content).decode("ascii"), subdir=subdir)
    else:
        return None

    return abs_url(request, rel)
