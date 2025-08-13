'use client';

import {
  ChakraProvider,
  createSystem,
  defaultConfig,
  defineConfig,
} from '@chakra-ui/react';

// v3のやり方：tokens と globalCss を config にまとめる
const customConfig = defineConfig({
  theme: {
    tokens: {
      fonts: {
        heading: { value: 'var(--font-geist-sans)' },
        body:   { value: 'var(--font-geist-sans)' },
        mono:   { value: 'var(--font-geist-mono)' },
      },
    },
  },
  // v3のグローバルCSSの書き方（placeholder を薄く）
  globalCss: {
    '*::placeholder': { opacity: 1, color: 'fg.subtle' },
  },
});

// system を作って Provider に渡す
const system = createSystem(defaultConfig, customConfig);

export default function ChakraProviders({ children }: { children: React.ReactNode }) {
  return <ChakraProvider value={system}>{children}</ChakraProvider>;
}
