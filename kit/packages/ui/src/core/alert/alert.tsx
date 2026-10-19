/**
 * # Alert
 *
 * A message that stays in the page until its cause is gone: a form that failed as a whole, a locked batch, maintenance
 * tonight. It is never a field error (use `<Field error>`) and never news of a moment ago (use a toast).
 *
 * ```tsx
 * import { Alert, Button } from '@dgtx/ui-frek';
 *
 * <Alert tone="err" title="Could not save record HS-0142" action={<Button size="sm" onClick={save}>Save again</Button>}>
 *   Lost connection to the server. The data is still on this device.
 * </Alert>
 *
 * <Alert tone="warn" title="Batch HD-5517 may miss the 16:15 SLA" onClose={() => setHidden(true)} />
 * ```
 *
 * ## Notes
 *
 * - Tones: `brand` (information, default), `ok`, `warn`, `err`. Each has its own icon and a tinted hairline, so the
 *   colour is never the only cue. The text stays in the body colour for contrast in both themes.
 * - `err` gets `role="alert"`, so a screen reader reads it at once when it appears. Other tones are `role="status"`.
 *   Pass `role` to override, e.g. a long-standing notice that should not be announced.
 * - Write the title as what happened and the description as why and what to do next. Keep one primary action.
 * - `onClose` adds a 32px close button; the app removes the alert. Do not make an error closable while it still applies.
 * - No entrance animation: an alert is page content, and it should be there in the first frame.
 *
 * ## Props
 *
 * ### Alert
 *
 * | Prop | Type | Default | Description |
 * |---|---|---|---|
 * | `tone` | `'brand' \| 'ok' \| 'warn' \| 'err'` | `'brand'` | Icon, tint and role |
 * | `title` | `ReactNode` |  | What happened, in a few words |
 * | `children` | `ReactNode` |  | Why, and what to do next |
 * | `icon` | `ReactNode \| false` |  | Replaces the tone's icon; `false` hides it |
 * | `action` | `ReactNode` |  | Buttons under the text |
 * | `onClose` | `() => void` |  | Shows a close button |
 * | `closeLabel` | `string` | `'Close'` | Accessible name of the close button |
 * | `className` | `string` |  | Extra classes |
 *
 * Plus every `<div>` prop (`role`, `id`, `aria-*`).
 *
 * ## Files
 *
 * - `alert.tsx`: Alert. Uses Button and the shared tone icons from `badge.tsx` (the same ones Toast uses).
 * - `alert.css`: `.dtx-alert*`.
 *
 * @generated from README.md in this folder. Edit the README, then run `npm run docs:sync`.
 */

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
  /** Buttons under the text, e.g. "Save". */
  action?: ReactNode;
  /** Shows a close button. Hiding the alert is the app's job. */
  onClose?: () => void;
  closeLabel?: string;
};

/**
 * Message that stays in the page until its cause is gone: a form that failed as a whole, a locked batch, maintenance.
 * Field errors belong to Field; something that happened a moment ago belongs to a toast.
 */
export function Alert({ tone = 'brand', title, children, icon, action, onClose, closeLabel = 'Close', className, ...rest }: AlertProps) {
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
