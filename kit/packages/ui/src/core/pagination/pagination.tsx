/**
 * # Pagination
 *
 * Page controls for a table or a list of cards: a "21–40 of 1,234 rows" summary, an optional rows-per-page picker,
 * and the page buttons.
 *
 * ```tsx
 * import { Pagination } from '@dgtx/ui-frek';
 *
 * const [page, setPage] = useState(1);
 * const [size, setSize] = useState(20);
 *
 * <Pagination page={page} total={1234} pageSize={size} onPageChange={setPage} onPageSizeChange={setSize} itemLabel="records" />
 * ```
 *
 * ## Notes
 *
 * - A `<nav aria-label="Pagination">`. The current page has `aria-current="page"` and is tinted and bold. Page buttons
 *   are named "Page 5"; "…" gaps are hidden from screen readers.
 * - The page list always has 7 slots once there are more than 7 pages (first, last, the current page and one on each
 *   side), so the buttons do not jump as the page changes. A gap always hides at least two pages.
 * - At the first or last page the arrow is `aria-disabled`, not `disabled`, so keyboard focus stays on it.
 * - The summary is a polite live region: a screen reader hears the new range after a page change.
 * - `onPageSizeChange` adds the picker. Changing the size also calls `onPageChange` with the page that still holds the
 *   first row on screen. The current `pageSize` is added to `pageSizeOptions` if missing.
 * - Below 360px of container width (a card, a phone) the page list collapses to "Page 3 / 62" between the arrows.
 * - `page` out of range shows the nearest page; resetting it after a filter is the app's job.
 * - Numbers use Vietnamese grouping ("1.234"). Buttons are 32px tall (WCAG 2.5.8).
 *
 * ## Props
 *
 * ### Pagination
 *
 * | Prop | Type | Default | Description |
 * |---|---|---|---|
 * | `page` | `number` | **required** | Current page, from 1 |
 * | `total` | `number` | **required** | Rows across all pages |
 * | `pageSize` | `number` | **required** | Rows per page |
 * | `onPageChange` | `(page: number) => void` | **required** |  |
 * | `onPageSizeChange` | `(pageSize: number) => void` |  | Adds the rows-per-page picker |
 * | `pageSizeOptions` | `number[]` | `[10, 20, 50, 100]` | Choices in the picker |
 * | `itemLabel` | `string` | `'rows'` | What a row is, in the summary and the picker's name |
 * | `aria-label` | `string` | `'Pagination'` | Name of the navigation landmark |
 * | `className` | `string` |  | Extra classes |
 *
 * ## Files
 *
 * - `pagination.tsx`: Pagination
 * - `pages.ts`: `pageItems` (which page buttons to show), `pageForResize`; tested by `pages.check.ts`
 * - `pagination.css`: `.dtx-pager*`
 *
 * Catalog: `#/catalog/pagination`
 *
 * @generated from README.md in this folder. Edit the README, then run `npm run docs:sync`.
 */

import type { ReactNode } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { cx } from '../../cx';
import { Select } from '../select/select';
import { pageForResize, pageItems } from './pages';

export type PaginationProps = {
  /** Current page, from 1. Out of range shows the nearest page; resetting it is the app's job. */
  page: number;
  /** Rows across all pages. */
  total: number;
  pageSize: number;
  onPageChange: (page: number) => void;
  /** Adds a rows-per-page picker. On a change, onPageChange also runs, so the first row on screen stays on screen. */
  onPageSizeChange?: (pageSize: number) => void;
  pageSizeOptions?: number[];
  /** What a row is, in the summary: "21–40 of 1,234 records". */
  itemLabel?: string;
  'aria-label'?: string;
  className?: string;
};

const fmt = new Intl.NumberFormat('en-US');

/**
 * Page controls with a "21–40 of 1,234 rows" summary and an optional rows-per-page picker.
 * The page list keeps a constant width; in a narrow container it collapses to "Page 3 / 62" between the arrows.
 */
export function Pagination({ page, total, pageSize, onPageChange, onPageSizeChange, pageSizeOptions = [10, 20, 50, 100], itemLabel = 'rows', 'aria-label': label = 'Pagination', className }: PaginationProps) {
  const count = Math.max(1, Math.ceil(total / pageSize));
  const current = Math.min(Math.max(1, page), count);
  const from = total ? (current - 1) * pageSize + 1 : 0, to = Math.min(current * pageSize, total);
  const go = (p: number) => { if (p !== current && p >= 1 && p <= count) onPageChange(p); };
  // aria-disabled, not disabled: the arrow keeps focus when it reaches the first or last page
  const arrow = (d: -1 | 1, name: string, icon: ReactNode) => {
    const off = d < 0 ? current <= 1 : current >= count;
    return <button type="button" className="dtx-pager__btn" aria-label={name} aria-disabled={off || undefined} onClick={() => go(current + d)}>{icon}</button>;
  };
  const sizes = [...new Set([...pageSizeOptions, pageSize])].sort((a, b) => a - b);

  return (
    <nav aria-label={label} className={cx('dtx-pager', className)}>
      <div className="dtx-pager__info">
        <span className="dtx-num" aria-live="polite">
          {total ? `${fmt.format(from)}–${fmt.format(to)} of ${fmt.format(total)} ${itemLabel}` : `0 ${itemLabel}`}
        </span>
        {onPageSizeChange && (
          <span className="dtx-pager__size">
            <span aria-hidden>Per page</span>
            <Select size="sm" aria-label={`Number of ${itemLabel} per page`} items={sizes.map(n => ({ value: String(n), label: String(n) }))} value={String(pageSize)}
              onValueChange={v => {
                const n = Number(v);
                if (!n || n === pageSize) return;
                onPageSizeChange(n);
                const p = pageForResize(current, pageSize, n);
                if (p !== current) onPageChange(p);
              }} />
          </span>
        )}
      </div>
      <div className="dtx-pager__nav">
        {arrow(-1, 'Previous page', <ChevronLeft aria-hidden />)}
        <ul className="dtx-pager__pages">
          {pageItems(current, count).map((p, i) => p === null
            ? <li key={`gap${i}`} className="dtx-pager__gap" aria-hidden>…</li>
            : <li key={p}><button type="button" className="dtx-pager__btn dtx-num" aria-label={`Page ${p}`} aria-current={p === current ? 'page' : undefined} onClick={() => go(p)}>{fmt.format(p)}</button></li>)}
        </ul>
        <span className="dtx-pager__compact dtx-num">Page {fmt.format(current)} / {fmt.format(count)}</span>
        {arrow(1, 'Next page', <ChevronRight aria-hidden />)}
      </div>
    </nav>
  );
}
