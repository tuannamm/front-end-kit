import type { ComponentProps, ReactNode } from 'react';
import { cx } from '../../cx';
import { mascotUrl } from '../../brand/logo';
import { toneIcon } from '../badge/badge';

export type EmptyStateProps = Omit<ComponentProps<'div'>, 'title'> & {
  /** What the user is looking at, e.g. "Chưa có lô nào", "Không tìm thấy “HD-99”". */
  title: ReactNode;
  /** What to do next. */
  children?: ReactNode;
  /** Lucide icon above the title. 'err' defaults to the error icon. */
  icon?: ReactNode;
  /** The DIGI-TEXX robot instead of the icon: first use, onboarding and 404 only (brand). */
  mascot?: boolean;
  /** One way forward: a primary button, or a secondary one plus a link. */
  action?: ReactNode;
  /** 'err' = loading failed: red icon, announced at once. */
  tone?: 'neutral' | 'err';
  /** sm for panels, popovers and tables; md for a page or a card section. */
  size?: 'sm' | 'md';
  className?: string;
};

/**
 * What a list, table or page shows when it has nothing to show: first use, no results, filtered to nothing,
 * no permission or a failed load. Says what happened and offers one way forward.
 */
export function EmptyState({ title, children, icon, mascot, action, tone = 'neutral', size = 'md', className, ...rest }: EmptyStateProps) {
  const art = icon ?? (tone === 'err' ? toneIcon.err : null);
  const px = size === 'sm' ? 64 : 120;
  return (
    <div role={tone === 'err' ? 'alert' : 'status'} className={cx('dtx-empty', `dtx-empty--${size}`, tone === 'err' && 'dtx-empty--err', className)} {...rest}>
      {mascot
        ? <img className="dtx-empty__mascot" src={mascotUrl} alt="" width={px} height={Math.round(px * 440 / 405)} />
        : art && <span className="dtx-empty__icon" aria-hidden>{art}</span>}
      <p className="dtx-empty__title">{title}</p>
      {children && <div className="dtx-empty__desc">{children}</div>}
      {action && <div className="dtx-empty__actions">{action}</div>}
    </div>
  );
}
