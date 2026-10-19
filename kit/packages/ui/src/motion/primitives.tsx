/**
 * # Motion
 *
 * Reusable motion, one phase per component: enter (`Reveal`), wait (`Skeleton`), both (`Loadable`), numbers (`CountUp`).
 * Under reduced motion everything shows its final state. `useReducedMotion()` returns the OS setting for JS-driven animation.
 *
 * ```tsx
 * import { Loadable, Reveal, CountUp } from '@dgtx/ui-frek';
 *
 * <Loadable loading={isLoading}><BatchList /></Loadable>
 * {items.map((it, i) => <Reveal key={it.id} index={i}>{…}</Reveal>)}
 * ```
 *
 * ## Props
 *
 * ### Reveal
 *
 * | Prop | Type | Default | Description |
 * |---|---|---|---|
 * | `children` | `ReactNode` | **required** | Content that enters |
 * | `effect` | `'fade' \| 'fade-up' \| 'scale' \| 'slide-in'` | `'fade-up'` | Enter animation; change `key` to replay |
 * | `delay` | `number` | `0` | ms before it starts |
 * | `index` | `number` | `0` | Position in a list; adds `index × stagger` to the delay |
 * | `stagger` | `number` | `60` | ms between list items |
 * | `className` | `string` |  | Extra classes |
 * | `style` | `CSSProperties` |  | Extra styles |
 *
 * ### Skeleton
 *
 * | Prop | Type | Default | Description |
 * |---|---|---|---|
 * | `width` | `number \| string` | `'100%'` | Match the final content so nothing shifts |
 * | `height` | `number \| string` | `10` | px or any CSS length |
 * | `radius` | `number` |  | Corner radius in px |
 * | `className` | `string` |  | Extra classes |
 *
 * ### SkeletonText
 *
 * | Prop | Type | Default | Description |
 * |---|---|---|---|
 * | `lines` | `number` | `3` | Number of lines; the first is taller, like a title |
 * | `label` | `string` | `'Loading'` | Accessible name of the loading status |
 *
 * ### Loadable
 *
 * | Prop | Type | Default | Description |
 * |---|---|---|---|
 * | `loading` | `boolean` | **required** | Skeleton while true, then the content enters |
 * | `children` | `ReactNode` | **required** | The loaded content |
 * | `skeleton` | `ReactNode` | `<SkeletonText />` | Placeholder shaped like the content |
 * | `effect` | `RevealEffect` | `'fade-up'` | How the content enters |
 *
 * ### CountUp
 *
 * | Prop | Type | Default | Description |
 * |---|---|---|---|
 * | `value` | `number` | **required** | Final number; counts from 0 on mount and when it changes |
 * | `decimals` | `number` | `0` | Fraction digits |
 * | `duration` | `number` | `900` | ms, ease-out |
 * | `locale` | `string` | `'en-US'` | Number format |
 *
 * ## Files
 *
 * - `primitives.tsx`: Reveal, Skeleton, SkeletonText, Loadable, CountUp, useReducedMotion
 * - Styles: `.dtx-enter-*`, `.dtx-skeleton*` and the keyframes in `styles.css`
 *
 * @generated from README.md in this folder. Edit the README, then run `npm run docs:sync`.
 */

import { useEffect, useRef, useState, useSyncExternalStore, type CSSProperties, type ReactNode } from 'react';
import { cx } from '../cx';

const mq = typeof window !== 'undefined' ? window.matchMedia('(prefers-reduced-motion: reduce)') : null;
/** True when the OS asks for reduced motion. Components use it to skip JS-driven animation. */
export function useReducedMotion() {
  return useSyncExternalStore(cb => { mq?.addEventListener('change', cb); return () => mq?.removeEventListener('change', cb); }, () => !!mq?.matches, () => false);
}

export type RevealEffect = 'fade' | 'fade-up' | 'scale' | 'slide-in';
/** Enter animation on mount. Change `key` to replay. Stagger lists with `index`. */
export function Reveal({ effect = 'fade-up', delay = 0, index = 0, stagger = 60, className, style, children }: { effect?: RevealEffect; delay?: number; index?: number; stagger?: number; className?: string; style?: CSSProperties; children: ReactNode }) {
  return <div className={cx(`dtx-enter-${effect}`, className)} style={{ animationDelay: `${delay + index * stagger}ms`, ...style }}>{children}</div>;
}

/** Placeholder block with shimmer. Match the final content's size so nothing shifts (CLS). */
export function Skeleton({ width = '100%', height = 10, radius, className }: { width?: number | string; height?: number | string; radius?: number; className?: string }) {
  return <span className={cx('dtx-skeleton', className)} style={{ width, height, borderRadius: radius }} aria-hidden />;
}

export function SkeletonText({ lines = 3, label = 'Loading' }: { lines?: number; label?: string }) {
  const widths = ['40%', '100%', '70%', '85%', '60%'];
  return (
    <div className="dtx-skeleton-stack" role="status" aria-label={label}>
      {Array.from({ length: lines }, (_, i) => <Skeleton key={i} width={widths[i % widths.length]} height={i === 0 ? 14 : 10} />)}
    </div>
  );
}

/** Skeleton while loading, then the content enters with `effect`. The two phases are Skeleton + Reveal. */
export function Loadable({ loading, skeleton, effect = 'fade-up', children }: { loading: boolean; skeleton?: ReactNode; effect?: RevealEffect; children: ReactNode }) {
  return loading ? <>{skeleton ?? <SkeletonText />}</> : <Reveal effect={effect}>{children}</Reveal>;
}

/** Counts from 0 to value (ease-out quart). Use on first load of KPI values only. */
export function CountUp({ value, decimals = 0, duration = 900, locale = 'en-US' }: { value: number; decimals?: number; duration?: number; locale?: string }) {
  const reduced = useReducedMotion();
  const [shown, setShown] = useState(reduced ? value : 0);
  const raf = useRef(0);
  useEffect(() => {
    if (reduced) { setShown(value); return; }
    const t0 = performance.now();
    const tick = (t: number) => {
      const k = Math.min(1, (t - t0) / duration);
      setShown(value * (1 - Math.pow(1 - k, 4)));
      if (k < 1) raf.current = requestAnimationFrame(tick);
    };
    raf.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf.current);
  }, [value, duration, reduced]);
  return <span className="dtx-num">{shown.toLocaleString(locale, { minimumFractionDigits: decimals, maximumFractionDigits: decimals })}</span>;
}
