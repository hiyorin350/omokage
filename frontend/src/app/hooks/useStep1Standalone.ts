'use client';

import { useCallback, useMemo, useState } from 'react';
import postJson from '../postJson';
import { FormState, UpdateField } from '../types';

const SAMPLE_A = '/images/sample_a.PNG';
const SAMPLE_B = '/images/sample_b.PNG';

export function useStep1Standalone() {
  const [loading, setLoading] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);
  const [form, setForm] = useState<FormState>({
    gender: null,
    hair: '',
    age: 22,
    similarTo: '',
    features: '',
  });

  const updateField: UpdateField = useCallback((key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  }, []);

  const payload = useMemo(() => ({ ...form }), [form]);

  const handleStart = useCallback(
    async (e?: React.FormEvent) => {
      e?.preventDefault();
      if (loading) return;
      setLoading(true);
      setNotice(null);
      try {
        type GenerateResponse = { options: [string, string]; notice?: string; error?: string };
        const data = await postJson<GenerateResponse>(`/api/generate`, payload);
        const [a, b] = data.options ?? [];
        setNotice(`生成完了: A=${a ?? SAMPLE_A}, B=${b ?? SAMPLE_B}`);
        if (data.notice) setNotice((prev) => [prev, data.notice].filter(Boolean).join(' / '));
        if (data.error) setNotice((prev) => [prev, data.error].filter(Boolean).join(' / '));
      } catch (err: any) {
        setNotice(`デモ表示: APIエラー（${err?.message ?? 'unknown error'}）`);
      } finally {
        setLoading(false);
      }
    },
    [loading, payload]
  );

  return { form, loading, notice, updateField, handleStart };
}
