from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status

@api_view(["POST"])
def generate(request):
    """
    入力: { gender, age, face_shape, hair, eyes, nose, mouth, accessories, notes }
    返却: 今はダミー（あとで生成ロジックを実装）
    """
    data = request.data or {}
    prompt = build_prompt_from_features(data)
    return Response(
        {
            "prompt": prompt,
            "status": "queued",
            "image_url": None,  # 後で生成画像のURLを返す
        },
        status=status.HTTP_202_ACCEPTED,
    )

def build_prompt_from_features(d):
    parts = []
    if g := d.get("gender"): parts.append(f"{g}")
    if a := d.get("age"): parts.append(f"{a} years old")
    if fs := d.get("face_shape"): parts.append(f"face shape: {fs}")
    if h := d.get("hair"): parts.append(f"hair: {h}")
    if e := d.get("eyes"): parts.append(f"eyes: {e}")
    if n := d.get("nose"): parts.append(f"nose: {n}")
    if m := d.get("mouth"): parts.append(f"mouth: {m}")
    if ac := d.get("accessories"): parts.append(f"accessories: {ac}")
    if nt := d.get("notes"): parts.append(nt)
    # リアル寄りのバイアスを付与
    parts.append("ultra realistic portrait, photographic, neutral background, soft lighting")
    return ", ".join(parts)