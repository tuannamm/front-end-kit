import { isValidElement, useId, useLayoutEffect, useRef, useState, type KeyboardEvent, type PointerEvent, type ReactNode } from 'react';
import { cx } from '../cx';
import { EmptyState } from '../core/empty-state/empty-state';
import { areaPath, linePath, niceScale, runs, type Pt } from './xy-scale';

export type ChartSeries = { name: string; data: (number | null)[]; color?: string };

type XYProps = {
  labels: string[];
  series: ChartSeries[];
  label: string;
  height?: number;
  min?: number;
  max?: number;
  format?: Intl.NumberFormatOptions;
  curve?: 'linear' | 'smooth';
  legend?: boolean;
  defaultActive?: number;
  empty?: ReactNode;
  className?: string;
};

const LOCALE = 'vi-VN';
/** Theme-aware and at least 3:1 on the page in both themes. Blue leads; the brand accents follow it. */
const PALETTE = ['var(--dtx-primary)', 'var(--dtx-tone-ok)', 'var(--dtx-tone-violet)', 'var(--dtx-tone-warn)', 'var(--dtx-tone-err)'];
/** Second channel beside colour: every series after the first has its own dash, in the lines and the legend. */
const DASHES = [undefined, '6 4', '2 3', '10 3 2 3', '1 3'];
const CHAR = 6.6; // average width of a 12px Roboto digit or letter, to size the axis gutters without measuring text

/** Trend over ordered labels (days, hours, months): one line per series, a hover or arrow-key readout of every value. */
export function LineChart({ labels, series, label, height = 240, min, max, format, curve = 'linear', legend, defaultActive, empty, className }: XYProps) {
  return <XYChart kind="line" {...{ labels, series, label, height, min, max, format, curve, legend, defaultActive, empty, className }} />;
}

/** LineChart with the area under each line filled; `stacked` piles the series up so the top edge is their total. */
export function AreaChart({ labels, series, label, height = 240, min, max, format, curve = 'linear', stacked = false, legend, defaultActive, empty, className }: XYProps & { stacked?: boolean }) {
  return <XYChart kind="area" {...{ labels, series, label, height, min, max, format, curve, stacked, legend, defaultActive, empty, className }} />;
}

function Swatch({ color, dash }: { color: string; dash?: string }) {
  return <svg className="dtx-xy__swatch" viewBox="0 0 18 8" aria-hidden><line x1="1" x2="17" y1="4" y2="4" stroke={color} strokeWidth="2.5" strokeDasharray={dash} strokeLinecap="round" /></svg>;
}

function XYChart({ kind, stacked = false, labels, series, label, height = 240, min, max, format, curve, legend = series.length > 1, defaultActive, empty = 'Chưa có dữ liệu', className }: XYProps & { kind: 'line' | 'area'; stacked?: boolean }) {
  const box = useRef<HTMLDivElement>(null);
  const [width, setWidth] = useState(0);
  // the readout rests on defaultActive (e.g. the latest value) and returns there when the pointer or focus leaves
  const rest = defaultActive ?? null;
  const [active, setActive] = useState<number | null>(rest);
  const [live, setLive] = useState('');
  const id = useId();

  useLayoutEffect(() => {
    const el = box.current;
    if (!el) return;
    const ro = new ResizeObserver(() => setWidth(el.clientWidth));
    ro.observe(el);
    setWidth(el.clientWidth);
    return () => ro.disconnect();
  }, []);

  const n = labels.length;
  const list = series.map((s, i) => ({ ...s, color: s.color ?? PALETTE[i % PALETTE.length], dash: DASHES[i % DASHES.length] }));
  // the top edge of each series: its own values, or the running total when stacked (a gap counts as 0 there)
  const tops = stacked
    ? list.map((_, k) => labels.map((_, i) => list.slice(0, k + 1).reduce((t, s) => t + (s.data[i] ?? 0), 0)))
    : list.map(s => labels.map((_, i) => s.data[i] ?? null));
  const values = tops.flat().filter((v): v is number => v !== null);
  const full = new Intl.NumberFormat(LOCALE, format), short = new Intl.NumberFormat(LOCALE, { notation: 'compact', ...format });
  const describe = (i: number) => `${labels[i]}: ${list.map(s => `${s.name} ${s.data[i] == null ? '–' : full.format(s.data[i]!)}`).join(', ')}`;

  // the plot box stays mounted through the empty state, so its width is known the moment data arrives
  if (!n || !values.length) {
    return (
      <div className={cx('dtx-xy', className)}>
        <div ref={box} className="dtx-xy__plot dtx-xy__empty" style={{ height }}>{isValidElement(empty) ? empty : <EmptyState size="sm" title={empty} />}</div>
      </div>
    );
  }

  const scale = niceScale(Math.min(0, ...values), Math.max(...values), { min, max });
  const tickText = scale.ticks.map(v => short.format(v));
  const T = 12, B = 30;
  const L = Math.max(...tickText.map(t => t.length)) * CHAR + 14;
  const R = Math.max(12, labels[n - 1].length * CHAR / 2 + 4);
  const pw = Math.max(0, width - L - R), ph = height - T - B;
  const x = (i: number) => (n === 1 ? L + pw / 2 : L + (i * pw) / (n - 1));
  const y = (v: number) => T + ph * (1 - (v - scale.min) / (scale.max - scale.min));
  const base = y(Math.min(scale.max, Math.max(scale.min, 0)));
  // thin the x labels so neighbours never touch
  const every = n === 1 ? 1 : Math.max(1, Math.ceil((Math.max(...labels.map(l => l.length)) * CHAR + 12) / (pw / (n - 1))));
  const smooth = curve === 'smooth';
  const points = tops.map(t => t.map((v, i): Pt | null => (v === null ? null : [x(i), y(v)])));

  const pick = (i: number) => setActive(Math.max(0, Math.min(n - 1, i)));
  const onPointer = (e: PointerEvent<HTMLDivElement>) => {
    const px = e.clientX - e.currentTarget.getBoundingClientRect().left;
    pick(n === 1 ? 0 : Math.round(((px - L) / pw) * (n - 1)));
  };
  const onKey = (e: KeyboardEvent<HTMLDivElement>) => {
    const to = { ArrowRight: (active ?? -1) + 1, ArrowLeft: (active ?? n) - 1, Home: 0, End: n - 1 }[e.key];
    if (to === undefined) { if (e.key === 'Escape') setActive(rest); return; }
    e.preventDefault();
    const i = Math.max(0, Math.min(n - 1, to));
    setActive(i);
    setLive(describe(i));
  };

  const tipLeft = active !== null && x(active) > width / 2;
  return (
    <div className={cx('dtx-xy', className)}>
      <div
        ref={box} className="dtx-xy__plot" style={{ height }} tabIndex={0} role="group" aria-label={label} aria-describedby={`${id}-hint`}
        onPointerMove={onPointer} onPointerDown={onPointer} onPointerLeave={e => { if (e.pointerType === 'mouse') setActive(rest); }}
        onKeyDown={onKey} onBlur={() => setActive(rest)}
      >
        {width > 0 && (
          <svg width={width} height={height} aria-hidden>
            <defs>
              <clipPath id={`${id}-clip`}><rect className="dtx-xy__reveal" x={L - 6} y={0} width={pw + R + 6} height={height - B + 4} /></clipPath>
              {kind === 'area' && list.map((s, k) => (
                <linearGradient key={k} id={`${id}-fill${k}`} x1="0" x2="0" y1="0" y2="1">
                  <stop offset="0" style={{ stopColor: s.color, stopOpacity: stacked ? .5 : .3 }} />
                  <stop offset="1" style={{ stopColor: s.color, stopOpacity: stacked ? .3 : .02 }} />
                </linearGradient>
              ))}
            </defs>
            {scale.ticks.map((v, i) => (
              <g key={v}>
                <line x1={L} x2={width - R} y1={y(v)} y2={y(v)} className={v === 0 ? 'dtx-xy__zero' : 'dtx-xy__grid'} />
                <text x={L - 8} y={y(v) + 4} textAnchor="end">{tickText[i]}</text>
              </g>
            ))}
            {labels.map((l, i) => i % every === 0 && <text key={i} x={x(i)} y={height - 10} textAnchor="middle">{l}</text>)}
            <g clipPath={`url(#${id}-clip)`}>
              {kind === 'area' && points.map((p, k) => {
                const lower = stacked && k > 0 ? points[k - 1].map((q, i) => q ?? [x(i), base] as Pt) : p.map((_, i) => [x(i), base] as Pt);
                return <path key={k} d={areaPath(p, lower as Pt[], smooth)} fill={`url(#${id}-fill${k})`} />;
              })}
              {points.map((p, k) => <path key={k} className="dtx-xy__line" d={linePath(p, smooth)} stroke={list[k].color} strokeDasharray={list[k].dash} />)}
              {/* a value with gaps on both sides has no line to sit on: give it a dot */}
              {points.map((p, k) => runs(p.map(q => (q ? 0 : null))).filter(r => r.length === 1).map(([i]) => <circle key={`${k}-${i}`} cx={p[i]![0]} cy={p[i]![1]} r="3" fill={list[k].color} />))}
            </g>
            {active !== null && (
              <g>
                <line className="dtx-xy__guide" x1={x(active)} x2={x(active)} y1={T} y2={height - B} />
                {points.map((p, k) => p[active] && <circle key={k} className="dtx-xy__dot" cx={p[active]![0]} cy={p[active]![1]} r="4" stroke={list[k].color} />)}
              </g>
            )}
          </svg>
        )}
        {active !== null && (
          <div className="dtx-xy__tip" style={{ left: x(active), top: T, translate: tipLeft ? 'calc(-100% - 12px) 0' : '12px 0' }} aria-hidden>
            <b>{labels[active]}</b>
            {list.map(s => (
              <span key={s.name} className="dtx-xy__row"><Swatch color={s.color} dash={s.dash} /><span>{s.name}</span><span className="dtx-num">{s.data[active] == null ? '–' : full.format(s.data[active]!)}</span></span>
            ))}
            {stacked && list.length > 1 && <span className="dtx-xy__row dtx-xy__total"><span /><span>Tổng</span><span className="dtx-num">{full.format(tops[tops.length - 1][active]!)}</span></span>}
          </div>
        )}
      </div>
      {legend && <div className="dtx-legend dtx-xy__legend" aria-hidden>{list.map(s => <span key={s.name}><Swatch color={s.color} dash={s.dash} />{s.name}</span>)}</div>}
      <span id={`${id}-hint`} className="dtx-sr">Dùng phím mũi tên trái, phải để đọc từng điểm.</span>
      <p className="dtx-sr" aria-live="polite">{live}</p>
      {/* the wrapper hides it: a table ignores the 1px box of .dtx-sr and would widen the page */}
      <div className="dtx-sr"><table>
        <caption>{label}</caption>
        <thead><tr><td />{list.map(s => <th key={s.name} scope="col">{s.name}</th>)}</tr></thead>
        <tbody>{labels.map((l, i) => <tr key={i}><th scope="row">{l}</th>{list.map(s => <td key={s.name}>{s.data[i] == null ? '–' : full.format(s.data[i]!)}</td>)}</tr>)}</tbody>
      </table></div>
    </div>
  );
}
