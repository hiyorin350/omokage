'use client';

import React from 'react';
import { Button, Field, HStack, Image, Textarea, VStack } from '@chakra-ui/react';

export type Step3ResultProps = {
  loading: boolean;
  resultUrl: string;
  fixNote: string;
  onChangeFixNote: (value: string) => void;
  onComplete: () => void;
  onRefine: () => void;
};

export default function Step3Result({
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
