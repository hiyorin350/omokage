'use client';

import React from 'react';
import { Box, Field, HStack, Slider } from '@chakra-ui/react';

type Props = {
  value: number;
  disabled?: boolean;
  onChange: (val: number) => void;
};

export default function AgeSlider({ value, disabled, onChange }: Props) {
  return (
    <Field.Root>
      <Box px={2} py={2} w="full">
        <Slider.Root
          min={10}
          max={80}
          step={1}
          value={[value]}
          onValueChange={(e) => onChange(e.value[0])}
          size="md"
          colorPalette="pink"
          w="full"
          maxW="820px"
          disabled={disabled}
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
  );
}
