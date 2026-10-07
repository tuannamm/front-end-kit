# Notification · NotificationList

A bell button with the unread count. Clicking it opens the list of notifications in a popover.
`NotificationList` is that panel on its own, for a full "all notifications" page.

```tsx
import { Notification, NotificationList, Button } from '@dtx/ui';

<Notification
  items={notifications}                                   // newest first; the app decides the order
  onSelect={n => markRead(n.id)}
  onMarkAllRead={markAllRead}
  footer={<Button variant="ghost" size="sm" href="/notifications">Xem tất cả thông báo</Button>}
/>

<NotificationList items={notifications} loading={isLoading} error={loadError} onRetry={reload} />
```

## Notes

- **Nothing is fetched or marked here.** The app passes `items`, marks a row read in `onSelect`, and loads more
  in `onOpenChange(true)` if it wants fresh data on open.
- **Count:** the unread count is derived from `items` (`read !== true`). It shows "99+" above 99 and pops again when it grows.
  The bell's accessible name says it too: "Thông báo, 3 chưa đọc".
- **Unread rows** get a blue tint, a medium-weight title, a square dot and a hidden "Chưa đọc:" prefix, so the
  state never depends on colour alone.
- **Rows:** a link when the item has `href`, a button when there is `onSelect`, plain text otherwise.
  Picking a row closes the popover. The description is clamped to two lines.
- **Time:** `relativeTime` shows "Vừa xong", "5 phút trước", "3 giờ trước", then calendar days ("Hôm qua", "Hôm kia",
  "6 ngày trước"), then the date. The exact time is in the hover title. It is computed on render, and the popover renders on open.
- **States:** `loading` shows skeleton rows while there are no items yet. `error` replaces the list; add `onRetry` for a
  "Thử lại" button. The empty state says that new notifications will show here.
- Focus moves to the panel on open (not to "Đánh dấu đã đọc"). Escape or a click outside closes it and returns focus to the bell.
- The popover reuses Select's positioner (z-index 65), so it opens above Dialog and Drawer.

## Props

### Notification

| Prop | Type | Default | Description |
|---|---|---|---|
| `open` | `boolean` |  | Controlled state |
| `defaultOpen` | `boolean` | `false` | Initial state when uncontrolled |
| `onOpenChange` | `(open: boolean) => void` |  | E.g. refresh the items on open |
| `onSelect` | `(item: NotificationItem) => void` |  | A row was picked; the popover closes |
| `aria-label` | `string` | `'Thông báo'` | Name of the bell and the panel; the unread count is added |

Plus every NotificationList prop.

### NotificationList

| Prop | Type | Default | Description |
|---|---|---|---|
| `items` | `NotificationItem[]` | **required** | In display order |
| `onSelect` | `(item: NotificationItem) => void` |  | A row was picked. Marking it read is the app's job |
| `onMarkAllRead` | `() => void` |  | Shows "Đánh dấu đã đọc" while something is unread |
| `loading` | `boolean` |  | Skeleton rows while there are no items yet |
| `error` | `ReactNode` |  | Replaces the list: what failed and how to recover |
| `onRetry` | `() => void` |  | Shows "Thử lại" under the error |
| `emptyText` | `ReactNode` | "Chưa có thông báo nào" | Empty state |
| `footer` | `ReactNode` |  | Under the list, e.g. a "Xem tất cả" link |
| `title` | `ReactNode` | `'Thông báo'` | Header text |
| `className` | `string` |  | Extra classes |

### NotificationItem

| Prop | Type | Default | Description |
|---|---|---|---|
| `id` | `string \| number` | **required** | Stable key |
| `title` | `ReactNode` | **required** | What happened |
| `description` | `ReactNode` |  | Second line, clamped to two lines |
| `time` | `string \| Date` |  | When it happened (ISO or Date) |
| `read` | `boolean` |  | Unread when not `true` |
| `icon` | `ReactNode` |  | Shown in a tinted tile |
| `tone` | `Tone` |  | Tint of the icon tile |
| `href` | `string` |  | Makes the row a link |

## Files

- `notification.tsx`: Notification, NotificationList, `NotificationItem`. Uses Button, Counter, IconTile and Skeleton.
- `notification.css`: `.dtx-notif-bell*`, `.dtx-notif-popup`, `.dtx-notif*`. Load it after `select.css`.
- `time.ts` + `time.check.ts`: relative and full time helpers and their node check

Catalog: `#/catalog/notification`
