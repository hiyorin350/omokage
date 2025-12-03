// フェッチ（JSON＋詳細エラー＋タイムアウト＋Cookie対応）
async function postJson<T>(url: string, body: unknown, signal?: AbortSignal): Promise<T> {
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'same-origin',   // 将来 Cookie 認証を入れる前提
      cache: 'no-store',
      body: JSON.stringify(body),
      signal,
    });
    const text = await res.text();
    let data: any = undefined;
    try { data = text ? JSON.parse(text) : undefined; } catch {}
    if (!res.ok) {
      const msg = (data?.error && typeof data.error === 'string') ? data.error : text || res.statusText;
      throw new Error(msg);
    }
    return (data ?? {}) as T;
  }

export default postJson;