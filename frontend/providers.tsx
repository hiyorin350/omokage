// app/Providers.tsx など
'use client';

import {
  ChakraProvider,
  createSystem,
  defaultConfig,
  defineConfig,
} from '@chakra-ui/react';

// v3 では extendTheme/ThemeConfig は廃止され、
// defineConfig + createSystem で「system」を作って、それを ChakraProvider に渡します。
const config = defineConfig({
  // v2 の styles.global に相当（全体に効くグローバルCSS）
  globalCss: {
    'html, body, #__next': {
      height: '100%',
    },
  },
});

const system = createSystem(defaultConfig, config);

export default function Providers({ children }: { children: React.ReactNode }) {
  // v3 では theme= ではなく value= に system を渡す
  return <ChakraProvider value={system}>{children}</ChakraProvider>;
}
