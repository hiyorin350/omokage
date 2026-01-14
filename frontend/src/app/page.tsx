'use client';

import React from 'react';
import { Alert, Box, Button, Container } from '@chakra-ui/react';

import OverlayLines from './overlayLines';
import VantaNetBg from './vantaNetBg';
import Step2Picker from './components/Step2Picker';
import Step3Result from './components/Step3Result';
import Step1Form from './components/molecules/Step1Form';
import { useImageFlow } from './hooks/useImageFlow';

export default function Page() {
  const {
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
  } = useImageFlow();

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
            title="似ているのはどっち？"
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

        {step === 4 && (
          <Step2Picker
            loading={loading}
            optionA={refineA ?? resultUrl ?? DEFAULT_RESULT}
            optionB={refineB ?? resultUrl ?? DEFAULT_RESULT}
            title="修正案を選んでください"
            onPick={handlePickRefine}
          />
        )}
      </Container>
    </Box>
  );
}
