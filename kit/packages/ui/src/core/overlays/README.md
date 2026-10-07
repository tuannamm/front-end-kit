# Dialog · Drawer · Toast

Layers above the page: a modal dialog, a side panel or bottom sheet, and stacked toasts.

```tsx
import { Dialog, DialogClose, Drawer, DrawerClose, ToastProvider, useToast, Button } from '@dtx/ui';

<Dialog trigger={<Button variant="danger">Xoá hồ sơ</Button>} title="Xoá hồ sơ HS-0142?" description="Không thể hoàn tác."
  footer={<><DialogClose><Button variant="ghost">Huỷ</Button></DialogClose><Button variant="danger" onClick={remove}>Xoá hồ sơ</Button></>} />

<Drawer open={!!record} onOpenChange={o => !o && setRecord(null)} title={record?.id} footer={<Button>Lưu</Button>}>
  <RecordDetail record={record} />
</Drawer>

<ToastProvider><App /></ToastProvider>              // once, at the app root
const toast = useToast();
toast({ title: 'Đã lưu', description: 'Hồ sơ HS-0142', tone: 'ok' });
toast({ title: 'Không lưu được hồ sơ HS-0142', description: 'Mất kết nối máy chủ.', tone: 'err' });
```

## Notes

- **Dialog:** focus is trapped while open and returned to the trigger on close. The panel scales .94 → 1, and the exit is faster.
  Put the action on the button ("Xoá hồ sơ"), never "OK".
- **Drawer:** `side` is `right` (default), `left` or `bottom`. Width is `sm 360 · md 480 · lg 720` px, always leaving
  a 40px strip of the page. Header and footer stay in place and the body scrolls. Swiping toward the edge dismisses it,
  and a fast swipe closes faster.
- **Layers:** backdrop 60, drawer/dialog 61, popups 65, toasts 70.
- **Toast:** toasts stack and expand on hover. Swipe right or down to dismiss. Default timeout is 4s.
  `tone` picks the icon (ok, warn, err, brand). An `err` toast stays until it is closed, is announced at once
  (`priority: 'high'`) and has a red-tinted edge. Its text should say what failed and how to recover. Screen readers hear an error through a
  `role="alert"` copy.
  While a right drawer is open, toasts move to the left corner so they do not cover its footer.
  On phones they move above the drawer footer instead.
- Toast `data.body` holds extra content under the text. UploadToast (in `file-upload/`) uses it.

## Props

### Dialog

| Prop | Type | Default | Description |
|---|---|---|---|
| `title` | `ReactNode` | **required** | Heading; also the accessible name |
| `description` | `ReactNode` |  | Line under the title |
| `children` | `ReactNode` |  | Body |
| `footer` | `ReactNode` |  | Buttons. Wrap a closing one in `<DialogClose>` |
| `trigger` | `ReactElement` |  | Element that opens it, when uncontrolled |
| `open` | `boolean` |  | Controlled state |
| `onOpenChange` | `(open: boolean) => void` |  |  |

### DialogClose

| Prop | Type | Default | Description |
|---|---|---|---|
| `children` | `ReactElement` | **required** | Element that closes the dialog, e.g. a Button |

### Drawer

| Prop | Type | Default | Description |
|---|---|---|---|
| `title` | `ReactNode` | **required** | Heading; also the accessible name |
| `description` | `ReactNode` |  | Line under the title |
| `children` | `ReactNode` |  | Body; it scrolls |
| `footer` | `ReactNode` |  | Buttons. Wrap a closing one in `<DrawerClose>` |
| `side` | `'right' \| 'left' \| 'bottom'` | `'right'` | Edge it slides from; swiping back toward it dismisses |
| `size` | `'sm' \| 'md' \| 'lg'` | `'md'` | Width for left/right: 360 · 480 · 720px |
| `trigger` | `ReactElement` |  | Element that opens it, when uncontrolled |
| `open` | `boolean` |  | Controlled state |
| `defaultOpen` | `boolean` |  | Initial state when uncontrolled |
| `onOpenChange` | `(open: boolean) => void` |  |  |
| `className` | `string` |  | On the panel |

### DrawerClose

| Prop | Type | Default | Description |
|---|---|---|---|
| `children` | `ReactElement` | **required** | Element that closes the drawer, e.g. a Button |

### ToastProvider

| Prop | Type | Default | Description |
|---|---|---|---|
| `children` | `ReactNode` | **required** | The app |

### useToast

| Prop | Type | Default | Description |
|---|---|---|---|
| `title` | `string` | **required** |  |
| `description` | `string` |  | Line under the title |
| `tone` | `'ok' \| 'warn' \| 'err' \| 'brand'` |  | Picks the icon; `'err'` also stays until closed and is announced at once |
| `icon` | `ReactNode` |  | Replaces the tone's icon, e.g. `<Badge size="sm" live />` for work in progress |
| `timeout` | `number` | `4000` (`'err'`: `0`) | Milliseconds; `0` keeps it until closed |

Options (`ToastOptions`) of the `toast(options)` function that `useToast()` returns; it returns the toast id.

## Files

- `overlays.tsx`: Dialog, DialogClose, Drawer, DrawerClose, ToastProvider, useToast
- `overlays.css`: `.dtx-backdrop`, `.dtx-dialog*`, `.dtx-drawer*`, `.dtx-toast*`

Catalog: `#/catalog/dialog`, `#/catalog/drawer`, `#/catalog/toast`
