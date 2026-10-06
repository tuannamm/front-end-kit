import type { CSSProperties } from 'react';

/** Area sparkline scaled to its own min/max. */
export function Sparkline({ data, label }: { data: number[]; label?: string }) {
  const min = Math.min(...data), max = Math.max(...data), span = max - min || 1;
  const pts = data.map((v, i) => `${(i * 100) / (data.length - 1)},${(26 - ((v - min) / span) * 24).toFixed(1)}`).join(' ');
  return (
    <svg className="dtx-spark" viewBox="0 0 100 28" preserveAspectRatio="none" role={label ? 'img' : undefined} aria-label={label} aria-hidden={label ? undefined : true}>
      <polyline points={`0,28 ${pts} 100,28`} fill="rgb(37 130 215 / .12)" stroke="none" />
      <polyline points={pts} fill="none" stroke="var(--dtx-primary)" strokeWidth="1.6" vectorEffect="non-scaling-stroke" />
    </svg>
  );
}

/** Linear bar against a target marker. min/max set the visible scale. */
export function TargetBar({ value, target, min = 0, max = 100, label }: { value: number; target: number; min?: number; max?: number; label: string }) {
  const pct = (v: number) => `${Math.max(0, Math.min(100, ((v - min) / (max - min)) * 100))}%`;
  return <div className="dtx-target" role="img" aria-label={label}><i style={{ width: pct(value) }} /><u style={{ left: pct(target) }} /></div>;
}

export type Segment = { value: number; color: string; label: string };
/** Proportional split (Tremor category bar). Tiny segments keep a visible minimum width. */
export function CategoryBar({ segments, legend }: { segments: Segment[]; legend?: boolean }) {
  const label = segments.map(s => `${s.value} ${s.label}`).join(', ');
  return (
    <div>
      <div className="dtx-catbar" role="img" aria-label={label}>
        {segments.map(s => <i key={s.label} style={{ flex: s.value, minWidth: 6, background: s.color }} />)}
      </div>
      {legend && <div className="dtx-legend" style={{ marginTop: 8 }}>{segments.map(s => <span key={s.label} style={{ '--k': s.color } as CSSProperties}>{s.label}</span>)}</div>}
    </div>
  );
}

/** Thin progress meter (queues, uploads). value: 0–100. */
export function Meter({ value, label }: { value: number; label: string }) {
  return <div className="dtx-meter" role="meter" aria-valuenow={value} aria-valuemin={0} aria-valuemax={100} aria-label={label}><i style={{ width: `${value}%` }} /></div>;
}

export type Series = { name: string; color: string; data: number[] };
/** Stacked column chart; one scale drives bars, gridlines and labels. */
export function StackedBarChart({ labels, series, max, step, height = 220, label }: { labels: string[]; series: Series[]; max?: number; step?: number; height?: number; label: string }) {
  const totals = labels.map((_, i) => series.reduce((s, x) => s + x.data[i], 0));
  const top = max ?? Math.ceil(Math.max(...totals) / 1000) * 1000;
  const tick = step ?? top / 4;
  const W = 640, H = height, L = 44, R = 8, T = 10, B = 26;
  const y = (v: number) => T + (H - T - B) * (1 - v / top);
  const bw = (W - L - R) / labels.length;
  const ticks = Array.from({ length: Math.floor(top / tick) + 1 }, (_, i) => i * tick);
  return (
    <div>
      <svg className="dtx-chart" viewBox={`0 0 ${W} ${H}`} role="img" aria-label={label}>
        {ticks.map(v => (
          <g key={v}>
            <line x1={L} x2={W - R} y1={y(v)} y2={y(v)} stroke="var(--dtx-border)" />
            <text x={L - 8} y={y(v) + 4} textAnchor="end">{v >= 1000 ? `${v / 1000}k` : v}</text>
          </g>
        ))}
        {labels.map((lab, i) => {
          const x = L + i * bw + bw * .2, w = bw * .6;
          let acc = 0;
          return (
            <g key={lab}>
              {series.map(s => {
                const y0 = y(acc), y1 = y(acc + s.data[i]); acc += s.data[i];
                return <rect key={s.name} x={x} y={y1} width={w} height={Math.max(0, y0 - y1 - 1)} rx="2" fill={s.color} style={{ animationDelay: `${i * 40}ms` }}><title>{`${lab}: ${s.data[i]} ${s.name}`}</title></rect>;
              })}
              <text x={x + w / 2} y={H - 8} textAnchor="middle">{lab}</text>
            </g>
          );
        })}
      </svg>
      <div className="dtx-legend">{series.map(s => <span key={s.name} style={{ '--k': s.color } as CSSProperties}>{s.name}</span>)}</div>
    </div>
  );
}
