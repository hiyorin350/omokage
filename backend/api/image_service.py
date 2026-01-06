import io
from concurrent.futures import ThreadPoolExecutor
from typing import Any, Dict, List

from django.conf import settings
from django.http import HttpRequest
from openai import OpenAI

from .image_utils import (
    FALLBACK_A,
    FALLBACK_B,
    abs_url,
    load_image_filelike,
    prompt_from_payload,
    save_item_to_media,
)
from .utils import save_base64_png

# OpenAI クライアントはここで一元管理
client = OpenAI(
    api_key=settings.OPENAI_API_KEY,
    organization=(settings.OPENAI_ORG_ID or None),
)


def _generate_one_image(prompt: str, size: str | None = None) -> str:
    size = size or getattr(settings, "IMAGES_SIZE", "1024x1024")
    result = client.images.generate(
        model=getattr(settings, "IMAGES_MODEL", "gpt-image-1"),
        prompt=prompt,
        size=size,
    )
    b64 = result.data[0].b64_json
    # 呼び出し元で abs_url するために相対パスを返す
    return save_base64_png(b64, subdir="generated")


def generate_pair(payload: Dict[str, Any], request: HttpRequest) -> Dict[str, Any]:
    """
    2枚生成して options に入れて返す。失敗時はサンプルを返す。
    """
    prompt = prompt_from_payload(payload)
    try:
        with ThreadPoolExecutor(max_workers=2) as ex:
            fut_a = ex.submit(_generate_one_image, prompt)
            fut_b = ex.submit(_generate_one_image, prompt)
            rel_a = fut_a.result()
            rel_b = fut_b.result()

        return {
            "options": [
                abs_url(request, rel_a),
                abs_url(request, rel_b),
            ]
        }
    except Exception as e:
        import traceback

        traceback.print_exc()
        return {
            "options": [FALLBACK_A, FALLBACK_B],
            "error": str(e) or "generation failed; showing samples",
            "notice": "サンプル画像で続行します（生成APIエラー）",
        }


def _refine_prompt(note: str, ctx: dict) -> str:
    base = prompt_from_payload(ctx) if ctx else "ポートレート写真。正面から肩上、フォトリアル。"
    if note:
        fix = f" 元画像の顔立ち・ライティングを保持しつつ、次を反映: {note}。"
    else:
        fix = " 元画像の雰囲気を保ち、より自然で解像感の高い仕上がりにする。"
    return base + " " + fix


def refine_pair(payload: Dict[str, Any], request: HttpRequest) -> Dict[str, Any]:
    """
    選択済み画像をベースに2枚の修正案を生成し options で返す。
    失敗時も 200 でフォールバックを返す。
    """
    selected_url = payload.get("selected")
    note = (payload.get("note") or "").strip()
    context = payload.get("context", {}) or {}

    # /media 始まりなら絶対URLに
    if selected_url and isinstance(selected_url, str) and selected_url.startswith("/"):
        selected_url = request.build_absolute_uri(selected_url)

    try:
        # 画像取得（複数回使うので中身を保持）
        img_file = load_image_filelike(selected_url)
        img_bytes = img_file.getvalue()
        img_name = getattr(img_file, "name", "input.png")

        def _do_refine() -> tuple[str | None, str | None]:
            try:
                bio = io.BytesIO(img_bytes)
                bio.name = img_name
                bio.seek(0)
                edit = client.images.edit(
                    model=getattr(settings, "IMAGES_MODEL", "gpt-image-1"),
                    image=bio,
                    prompt=_refine_prompt(note, context),
                    size=getattr(settings, "IMAGES_SIZE", "1024x1024"),
                )
                item = edit.data[0]
                url = save_item_to_media(request, item, subdir="refined")
                return url, None
            except Exception as e:
                return None, str(e)

        with ThreadPoolExecutor(max_workers=2) as ex:
            fut_a = ex.submit(_do_refine)
            fut_b = ex.submit(_do_refine)
            url_a, err_a = fut_a.result()
            url_b, err_b = fut_b.result()

        if url_a and url_b:
            return {"options": [url_a, url_b]}

        if url_a or url_b:
            only = url_a or url_b
            return {
                "options": [only, only],
                "notice": "修正案を1枚のみ生成しました。",
            }

        fallback = selected_url or FALLBACK_A
        return {
            "options": [fallback, fallback],
            "error": err_a or err_b or "no image returned",
        }

    except Exception as e:
        fallback = selected_url or FALLBACK_A
        return {
            "options": [fallback, fallback],
            "error": str(e) or "internal error",
        }
