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
