/**
 * # EmptyState
 *
 * What a list, table, panel or page shows when it has nothing to show. It says what happened and offers one way forward.
 * Every empty or failed-load view in the kit renders it (DataTable, NotificationList, PdfViewer, CommandPalette),
 * so they all look and read the same.
 *
 * ```tsx
 * import { EmptyState, Button } from '@dgtx/ui-frek';
 *
 * <EmptyState mascot title="No batches yet" action={<Button onClick={create}>Create your first batch</Button>}>
 *   Upload records to start digitising. The system accepts PDF, TIFF and photos.
 * </EmptyState>
 *
 * <DataTable rows={rows} columns={columns} rowKey={r => r.id}
 *   empty={<EmptyState size="sm" icon={<ListFilter />} title="No batches match the filters" action={<Button variant="secondary" size="sm" onClick={reset}>Clear filters</Button>} />} />
 * ```
 *
 * ## Notes
 *
 * - Five cases, five messages. Each says what happened and what to do next:
 *   - first use: the mascot, what this place is for, the primary action ("Create your first batch");
 *   - no results: echo the query, suggest a shorter or different one;
 *   - filtered to nothing: name the filters as the cause, offer "Clear filters";
 *   - no permission: who can grant it, offer to ask;
 *   - load failure: `tone="err"`, what failed and "Retry".
 * - The mascot is for first use, onboarding and 404 only (brand), at 120px (`md`) or 64px (`sm`). Never next to an error.
 * - `tone="err"` gets `role="alert"` and the error icon in red. The others are `role="status"`; pass `role` to override
 *   (e.g. `role={undefined}` inside a container that already is a live region).
 * - `size="sm"` fits panels, popovers and tables (24px icon, 32px padding); `md` fits a page or a card section.
 * - Keep one primary action. A second, quieter one (ghost button or link) is fine.
 *
 * ## Props
 *
 * ### EmptyState
 *
 * | Prop | Type | Default | Description |
 * |---|---|---|---|
 * | `title` | `ReactNode` | **required** | What the user is looking at, e.g. "No batches yet" |
 * | `children` | `ReactNode` |  | What to do next |
 * | `icon` | `ReactNode` |  | Lucide icon above the title; `'err'` defaults to the error icon |
 * | `mascot` | `boolean` |  | The robot instead of the icon: first use, onboarding, 404 only |
 * | `action` | `ReactNode` |  | One way forward, e.g. a button |
 * | `tone` | `'neutral' \| 'err'` | `'neutral'` | `'err'`: red icon, `role="alert"` |
 * | `size` | `'sm' \| 'md'` | `'md'` | `sm` for panels, popovers and tables |
 * | `className` | `string` |  | Extra classes |
 *
 * Plus every `<div>` prop (`role`, `id`, `aria-*`).
 *
 * ## Files
 *
 * - `empty-state.tsx`: EmptyState. Uses `mascotUrl` from `brand/logo.tsx` and the error icon from `badge.tsx`.
 * - `empty-state.css`: `.dtx-empty*`.
 *
 
 */

import type { ComponentProps, ReactNode } from 'react';
import { cx } from '../../cx';
import { mascotUrl } from '../../brand/logo';
import { toneIcon } from '../badge/badge';

export type EmptyStateProps = Omit<ComponentProps<'div'>, 'title'> & {
  /** What the user is looking at, e.g. "No batches yet", "No results for “HD-99”". */
  title: ReactNode;
  /** What to do next. */
  children?: ReactNode;
  /** Lucide icon above the title. 'err' defaults to the error icon. */
  icon?: ReactNode;
  /** The DIGI-TEXX robot instead of the icon: first use, onboarding and 404 only (brand). */
  mascot?: boolean;
  /** One way forward: a primary button, or a secondary one plus a link. */
  action?: ReactNode;
  /** 'err' = loading failed: red icon, announced at once. */
  tone?: 'neutral' | 'err';
  /** sm for panels, popovers and tables; md for a page or a card section. */
  size?: 'sm' | 'md';
  className?: string;
};

/**
 * What a list, table or page shows when it has nothing to show: first use, no results, filtered to nothing,
 * no permission or a failed load. Says what happened and offers one way forward.
 */
export function EmptyState({ title, children, icon, mascot, action, tone = 'neutral', size = 'md', className, ...rest }: EmptyStateProps) {
  const art = icon ?? (tone === 'err' ? toneIcon.err : null);
  const px = size === 'sm' ? 64 : 120;
  return (
    <div role={tone === 'err' ? 'alert' : 'status'} className={cx('dtx-empty', `dtx-empty--${size}`, tone === 'err' && 'dtx-empty--err', className)} {...rest}>
      {mascot
        ? <img className="dtx-empty__mascot" src={mascotUrl} alt="" width={px} height={Math.round(px * 440 / 405)} />
        : art && <span className="dtx-empty__icon" aria-hidden>{art}</span>}
      <p className="dtx-empty__title">{title}</p>
      {children && <div className="dtx-empty__desc">{children}</div>}
      {action && <div className="dtx-empty__actions">{action}</div>}
    </div>
  );
}
