import { useLayoutEffect, useRef, type CSSProperties, type ReactNode } from 'react';
import { cx } from '../../cx';

export type MasonryProps = {
  /** One element per tile. Tiles keep their own height; give images an aspect-ratio so they do not reflow on load. */
  children: ReactNode;
  /** Narrowest a column may get; the column count follows the container width. Ignored when `columns` is set. */
  minColumnWidth?: number;
  /** A fixed number of columns. */
  columns?: number;
  /** Space between tiles, both ways (px). */
  gap?: number;
  'aria-label'?: string;
  className?: string;
};

/**
 * Tiles in the shortest column first, so columns end at nearly the same height. The column tracks are a CSS grid
 * (auto-fill or a fixed count); JS only stacks each tile down its column, again whenever a tile changes size.
 */
function place(el: HTMLElement) {
  const cs = getComputedStyle(el);
  const tracks = cs.gridTemplateColumns.split(' ');
  const step = (parseFloat(tracks[0]) + parseFloat(cs.columnGap)) * (cs.direction === 'rtl' ? -1 : 1);
  const gap = parseFloat(cs.rowGap);
  const heights: number[] = Array(tracks.length).fill(0);
  for (const tile of el.children as HTMLCollectionOf<HTMLElement>) {
    const h = tile.getBoundingClientRect().height; // fractional: rounded offsetHeights drift down a long column
    if (!h) continue; // display: none
    const c = heights.indexOf(Math.min(...heights)); // ties go to the first column in reading order
    tile.style.transform = `translate(${c * step}px, ${heights[c]}px)`;
    heights[c] += h + gap;
  }
  el.style.height = `${Math.max(0, Math.max(...heights) - gap)}px`;
}

/** Masonry grid: columns of tiles of different heights, filled shortest column first, in DOM (tab) order. */
export function Masonry({ children, minColumnWidth = 240, columns, gap = 16, 'aria-label': label, className }: MasonryProps) {
  const ref = useRef<HTMLDivElement>(null);
  const observer = useRef<ResizeObserver>(null);

  // Tiles are observed, not the container: a width change resizes the tracks and so every tile, and the container's
  // own height (set by place) stays out of the loop.
  useLayoutEffect(() => {
    const el = ref.current!;
    const ro = new ResizeObserver(() => place(el));
    observer.current = ro;
    return () => ro.disconnect();
  }, []);

  // ponytail: every render re-reads every tile height, O(n); virtualise past a few hundred tiles
  useLayoutEffect(() => {
    const el = ref.current!;
    for (const tile of el.children) observer.current!.observe(tile);
    place(el);
  });

  return (
    <div
      ref={ref} className={cx('dtx-masonry', className)} aria-label={label} role={label ? 'group' : undefined}
      data-columns={columns ? '' : undefined}
      style={{ '--gap': `${gap}px`, '--min': `${minColumnWidth}px`, '--n': columns } as CSSProperties}
    >
      {children}
    </div>
  );
}
