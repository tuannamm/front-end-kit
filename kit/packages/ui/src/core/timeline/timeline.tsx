import type { ReactNode } from 'react';
import { cx } from '../../cx';
import type { Tone } from '../badge/badge';
import { fullTime, isoTime, relativeTime, shortTime } from '../notification/time';

export type TimelineItem = {
  title: ReactNode;
  /** Second line and anything below it: a note, a quote, a file. */
  description?: ReactNode;
  /** ISO date-time or Date. */
  time?: string | Date;
  /** Marker colour. Back it with words: the colour alone tells nothing to a screen reader. */
  tone?: Tone;
  /** Replaces the dot with an icon in a small frame. */
  icon?: ReactNode;
  /** done: happened. current: in progress now. pending: not yet, hollow marker and a dashed line leading to it. */
  status?: 'done' | 'current' | 'pending';
};

export type TimelineProps = {
  items: TimelineItem[];
  /** relative: "5 phút trước". absolute: "14:32 · 07/10/2026". The full time is in the hover title either way. */
  timeStyle?: 'relative' | 'absolute';
  'aria-label'?: string;
  className?: string;
};

const statusWord = { current: 'Đang thực hiện', pending: 'Chưa thực hiện' };

/** Events in order down a rail: an activity log, an audit trail, the steps of a batch. */
export function Timeline({ items, timeStyle = 'relative', 'aria-label': label, className }: TimelineProps) {
  return (
    <ol className={cx('dtx-timeline', className)} aria-label={label}>
      {items.map((it, i) => {
        const status = it.status ?? 'done';
        const iso = it.time ? isoTime(it.time) : '';
        return (
          // ponytail: index keys; items hold no state, so a prepended event only re-renders
          <li key={i} className={cx('dtx-timeline__item', `dtx-tone-${it.tone ?? 'brand'}`, it.icon != null && 'dtx-timeline__item--icon')} data-status={status} aria-current={status === 'current' ? 'step' : undefined}>
            <span className="dtx-timeline__marker" aria-hidden>{it.icon}</span>
            <div className="dtx-timeline__head">
              <span className="dtx-timeline__title">
                {status !== 'done' && <span className="dtx-timeline__sr">{statusWord[status]}: </span>}
                {it.title}
              </span>
              {iso && <time className="dtx-timeline__time dtx-num" dateTime={iso} title={fullTime(it.time!)}>{timeStyle === 'absolute' ? shortTime(it.time!) : relativeTime(it.time!)}</time>}
            </div>
            {it.description && <div className="dtx-timeline__desc">{it.description}</div>}
          </li>
        );
      })}
    </ol>
  );
}
