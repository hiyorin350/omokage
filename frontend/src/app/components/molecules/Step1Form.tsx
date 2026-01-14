'use client';

import React from 'react';
import { Button, Card, HStack, Stack } from '@chakra-ui/react';
import { FormState, UpdateField } from '../../types';
import GenderToggle from '../atoms/GenderToggle';
import LabeledTextarea from '../atoms/LabeledTextarea';
import AgeSlider from '../atoms/AgeSlider';

type Props = {
  form: FormState;
  loading: boolean;
  onChange: UpdateField;
  onSubmit: (e?: React.FormEvent) => void;
};

export default function Step1Form({ form, loading, onChange, onSubmit }: Props) {
  return (
    <Card.Root>
      <Card.Body>
        <Stack gap={6} as="form" onSubmit={onSubmit}>
          <GenderToggle value={form.gender} disabled={loading} onChange={(v) => onChange('gender', v)} />

          <LabeledTextarea
            label="髪型"
            value={form.hair}
            onChange={(v) => onChange('hair', v)}
            placeholder="例: ショートカット、ボブ、肩までのロング、黒髪、茶髪…"
            disabled={loading}
          />

          <AgeSlider value={form.age} onChange={(v) => onChange('age', v)} disabled={loading} />

          <LabeledTextarea
            label="似ている芸能人"
            value={form.similarTo}
            onChange={(v) => onChange('similarTo', v)}
            placeholder="例: 〜〜（※実在の人物名は“雰囲気”として扱われます）"
            disabled={loading}
          />

          <LabeledTextarea
            label="特徴"
            value={form.features}
            onChange={(v) => onChange('features', v)}
            placeholder="例: 二重、鼻が高い…"
            disabled={loading}
          />

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
  );
}
