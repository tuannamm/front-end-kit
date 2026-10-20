/**
 * # Icon
 *
 * Puts a lucide-react icon on the kit's size scale and tones.
 *
 * ```tsx
 * import { Icon } from '@dgtx/ui-frek';
 * import { Upload, CircleAlert } from 'lucide-react';
 *
 * <Icon icon={Upload} />                                     // decorative, 16px, text colour
 * <Icon icon={CircleAlert} tone="err" label="Error" />      // stands alone: give it a name
 * ```
 *
 * Sizes: `xs 12 · sm 14 · md 16 · lg 20 · xl 24` px. Tones: any `Tone` from `badge/`, or `muted`.
 *
 * ## Notes
 *
 * - Decorative by default: the icon is hidden from assistive tech. Give it a `label` only when no text next to it
 *   says what it means. Add a Tooltip with the same words for sighted users.
 * - Inside Button, Badge and other kit parts, the part sets the size. A bare lucide icon works there too.
 * - `vertical-align: -.125em` keeps an inline icon on the x-height. Tailwind preflight would otherwise make it a block.
 *
 * ## Props
 *
 * ### Icon
 *
 * | Prop | Type | Default | Description |
 * |---|---|---|---|
 * | `icon` | `LucideIcon` | **required** | A lucide-react icon, e.g. `Upload` |
 * | `size` | `'xs' \| 'sm' \| 'md' \| 'lg' \| 'xl'` | `'md'` | 12 · 14 · 16 · 20 · 24px |
 * | `tone` | `Tone \| 'muted'` |  | Default: the colour of the surrounding text |
 * | `label` | `string` |  | Accessible name. Without it the icon is decorative |
 * | `className` | `string` |  | Extra classes |
 *
 * ## Files
 *
 * - `icon.tsx`: component
 * - `icon.css`: `.dtx-icon*`
 *
 * Catalog: `#/catalog/icon`
 *
 
 */

import type { LucideIcon } from 'lucide-react';
import { cx } from '../../cx';
import type { Tone } from '../badge/badge';

const px = { xs: 12, sm: 14, md: 16, lg: 20, xl: 24 } as const;

export type IconProps = {
  /** A lucide-react icon, e.g. <Icon icon={Upload} />. Browse them at lucide.dev/icons. */
  icon: LucideIcon;
  /** xs 12 · sm 14 · md 16 · lg 20 · xl 24px; default md. Inside Button, Badge and other kit parts, the part sets the size. */
  size?: keyof typeof px;
  /** Default: the colour of the surrounding text. */
  tone?: Tone | 'muted';
  /** What the icon means, when no text next to it says so (a lone status icon). Without it the icon is hidden from assistive tech. */
  label?: string;
  className?: string;
};

/** One icon on the kit's size scale and tones; decorative unless it gets a label. */
export function Icon({ icon: Svg, size = 'md', tone, label, className }: IconProps) {
  return <Svg size={px[size]} className={cx('dtx-icon', tone && (tone === 'muted' ? 'dtx-icon--muted' : `dtx-tone-${tone}`), className)}
    {...(label && { role: 'img', 'aria-label': label })} />;
}
