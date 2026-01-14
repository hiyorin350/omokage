'use client';

import React from 'react';
import { Field, Textarea } from '@chakra-ui/react';

type Props = {
  label: string;
  value: string;
  placeholder?: string;
  disabled?: boolean;
  onChange: (val: string) => void;
};

export default function LabeledTextarea({ label, value, placeholder, disabled, onChange }: Props) {
  return (
    <Field.Root>
      <Field.Label>{label}</Field.Label>
      <Textarea
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
      />
    </Field.Root>
  );
}
