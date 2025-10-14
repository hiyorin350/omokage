# api/views.py
import io, json, os, base64, requests, mimetypes
from urllib.parse import urlparse
from django.http import JsonResponse, HttpRequest
from django.views.decorators.csrf import csrf_exempt
from django.conf import settings
from openai import OpenAI
from .utils import save_base64_png
from pathlib import Path

client = OpenAI(
    api_key=settings.OPENAI_API_KEY,
    organization=(settings.OPENAI_ORG_ID or None),
)

def _abs_url(request: HttpRequest, rel_path: str) -> str:
    return request.build_absolute_uri(settings.MEDIA_URL + rel_path.split("/", 1)[1] if rel_path.startswith("media/") else rel_path if rel_path.startswith("/") else settings.MEDIA_URL + rel_path)

def _prompt_from_payload(p: dict) -> str:
    gender = p.get("gender") or ""
    hair = p.get("hair") or ""
    age = p.get("age") or ""
    features = p.get("features") or ""
    similar = p.get("similarTo") or ""

    # 有名人そっくり要求は避けて「雰囲気・特徴」に変換（オリジナル人物で）
    vibe = f"（{similar}の雰囲気を連想させる要素）" if similar else ""
    return (
        "ポートレート写真。新規オリジナル人物を生成。"
        "特定の実在人物を模倣しない。肌や髪の質感は自然、過度な補正なし。"
        f" 性別: {gender}。年齢: {age}。髪型/色: {hair}。特徴: {features}。{vibe}"
        " 背景はシンプル、正面から肩上、フォトリアル、照明は柔らかい。"
    )

def _generate_one_image(prompt: str, size: str | None = None) -> str:
    size = size or getattr(settings, "IMAGES_SIZE", "1024x1024")
    result = client.images.generate(
        model=getattr(settings, "IMAGES_MODEL", "gpt-image-1"),
        prompt=prompt,
        size=size,
    )
    b64 = result.data[0].b64_json
    rel = save_base64_png(b64, subdir="generated")
    return rel

@csrf_exempt
def generate(request: HttpRequest):
    if request.method != "POST":
        return JsonResponse({"error": "POST only"}, status=405)

    try:
        payload = json.loads(request.body.decode("utf-8"))
    except Exception:
        return JsonResponse({"error": "invalid json"}, status=400)

    prompt = _prompt_from_payload(payload)
    try:
        # 2枚作る（nパラメータ未使用で2回呼ぶのが互換的）
        rel_a = _generate_one_image(prompt)
        rel_b = _generate_one_image(prompt)
        return JsonResponse({
            "options": [
                _abs_url(request, rel_a),
                _abs_url(request, rel_b),
            ]
        })
    except Exception as e:
        return JsonResponse({"error": str(e)}, status=500)

def _download_to_bytes(url: str) -> bytes:
    r = requests.get(url, timeout=30)
    r.raise_for_status()
    return r.content

def _load_image_filelike(selected_url: str) -> io.BytesIO:
    """
    /media/～ はファイル直読み、外部URLはHTTPで取得。
    BytesIO.name に拡張子付きの名前を必ずセット。
    """
    u = urlparse(selected_url)  # ← どの場合もまず分解（クエリを捨てる）
    path = u.path  # /media/refined/xxx.png だけを取り出す

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
    bio.name = f"input{ext}"  # ★ 重要：拡張子でMIME推定
    bio.seek(0)
    return bio

@csrf_exempt
def refine(request: HttpRequest):
    if request.method != "POST":
        return JsonResponse({"error": "POST only"}, status=405)

    try:
        payload = json.loads(request.body.decode("utf-8"))
        selected_url = payload.get("selected")
        note = payload.get("note", "")
        context = payload.get("context", {})
        if not selected_url:
            return JsonResponse({"error": "selected required"}, status=400)

        # /media 始まりなら絶対URLに
        if selected_url.startswith("/"):
            selected_url = request.build_absolute_uri(selected_url)

        # 画像取得
        img_file = _load_image_filelike(selected_url)

        # 画像編集
        edit = client.images.edit(
            model=getattr(settings, "IMAGES_MODEL", "gpt-image-1"),
            image=img_file,
            prompt=(...),
            size=getattr(settings, "IMAGES_SIZE", "1024x1024"),
        )
        
        # 返り値を保存
        item = edit.data[0]
        if getattr(item, "b64_json", None):
            b64 = item.b64_json
            rel = save_base64_png(b64, subdir="refined")
            return JsonResponse({"url": _abs_url(request, rel)})
        elif getattr(item, "url", None):
            content = _download_to_bytes(item.url)
            rel = save_base64_png(base64.b64encode(content).decode("ascii"), subdir="refined")
            return JsonResponse({"url": _abs_url(request, rel)})
        else:
            return JsonResponse({"error": "no image returned"}, status=502)

    except Exception as e:
        return JsonResponse({"error": str(e)}, status=500)

@csrf_exempt
def complete(request: HttpRequest):
    if request.method != "POST":
        return JsonResponse({"error": "POST only"}, status=405)
    # ここでは受け取った URL とメタをログ保存するだけ（必要ならDBに保存）
    try:
        payload = json.loads(request.body.decode("utf-8"))
        # TODO: models に保存する場合はここで実装
        return JsonResponse({"ok": True})
    except Exception as e:
        return JsonResponse({"error": str(e)}, status=400)
