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

export function SectionHeader({ title, description, id }: { title: ReactNode; description?: ReactNode; id?: string }) {
  return (
    <div className="dtx-section-head">
      <div className="dtx-section-head__bar" aria-hidden />
      <h2 id={id}>{title}</h2>
      {description && <p>{description}</p>}
    </div>
  );
}

export function Eyebrow({ children }: { children: ReactNode }) {
  return <span className="dtx-eyebrow">{children}</span>;
}

/** Hexagon icon container (brand motif). */
export function HexIcon({ children }: { children: ReactNode }) {
  return <div className="dtx-hex" aria-hidden>{children}</div>;
}

/** Hero headline: Roboto Bold Italic uppercase. Wrap the accent words in <em> for the sky gradient. */
export function Display({ children, as: Tag = 'h1' }: { children: ReactNode; as?: 'h1' | 'h2' | 'p' }) {
  return <Tag className="dtx-display">{children}</Tag>;
}
export function Lede({ children }: { children: ReactNode }) {
  return <p className="dtx-lede">{children}</p>;
}
