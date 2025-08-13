'use client';

import React, { useMemo, useState, useEffect, useRef } from 'react';
import {
  Box,
  Container,
  chakra,
  Stack,
  Heading,
  Text,
  Button,
  ButtonGroup,
  HStack,
  VStack,
  Textarea,
  Field,
  Slider,
  Image,
  Card,
  Skeleton,
  Alert,
} from '@chakra-ui/react';

// === 背景: Vanta.js NET（WebGL） ===
const VantaNetBg = () => {
  const ref = useRef<HTMLDivElement | null>(null);
  const effectRef = useRef<any>(null);

  useEffect(() => {
    let mounted = true;
    (async () => {
      if (!ref.current || effectRef.current) return;
      const THREE = await import('three');
      const NET = (await import('vanta/dist/vanta.net.min')).default;
      if (!mounted) return;
      effectRef.current = NET({
        el: ref.current,
        THREE,
        backgroundAlpha: 0.0, // Chakra側の背景を活かす
        color: 0x7c3aed,      // ネットの色（violet系）
        points: 12.0,
        maxDistance: 20.0,
        spacing: 18.0,
        mouseControls: false,
        touchControls: false,
        gyroControls: false,
        scale: 1.0,
        scaleMobile: 1.0,
      });
    })();
    return () => {
      mounted = false;
      if (effectRef.current) {
        effectRef.current.destroy();
        effectRef.current = null;
      }
    };
  }, []);

  return (
    <Box ref={ref} position="absolute" inset={0} pointerEvents="none" />
  );
};

// === 追加オーバーレイ: 数本の装飾ライン ===
const OverlayLines = () => (
  <chakra.svg
    position="absolute"
    inset={0}
    pointerEvents="none"
    viewBox="0 0 100 100"
    preserveAspectRatio="none"
    opacity={0.55}
  >
    <defs>
      <linearGradient id="gradLine" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%"  stopColor="#7c3aed" stopOpacity={0} />
        <stop offset="50%" stopColor="#7c3aed" stopOpacity={0.5} />
        <stop offset="100%" stopColor="#06b6d4" stopOpacity={0} />
      </linearGradient>
    </defs>

    <line x1={0}  y1={15} x2={100} y2={35} stroke="url(#gradLine)" strokeWidth={0.7} />
    <line x1={0}  y1={70} x2={100} y2={90} stroke="url(#gradLine)" strokeWidth={0.7} />
    <line x1={15} y1={0}  x2={85}  y2={100} stroke="url(#gradLine)" strokeWidth={0.7} />
  </chakra.svg>
);

// 3つの画面構成に対応：
// ① 入力 → ② 似ている方を選択 → ③ 選んだ画像の修正
// APIは /api/generate, /api/refine, /api/complete を想定（未実装ならサンプル画像でフォールバック）

export default function Page() {
  type Step = 1 | 2 | 3;
  // v3: useToast は廃止。簡易通知は Alert + state で代替。

  // --- UI/状態 ---
  const [step, setStep] = useState<Step>(1);
  const [loading, setLoading] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);

  // ① 入力値
  const [gender, setGender] = useState<'male' | 'female' | null>(null);
  const [hair, setHair] = useState('');
  const [age, setAge] = useState(22);
  const [similarTo, setSimilarTo] = useState('');
  const [features, setFeatures] = useState('');

  // ② 候補画像
  const [optionA, setOptionA] = useState<string | null>(null);
  const [optionB, setOptionB] = useState<string | null>(null);

  // ③ 最終画像 & 修正
  const [resultUrl, setResultUrl] = useState<string | null>(null);
  const [fixNote, setFixNote] = useState('');

  const payload = useMemo(
    () => ({ gender, hair, age, similarTo, features }),
    [gender, hair, age, similarTo, features]
  );

  // --- API helper（失敗時は投げる）---
  async function postJSON<T>(url: string, body: unknown): Promise<T> {
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    if (!res.ok) {
      const msg = await res.text();
      throw new Error(msg || res.statusText);
    }
    return res.json();
  }

  // --- ①→②: 画像生成（2枚）---
  async function handleStart(e?: React.FormEvent) {
    e?.preventDefault();
    setLoading(true);
    try {
      type GenerateResponse = { options: [string, string] };
      const data = await postJSON<GenerateResponse>('/api/generate', payload);
      const [a, b] = data.options ?? [];
      setOptionA(a ?? '/images/sample_a.PNG');
      setOptionB(b ?? '/images/sample_b.PNG');
      setStep(2);
    } catch (err) {
      // API未実装などのときはダミーで進行
      setOptionA('/images/sample_a.PNG');
      setOptionB('/images/sample_b.PNG');
      setStep(2);
      setNotice('デモモードで表示中: APIが未実装のためサンプル画像を表示しています。');
    } finally {
      setLoading(false);
    }
  }

  // --- ②→③: どちらか選択 ---
  function handlePick(which: 'a' | 'b') {
    const url = which === 'a' ? optionA : optionB;
    if (!url) return;
    setResultUrl(url);
    setStep(3);
  }

  // --- ③ 修正 ---
  async function handleRefine() {
    if (!resultUrl) return;
    setLoading(true);
    try {
      type RefineResponse = { url: string };
      const data = await postJSON<RefineResponse>('/api/refine', {
        selected: resultUrl,
        note: fixNote,
        context: payload,
      });
      setResultUrl(data.url || resultUrl);
      setNotice('修正完了: 画像を更新しました。');
    } catch (err) {
      setNotice('修正に失敗しました');
    } finally {
      setLoading(false);
    }
  }

  // --- ③ 完了 ---
  async function handleComplete() {
    if (!resultUrl) return;
    setLoading(true);
    try {
      await postJSON('/api/complete', { imageUrl: resultUrl, meta: payload });
      setNotice('保存しました');
    } catch (err) {
      setNotice('保存に失敗しました');
    } finally {
      setLoading(false);
    }
  }

  return (
    <Box as="main" minH="100dvh" position="relative" overflow="hidden" py={{ base: 8, md: 12 }}>
      {/* 背景（最背面） */}
      <VantaNetBg />
      <OverlayLines />

      <Container maxW="lg" position="relative" zIndex={1}>
        {notice && (
          <Alert.Root status="info" rounded="md" mb={4}>
            {notice}
          </Alert.Root>
        )}
        {/* ① 入力 */}
        {step === 1 && (
          <Card.Root>
            <Card.Body>
              <Stack gap={6} as="form" onSubmit={handleStart}>
                {/* 性別トグル */}
                <ButtonGroup attached variant="outline" w="full">
                  <Button
                    flex={1}
                    borderColor={gender === 'male' ? 'blue.400' : 'gray.300'}
                    color={gender === 'male' ? 'blue.500' : 'gray.600'}
                    onClick={() => setGender('male')}
                  >
                    <Text as="span" mr={2} fontSize="lg">♂</Text>
                    男
                  </Button>
                  <Button
                    flex={1}
                    borderColor={gender === 'female' ? 'pink.400' : 'gray.300'}
                    color={gender === 'female' ? 'pink.500' : 'gray.600'}
                    onClick={() => setGender('female')}
                  >
                    <Text as="span" mr={2} fontSize="lg">♀</Text>
                    女
                  </Button>
                </ButtonGroup>

                <Field.Root>
                  <Field.Label>髪型</Field.Label>
                  <Textarea
                    placeholder="例: ショートカット、ボブ、肩までのロング、黒髪、茶髪…"
                    value={hair}
                    onChange={(e) => setHair(e.target.value)}
                  />
                </Field.Root>

                <Field.Root>
                  <Field.Label>年齢</Field.Label>
                  <Box px={2} py={2} w="full">
                    <Slider.Root
                      min={10}
                      max={80}
                      step={1}
                      value={[age]}
                      onValueChange={(e) => setAge(e.value[0])}
                      size="md"
                      colorPalette="pink"
                      w="full"
                      maxW="820px"
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
                    placeholder="例: 〜〜"
                    value={similarTo}
                    onChange={(e) => setSimilarTo(e.target.value)}
                  />
                </Field.Root>

                <Field.Root>
                  <Field.Label>特徴</Field.Label>
                  <Textarea
                    placeholder="例: 二重、鼻が高い…"
                    value={features}
                    onChange={(e) => setFeatures(e.target.value)}
                  />
                </Field.Root>

                <HStack justify="center">
                  <Button type="submit" colorPalette="pink" px={8} borderRadius="xl" loading={loading} loadingText="生成中…">
                    Start!!
                  </Button>
                </HStack>
              </Stack>
            </Card.Body>
          </Card.Root>
        )}

        {/* ② 2択比較 */}
        {step === 2 && (
          <VStack gap={8} align="center">
            <Heading size="md" mt={2} fontWeight="medium">
              似ているのはどっち？
            </Heading>
            <Skeleton loading={loading} borderRadius="md">
              <Image
                src={optionA ?? '/images/sample_a.PNG'}
                alt="option A"
                w="220px"
                h="220px"
                objectFit="cover"
                borderRadius="md"
                border="2px solid"
                borderColor="transparent"
                cursor={loading ? 'default' : 'pointer'}
                onClick={() => !loading && handlePick('a')}
              />
            </Skeleton>
            <Skeleton loading={loading} borderRadius="md">
              <Image
                src={optionB ?? '/images/sample_b.PNG'}
                alt="option B"
                w="220px"
                h="220px"
                objectFit="cover"
                borderRadius="md"
                border="2px solid"
                borderColor="transparent"
                cursor={loading ? 'default' : 'pointer'}
                onClick={() => !loading && handlePick('b')}
              />
            </Skeleton>
          </VStack>
        )}

        {/* ③ 完了/修正 */}
        {step === 3 && (
          <VStack gap={6} align="center">
            <Image
              src={resultUrl ?? '/images/result.PNG'}
              alt="result"
              w="260px"
              h="260px"
              objectFit="cover"
              borderRadius="md"
            />
            <HStack gap={4}>
              <Button variant="outline" borderColor="blue.400" color="blue.500" onClick={handleComplete} loading={loading}>
                完成
              </Button>
              <Button variant="outline" borderColor="pink.400" color="pink.500" onClick={handleRefine} loading={loading}>
                修正
              </Button>
            </HStack>
            <Field.Root>
              <Field.Label>修正項目</Field.Label>
              <Textarea
                placeholder="例: もっと目がぱっちり"
                value={fixNote}
                onChange={(e) => setFixNote(e.target.value)}
              />
            </Field.Root>
          </VStack>
        )}
      </Container>
    </Box>
  );
}
