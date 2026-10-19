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
 * @generated from README.md in this folder. Edit the README, then run `npm run docs:sync`.
 */

import type { ReactNode } from 'react';

/** Always-dark brand band: fading grid, blue glow, circuit traces that draw in on load. */
export function TechBackdrop({ children, circuit = true, className }: { children: ReactNode; circuit?: boolean; className?: string }) {
  return (
    <section className={['dtx-backdrop-tech', className].filter(Boolean).join(' ')} data-theme="dark">
      <div className="dtx-backdrop-tech__grid" aria-hidden />
      <div className="dtx-backdrop-tech__glow" aria-hidden />
      {circuit && (
        <svg className="dtx-backdrop-tech__circuit" viewBox="0 0 1200 640" preserveAspectRatio="xMidYMid slice" aria-hidden>
          <path d="M1200 90H980l-40 40H760" /><rect x="756" y="126" width="8" height="8" />
          <path d="M1200 170H1040l-30 30H900l-20 20H700" /><rect x="696" y="216" width="8" height="8" />
          <path d="M1200 520H1010l-50-50H820" /><rect x="816" y="466" width="8" height="8" />
          <path d="M1200 590H900l-30-30H640" /><rect x="636" y="556" width="8" height="8" />
          <path d="M0 600H160l40-40h120" /><rect x="316" y="556" width="8" height="8" />
        </svg>
      )}
      {children}
    </section>
  );
}
