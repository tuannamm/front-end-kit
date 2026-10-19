/**
 * # Badge · Counter · ProgressRing · Kbd · IconTile
 *
 * Small status labels and the helpers that sit inside them. Also owns `Tone`, the colour vocabulary that
 * Icon, Select and KpiCard reuse.
 *
 * ```tsx
 * import { Badge, Counter, ProgressRing, Kbd, IconTile } from '@dgtx/ui-frek';
 *
 * <Badge tone="ok" dot>Completed</Badge>
 * <Badge tone="brand" live>Processing</Badge>
 * <Badge tone="neutral" onRemove={() => drop(tag)}>{tag}</Badge>
 * <Counter>12</Counter>
 * <Badge icon={<ProgressRing value={60} />}>60%</Badge>
 * <Kbd>⌘K</Kbd>
 * ```
 *
 * ## Tones
 *
 * `brand · ok · warn · err · neutral · violet`. Each tone sets `--c` (an RGB triple) and `--t` (a text token).
 * Every variant (`soft`, `surface`, `outline`, `solid`) mixes from these two, so one rule works in both themes.
 * Violet is for AI only and always sits next to blue.
 *
 * ## Notes
 *
 * - `live`: a pulsing dot. Use it only while a process really runs.
 * - `pill`: use only for trend deltas. Other badges stay square, like the logo.
 * - `solid` on lime/amber uses ink text in both themes (`theme-fixed` in the CSS).
 * - The remove button is 16px with a 24px hit area (WCAG 2.5.8). Its label defaults to "Remove".
 * - `ProgressRing` is decorative unless you pass `label`.
 *
 * ## Props
 *
 * ### Badge
 *
 * | Prop | Type | Default | Description |
 * |---|---|---|---|
 * | `tone` | `Tone` | `'brand'` | `brand · ok · warn · err · neutral · violet` |
 * | `variant` | `'soft' \| 'surface' \| 'outline' \| 'solid'` | `'soft'` | Fill strength |
 * | `size` | `'sm' \| 'md' \| 'lg'` | `'md'` | 18 · 22 · 26px tall |
 * | `pill` | `boolean` |  | Pill shape: reserve for trend deltas |
 * | `dot` | `boolean` |  | Leading square dot (logo motif) |
 * | `live` | `boolean` |  | Pulsing dot: only while a process is running. Implies `dot` |
 * | `icon` | `ReactNode` |  | Leading icon, sized to 12px |
 * | `onRemove` | `() => void` |  | Shows a remove button (24px hit area) |
 * | `removeLabel` | `string` | `'Remove'` | Accessible name of the remove button |
 * | `children` | `ReactNode` |  | Text |
 * | `className` | `string` |  | Extra classes |
 *
 * Plus every `<span>` prop.
 *
 * ### Counter
 *
 * | Prop | Type | Default | Description |
 * |---|---|---|---|
 * | `tone` | `Tone` | `'neutral'` | Colour |
 * | `solid` | `boolean` |  | Solid fill, for counts that need attention |
 * | `children` | `ReactNode` | **required** | The number |
 * | `className` | `string` |  | Extra classes |
 *
 * ### ProgressRing
 *
 * | Prop | Type | Default | Description |
 * |---|---|---|---|
 * | `value` | `number` | **required** | 0–100, clamped |
 * | `size` | `number` | `12` | Pixels |
 * | `label` | `string` |  | Accessible name. Without it the ring is decorative |
 *
 * ### Kbd
 *
 * | Prop | Type | Default | Description |
 * |---|---|---|---|
 * | `children` | `ReactNode` | **required** | Key or shortcut, e.g. `⌘K` |
 *
 * ### IconTile
 *
 * | Prop | Type | Default | Description |
 * |---|---|---|---|
 * | `tone` | `Tone` | `'brand'` | Tint of the tile and colour of the icon |
 * | `children` | `ReactNode` | **required** | The icon, sized to 13px |
 *
 * ## Files
 *
 * - `badge.tsx`: Badge, Counter, ProgressRing, Kbd, IconTile, `Tone`
 * - `badge.css`: `.dtx-badge*`, `.dtx-tone-*`, `.dtx-dot`, `.dtx-ring`, `.dtx-kbd`, `.dtx-icon-tile`
 *
 * Catalog: `#/catalog/badge`, `#/catalog/counter`
 *
 * @generated from README.md in this folder. Edit the README, then run `npm run docs:sync`.
 */

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

export function Badge({ tone = 'brand', variant = 'soft', size = 'md', pill, dot, live, icon, onRemove, removeLabel = 'Remove', className, children, ...rest }: BadgeProps) {
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
