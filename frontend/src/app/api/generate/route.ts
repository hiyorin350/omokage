// app/api/generate/route.ts
import { NextRequest, NextResponse } from 'next/server';

const BACKEND_ORIGIN =
  process.env.BACKEND_INTERNAL_ORIGIN || 'http://backend:8000';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const res = await fetch(`${BACKEND_ORIGIN}/api/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });

    const text = await res.text();
    let data: any = undefined;
    try {
      data = text ? JSON.parse(text) : undefined;
    } catch {
      // Django が変なJSON返しても、とりあえずそのまま返す
    }

    return NextResponse.json(data ?? {}, { status: res.status });
  } catch (e: any) {
    console.error('proxy /api/generate error', e);
    return NextResponse.json(
      { error: e?.message ?? 'proxy error' },
      { status: 500 },
    );
  }
}
