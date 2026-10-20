/**
 * # Carousel
 *
 * A row of slides that scrolls sideways: announcements, a strip of cards, a set of images. Built on native scroll
 * snapping, so swipe, trackpad and mouse wheel work without extra code.
 *
 * ```tsx
 * import { Carousel } from '@dgtx/ui-frek';
 *
 * // one slide at a time
 * <Carousel aria-label="Latest news">
 *   {news.map(n => <NewsSlide key={n.id} {...n} />)}
 * </Carousel>
 *
 * // a row of cards, the next one peeking
 * <Carousel aria-label="Recent batches" slideWidth="min(260px, 80%)">
 *   {batches.map(b => <BatchCard key={b.id} batch={b} />)}
 * </Carousel>
 * ```
 *
 * ## Notes
 *
 * - The slides sit in a scroll box with `scroll-snap`. The arrow buttons move a page: "Next slide" brings the first
 *   hidden slide to the start, "Previous slide" brings the previous one to the end. The row itself takes focus, and then
 *   ←/→ scroll it.
 * - With 10 slides or fewer the dots show which slides are in view (longer blue pills) and jump to a slide. With more,
 *   a "3–5 / 20" count replaces them. `indicators={false}` leaves only the arrows.
 * - At either end the arrow is `aria-disabled`, not `disabled`, so keyboard focus stays on it. When every slide fits,
 *   the controls are hidden.
 * - A slide counts as shown when 60% of it is in view.
 * - Follows the WAI-ARIA carousel pattern: a `<section aria-roledescription="carousel">` named by `aria-label`, each
 *   slide a group named "3 / 8". A move made with the buttons or dots is announced ("Showing 3–5 / 20"); a swipe is not.
 * - Autoplay is off by default: moving content is rarely read. `autoPlay` advances a page every `interval` ms and wraps
 *   to the start. It adds a pause button (WCAG 2.2.2), holds while the mouse is over the carousel or it is off-screen,
 *   and stops for good when keyboard focus enters a slide. Rotation is not announced. Under reduced motion it starts
 *   paused, and the row jumps instead of scrolling smoothly.
 *
 * ```tsx
 * <Carousel aria-label="Announcements" autoPlay interval={6000}>…</Carousel>
 * ```
 * - Slide content keeps its focus ring: the scroll box has 4px of room around it. Equal slide heights come from the grid;
 *   give slide content `height: 100%` to fill them.
 *
 * ## Props
 *
 * ### Carousel
 *
 * | Prop | Type | Default | Description |
 * |---|---|---|---|
 * | `children` | `ReactNode` | **required** | One child per slide |
 * | `aria-label` | `string` | **required** | Names the carousel |
 * | `slideWidth` | `string` | `'100%'` | Any CSS width, e.g. `'min(260px, 80%)'` for a card row |
 * | `gap` | `number` | `16` | Space between slides, in px |
 * | `indicators` | `boolean` | `true` | Dots (≤ 10 slides) or a count beside the arrows |
 * | `autoPlay` | `boolean` | `false` | Advance a page every `interval`, wrapping; adds a pause button |
 * | `interval` | `number` | `5000` | Time on each page with `autoPlay`, in ms |
 * | `className` | `string` |  | Extra classes |
 *
 * ## Files
 *
 * - `carousel.tsx`: Carousel
 * - `carousel.css`: `.dtx-carousel*`
 *
 * Catalog: `#/catalog/carousel`
 *
 
 */

import { Children, useEffect, useRef, useState, type CSSProperties, type ReactNode } from 'react';
import { ChevronLeft, ChevronRight, Pause, Play } from 'lucide-react';
import { cx } from '../../cx';
import { useReducedMotion } from '../../motion/primitives';
import { Button } from '../button/button';

export type CarouselProps = {
  /** One child per slide. */
  children: ReactNode;
  /** Names the carousel, e.g. "News". Required: a page can hold several. */
  'aria-label': string;
  /** Any CSS width. '100%' shows one slide at a time; 'min(260px, 80%)' shows a row of cards with the next one peeking. */
  slideWidth?: string;
  /** Space between slides, in px. */
  gap?: number;
  /** Dots (10 slides or fewer) or a "3–5 / 20" count beside the arrows. */
  indicators?: boolean;
  /** Advance a page every `interval` ms, wrapping at the end. Adds a pause button; holds while hovered or off-screen,
   * stops for good once keyboard focus enters a slide. Starts paused under reduced motion. */
  autoPlay?: boolean;
  /** Time on each page when `autoPlay` is on, in ms. */
  interval?: number;
  className?: string;
};

const MAX_DOTS = 10;

/**
 * A row of slides that scrolls sideways with native scroll snapping: swipe, trackpad, the arrow buttons, the dots,
 * or arrow keys once the row has focus. Controls hide when every slide fits. Optional autoplay with a pause button.
 */
export function Carousel({ children, 'aria-label': label, slideWidth = '100%', gap = 16, indicators = true, autoPlay = false, interval = 5000, className }: CarouselProps) {
  const slides = Children.toArray(children);
  const n = slides.length;
  const track = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState<number[]>([]);
  const [live, setLive] = useState('');
  const announce = useRef(false);
  const reduced = useReducedMotion();
  const root = useRef<HTMLElement>(null);
  // undefined until the user picks: then reduced motion decides
  const [paused, setPaused] = useState<boolean>();
  const [hover, setHover] = useState(false);
  const [onScreen, setOnScreen] = useState(false);
  const playing = autoPlay && !(paused ?? reduced);

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
    const id = setTimeout(() => { setLive(`Showing ${range} / ${n}`); announce.current = false; }, 300);
    return () => clearTimeout(id);
  }, [range, n, visible.length]);

  const show = (i: number, inline: ScrollLogicalPosition, speak = true) => {
    const el = track.current?.children[i] as HTMLElement | undefined;
    if (!el) return;
    announce.current = speak;
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

  useEffect(() => {
    const el = root.current;
    if (!autoPlay || !el) return;
    const io = new IntersectionObserver(([e]) => setOnScreen(e.isIntersecting));
    io.observe(el);
    return () => io.disconnect();
  }, [autoPlay, n]);
  // a page every interval, counted from where the row settled, so a manual move restarts the clock;
  // rotation is not announced (WAI-ARIA carousel: the live region stays quiet while it runs)
  useEffect(() => {
    if (!playing || hover || !onScreen || !visible.length || visible.length >= n) return;
    const id = setTimeout(() => show(atEnd ? 0 : last + 1, 'start', false), interval);
    return () => clearTimeout(id);
  }, [playing, hover, onScreen, first, last, atEnd, interval, n]); // eslint-disable-line react-hooks/exhaustive-deps

  if (!n) return null;
  return (
    <section ref={root} className={cx('dtx-carousel', className)} aria-roledescription="carousel" aria-label={label}
      onPointerEnter={e => { if (e.pointerType === 'mouse') setHover(true); }} onPointerLeave={() => setHover(false)}>
      <div ref={track} className="dtx-carousel__track" tabIndex={0} role="group" aria-label="Slides"
        onFocus={e => { reveal(e.target); if (autoPlay && e.target.matches(':focus-visible')) setPaused(true); }} style={{ '--slide-w': slideWidth, '--gap': `${gap}px` } as CSSProperties}>
        {slides.map((s, i) => (
          <div key={i} data-index={i} className="dtx-carousel__slide" role="group" aria-roledescription="slide" aria-label={`${i + 1} / ${n}`}>{s}</div>
        ))}
      </div>
      {visible.length < n && (
        <div className="dtx-carousel__bar">
          {indicators && (n <= MAX_DOTS
            ? <div className="dtx-carousel__dots">
                {slides.map((_, i) => <button key={i} type="button" className="dtx-carousel__dot" aria-label={`Go to slide ${i + 1}`} aria-current={visible.includes(i) || undefined} onClick={() => show(i, 'start')} />)}
              </div>
            : <span className="dtx-carousel__count dtx-num" aria-hidden>{range} / {n}</span>)}
          {/* aria-disabled, not disabled: the button keeps focus when the row reaches its end */}
          <div className="dtx-carousel__nav">
            {autoPlay && <Button variant="ghost" size="sm" icon aria-label={playing ? 'Stop autoplay' : 'Start autoplay'} onClick={() => setPaused(playing)}>{playing ? <Pause aria-hidden /> : <Play aria-hidden />}</Button>}
            <Button variant="secondary" size="sm" icon aria-label="Previous slide" aria-disabled={atStart || undefined} onClick={() => { if (!atStart) show(first - 1, 'end'); }}><ChevronLeft aria-hidden /></Button>
            <Button variant="secondary" size="sm" icon aria-label="Next slide" aria-disabled={atEnd || undefined} onClick={() => { if (!atEnd) show(last + 1, 'start'); }}><ChevronRight aria-hidden /></Button>
          </div>
        </div>
      )}
      <p className="dtx-sr" aria-live="polite">{live}</p>
    </section>
  );
}
