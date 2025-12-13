'use client';

import React, { useMemo, useState } from 'react';
import {
    Box,
    Stack,
    Text,
    Button,
    ButtonGroup,
    HStack,
    Textarea,
    Field,
    Slider,
    Card
  } from '@chakra-ui/react';

import postJson from './postJson';
  type Step = 1 | 2 | 3;

const step1 = () => {
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

  const payload = useMemo(
    () => ({ gender, hair, age, similarTo, features }),
    [gender, hair, age, similarTo, features]
  );


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
return (
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

export default step1