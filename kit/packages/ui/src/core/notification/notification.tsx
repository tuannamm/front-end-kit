import { useId, useRef, useState, type ReactNode } from 'react';
import { Popover } from '@base-ui/react/popover';
import { Bell } from 'lucide-react';
import { cx } from '../../cx';
import { Skeleton } from '../../motion/primitives';
import { Counter, IconTile, type Tone } from '../badge/badge';
import { Button } from '../button/button';
import { EmptyState } from '../empty-state/empty-state';
import { fullTime, relativeTime } from './time';

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
  /** Shows "Đánh dấu đã đọc" in the header while something is unread. */
  onMarkAllRead?: () => void;
  /** Skeleton rows while there are no items yet. */
  loading?: boolean;
  /** Replaces the list: say what failed and how to recover. */
  error?: ReactNode;
  /** Shows "Thử lại" under the error. */
  onRetry?: () => void;
  emptyText?: ReactNode;
  /** Under the list, e.g. a "Xem tất cả" link. */
  footer?: ReactNode;
  title?: ReactNode;
  className?: string;
};


/** Header, rows (unread first is the app's ordering), and the empty, loading and error states. The panel of <Notification>, or a page on its own. */
export function NotificationList({ items, onSelect, onMarkAllRead, loading, error, onRetry, emptyText, footer, title = 'Thông báo', className }: NotificationListProps) {
  const id = useId();
  const unread = items.filter(i => !i.read).length;
  let body: ReactNode;
  if (error) body = (
    <EmptyState size="sm" tone="err" title={error} action={onRetry && <Button variant="secondary" size="sm" onClick={onRetry}>Thử lại</Button>} />
  );
  else if (loading && !items.length) body = (
    <div className="dtx-notif__loading" role="status" aria-label="Đang tải thông báo">
      {[0, 1, 2].map(i => <div key={i} className="dtx-notif__skeleton"><Skeleton width={28} height={28} radius={4} /><div><Skeleton width="70%" height={12} /><Skeleton width="90%" /><Skeleton width="30%" /></div></div>)}
    </div>
  );
  else if (!items.length) body = <EmptyState size="sm" icon={<Bell />} title={emptyText ?? 'Chưa có thông báo nào'}>{!emptyText && 'Thông báo mới sẽ hiện ở đây.'}</EmptyState>;
  else body = <ul className="dtx-notif__list">{items.map(item => <li key={item.id}><Row item={item} onSelect={onSelect} /></li>)}</ul>;
  return (
    <section className={cx('dtx-notif', className)} aria-labelledby={`${id}t`}>
      <div className="dtx-notif__head">
        <span id={`${id}t`} className="dtx-notif__title">{title}</span>
        {unread > 0 && <span className="dtx-notif__unread dtx-num">{unread} chưa đọc</span>}
        {onMarkAllRead && unread > 0 && <Button variant="ghost" size="sm" className="dtx-notif__all" onClick={onMarkAllRead}>Đánh dấu đã đọc</Button>}
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
        <span className="dtx-notif__item-title">{!item.read && <span className="dtx-sr">Chưa đọc: </span>}{item.title}</span>
        {item.description && <span className="dtx-notif__desc">{item.description}</span>}
        {item.time && <time className="dtx-notif__time" dateTime={new Date(item.time).toISOString()} title={fullTime(item.time)}>{relativeTime(item.time)}</time>}
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
  /** Name of the bell; the unread count is added ("Thông báo, 3 chưa đọc"). */
  'aria-label'?: string;
};

/** Bell button with the unread count; opens the NotificationList in a popover. Picking a row closes it. */
export function Notification({ open, defaultOpen = false, onOpenChange, 'aria-label': label = 'Thông báo', onSelect, ...list }: NotificationProps) {
  const [inner, setInner] = useState(defaultOpen);
  const isOpen = open ?? inner;
  const setOpen = (o: boolean) => { setInner(o); onOpenChange?.(o); };
  const popup = useRef<HTMLDivElement>(null);
  const unread = list.items.filter(i => !i.read).length;
  return (
    <Popover.Root open={isOpen} onOpenChange={setOpen}>
      <Popover.Trigger render={<Button variant="ghost" icon className="dtx-notif-bell" aria-label={unread ? `${label}, ${unread} chưa đọc` : label} />}>
        <Bell aria-hidden />
        {/* keyed by the count, so it pops again when a new one arrives */}
        {unread > 0 && <Counter key={unread} solid tone="err" className="dtx-notif-bell__count">{unread > 99 ? '99+' : unread}</Counter>}
      </Popover.Trigger>
      <Popover.Portal>
        <Popover.Positioner sideOffset={8} align="end" collisionPadding={16} className="dtx-select-positioner">
          {/* focus lands on the panel, not on "Đánh dấu đã đọc", so Enter right after opening changes nothing */}
          <Popover.Popup ref={popup} initialFocus={popup} className="dtx-select-popup dtx-notif-popup" aria-label={label}>
            <NotificationList {...list} onSelect={onSelect && (item => { onSelect(item); setOpen(false); })} />
          </Popover.Popup>
        </Popover.Positioner>
      </Popover.Portal>
    </Popover.Root>
  );
}
