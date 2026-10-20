/**
 * # Timeline
 *
 * Events in order down a rail: an activity log, an audit trail, the steps of a batch or an order.
 *
 * ```tsx
 * import { Timeline } from '@dgtx/ui-frek';
 *
 * // activity log, newest first
 * <Timeline aria-label="Activity of batch HD-5517" items={[
 *   { title: 'Handed over to the customer', time: '2026-10-07T09:12:00+07:00', tone: 'ok' },
 *   { title: 'OCR failed on 12 pages', description: 'Blurry scan, sent to manual QC.', time: '2026-10-07T08:40:00+07:00', tone: 'err' },
 * ]} />
 *
 * // progress: what is done, what runs now, what is ahead
 * <Timeline timeStyle="absolute" items={[
 *   { title: 'Records received', time: '2026-10-06T08:30:00+07:00' },
 *   { title: 'Recognition (OCR)', status: 'current' },
 *   { title: 'Quality check', status: 'pending' },
 * ]} />
 * ```
 *
 * ## Notes
 *
 * - An `<ol>`; the order is yours (newest first for a log, oldest first for steps). For a log grouped by day, put a
 *   heading and a Timeline per day.
 * - Markers are small squares (the logo motif) in the item's `tone`, default brand blue. `icon` swaps the square for an
 *   icon in a hairline frame; dots and icons can mix and stay on one rail.
 * - `status`: `current` rings the marker and sets `aria-current="step"`; `pending` hollows it, mutes the title and dashes
 *   the line leading to it. Screen readers hear "In progress" / "Not started" before those titles.
 * - Colour is never the only signal: say "failed", "handed over" in the title too.
 * - `time` renders a `<time datetime>`, "5 minutes ago" or "14:32 · 07/10/2026" (`timeStyle`); the full time is in the
 *   hover title. An invalid time is left out. Long titles wrap; the time drops below only when the row is too narrow.
 *
 * ## Props
 *
 * ### Timeline
 *
 * | Prop | Type | Default | Description |
 * |---|---|---|---|
 * | `items` | `TimelineItem[]` | **required** |  |
 * | `timeStyle` | `'relative' \| 'absolute'` | `'relative'` | "5 minutes ago" or "14:32 · 07/10/2026" |
 * | `aria-label` | `string` |  | Names the list when no heading above does |
 * | `className` | `string` |  | Extra classes |
 *
 * ### TimelineItem
 *
 * | Prop | Type | Default | Description |
 * |---|---|---|---|
 * | `title` | `ReactNode` | **required** | What happened |
 * | `description` | `ReactNode` |  | Below the title: a note, a quote, a file |
 * | `time` | `string \| Date` |  | When (ISO or Date) |
 * | `tone` | `Tone` | `'brand'` | Marker colour |
 * | `icon` | `ReactNode` |  | Icon instead of the square dot |
 * | `status` | `'done' \| 'current' \| 'pending'` | `'done'` | Progress state |
 *
 * ## Files
 *
 * - `timeline.tsx`: Timeline, `TimelineItem`
 * - `timeline.css`: `.dtx-timeline*`
 * - Time formatting: `../notification/time.ts` (`relativeTime`, `shortTime`, `fullTime`, `isoTime`)
 *
 * Catalog: `#/catalog/timeline`
 *
 
 */

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
  /** relative: "5 minutes ago". absolute: "14:32 · 10/07/2026". The full time is in the hover title either way. */
  timeStyle?: 'relative' | 'absolute';
  'aria-label'?: string;
  className?: string;
};

const statusWord = { current: 'In progress', pending: 'Not started' };

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
                {status !== 'done' && <span className="dtx-sr">{statusWord[status]}: </span>}
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
