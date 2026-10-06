import type { ReactNode } from 'react';
import { cx } from '../cx';
import type { Tone } from '../core/badge';

export type KpiCardProps = {
  label: string;
  /** Top-right status: a <Badge>. */
  badge?: ReactNode;
  value: ReactNode;
  unit?: ReactNode;
  /** 28px visual row: <Sparkline>, <TargetBar>, <CategoryBar>. Keep every card in a row filled. */
  viz?: ReactNode;
  caption?: ReactNode;
  captionIcon?: ReactNode;
  /** Colours the caption icon only. */
  tone?: Tone;
};

/** One structure for every KPI (shadcn section-cards + Tremor): attention is shown by badge, viz and icon, never by card chrome. */
export function KpiCard({ label, badge, value, unit, viz, caption, captionIcon, tone = 'brand' }: KpiCardProps) {
  return (
    <div className="dtx-card dtx-kpi">
      <div className="dtx-kpi__top"><span className="dtx-kpi__label">{label}</span>{badge}</div>
      <span className="dtx-kpi__value">{value}{unit && <small>{unit}</small>}</span>
      <div className="dtx-kpi__viz">{viz}</div>
      <div className={cx('dtx-kpi__cap', `dtx-tone-${tone}`)}>{captionIcon}<span>{caption}</span></div>
    </div>
  );
}
