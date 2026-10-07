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

const statusWord: Record<StepStatus, string> = { finish: 'Đã xong', process: 'Đang thực hiện', error: 'Lỗi', wait: 'Chưa thực hiện' };

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
      const over = ol.scrollWidth > ol.clientWidth + 1;
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
