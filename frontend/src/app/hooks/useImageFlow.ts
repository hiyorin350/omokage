'use client';

import { useCallback, useMemo, useRef, useState } from 'react';
import postJson from '../postJson';
import { FormState, Step, UpdateField } from '../types';

const SAMPLE_A = '/images/sample_a.PNG';
const SAMPLE_B = '/images/sample_b.PNG';
const DEFAULT_RESULT = '/images/result.PNG';

export function useImageFlow() {
  const [step, setStep] = useState<Step>(1);
  const [loading, setLoading] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);
  const [form, setForm] = useState<FormState>({
    gender: null,
    hair: '',
    age: 22,
    similarTo: '',
    features: '',
  });
  const [optionA, setOptionA] = useState<string | null>(null);
  const [optionB, setOptionB] = useState<string | null>(null);
  const [refineA, setRefineA] = useState<string | null>(null);
  const [refineB, setRefineB] = useState<string | null>(null);
  const [resultUrl, setResultUrl] = useState<string | null>(null);
  const [fixNote, setFixNote] = useState('');

  const inflight = useRef<AbortController | null>(null);

  const payload = useMemo(() => ({ ...form }), [form]);

  const updateField: UpdateField = useCallback((key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  }, []);

  const newSignal = useCallback((ms = 120000) => {
    if (inflight.current) inflight.current.abort();
    const ac = new AbortController();
    inflight.current = ac;
    if (ms > 0) {
      const t = setTimeout(() => ac.abort(), ms);
      const abort = ac.abort.bind(ac);
      ac.abort = () => {
        clearTimeout(t);
        abort();
      };
    }
    return ac.signal;
  }, []);

  const handleStart = useCallback(
    async (e?: React.FormEvent) => {
      e?.preventDefault();
      if (loading) return;
      setLoading(true);
      setNotice(null);
      try {
        type GenerateResponse = { options: [string, string]; notice?: string; error?: string };
        const data = await postJson<GenerateResponse>(`/api/generate`, payload, newSignal());
        const [a, b] = data.options ?? [];
        setOptionA(a ?? SAMPLE_A);
        setOptionB(b ?? SAMPLE_B);
        setStep(2);
        if (data.notice) setNotice(data.notice);
        if (data.error) setNotice((prev) => `${data.error}${prev ? ` / ${prev}` : ''}`);
      } catch (err: any) {
        setOptionA(SAMPLE_A);
        setOptionB(SAMPLE_B);
        setStep(2);
        setNotice(`デモ表示: APIエラーによりサンプルで進行します（${err?.message ?? 'unknown error'}）`);
      } finally {
        setLoading(false);
      }
    },
    [loading, newSignal, payload]
  );

  const handlePick = useCallback(
    (which: 'a' | 'b') => {
      if (loading) return;
      const url = which === 'a' ? optionA : optionB;
      if (!url) return;
      setResultUrl(url);
      setStep(3);
    },
    [loading, optionA, optionB]
  );

  const handleBack = useCallback(() => {
    if (loading) return;
    if (step === 3) {
      setResultUrl(null);
      setStep(2);
      return;
    }
    if (step === 4) {
      setStep(3);
      return;
    }
    if (step === 2) setStep(1);
  }, [loading, step]);

  const handleRefine = useCallback(async () => {
    if (!resultUrl || loading) return;
    setLoading(true);
    setNotice(null);
    try {
      type RefineResponse = { options: [string, string]; notice?: string; error?: string };
      const data = await postJson<RefineResponse>(
        `/api/refine`,
        { selected: resultUrl, note: fixNote, context: payload },
        newSignal(120000)
      );
      const [a, b] = data.options ?? [];
      setRefineA(a ?? resultUrl);
      setRefineB(b ?? resultUrl);
      setStep(4);
      if (data.notice) setNotice(data.notice);
      if (data.error) setNotice((prev) => `${data.error}${prev ? ` / ${prev}` : ''}`);
    } catch (err: any) {
      setRefineA(resultUrl);
      setRefineB(resultUrl);
      setStep(4);
      setNotice(`修正案の取得に失敗したため元画像で表示します（${err?.message ?? 'unknown error'}）`);
    } finally {
      setLoading(false);
    }
  }, [loading, resultUrl, fixNote, payload, newSignal]);

  const handlePickRefine = useCallback(
    (which: 'a' | 'b') => {
      if (loading) return;
      const url = which === 'a' ? refineA : refineB;
      if (!url) return;
      setResultUrl(url);
      setStep(3);
      setNotice('修正案を適用しました。');
    },
    [loading, refineA, refineB]
  );

  const handleComplete = useCallback(async () => {
    if (!resultUrl || loading) return;
    setLoading(true);
    setNotice(null);
    try {
      await postJson(`/api/complete`, { imageUrl: resultUrl, meta: payload }, newSignal(120000));
      setNotice('保存しました');
    } catch (err: any) {
      setNotice(`保存に失敗しました: ${err?.message ?? 'unknown error'}`);
    } finally {
      setLoading(false);
    }
  }, [loading, payload, resultUrl, newSignal]);

  return {
    step,
    loading,
    notice,
    form,
    optionA,
    optionB,
    refineA,
    refineB,
    resultUrl,
    fixNote,
    setFixNote,
    updateField,
    handleStart,
    handlePick,
    handleBack,
    handleRefine,
    handlePickRefine,
    handleComplete,
    DEFAULT_RESULT,
    SAMPLE_A,
    SAMPLE_B,
  };
}
