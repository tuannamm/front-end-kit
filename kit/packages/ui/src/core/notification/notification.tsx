/**
 * # Notification · NotificationList
 *
 * A bell button with the unread count. Clicking it opens the list of notifications in a popover.
 * `NotificationList` is that panel on its own, for a full "all notifications" page.
 *
 * ```tsx
 * import { Notification, NotificationList, Button } from '@dgtx/ui-frek';
 *
 * <Notification
 *   items={notifications}                                   // newest first; the app decides the order
 *   onSelect={n => markRead(n.id)}
 *   onMarkAllRead={markAllRead}
 *   footer={<Button variant="ghost" size="sm" href="/notifications">View all notifications</Button>}
 * />
 *
 * <NotificationList items={notifications} loading={isLoading} error={loadError} onRetry={reload} />
 * ```
 *
 * ## Notes
 *
 * - **Nothing is fetched or marked here.** The app passes `items`, marks a row read in `onSelect`, and loads more
 *   in `onOpenChange(true)` if it wants fresh data on open.
 * - **Count:** the unread count is derived from `items` (`read !== true`). It shows "99+" above 99 and pops again when it grows.
 *   The bell's accessible name says it too: "Notifications, 3 unread".
 * - **Unread rows** get a blue tint, a medium-weight title, a square dot and a hidden "Unread:" prefix, so the
 *   state never depends on colour alone.
 * - **Rows:** a link when the item has `href`, a button when there is `onSelect`, plain text otherwise.
 *   Picking a row closes the popover. The description is clamped to two lines.
 * - **Time:** `relativeTime` shows "Just now", "5 minutes ago", "3 hours ago", then calendar days ("yesterday", "2 days ago",
 *   "6 days ago"), then the date. The exact time is in the hover title. It is computed on render, and the popover renders on open.
 * - **States:** `loading` shows skeleton rows while there are no items yet. `error` replaces the list; add `onRetry` for a
 *   "Retry" button. The empty state says that new notifications will show here.
 * - Focus moves to the panel on open (not to "Mark all as read"). Escape or a click outside closes it and returns focus to the bell.
 * - The popover reuses Select's positioner (z-index 65), so it opens above Dialog and Drawer.
 *
 * ## Props
 *
 * ### Notification
 *
 * | Prop | Type | Default | Description |
 * |---|---|---|---|
 * | `open` | `boolean` |  | Controlled state |
 * | `defaultOpen` | `boolean` | `false` | Initial state when uncontrolled |
 * | `onOpenChange` | `(open: boolean) => void` |  | E.g. refresh the items on open |
 * | `onSelect` | `(item: NotificationItem) => void` |  | A row was picked; the popover closes |
 * | `aria-label` | `string` | `'Notifications'` | Name of the bell and the panel; the unread count is added |
 *
 * Plus every NotificationList prop.
 *
 * ### NotificationList
 *
 * | Prop | Type | Default | Description |
 * |---|---|---|---|
 * | `items` | `NotificationItem[]` | **required** | In display order |
 * | `onSelect` | `(item: NotificationItem) => void` |  | A row was picked. Marking it read is the app's job |
 * | `onMarkAllRead` | `() => void` |  | Shows "Mark all as read" while something is unread |
 * | `loading` | `boolean` |  | Skeleton rows while there are no items yet |
 * | `error` | `ReactNode` |  | Replaces the list: what failed and how to recover |
 * | `onRetry` | `() => void` |  | Shows "Retry" under the error |
 * | `emptyText` | `ReactNode` | "No notifications yet" | Empty-state title; the default also says new ones will show here |
 * | `footer` | `ReactNode` |  | Under the list, e.g. a "View all" link |
 * | `title` | `ReactNode` | `'Notifications'` | Header text |
 * | `className` | `string` |  | Extra classes |
 *
 * ### NotificationItem
 *
 * | Prop | Type | Default | Description |
 * |---|---|---|---|
 * | `id` | `string \| number` | **required** | Stable key |
 * | `title` | `ReactNode` | **required** | What happened |
 * | `description` | `ReactNode` |  | Second line, clamped to two lines |
 * | `time` | `string \| Date` |  | When it happened (ISO or Date) |
 * | `read` | `boolean` |  | Unread when not `true` |
 * | `icon` | `ReactNode` |  | Shown in a tinted tile |
 * | `tone` | `Tone` |  | Tint of the icon tile |
 * | `href` | `string` |  | Makes the row a link |
 *
 * ## Files
 *
 * - `notification.tsx`: Notification, NotificationList, `NotificationItem`. Uses Button, Counter, IconTile and Skeleton.
 * - `notification.css`: `.dtx-notif-bell*`, `.dtx-notif-popup`, `.dtx-notif*`. Load it after `select.css`.
 * - `time.ts` + `time.check.ts`: relative and full time helpers and their node check
 *
 * Catalog: `#/catalog/notification`
 *
 
 */

import { useId, useRef, useState, type ReactNode } from 'react';
import { Popover } from '@base-ui/react/popover';
import { Bell } from 'lucide-react';
import { cx } from '../../cx';
import { Skeleton } from '../../motion/primitives';
import { Counter, IconTile, type Tone } from '../badge/badge';
import { Button } from '../button/button';
import { EmptyState } from '../empty-state/empty-state';
import { fullTime, isoTime, relativeTime } from './time';

export type NotificationItem = {
  id: string | number;
  title: ReactNode;
  /** Second line, clamped to two lines. */
  description?: ReactNode;
  /** When it happened: ISO date-time or Date. Shown as "5 phút trước"; the exact time is in the hover title. */
  time?: string | Date;
  read?: boolean;
  /** Shown in a tinted tile. */
  icon?: ReactNode;
  tone?: Tone;
  /** The row becomes a link. Without it the row is a button when there is an onSelect. */
  href?: string;
};

export type NotificationListProps = {
  items: NotificationItem[];
  /** A row was picked. Marking it read is the app's job. */
  onSelect?: (item: NotificationItem) => void;
  /** Shows "Mark all as read" in the header while something is unread. */
  onMarkAllRead?: () => void;
  /** Skeleton rows while there are no items yet. */
  loading?: boolean;
  /** Replaces the list: say what failed and how to recover. */
  error?: ReactNode;
  /** Shows "Retry" under the error. */
  onRetry?: () => void;
  emptyText?: ReactNode;
  /** Under the list, e.g. a "View all" link. */
  footer?: ReactNode;
  title?: ReactNode;
  className?: string;
};


/** Header, rows (unread first is the app's ordering), and the empty, loading and error states. The panel of <Notification>, or a page on its own. */
export function NotificationList({ items, onSelect, onMarkAllRead, loading, error, onRetry, emptyText, footer, title = 'Notifications', className }: NotificationListProps) {
  const id = useId();
  const unread = items.filter(i => !i.read).length;
  let body: ReactNode;
  if (error) body = (
    <EmptyState size="sm" tone="err" title={error} action={onRetry && <Button variant="secondary" size="sm" onClick={onRetry}>Retry</Button>} />
  );
  else if (loading && !items.length) body = (
    <div className="dtx-notif__loading" role="status" aria-label="Loading notifications">
      {[0, 1, 2].map(i => <div key={i} className="dtx-notif__skeleton"><Skeleton width={28} height={28} radius={4} /><div><Skeleton width="70%" height={12} /><Skeleton width="90%" /><Skeleton width="30%" /></div></div>)}
    </div>
  );
  else if (!items.length) body = <EmptyState size="sm" icon={<Bell />} title={emptyText ?? 'No notifications yet'}>{!emptyText && 'New notifications will appear here.'}</EmptyState>;
  else body = <ul className="dtx-notif__list">{items.map(item => <li key={item.id}><Row item={item} onSelect={onSelect} /></li>)}</ul>;
  return (
    <section className={cx('dtx-notif', className)} aria-labelledby={`${id}t`}>
      <div className="dtx-notif__head">
        <span id={`${id}t`} className="dtx-notif__title">{title}</span>
        {unread > 0 && <span className="dtx-notif__unread dtx-num">{unread} unread</span>}
        {onMarkAllRead && unread > 0 && <Button variant="ghost" size="sm" className="dtx-notif__all" onClick={onMarkAllRead}>Mark all as read</Button>}
      </div>
      {body}
      {footer && <div className="dtx-notif__foot">{footer}</div>}
    </section>
  );
}

function Row({ item, onSelect }: { item: NotificationItem; onSelect?: (item: NotificationItem) => void }) {
  const content = (
    <>
      {item.icon && <IconTile tone={item.tone}>{item.icon}</IconTile>}
      <span className="dtx-notif__main">
        <span className="dtx-notif__item-title">{!item.read && <span className="dtx-sr">Unread: </span>}{item.title}</span>
        {item.description && <span className="dtx-notif__desc">{item.description}</span>}
        {item.time && isoTime(item.time) && <time className="dtx-notif__time" dateTime={isoTime(item.time)} title={fullTime(item.time)}>{relativeTime(item.time)}</time>}
      </span>
      {!item.read && <i className="dtx-notif__dot" aria-hidden />}
    </>
  );
  const props = { className: 'dtx-notif__item', 'data-unread': item.read ? undefined : '' };
  if (item.href) return <a {...props} href={item.href} onClick={() => onSelect?.(item)}>{content}</a>;
  if (onSelect) return <button type="button" {...props} onClick={() => onSelect(item)}>{content}</button>;
  return <div {...props}>{content}</div>;
}

export type NotificationProps = NotificationListProps & {
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  /** Name of the bell; the unread count is added ("Notifications, 3 unread"). */
  'aria-label'?: string;
};

/** Bell button with the unread count; opens the NotificationList in a popover. Picking a row closes it. */
export function Notification({ open, defaultOpen = false, onOpenChange, 'aria-label': label = 'Notifications', onSelect, ...list }: NotificationProps) {
  const [inner, setInner] = useState(defaultOpen);
  const isOpen = open ?? inner;
  const setOpen = (o: boolean) => { setInner(o); onOpenChange?.(o); };
  const popup = useRef<HTMLDivElement>(null);
  const unread = list.items.filter(i => !i.read).length;
  return (
    <Popover.Root open={isOpen} onOpenChange={setOpen}>
      <Popover.Trigger render={<Button variant="ghost" icon className="dtx-notif-bell" aria-label={unread ? `${label}, ${unread} unread` : label} />}>
        <Bell aria-hidden />
        {/* keyed by the count, so it pops again when a new one arrives */}
        {unread > 0 && <Counter key={unread} solid tone="err" className="dtx-notif-bell__count">{unread > 99 ? '99+' : unread}</Counter>}
      </Popover.Trigger>
      <Popover.Portal>
        <Popover.Positioner sideOffset={8} align="end" collisionPadding={16} className="dtx-select-positioner">
          {/* focus lands on the panel, not on "Mark all as read", so Enter right after opening changes nothing */}
          <Popover.Popup ref={popup} initialFocus={popup} className="dtx-select-popup dtx-notif-popup" aria-label={label}>
            <NotificationList {...list} onSelect={onSelect && (item => { onSelect(item); setOpen(false); })} />
          </Popover.Popup>
        </Popover.Positioner>
      </Popover.Portal>
    </Popover.Root>
  );
}
