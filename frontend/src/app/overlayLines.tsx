import {chakra} from '@chakra-ui/react';

// === 追加オーバーレイ: 数本の装飾ライン ===
const OverlayLines = () => (
    <chakra.svg
      position="absolute"
      inset={0}
      pointerEvents="none"
      viewBox="0 0 100 100"
      preserveAspectRatio="none"
      opacity={0.55}
    >
      <defs>
        <linearGradient id="gradLine" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%"  stopColor="#7c3aed" stopOpacity={0} />
          <stop offset="50%" stopColor="#7c3aed" stopOpacity={0.5} />
          <stop offset="100%" stopColor="#06b6d4" stopOpacity={0} />
        </linearGradient>
      </defs>
  
      <line x1={0}  y1={15} x2={100} y2={35} stroke="url(#gradLine)" strokeWidth={0.7} />
      <line x1={0}  y1={70} x2={100} y2={90} stroke="url(#gradLine)" strokeWidth={0.7} />
      <line x1={15} y1={0}  x2={85}  y2={100} stroke="url(#gradLine)" strokeWidth={0.7} />
    </chakra.svg>
  );

export default OverlayLines;