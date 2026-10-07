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
