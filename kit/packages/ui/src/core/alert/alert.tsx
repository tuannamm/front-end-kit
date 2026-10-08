import type { ComponentProps, ReactNode } from 'react';
import { X } from 'lucide-react';
import { cx } from '../../cx';
import { toneIcon, type StatusTone } from '../badge/badge';
import { Button } from '../button/button';

export type AlertProps = Omit<ComponentProps<'div'>, 'title'> & {
  tone?: StatusTone;
  /** What happened, in a few words. */
  title?: ReactNode;
  /** Why, and what to do next. */
  children?: ReactNode;
  /** Replaces the tone's icon; `false` hides it. */
  icon?: ReactNode | false;
  /** Buttons under the text, e.g. "Lưu lại". */
  action?: ReactNode;
  /** Shows a close button. Hiding the alert is the app's job. */
  onClose?: () => void;
  closeLabel?: string;
};

/**
 * Message that stays in the page until its cause is gone: a form that failed as a whole, a locked batch, maintenance.
 * Field errors belong to Field; something that happened a moment ago belongs to a toast.
 */
export function Alert({ tone = 'brand', title, children, icon, action, onClose, closeLabel = 'Đóng', className, ...rest }: AlertProps) {
  return (
    // an error interrupts the screen reader; the other tones wait their turn
    <div role={tone === 'err' ? 'alert' : 'status'} className={cx('dtx-alert', `dtx-tone-${tone}`, className)} {...rest}>
      {icon !== false && <span className="dtx-alert__icon" aria-hidden>{icon ?? toneIcon[tone]}</span>}
      <div className="dtx-alert__body">
        {title && <p className="dtx-alert__title">{title}</p>}
        {children && <div className="dtx-alert__desc">{children}</div>}
        {action && <div className="dtx-alert__actions">{action}</div>}
      </div>
      {onClose && <Button variant="ghost" size="sm" icon aria-label={closeLabel} className="dtx-alert__close" onClick={onClose}><X aria-hidden /></Button>}
    </div>
  );
}
