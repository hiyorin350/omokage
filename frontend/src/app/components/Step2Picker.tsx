'use client';

import React from 'react';
import { Heading, Image, Skeleton, VStack } from '@chakra-ui/react';

export type Step2PickerProps = {
  loading: boolean;
  optionA: string;
  optionB: string;
  onPick: (which: 'a' | 'b') => void;
  title?: string;
};

export default function Step2Picker({ loading, optionA, optionB, onPick, title }: Step2PickerProps) {
  return (
    <VStack gap={8} align="center">
      <Heading size="md" mt={2} fontWeight="medium">
        {title ?? '似ているのはどっち？'}
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
