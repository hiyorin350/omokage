'use client';

import React from 'react';
import { Alert, Box, Container } from '@chakra-ui/react';

import Step1Form from './molecules/Step1Form';
import { useStep1Standalone } from '../hooks/useStep1Standalone';

/**
 * 単体で Step1 フォームを動かすデモ／サンプル用コンポーネント。
 * 生成結果の表示までは行わず、入力と submit 処理だけを担う。
 */
export default function Step1Standalone() {
  const { form, loading, notice, updateField, handleStart } = useStep1Standalone();

  return (
    <Box as="main" minH="100dvh" py={{ base: 8, md: 12 }}>
      <Container maxW="lg">
        {notice && (
          <Alert.Root status="info" rounded="md" mb={4}>
            {notice}
          </Alert.Root>
        )}
        <Step1Form form={form} loading={loading} onChange={updateField} onSubmit={handleStart} />
      </Container>
    </Box>
  );
}
