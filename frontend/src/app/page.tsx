'use client';

import React, { useMemo, useState, useRef } from 'react';
import {
  Box,
  Container,
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

import VantaNetBg from './vantaNetBg';
import OverlayLines from './overlayLines';
import postJson from './postJson';

export default function Page() {
  type Step = 1 | 2 | 3;

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

  // リクエスト多重送信防止＆タイムアウト
  const inflight = useRef<AbortController | null>(null);
  function newSignal(ms = 120000) {
    if (inflight.current) inflight.current.abort();
    const ac = new AbortController();
    inflight.current = ac;
    if (ms > 0) {
      const t = setTimeout(() => ac.abort(), ms);
      // リクエスト完了でクリア
      const _abort = ac.abort.bind(ac);
      ac.abort = () => { clearTimeout(t); _abort(); };
    }
    return ac.signal;
  }

  // --- ①→②: 画像生成（2枚）---
  async function handleStart(e?: React.FormEvent) {
    e?.preventDefault();
    if (loading) return;
    setLoading(true);
    setNotice(null);
    try {
      type GenerateResponse = { options: [string, string] };
      const data = await postJson<GenerateResponse>(`/api/generate`, payload);
      const [a, b] = data.options ?? [];
      setOptionA(a ?? '/images/sample_a.PNG');
      setOptionB(b ?? '/images/sample_b.PNG');
      setStep(2);
    } catch (err: any) {
      setOptionA('/images/sample_a.PNG');
      setOptionB('/images/sample_b.PNG');
      setStep(2);
      setNotice(`デモ表示: APIエラーによりサンプルで進行します（${err?.message ?? 'unknown error'}）`);
    } finally {
      setLoading(false);
    }
  }

  // --- ②→③: どちらか選択 ---
  function handlePick(which: 'a' | 'b') {
    if (loading) return;
    const url = which === 'a' ? optionA : optionB;
    if (!url) return;
    setResultUrl(url);
    setStep(3);
  }

  // --- ②→① / ③→②: 戻る ---
  function handleBack() {
    if (loading) return;
    if (step === 3) {
      setResultUrl(null);
      setStep(2);
      return;
    }
    if (step === 2) setStep(1);
  }

  // --- ③ 修正 ---
  async function handleRefine() {
    if (!resultUrl || loading) return;
    setLoading(true);
    setNotice(null);
    try {
      type RefineResponse = { url: string };
      const data = await postJson<RefineResponse>(`/api/refine`, {
        selected: resultUrl,
        note: fixNote,
        context: payload,
      }, newSignal(120000));
      setResultUrl(data.url || resultUrl);
      setNotice('修正完了: 画像を更新しました。');
    } catch (err: any) {
      setNotice(`修正に失敗しました: ${err?.message ?? 'unknown error'}`);
    } finally {
      setLoading(false);
    }
  }

  // --- ③ 完了 ---
  async function handleComplete() {
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

        {/* ← 戻るボタン */}
        {step > 1 && (
          <Button variant="ghost" size="sm" onClick={handleBack} disabled={loading} mb={4}>
            ← 戻る
          </Button>
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
                    disabled={loading}
                  >
                    <Text as="span" mr={2} fontSize="lg">♂</Text>
                    男
                  </Button>
                  <Button
                    flex={1}
                    borderColor={gender === 'female' ? 'pink.400' : 'gray.300'}
                    color={gender === 'female' ? 'pink.500' : 'gray.600'}
                    onClick={() => setGender('female')}
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
                    value={hair}
                    onChange={(e) => setHair(e.target.value)}
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
                      value={[age]}
                      onValueChange={(e) => setAge(e.value[0])}
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
                    value={similarTo}
                    onChange={(e) => setSimilarTo(e.target.value)}
                    disabled={loading}
                  />
                </Field.Root>

                <Field.Root>
                  <Field.Label>特徴</Field.Label>
                  <Textarea
                    placeholder="例: 二重、鼻が高い…"
                    value={features}
                    onChange={(e) => setFeatures(e.target.value)}
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
              <Button
                variant="outline"
                borderColor="blue.400"
                color="blue.500"
                onClick={handleComplete}
                loading={loading}
              >
                完成
              </Button>
              <Button
                variant="outline"
                borderColor="pink.400"
                color="pink.500"
                onClick={handleRefine}
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
                onChange={(e) => setFixNote(e.target.value)}
                disabled={loading}
              />
            </Field.Root>
          </VStack>
        )}
      </Container>
    </Box>
  );
}
