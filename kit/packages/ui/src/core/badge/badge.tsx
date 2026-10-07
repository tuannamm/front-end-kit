import type { ComponentProps, ReactNode } from 'react';
import { AlertTriangle, CheckCircle2, CircleAlert, Info, X } from 'lucide-react';
import { cx } from '../../cx';

export type Tone = 'brand' | 'ok' | 'warn' | 'err' | 'neutral' | 'violet';
/** The tones that report a state; each has one icon, shared by Toast and Alert. */
export type StatusTone = 'brand' | 'ok' | 'warn' | 'err';
export const toneIcon: Record<StatusTone, ReactNode> = { brand: <Info />, ok: <CheckCircle2 />, warn: <AlertTriangle />, err: <CircleAlert /> };

export type BadgeProps = ComponentProps<'span'> & {
  tone?: Tone;
  variant?: 'soft' | 'surface' | 'outline' | 'solid';
  size?: 'sm' | 'md' | 'lg';
  /** Pill shape: reserve for trend deltas. */
  pill?: boolean;
  /** Leading square dot (logo motif). */
  dot?: boolean;
  /** Pulsing dot: only while a process is running. Implies dot. */
  live?: boolean;
  icon?: ReactNode;
  onRemove?: () => void;
  removeLabel?: string;
};

export function Badge({ tone = 'brand', variant = 'soft', size = 'md', pill, dot, live, icon, onRemove, removeLabel = 'Xoá', className, children, ...rest }: BadgeProps) {
  return (
    <span className={cx('dtx-badge', `dtx-tone-${tone}`, variant !== 'soft' && `dtx-badge--${variant}`, size !== 'md' && `dtx-badge--${size}`, pill && 'dtx-badge--pill', className)} {...rest}>
      {(dot || live) && <i className={cx('dtx-dot', live && 'dtx-dot--live')} aria-hidden />}
      {icon}
      {children}
      {onRemove && <button type="button" className="dtx-badge__remove" aria-label={removeLabel} onClick={onRemove}><X size={10} strokeWidth={2.5} /></button>}
    </span>
  );
}

/** Tabular count for nav items and tabs. */
export function Counter({ tone = 'neutral', solid, children, className }: { tone?: Tone; solid?: boolean; children: ReactNode; className?: string }) {
  return <span className={cx('dtx-badge dtx-badge--counter', `dtx-tone-${tone}`, solid && 'dtx-badge--solid', className)}>{children}</span>;
}

/** 12px progress ring, usable inside a Badge or standalone. value: 0–100. */
export function ProgressRing({ value, size = 12, label }: { value: number; size?: number; label?: string }) {
  const C = 2 * Math.PI * 6, v = Math.max(0, Math.min(100, value));
  return (
    <svg className="dtx-ring" width={size} height={size} viewBox="0 0 16 16" role={label ? 'img' : undefined} aria-label={label} aria-hidden={label ? undefined : true}>
      <circle cx="8" cy="8" r="6" fill="none" stroke="currentColor" strokeOpacity=".25" strokeWidth="2.4" />
      <circle cx="8" cy="8" r="6" fill="none" stroke="currentColor" strokeWidth="2.4" strokeDasharray={C} strokeDashoffset={C * (1 - v / 100)} transform="rotate(-90 8 8)" />
    </svg>
  );
}

export function Kbd({ children }: { children: ReactNode }) {
  return <kbd className="dtx-kbd">{children}</kbd>;
}

/** Small tinted square that holds an icon (select options, lists). */
export function IconTile({ tone = 'brand', children }: { tone?: Tone; children: ReactNode }) {
  return <span className={cx('dtx-icon-tile', `dtx-tone-${tone}`)} aria-hidden>{children}</span>;
}
