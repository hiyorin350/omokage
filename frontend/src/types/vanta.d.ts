// Minimal types for Vanta modules we use
// This avoids TS7016 (implicit any) when importing vanta effects.

declare module 'vanta/dist/vanta.net.min' {
  interface VantaInstance {
    destroy(): void;
  }
  const init: (options: any) => VantaInstance;
  export default init;
}

// Optional: allow other Vanta effects if you swap later
declare module 'vanta/dist/*' {
  interface VantaInstance {
    destroy(): void;
  }
  const init: (options: any) => VantaInstance;
  export default init;
}
