'use client';

import React, { useCallback, useMemo, useRef, useState } from 'react';
import {
  Alert,
  Box,
  Button,
  ButtonGroup,
  Card,
  Container,
  Field,
  HStack,
  Heading,
  Image,
  Skeleton,
  Slider,
  Stack,
  Text,
  Textarea,
  VStack,
} from '@chakra-ui/react';

import OverlayLines from './overlayLines';
import VantaNetBg from './vantaNetBg';
import postJson from './postJson';

type Step = 1 | 2 | 3;
type FormState = {
  gender: 'male' | 'female' | null;
  hair: string;
  age: number;
  similarTo: string;
  features: string;
};

type UpdateField = <K extends keyof FormState>(key: K, value: FormState[K]) => void;

const SAMPLE_A = '/images/sample_a.PNG';
const SAMPLE_B = '/images/sample_b.PNG';
const DEFAULT_RESULT = '/images/result.PNG';

export default function Page() {
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
      ac.abort = () => { clearTimeout(t); abort(); };
    }
    return ac.signal;
  }, []);

  const handleStart = useCallback(async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (loading) return;
    setLoading(true);
    setNotice(null);
    try {
      type GenerateResponse = { options: [string, string] };
      const data = await postJson<GenerateResponse>(`/api/generate`, payload, newSignal());
      const [a, b] = data.options ?? [];
      setOptionA(a ?? SAMPLE_A);
      setOptionB(b ?? SAMPLE_B);
      setStep(2);
    } catch (err: any) {
      setOptionA(SAMPLE_A);
      setOptionB(SAMPLE_B);
      setStep(2);
      setNotice(`デモ表示: APIエラーによりサンプルで進行します（${err?.message ?? 'unknown error'}）`);
    } finally {
      setLoading(false);
    }
  }, [loading, newSignal, payload]);

  const handlePick = useCallback((which: 'a' | 'b') => {
    if (loading) return;
    const url = which === 'a' ? optionA : optionB;
    if (!url) return;
    setResultUrl(url);
    setStep(3);
  }, [loading, optionA, optionB]);

  const handleBack = useCallback(() => {
    if (loading) return;
    if (step === 3) {
      setResultUrl(null);
      setStep(2);
      return;
    }
    if (step === 2) setStep(1);
  }, [loading, step]);

  const handleRefine = useCallback(async () => {
    if (!resultUrl || loading) return;
    setLoading(true);
    setNotice(null);
    try {
      type RefineResponse = { url: string };
      const data = await postJson<RefineResponse>(
        `/api/refine`,
        { selected: resultUrl, note: fixNote, context: payload },
        newSignal(120000)
      );
      setResultUrl(data.url || resultUrl);
      setNotice('修正完了: 画像を更新しました。');
    } catch (err: any) {
      setNotice(`修正に失敗しました: ${err?.message ?? 'unknown error'}`);
    } finally {
      setLoading(false);
    }
  }, [loading, resultUrl, fixNote, payload, newSignal]);

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

  return (
    <Box as="main" minH="100dvh" position="relative" overflow="hidden" py={{ base: 8, md: 12 }}>
      <VantaNetBg />
      <OverlayLines />

      <Container maxW="lg" position="relative" zIndex={1}>
        {notice && (
          <Alert.Root status="info" rounded="md" mb={4}>
            {notice}
          </Alert.Root>
        )}

        {step > 1 && (
          <Button variant="ghost" size="sm" onClick={handleBack} disabled={loading} mb={4}>
            ← 戻る
          </Button>
        )}

        {step === 1 && (
          <Step1Form
            form={form}
            loading={loading}
            onChange={updateField}
            onSubmit={handleStart}
          />
        )}

        {step === 2 && (
          <Step2Picker
            loading={loading}
            optionA={optionA ?? SAMPLE_A}
            optionB={optionB ?? SAMPLE_B}
            onPick={handlePick}
          />
        )}

        {step === 3 && (
          <Step3Result
            loading={loading}
            resultUrl={resultUrl ?? DEFAULT_RESULT}
            fixNote={fixNote}
            onChangeFixNote={setFixNote}
            onComplete={handleComplete}
            onRefine={handleRefine}
          />
        )}
      </Container>
    </Box>
  );
}

type Step1FormProps = {
  form: FormState;
  loading: boolean;
  onChange: UpdateField;
  onSubmit: (e?: React.FormEvent) => void;
};

function Step1Form({ form, loading, onChange, onSubmit }: Step1FormProps) {
  return (
    <Card.Root>
      <Card.Body>
        <Stack gap={6} as="form" onSubmit={onSubmit}>
          <ButtonGroup attached variant="outline" w="full">
            <Button
              flex={1}
              borderColor={form.gender === 'male' ? 'blue.400' : 'gray.300'}
              color={form.gender === 'male' ? 'blue.500' : 'gray.600'}
              onClick={() => onChange('gender', 'male')}
              disabled={loading}
            >
              <Text as="span" mr={2} fontSize="lg">♂</Text>
              男
            </Button>
            <Button
              flex={1}
              borderColor={form.gender === 'female' ? 'pink.400' : 'gray.300'}
              color={form.gender === 'female' ? 'pink.500' : 'gray.600'}
              onClick={() => onChange('gender', 'female')}
              disabled={loading}
            >
              <Text as="span" mr={2} fontSize="lg">♀</Text>
              女
            </Button>
          </ButtonGroup>

          <Field.Root>
            <Field.Label>髪型</Field.Label>
            <Textarea
              placeholder="例: ショートカット、ボブ、肩までのロング、黒髪、茶髪…"
              value={form.hair}
              onChange={(e) => onChange('hair', e.target.value)}
              disabled={loading}
            />
          </Field.Root>

          <Field.Root>
            <Field.Label>年齢</Field.Label>
            <Box px={2} py={2} w="full">
              <Slider.Root
                min={10}
                max={80}
                step={1}
                value={[form.age]}
                onValueChange={(e) => onChange('age', e.value[0])}
                size="md"
                colorPalette="pink"
                w="full"
                maxW="820px"
                disabled={loading}
              >
                <HStack justify="space-between" mb={2}>
                  <Slider.Label>年齢</Slider.Label>
                  <Slider.ValueText />
                </HStack>
                <Slider.Control>
                  <Slider.Track>
                    <Slider.Range />
                  </Slider.Track>
                  <Slider.Thumbs />
                  <Slider.Marks marks={[10, 20, 30, 40, 50, 60, 70, 80]} />
                </Slider.Control>
              </Slider.Root>
            </Box>
          </Field.Root>

          <Field.Root>
            <Field.Label>似ている芸能人</Field.Label>
            <Textarea
              placeholder="例: 〜〜（※実在の人物名は“雰囲気”として扱われます）"
              value={form.similarTo}
              onChange={(e) => onChange('similarTo', e.target.value)}
              disabled={loading}
            />
          </Field.Root>

          <Field.Root>
            <Field.Label>特徴</Field.Label>
            <Textarea
              placeholder="例: 二重、鼻が高い…"
              value={form.features}
              onChange={(e) => onChange('features', e.target.value)}
              disabled={loading}
            />
          </Field.Root>

          <HStack justify="center">
            <Button
              type="submit"
              colorPalette="pink"
              px={8}
              borderRadius="xl"
              loading={loading}
              loadingText="生成中…"
            >
              Start!!
            </Button>
          </HStack>
        </Stack>
      </Card.Body>
    </Card.Root>
  );
}

type Step2PickerProps = {
  loading: boolean;
  optionA: string;
  optionB: string;
  onPick: (which: 'a' | 'b') => void;
};

function Step2Picker({ loading, optionA, optionB, onPick }: Step2PickerProps) {
  return (
    <VStack gap={8} align="center">
      <Heading size="md" mt={2} fontWeight="medium">
        似ているのはどっち？
      </Heading>
      <Skeleton loading={loading} borderRadius="md">
        <Image
          src={optionA}
          alt="option A"
          w="220px"
          h="220px"
          objectFit="cover"
          borderRadius="md"
          border="2px solid"
          borderColor="transparent"
          cursor={loading ? 'default' : 'pointer'}
          onClick={() => !loading && onPick('a')}
        />
      </Skeleton>
      <Skeleton loading={loading} borderRadius="md">
        <Image
          src={optionB}
          alt="option B"
          w="220px"
          h="220px"
          objectFit="cover"
          borderRadius="md"
          border="2px solid"
          borderColor="transparent"
          cursor={loading ? 'default' : 'pointer'}
          onClick={() => !loading && onPick('b')}
        />
      </Skeleton>
    </VStack>
  );
}

type Step3ResultProps = {
  loading: boolean;
  resultUrl: string;
  fixNote: string;
  onChangeFixNote: (value: string) => void;
  onComplete: () => void;
  onRefine: () => void;
};

function Step3Result({
  loading,
  resultUrl,
  fixNote,
  onChangeFixNote,
  onComplete,
  onRefine,
}: Step3ResultProps) {
  return (
    <VStack gap={6} align="center">
      <Image
        src={resultUrl}
        alt="result"
        w="260px"
        h="260px"
        objectFit="cover"
        borderRadius="md"
      />
      <HStack gap={4}>
        <Button
          variant="outline"
          borderColor="blue.400"
          color="blue.500"
          onClick={onComplete}
          loading={loading}
        >
          完成
        </Button>
        <Button
          variant="outline"
          borderColor="pink.400"
          color="pink.500"
          onClick={onRefine}
          loading={loading}
        >
          修正
        </Button>
      </HStack>
      <Field.Root>
        <Field.Label>修正項目</Field.Label>
        <Textarea
          placeholder="例: もっと目がぱっちり"
          value={fixNote}
          onChange={(e) => onChangeFixNote(e.target.value)}
          disabled={loading}
        />
      </Field.Root>
    </VStack>
  );
}
