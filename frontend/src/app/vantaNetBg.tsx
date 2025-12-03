'use client';

import React, { useEffect, useRef } from 'react';
import { Box } from '@chakra-ui/react';

// === 背景: Vanta.js NET（WebGL） ===
const VantaNetBg = () => {
    const ref = useRef<HTMLDivElement | null>(null);
    const effectRef = useRef<any>(null);
  
    useEffect(() => {
      let mounted = true;
      (async () => {
        if (!ref.current || effectRef.current) return;
        const THREE = await import('three');
        const NET = (await import('vanta/dist/vanta.net.min')).default;
        if (!mounted) return;
        effectRef.current = NET({
          el: ref.current,
          THREE,
          backgroundAlpha: 0.0,
          color: 0x7c3aed,
          points: 12.0,
          maxDistance: 20.0,
          spacing: 18.0,
          mouseControls: false,
          touchControls: false,
          gyroControls: false,
          scale: 1.0,
          scaleMobile: 1.0,
        });
      })();
      return () => {
        mounted = false;
        if (effectRef.current) {
          try { effectRef.current.destroy(); } catch {}
          effectRef.current = null;
        }
      };
    }, []);
  
    return <Box ref={ref} position="absolute" inset={0} pointerEvents="none" />;
  };

export default VantaNetBg;