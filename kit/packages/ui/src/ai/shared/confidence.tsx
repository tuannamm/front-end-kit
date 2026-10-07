import { Badge } from '../../core/badge/badge';

export type ConfidenceLevel = 'high' | 'medium' | 'low';
export type Thresholds = { high: number; low: number };
export const defaultThresholds: Thresholds = { high: 95, low: 80 };

/** ≥ high → high, < low → low, otherwise medium. */
export function confidenceLevel(v: number, t: Thresholds = defaultThresholds): ConfidenceLevel {
  return v >= t.high ? 'high' : v < t.low ? 'low' : 'medium';
}
const tone = { high: 'ok', medium: 'warn', low: 'err' } as const;
export const confidenceWord = { high: 'Tin cậy cao', medium: 'Cần kiểm tra', low: 'Tin cậy thấp' };
const word = confidenceWord;

/** OCR confidence as a badge. `showLabel` adds the review hint for QC screens. */
export function ConfidenceBadge({ value, thresholds, showLabel, size = 'sm' }: { value: number; thresholds?: Thresholds; showLabel?: boolean; size?: 'sm' | 'md' }) {
  const lv = confidenceLevel(value, thresholds);
  return <Badge tone={tone[lv]} variant="surface" size={size} dot aria-label={`Độ tin cậy ${value.toFixed(1)}%: ${word[lv]}`}>{value.toFixed(1)}%{showLabel && ` · ${word[lv]}`}</Badge>;
}

/** Thin bar with threshold ticks; colour follows the level. */
export function ConfidenceBar({ value, thresholds = defaultThresholds }: { value: number; thresholds?: Thresholds }) {
  const lv = confidenceLevel(value, thresholds);
  return (
    <div className="dtx-conf" data-level={lv} role="meter" aria-valuenow={value} aria-valuemin={0} aria-valuemax={100} aria-label={`Độ tin cậy ${value.toFixed(1)}%`}>
      <i style={{ width: `${value}%` }} />
      <u style={{ left: `${thresholds.low}%` }} /><u style={{ left: `${thresholds.high}%` }} />
    </div>
  );
}

/** Five square dots (logo motif). 99→5, 95→4, 90→3, 85→2, ≤80→1. Colour follows the level. */
export function ConfidenceDots({ value, thresholds = defaultThresholds }: { value: number; thresholds?: Thresholds }) {
  const lv = confidenceLevel(value, thresholds);
  const filled = Math.max(1, Math.min(5, Math.round((value - 75) / 5)));
  return (
    <span className="dtx-conf-dots" data-level={lv} role="img" aria-label={`Độ tin cậy ${value.toFixed(1)}%: ${word[lv]}`}>
      {[1, 2, 3, 4, 5].map(i => <i key={i} data-on={i <= filled ? '' : undefined} />)}
    </span>
  );
}
