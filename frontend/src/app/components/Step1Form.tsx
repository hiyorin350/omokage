'use client';

import React from 'react';
import {
  Box,
  Button,
  ButtonGroup,
  Card,
  Field,
  HStack,
  Slider,
  Stack,
  Text,
  Textarea,
} from '@chakra-ui/react';

import { FormState, UpdateField } from '../types';

export type Step1FormProps = {
  form: FormState;
  loading: boolean;
  onChange: UpdateField;
  onSubmit: (e?: React.FormEvent) => void;
};

export default function Step1Form({ form, loading, onChange, onSubmit }: Step1FormProps) {
  return (
    <Card.Root>
      <Card.Body>
        <Stack gap={6} as="form" onSubmit={onSubmit}>
          <ButtonGroup attached variant="outline" w="full">
            <Button
              flex={1}
              borderColor={form.gender === 'male' ? 'blue.400' : 'gray.300'}
              color={form.gender === 'male' ? 'blue.500' : 'gray.600'}
              onClick={() => onChange('gender', 'male')}
              disabled={loading}
            >
              <Text as="span" mr={2} fontSize="lg">♂</Text>
              男
            </Button>
            <Button
              flex={1}
              borderColor={form.gender === 'female' ? 'pink.400' : 'gray.300'}
              color={form.gender === 'female' ? 'pink.500' : 'gray.600'}
              onClick={() => onChange('gender', 'female')}
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
              value={form.hair}
              onChange={(e) => onChange('hair', e.target.value)}
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
                value={[form.age]}
                onValueChange={(e) => onChange('age', e.value[0])}
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
              value={form.similarTo}
              onChange={(e) => onChange('similarTo', e.target.value)}
              disabled={loading}
            />
          </Field.Root>

          <Field.Root>
            <Field.Label>特徴</Field.Label>
            <Textarea
              placeholder="例: 二重、鼻が高い…"
              value={form.features}
              onChange={(e) => onChange('features', e.target.value)}
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
  );
}
