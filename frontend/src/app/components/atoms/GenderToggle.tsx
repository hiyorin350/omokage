'use client';

import React from 'react';
import { Button, ButtonGroup, Text } from '@chakra-ui/react';

type Props = {
  value: 'male' | 'female' | null;
  disabled?: boolean;
  onChange: (val: 'male' | 'female') => void;
};

export default function GenderToggle({ value, disabled, onChange }: Props) {
  return (
    <ButtonGroup attached variant="outline" w="full">
      <Button
        flex={1}
        borderColor={value === 'male' ? 'blue.400' : 'gray.300'}
        color={value === 'male' ? 'blue.500' : 'gray.600'}
        onClick={() => onChange('male')}
        disabled={disabled}
      >
        <Text as="span" mr={2} fontSize="lg">
          ♂
        </Text>
        男
      </Button>
      <Button
        flex={1}
        borderColor={value === 'female' ? 'pink.400' : 'gray.300'}
        color={value === 'female' ? 'pink.500' : 'gray.600'}
        onClick={() => onChange('female')}
        disabled={disabled}
      >
        <Text as="span" mr={2} fontSize="lg">
          ♀
        </Text>
        女
      </Button>
    </ButtonGroup>
  );
}
