const LOGOS = {
  horizontal: new URL('../assets/logo-horizontal.svg', import.meta.url).href,
  'horizontal-white': new URL('../assets/logo-horizontal-white.svg', import.meta.url).href,
  square: new URL('../assets/logo-square.svg', import.meta.url).href,
  'square-on-blue': new URL('../assets/logo-square-on-blue.svg', import.meta.url).href,
} as const;
export const mascotUrl = new URL('../assets/mascot-robot.png', import.meta.url).href;

/**
 * Official logo files, never recoloured (brand rule). Pick the variant for the background:
 * horizontal = light, horizontal-white = dark/navy, square = avatar/favicon, square-on-blue = on #2582D7.
 * Minimum: 10 mm print (PDF p.6); kit floor 120px horizontal / 38px square on screen.
 */
export function Logo({ variant = 'horizontal', width }: { variant?: keyof typeof LOGOS; width?: number }) {
  const square = variant.startsWith('square');
  const w = Math.max(width ?? (square ? 38 : 150), square ? 38 : 120);
  return <img src={LOGOS[variant]} alt="DIGI-TEXX" width={w} height={square ? w : undefined} style={{ display: 'block', height: square ? w : 'auto' }} />;
}
