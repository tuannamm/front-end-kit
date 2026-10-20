/**
 * # Steps
 *
 * Where the user is in a sequence: a wizard, a checkout, the stages a batch goes through.
 *
 * ```tsx
 * import { Steps } from '@dgtx/ui-frek';
 *
 * <Steps current={1} items={[
 *   { title: 'Intake', description: '3,860 pages' },
 *   { title: 'Recognition', subTitle: '00:08 left', description: '2,140 / 3,860 pages' },
 *   { title: 'Quality check' },
 * ]} />
 *
 * // a failed step
 * <Steps current={2} status="error" items={…} />
 *
 * // a wizard the user may go back and forth in
 * <Steps current={step} onChange={setStep} items={…} />
 * ```
 *
 * ## Notes
 *
 * - `current` sets every status: steps before it are finished (check), the current one is in progress (solid blue),
 *   the rest wait. `status` changes the current one (`'error'` shows a cross in red); an item's own `status` overrides.
 * - The line after a step turns blue once that step is finished.
 * - Horizontal (default) puts the title beside the marker and the line on the title's line. Titles never wrap there:
 *   when the steps do not fit the width, Steps lays itself out vertically, and back when there is room again. Measured,
 *   not a breakpoint, so it holds for three short steps on a phone and eight long ones on a laptop.
 * - `onChange` turns each step into a button (`disabled` items stay inert). Without it the steps are plain text.
 * - An `<ol>`; the current step has `aria-current="step"`, and every title is read with its status ("Done: Intake"), so the colour is never the only signal.
 * - `variant="outlined"` draws a hairline ring instead of a tint; `size="sm"` for toolbars and dialogs.
 * - For a log of past events with times, use Timeline instead.
 *
 * ## Props
 *
 * ### Steps
 *
 * | Prop | Type | Default | Description |
 * |---|---|---|---|
 * | `items` | `StepItem[]` | **required** |  |
 * | `current` | `number` | `0` | Index of the step in progress |
 * | `status` | `StepStatus` | `'process'` | Status of the current step: `'wait' \| 'process' \| 'finish' \| 'error'` |
 * | `onChange` | `(index: number) => void` |  | Makes the steps buttons |
 * | `orientation` | `'horizontal' \| 'vertical'` | `'horizontal'` | Horizontal falls back to vertical when it does not fit |
 * | `size` | `'md' \| 'sm'` | `'md'` | 32px or 24px markers |
 * | `variant` | `'filled' \| 'outlined'` | `'filled'` | Tinted markers, or a hairline ring |
 * | `aria-label` | `string` |  | Names the list |
 * | `className` | `string` |  | Extra classes |
 *
 * ### StepItem
 *
 * | Prop | Type | Default | Description |
 * |---|---|---|---|
 * | `title` | `ReactNode` | **required** |  |
 * | `subTitle` | `ReactNode` |  | Beside the title, smaller |
 * | `description` | `ReactNode` |  | Under the title |
 * | `icon` | `ReactNode` |  | Replaces the number in the marker |
 * | `status` | `StepStatus` |  | Overrides the status from `current` |
 * | `disabled` | `boolean` |  | Not clickable, even with `onChange` |
 *
 * ## Files
 *
 * - `steps.tsx`: Steps, `StepItem`, `StepStatus`
 * - `steps.css`: `.dtx-steps*`
 *
 * Catalog: `#/catalog/steps`
 *
 
 */

import { useLayoutEffect, useRef, useState, type ReactNode } from 'react';
import { Check, X } from 'lucide-react';
import { cx } from '../../cx';

export type StepStatus = 'wait' | 'process' | 'finish' | 'error';

export type StepItem = {
  title: ReactNode;
  /** Beside the title, smaller: a count, a time left. */
  subTitle?: ReactNode;
  /** Under the title. */
  description?: ReactNode;
  /** Replaces the number inside the marker. */
  icon?: ReactNode;
  /** Overrides the status that `current` gives this step. */
  status?: StepStatus;
  /** Not clickable, even with onChange. */
  disabled?: boolean;
};

export type StepsProps = {
  items: StepItem[];
  /** Index of the step in progress: those before it are finished, those after it wait. */
  current?: number;
  /** Status of the current step, e.g. 'error' when it failed. */
  status?: StepStatus;
  /** Makes the steps buttons: for a wizard the user may go back and forth in. */
  onChange?: (index: number) => void;
  /** horizontal falls back to vertical when the steps do not fit the width. */
  orientation?: 'horizontal' | 'vertical';
  size?: 'md' | 'sm';
  /** filled: tinted markers. outlined: a hairline ring. */
  variant?: 'filled' | 'outlined';
  'aria-label'?: string;
  className?: string;
};

const statusWord: Record<StepStatus, string> = { finish: 'Done', process: 'In progress', error: 'Error', wait: 'Not started' };

/** Where the user is in a sequence: a wizard, a checkout, the stages a batch goes through. */
export function Steps({ items, current = 0, status = 'process', onChange, orientation = 'horizontal', size = 'md', variant = 'filled', 'aria-label': label, className }: StepsProps) {
  const ref = useRef<HTMLOListElement>(null);
  const [fits, setFits] = useState(true);
  const layout = orientation === 'horizontal' && fits ? 'horizontal' : 'vertical';

  // Horizontal while the steps fit the width (titles never wrap there), vertical otherwise. Measured, not a breakpoint:
  // three short steps fit a phone, eight long ones do not fit a laptop. The check lays the list out horizontally for
  // a moment, reads whether it overflows and puts the layout back, all before the browser paints. Every render (the
  // content may have changed) and on every resize.
  useLayoutEffect(() => {
    if (orientation === 'vertical') return;
    const ol = ref.current!;
    const check = () => {
      const was = ol.dataset.layout;
      ol.dataset.layout = 'horizontal';
      // the items' own widths, not the list's scrollWidth: right after the switch Chromium may lay the items out shrunk to
      // fit, so the list reports no overflow one time and overflow the next, and the layout flips on every resize
      const need = [...ol.children].reduce((w, li) => w + li.scrollWidth, 0);
      const over = need > ol.clientWidth + 1;
      ol.dataset.layout = was;
      setFits(!over);
    };
    check();
    const ro = new ResizeObserver(check);
    ro.observe(ol);
    return () => ro.disconnect();
  });

  return (
    <ol ref={ref} className={cx('dtx-steps', `dtx-steps--${size}`, `dtx-steps--${variant}`, className)} data-layout={layout} aria-label={label}>
      {items.map((it, i) => {
        const s: StepStatus = it.status ?? (i < current ? 'finish' : i === current ? status : 'wait');
        const body = (
          <>
            <span className="dtx-steps__icon" aria-hidden>{it.icon ?? (s === 'finish' ? <Check /> : s === 'error' ? <X /> : i + 1)}</span>
            <span className="dtx-steps__body">
              <span className="dtx-steps__head">
                <span className="dtx-steps__title"><span className="dtx-sr">{statusWord[s]}: </span>{it.title}</span>
                {it.subTitle && <span className="dtx-steps__sub">{it.subTitle}</span>}
              </span>
              {it.description && <span className="dtx-steps__desc">{it.description}</span>}
            </span>
          </>
        );
        return (
          <li key={i} className="dtx-steps__item" data-status={s} aria-current={i === current ? 'step' : undefined}>
            {onChange
              ? <button type="button" className="dtx-steps__step" disabled={it.disabled} onClick={() => onChange(i)}>{body}</button>
              : <div className="dtx-steps__step">{body}</div>}
          </li>
        );
      })}
    </ol>
  );
}
