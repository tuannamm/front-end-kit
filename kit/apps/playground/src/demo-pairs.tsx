// Playground only: fake before/after pages for demos that have no real processed image. Not part of @dtx/ui —
// real screens pass the service's two images to CompareSlider / ScanBeam.
import type { CSSProperties, ReactNode } from 'react';

export type DemoStep = 'binarize' | 'denoise' | 'grayscale';
const RAW_COLOR = 'sepia(.45) saturate(1.3) contrast(.82) brightness(.94)';
const NOISE = `url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='180' height='180'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='.85' numOctaves='2' stitchTiles='stitch'/><feColorMatrix values='0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 1.6 -.55'/></filter><rect width='100%' height='100%' filter='url(%23n)'/></svg>")`;
const look = (filter: string, page: ReactNode, noise = false) => (
  <div style={{ position: 'relative', lineHeight: 0, filter }}>
    {page}
    {noise && <i aria-hidden style={{ position: 'absolute', inset: 0, opacity: .6, mixBlendMode: 'multiply', backgroundImage: NOISE } as CSSProperties} />}
  </div>
);

export function demoPair(step: DemoStep, page: ReactNode) {
  if (step === 'denoise') return { before: look('blur(.6px) contrast(.92)', page, true), after: look('none', page) };
  return { before: look(RAW_COLOR, page), after: look(step === 'binarize' ? 'grayscale(1) contrast(6) brightness(1.08)' : 'grayscale(1)', page) };
}
