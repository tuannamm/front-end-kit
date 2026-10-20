/**
 * # Brand
 *
 * DIGI-TEXX identity pieces from the Branding Guidelines PDF: logo, headline type, the tech backdrop and the theme switch.
 *
 * ```tsx
 * import { Logo, Display, Lede, TechBackdrop } from '@dgtx/ui-frek';
 *
 * <TechBackdrop><Logo variant="horizontal-white" /><Display>Smart <em>digitisation</em></Display><Lede>…</Lede></TechBackdrop>
 * ```
 *
 * ## Props
 *
 * ### Logo
 *
 * | Prop | Type | Default | Description |
 * |---|---|---|---|
 * | `variant` | `'horizontal' \| 'horizontal-white' \| 'square' \| 'square-on-blue'` | `'horizontal'` | Pick by background: light, dark, avatar/favicon, on brand blue. Never recoloured |
 * | `width` | `number` | `150` (square `38`) | px; never below 120 (square 38) |
 *
 * ### ThemeToggle
 *
 * No props. Cycles system → light → dark and stores the choice in the browser (`useTheme()`).
 *
 * ### TechBackdrop
 *
 * | Prop | Type | Default | Description |
 * |---|---|---|---|
 * | `children` | `ReactNode` | **required** | Content of the band; always on the dark theme |
 * | `circuit` | `boolean` | `true` | Circuit traces that draw in on load |
 * | `className` | `string` |  | Extra classes |
 *
 * ### Display
 *
 * | Prop | Type | Default | Description |
 * |---|---|---|---|
 * | `children` | `ReactNode` | **required** | Hero headline, Roboto Bold Italic uppercase; wrap accent words in `<em>` |
 * | `as` | `'h1' \| 'h2' \| 'p'` | `'h1'` | Element |
 *
 * ### Lede
 *
 * | Prop | Type | Default | Description |
 * |---|---|---|---|
 * | `children` | `ReactNode` | **required** | Intro paragraph under a Display |
 *
 * ### SectionHeader
 *
 * | Prop | Type | Default | Description |
 * |---|---|---|---|
 * | `title` | `ReactNode` | **required** | Rendered as an `<h2>` with the brand bar |
 * | `description` | `ReactNode` |  | Paragraph under the title |
 * | `id` | `string` |  | Id of the heading |
 *
 * ### Eyebrow
 *
 * | Prop | Type | Default | Description |
 * |---|---|---|---|
 * | `children` | `ReactNode` | **required** | Small tracked label |
 *
 * ### HexIcon
 *
 * | Prop | Type | Default | Description |
 * |---|---|---|---|
 * | `children` | `ReactNode` | **required** | Icon inside the hexagon; decorative |
 *
 * ## Files
 *
 * - `logo.tsx`: Logo, `mascotUrl`
 * - `type.tsx`: Display, Lede, SectionHeader, Eyebrow, HexIcon
 * - `tech-backdrop.tsx`: TechBackdrop
 * - `theme.tsx`: ThemeToggle, useTheme
 * - Logo files: `../assets/`
 *
 
 */

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
