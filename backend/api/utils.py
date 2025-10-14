# api/utils.py
import base64, uuid
from pathlib import Path
from django.conf import settings

def save_base64_png(b64: str, subdir: str = "generated") -> str:
    """
    base64 の PNG を MEDIA_ROOT/subdir に保存して相対パスを返す
    戻り値例: "generated/abc.png"
    """
    if b64.startswith("data:image"):
        b64 = b64.split(",", 1)[1]
    data = base64.b64decode(b64)
    folder = Path(settings.MEDIA_ROOT) / subdir
    folder.mkdir(parents=True, exist_ok=True)
    filename = f"{uuid.uuid4().hex}.png"
    path = folder / filename
    path.write_bytes(data)
    return f"{subdir}/{filename}"
