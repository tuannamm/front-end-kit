import { useLayoutEffect, useRef, useState, type CSSProperties, type ReactNode, type SyntheticEvent } from 'react';
import { cx } from '../../cx';
import { connect, type Pt, type Rect } from './connect';

export type FieldLinkProps = {
  /** Box id linked while nothing is hovered or focused: a selected field, or a static state for docs and screenshots. */
  linked?: string | null;
  /** The page with its BoxOverlay, and the extracted fields marked `data-source="<box id>"`, laid out however you like. */
  children: ReactNode;
  className?: string;
};

type Geo = { d: string; from: Pt; to: Pt; rgb: string };

/**
 * Draws a line from an extracted field to the box it was read from, so a reviewer sees where a value came from without
 * searching the page. Hovering or focusing either end links the pair; the line takes the box's colour.
 */
export function FieldLink({ linked = null, children, className }: FieldLinkProps) {
  const root = useRef<HTMLDivElement>(null);
  const [over, setOver] = useState<string | null>(null);
  const [geo, setGeo] = useState<Geo | null>(null);
  const id = over ?? linked;

  // one handler for both ends: a field (data-source) or a BoxOverlay box (data-box) under the pointer or focus
  const track = (e: SyntheticEvent) => {
    const end = (e.target as Element).closest?.('[data-source], [data-box]');
    setOver(end ? end.getAttribute('data-source') ?? end.getAttribute('data-box') : null);
  };

  useLayoutEffect(() => {
    const el = root.current;
    if (!el || !id) { setGeo(null); return; }
    const q = CSS.escape(id);
    let marked: Element[] = [];
    const measure = () => {
      const f = el.querySelector(`[data-source="${q}"]`), b = el.querySelector(`[data-box="${q}"]`);
      const ends = [f, b].filter((n): n is Element => !!n);
      if (ends.some((n, i) => n !== marked[i]) || ends.length !== marked.length) {
        marked.forEach(n => n.removeAttribute('data-linked'));
        (marked = ends).forEach(n => n.setAttribute('data-linked', ''));
      }
      if (!f || !b) { setGeo(null); return; }
      const o = el.getBoundingClientRect();
      const rel = (n: Element): Rect => { const r = n.getBoundingClientRect(); return { left: r.left - o.left, right: r.right - o.left, top: r.top - o.top, bottom: r.bottom - o.top }; };
      const g = connect(rel(f), rel(b));
      // BoxOverlay sets each box's colour as an "r g b" triple in --c
      const rgb = getComputedStyle(b).getPropertyValue('--c').trim() || '37 130 215';
      setGeo(prev => (g && prev?.d === g.d && prev.rgb === rgb ? prev : g && { ...g, rgb }));
    };
    let raf = 0;
    const place = () => { cancelAnimationFrame(raf); raf = requestAnimationFrame(measure); };
    measure();
    // follow layout: resizes, boxes that arrive late (a page measured after mount), scrolling, the boxes' draw-in
    const ro = new ResizeObserver(place);
    ro.observe(el);
    Array.from(el.children).forEach(n => ro.observe(n));
    const mo = new MutationObserver(place);
    mo.observe(el, { childList: true, subtree: true });
    addEventListener('scroll', place, true);
    el.addEventListener('animationend', place);
    return () => {
      cancelAnimationFrame(raf); ro.disconnect(); mo.disconnect();
      removeEventListener('scroll', place, true); el.removeEventListener('animationend', place);
      marked.forEach(n => n.removeAttribute('data-linked'));
    };
  }, [id]);

  return (
    <div
      ref={root} className={cx('dtx-flink', className)} data-on={geo ? '' : undefined} style={geo ? { '--flink': geo.rgb } as CSSProperties : undefined}
      onPointerOver={track} onPointerLeave={() => setOver(null)} onFocus={track} onBlur={() => setOver(null)}
    >
      {children}
      {geo && (
        // keyed by the pair, so each new link fades in once and then only follows layout changes
        <svg key={id} className="dtx-flink__svg" aria-hidden>
          <path className="dtx-flink__line" d={geo.d} />
          <circle className="dtx-flink__end" cx={geo.from[0]} cy={geo.from[1]} r="3.5" />
          <circle className="dtx-flink__end dtx-flink__end--box" cx={geo.to[0]} cy={geo.to[1]} r="3.5" />
        </svg>
      )}
    </div>
  );
}
