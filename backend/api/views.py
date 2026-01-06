import json
from django.http import JsonResponse, HttpRequest
from django.views.decorators.csrf import csrf_exempt

from .image_service import generate_pair, refine_pair

@csrf_exempt
def generate(request: HttpRequest):
    if request.method != "POST":
        return JsonResponse({"error": "POST only"}, status=405)

    try:
        payload = json.loads(request.body.decode("utf-8"))
    except Exception:
        return JsonResponse({"error": "invalid json"}, status=400)

    data = generate_pair(payload, request)
    return JsonResponse(data)

@csrf_exempt
def refine(request: HttpRequest):
    if request.method != "POST":
        return JsonResponse({"error": "POST only"}, status=405)

    try:
        payload = json.loads(request.body.decode("utf-8"))
        if not payload.get("selected"):
            return JsonResponse({"error": "selected required"}, status=400)

        data = refine_pair(payload, request)
        return JsonResponse(data)

    except Exception as e:
        return JsonResponse({
            "options": ["/images/sample_a.PNG", "/images/sample_a.PNG"],
            "error": str(e) or "internal error",
        }, status=200)

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
