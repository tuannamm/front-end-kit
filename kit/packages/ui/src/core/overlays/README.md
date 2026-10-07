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
toast({ title: 'Đã lưu', description: 'Hồ sơ HS-0142', icon: <Badge tone="ok" size="sm" dot /> });
```

## Notes

- **Dialog:** focus is trapped while open and returned to the trigger on close. The panel scales .94 → 1, and the exit is faster.
  Put the action on the button ("Xoá hồ sơ"), never "OK".
- **Drawer:** `side` is `right` (default), `left` or `bottom`. Width is `sm 360 · md 480 · lg 720` px, always leaving
  a 40px strip of the page. Header and footer stay in place and the body scrolls. Swiping toward the edge dismisses it,
  and a fast swipe closes faster.
- **Layers:** backdrop 60, drawer/dialog 61, popups 65, toasts 70.
- **Toast:** toasts stack and expand on hover. Swipe right or down to dismiss. Default timeout is 4s.
  While a right drawer is open, toasts move to the left corner so they do not cover its footer.
  On phones they move above the drawer footer instead.
- Toast `data.body` holds extra content under the text. UploadToast (in `file-upload/`) uses it.

## Files

- `overlays.tsx`: Dialog, DialogClose, Drawer, DrawerClose, ToastProvider, useToast
- `overlays.css`: `.dtx-backdrop`, `.dtx-dialog*`, `.dtx-drawer*`, `.dtx-toast*`

Catalog: `#/catalog/dialog`, `#/catalog/drawer`, `#/catalog/toast`

Props are documented in TSDoc on the types in the `.tsx`; this file covers usage and decisions only.
