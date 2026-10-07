import { Children, useEffect, useRef, useState, type CSSProperties, type ReactNode } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { cx } from '../../cx';
import { useReducedMotion } from '../../motion/primitives';
import { Button } from '../button/button';

export type CarouselProps = {
  /** One child per slide. */
  children: ReactNode;
  /** Names the carousel, e.g. "Tin mới". Required: a page can hold several. */
  'aria-label': string;
  /** Any CSS width. '100%' shows one slide at a time; 'min(260px, 80%)' shows a row of cards with the next one peeking. */
  slideWidth?: string;
  /** Space between slides, in px. */
  gap?: number;
  /** Dots (10 slides or fewer) or a "3–5 / 20" count beside the arrows. */
  indicators?: boolean;
  className?: string;
};

const MAX_DOTS = 10;

/**
 * A row of slides that scrolls sideways with native scroll snapping: swipe, trackpad, the arrow buttons, the dots,
 * or arrow keys once the row has focus. Controls hide when every slide fits. No autoplay.
 */
export function Carousel({ children, 'aria-label': label, slideWidth = '100%', gap = 16, indicators = true, className }: CarouselProps) {
  const slides = Children.toArray(children);
  const n = slides.length;
  const track = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState<number[]>([]);
  const [live, setLive] = useState('');
  const announce = useRef(false);
  const reduced = useReducedMotion();

  // a slide counts as shown once 60% of it is in view
  useEffect(() => {
    const root = track.current;
    if (!root) return;
    const seen = new Set<number>();
    const io = new IntersectionObserver(entries => {
      for (const e of entries) {
        const i = Number((e.target as HTMLElement).dataset.index);
        if (e.intersectionRatio >= .59) seen.add(i); else seen.delete(i);
      }
      setVisible([...seen].sort((a, b) => a - b));
    }, { root, threshold: [0, .6, 1] });
    for (const el of root.children) io.observe(el);
    return () => io.disconnect();
  }, [n]);

  const first = visible[0] ?? 0, last = visible[visible.length - 1] ?? 0;
  const range = first === last ? `${first + 1}` : `${first + 1}–${last + 1}`;
  // only moves made with the controls are announced (a swipe is already seen), once the scroll settles:
  // a smooth scroll passes through the slides in between
  useEffect(() => {
    if (!announce.current || !visible.length) return;
    const id = setTimeout(() => { setLive(`Đang xem ${range} / ${n}`); announce.current = false; }, 300);
    return () => clearTimeout(id);
  }, [range, n, visible.length]);

  const show = (i: number, inline: ScrollLogicalPosition) => {
    const el = track.current?.children[i] as HTMLElement | undefined;
    if (!el) return;
    announce.current = true;
    // container: 'nearest' scrolls the row only, never the page (ignored where unsupported)
    el.scrollIntoView({ behavior: reduced ? 'auto' : 'smooth', block: 'nearest', inline, container: 'nearest' } as ScrollIntoViewOptions);
  };
  // focus scrolls a slide only just into view, and snapping can leave it clipped at the edge: bring it to the start
  const reveal = (target: EventTarget) => requestAnimationFrame(() => {
    const t = track.current, slide = (target as HTMLElement).closest?.('.dtx-carousel__slide');
    if (!t || !slide || slide.parentElement !== t) return;
    const s = slide.getBoundingClientRect(), r = t.getBoundingClientRect();
    if (s.left < r.left - 1 || s.right > r.right + 1) slide.scrollIntoView({ behavior: reduced ? 'auto' : 'smooth', block: 'nearest', inline: 'start', container: 'nearest' } as ScrollIntoViewOptions);
  });
  const atStart = !visible.length || first === 0, atEnd = !!visible.length && last === n - 1;

  if (!n) return null;
  return (
    <section className={cx('dtx-carousel', className)} aria-roledescription="carousel" aria-label={label}>
      <div ref={track} className="dtx-carousel__track" tabIndex={0} role="group" aria-label="Các slide" onFocus={e => reveal(e.target)} style={{ '--slide-w': slideWidth, '--gap': `${gap}px` } as CSSProperties}>
        {slides.map((s, i) => (
          <div key={i} data-index={i} className="dtx-carousel__slide" role="group" aria-roledescription="slide" aria-label={`${i + 1} / ${n}`}>{s}</div>
        ))}
      </div>
      {visible.length < n && (
        <div className="dtx-carousel__bar">
          {indicators && (n <= MAX_DOTS
            ? <div className="dtx-carousel__dots">
                {slides.map((_, i) => <button key={i} type="button" className="dtx-carousel__dot" aria-label={`Tới slide ${i + 1}`} aria-current={visible.includes(i) || undefined} onClick={() => show(i, 'start')} />)}
              </div>
            : <span className="dtx-carousel__count dtx-num" aria-hidden>{range} / {n}</span>)}
          {/* aria-disabled, not disabled: the button keeps focus when the row reaches its end */}
          <div className="dtx-carousel__nav">
            <Button variant="secondary" size="sm" icon aria-label="Slide trước" aria-disabled={atStart || undefined} onClick={() => { if (!atStart) show(first - 1, 'end'); }}><ChevronLeft aria-hidden /></Button>
            <Button variant="secondary" size="sm" icon aria-label="Slide tiếp" aria-disabled={atEnd || undefined} onClick={() => { if (!atEnd) show(last + 1, 'start'); }}><ChevronRight aria-hidden /></Button>
          </div>
        </div>
      )}
      <p className="dtx-sr" aria-live="polite">{live}</p>
    </section>
  );
}
