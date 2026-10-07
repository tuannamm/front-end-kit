import { Fragment, useId, useLayoutEffect, useRef, useState, type CSSProperties, type KeyboardEvent, type PointerEvent, type ReactNode } from 'react';
import { cx } from '../../cx';
import { initialFractions, moveHandle, toPx, type PanelLimits, type PanelSize } from './split';

export type SplitterPanel = PanelLimits & {
  content: ReactNode;
  /** Starting size: px, or '30%'. Panels without one share the rest. Restore a saved layout through this. */
  defaultSize?: PanelSize;
  /** Names the panel for the handle before it ("Đổi kích thước: Danh sách"). */
  label?: string;
};

export type SplitterProps = {
  panels: SplitterPanel[];
  /** horizontal: panels side by side. vertical: stacked (give the Splitter a height). */
  orientation?: 'horizontal' | 'vertical';
  /** Every move, in % of the shared space. */
  onResize?: (sizes: number[]) => void;
  /** Once per drag or key press: the place to save the layout. */
  onResizeEnd?: (sizes: number[]) => void;
  className?: string;
};

const STEP = 16;
const css = (v: PanelSize | undefined) => (typeof v === 'number' ? `${v}px` : v);

/**
 * Panels with draggable handles between them. A handle moves only its two neighbours; min/max hold while dragging and
 * on container resizes. Handles are focusable separators: arrows step, Home/End go to the limits, Enter (or a
 * double-click) folds a collapsible neighbour and opens it again.
 */
export function Splitter({ panels, orientation = 'horizontal', onResize, onResizeEnd, className }: SplitterProps) {
  const root = useRef<HTMLDivElement>(null);
  const id = useId();
  const [fr, setFr] = useState<number[] | null>(null); // fractions of the shared space; flex-grow normalises them
  const [dragging, setDragging] = useState<number | null>(null);
  const restore = useRef<Record<number, number>>({}); // px before a fold, by handle
  const horizontal = orientation === 'horizontal';

  const els = () => [...root.current!.children].filter(c => c.classList.contains('dtx-splitter__panel')) as HTMLElement[];
  const sizeOf = (el: Element) => { const r = el.getBoundingClientRect(); return horizontal ? r.width : r.height; };
  const measure = () => { const s = els().map(sizeOf); return { s, avail: s.reduce((a, b) => a + b, 0) }; };
  // RTL mirrors the row: moving right shrinks the panel before the handle
  const sign = () => (horizontal && getComputedStyle(root.current!).direction === 'rtl' ? -1 : 1);

  useLayoutEffect(() => {
    setFr(initialFractions(panels.map(p => p.defaultSize), measure().avail));
  }, [panels.length]); // eslint-disable-line react-hooks/exhaustive-deps

  /** Put panel i at `to` px (its right/bottom neighbour takes the difference); returns the sizes in %. */
  const move = (i: number, to: number, snap: boolean, exact = false) => {
    const { s, avail } = measure();
    const a = exact ? Math.max(0, Math.min(s[i] + s[i + 1], to)) : moveHandle(s[i], s[i + 1], to, avail, panels[i], panels[i + 1], snap);
    s[i + 1] += s[i] - a;
    s[i] = a;
    const next = s.map(v => v / avail);
    setFr(next);
    const pct = next.map(f => f * 100);
    onResize?.(pct);
    return pct;
  };

  // not onResizeEnd?.(move(…)): an optional call skips evaluating its argument, and the move with it
  const end = (pct: number[]) => onResizeEnd?.(pct);

  const fold = (i: number) => {
    const { s } = measure();
    const side = panels[i].collapsible ? i : panels[i + 1].collapsible ? i + 1 : -1;
    if (side < 0) return;
    const total = s[i] + s[i + 1];
    if (s[side] > 0) { restore.current[i] = s[side]; end(move(i, side === i ? 0 : total, false, true)); return; }
    const back = restore.current[i] ?? toPx(panels[side].min, measure().avail, total / 2);
    end(move(i, side === i ? back : total - back, false));
  };

  const onPointerDown = (i: number) => (e: PointerEvent<HTMLDivElement>) => {
    if (e.button !== 0) return;
    e.preventDefault();
    const handle = e.currentTarget;
    handle.focus();
    handle.setPointerCapture(e.pointerId);
    const start = horizontal ? e.clientX : e.clientY, k = sign();
    const [from, fromB] = [els()[i], els()[i + 1]].map(sizeOf);
    let last: number[] | null = null;
    setDragging(i);
    const onMove = (ev: globalThis.PointerEvent) => { last = move(i, from + k * ((horizontal ? ev.clientX : ev.clientY) - start), true); };
    const onUp = () => {
      handle.removeEventListener('pointermove', onMove);
      setDragging(null);
      if (!last) return;
      if (last[i] === 0 && from > 0) restore.current[i] = from;
      if (last[i + 1] === 0 && fromB > 0) restore.current[i] = fromB;
      end(last);
    };
    handle.addEventListener('pointermove', onMove);
    handle.addEventListener('lostpointercapture', onUp, { once: true });
  };

  const onKeyDown = (i: number) => (e: KeyboardEvent<HTMLDivElement>) => {
    const [less, more] = horizontal ? (sign() < 0 ? ['ArrowRight', 'ArrowLeft'] : ['ArrowLeft', 'ArrowRight']) : ['ArrowUp', 'ArrowDown'];
    const a = sizeOf(els()[i]);
    const to = e.key === less ? a - STEP : e.key === more ? a + STEP : e.key === 'Home' ? -Infinity : e.key === 'End' ? Infinity : null;
    if (e.key === 'Enter') { e.preventDefault(); fold(i); return; }
    if (to === null) return;
    e.preventDefault();
    end(move(i, to, false));
  };

  const total = fr ? fr.reduce((a, b) => a + b, 0) : 1;
  return (
    <div ref={root} className={cx('dtx-splitter', className)} data-orientation={orientation} data-dragging={dragging !== null ? '' : undefined}>
      {panels.map((p, i) => {
        const collapsed = fr?.[i] === 0;
        const pct = Math.round(((fr?.[i - 1] ?? 0) / total) * 100);
        return (
          <Fragment key={i}>
            {i > 0 && (
              <div
                className="dtx-splitter__handle" role="separator" tabIndex={0}
                aria-orientation={horizontal ? 'vertical' : 'horizontal'} aria-controls={`${id}-${i - 1}`}
                aria-label={`Đổi kích thước: ${panels[i - 1].label ?? `khung ${i}`}`}
                aria-valuenow={pct} aria-valuemin={0} aria-valuemax={100}
                data-dragging={dragging === i - 1 ? '' : undefined}
                onPointerDown={onPointerDown(i - 1)} onKeyDown={onKeyDown(i - 1)} onDoubleClick={() => fold(i - 1)}
              />
            )}
            <div
              id={`${id}-${i}`} className="dtx-splitter__panel" data-collapsed={collapsed ? '' : undefined} inert={collapsed}
              style={{
                flex: `${fr?.[i] ?? 1} 1 0px`,
                [horizontal ? 'minWidth' : 'minHeight']: collapsed ? 0 : css(p.min),
                [horizontal ? 'maxWidth' : 'maxHeight']: css(p.max),
              } as CSSProperties}
            >
              {p.content}
            </div>
          </Fragment>
        );
      })}
    </div>
  );
}
