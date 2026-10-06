import { cx } from '../cx';

export function Avatar({ name, src, size = 'md' }: { name: string; src?: string; size?: 'sm' | 'md' }) {
  const w = name.trim().split(/\s+/);
  const initials = (w[0][0] + (w.length > 1 ? w[w.length - 1][0] : '')).toUpperCase();
  return <span className={cx('dtx-avatar', size === 'sm' && 'dtx-avatar--sm')} title={name} aria-label={name} role="img">{src ? <img src={src} alt="" /> : initials}</span>;
}
