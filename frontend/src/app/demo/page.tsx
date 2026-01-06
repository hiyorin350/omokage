'use client';

import React from 'react';
import {
  Alert,
  Box,
  Card,
  Container,
  Grid,
  GridItem,
  Heading,
  List,
  ListItem,
  Stack,
  Text,
  VStack,
  Separator,
} from '@chakra-ui/react';

const SAMPLE_A = '/images/sample_a.PNG';
const SAMPLE_B = '/images/sample_b.PNG';
const SAMPLE_RESULT = '/images/result.PNG';

type StepCardProps = {
  title: string;
  body: string;
  note?: string;
  image?: string;
};

function StepCard({ title, body, note, image }: StepCardProps) {
  return (
    <Card.Root>
      <Card.Body>
        <Stack gap={3}>
          <Heading size="sm">{title}</Heading>
          <Text color="gray.700">{body}</Text>
          {note && (
            <Alert.Root status="info" rounded="md">
              {note}
            </Alert.Root>
          )}
          {image && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={image}
              alt={title}
              style={{
                width: '100%',
                maxWidth: 260,
                borderRadius: 8,
                border: '1px solid #e2e8f0',
              }}
            />
          )}
        </Stack>
      </Card.Body>
    </Card.Root>
  );
}

export default function DemoPage() {
  return (
    <Box as="main" minH="100dvh" py={{ base: 10, md: 14 }}>
      <Container maxW="5xl">
        <VStack align="start" spacing={3} mb={8}>
          <Heading size="lg">デモ／使い方ガイド</Heading>
          <Text color="gray.600">
            実際の画像生成 API を呼ばずに、フローと操作方法だけを紹介する説明ページです。
            画面構成やステップの流れを把握するためにお使いください。
          </Text>
        </VStack>

        <Grid templateColumns={{ base: '1fr', md: '2fr 1fr' }} gap={6}>
          <GridItem>
            <Stack gap={6}>
              <StepCard
                title="Step 1: 条件入力"
                body="性別・髪型・年齢・似ている芸能人・特徴を入力して Start を押します。入力内容がそのままプロンプトに使われます。"
                note="未入力でも進めますが、具体的に書くほど狙ったイメージに近づきます。"
              />
              <StepCard
                title="Step 2: 2択で選ぶ"
                body="生成された2枚から好みの方を選びます。選んだ画像が次のステップに渡されます。"
                image={SAMPLE_A}
                note="APIエラー時はサンプル画像で進行します。"
              />
              <StepCard
                title="Step 3: 確認＆修正"
                body="選んだ画像を確認し、必要なら修正指示をテキストで入力。『修正』を押すと修正案を2枚提示します。"
                image={SAMPLE_RESULT}
              />
              <StepCard
                title="Step 4: 修正案の再選択"
                body="提示された2枚の修正案から1枚選び、最終的な画像として確定します。"
                image={SAMPLE_B}
              />
            </Stack>
          </GridItem>

          <GridItem>
            <Card.Root h="full">
              <Card.Body>
                <Stack gap={4}>
                  <Heading size="sm">Tips</Heading>
                  <List spacing={3} color="gray.700">
                    <ListItem>短くてもよいので特徴は3つ以上書くと安定しやすいです。</ListItem>
                    <ListItem>「似ている芸能人」は雰囲気として扱われ、完全一致はしません。</ListItem>
                    <ListItem>修正指示は「目を大きく」「髪をもう少し短く」のように単一項目で書くと反映されやすいです。</ListItem>
                    <ListItem>API上限に達している場合はサンプル画像で進行し、通知にエラー内容が表示されます。</ListItem>
                  </List>
                  <Separator />
                  <Heading size="sm">デモの目的</Heading>
                  <Text color="gray.700">
                    このページでは UI の流れを確認するだけで、実際の画像生成は行いません。社内レビューやユーザートレーニング時の説明資料としてご利用ください。
                  </Text>
                </Stack>
              </Card.Body>
            </Card.Root>
          </GridItem>
        </Grid>
      </Container>
    </Box>
  );
}
