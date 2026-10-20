/**
 * # Dialog · Drawer · Toast
 *
 * Layers above the page: a modal dialog, a side panel or bottom sheet, and stacked toasts.
 *
 * ```tsx
 * import { Dialog, DialogClose, Drawer, DrawerClose, ToastProvider, useToast, Button } from '@dgtx/ui-frek';
 *
 * <Dialog trigger={<Button variant="danger">Delete record</Button>} title="Delete record HS-0142?" description="This cannot be undone."
 *   footer={<><DialogClose><Button variant="ghost">Cancel</Button></DialogClose><Button variant="danger" onClick={remove}>Delete record</Button></>} />
 *
 * <Drawer open={!!record} onOpenChange={o => !o && setRecord(null)} title={record?.id} footer={<Button>Save</Button>}>
 *   <RecordDetail record={record} />
 * </Drawer>
 *
 * <ToastProvider><App /></ToastProvider>              // once, at the app root
 * const toast = useToast();
 * toast({ title: 'Saved', description: 'Record HS-0142', tone: 'ok' });
 * toast({ title: 'Could not save record HS-0142', description: 'Lost connection to the server.', tone: 'err' });
 * ```
 *
 * ## Notes
 *
 * - **Dialog:** focus is trapped while open and returned to the trigger on close. The panel scales .94 → 1, and the exit is faster.
 *   Put the action on the button ("Delete record"), never "OK".
 * - **Drawer:** `side` is `right` (default), `left` or `bottom`. Width is `sm 360 · md 480 · lg 720` px, always leaving
 *   a 40px strip of the page. Header and footer stay in place and the body scrolls. Swiping toward the edge dismisses it,
 *   and a fast swipe closes faster.
 * - **Layers:** backdrop 60, drawer/dialog 61, popups 65, toasts 70.
 * - **Toast:** toasts stack and expand on hover. Swipe right or down to dismiss. Default timeout is 4s.
 *   `tone` picks the icon (ok, warn, err, brand). An `err` toast stays until it is closed, is announced at once
 *   (`priority: 'high'`) and has a red-tinted edge. Its text should say what failed and how to recover. Screen readers hear an error through a
 *   `role="alert"` copy.
 *   While a right drawer is open, toasts move to the left corner so they do not cover its footer.
 *   On phones they move above the drawer footer instead.
 * - Toast `data.body` holds extra content under the text. UploadToast (in `file-upload/`) uses it.
 *
 * ## Props
 *
 * ### Dialog
 *
 * | Prop | Type | Default | Description |
 * |---|---|---|---|
 * | `title` | `ReactNode` | **required** | Heading; also the accessible name |
 * | `description` | `ReactNode` |  | Line under the title |
 * | `children` | `ReactNode` |  | Body |
 * | `footer` | `ReactNode` |  | Buttons. Wrap a closing one in `<DialogClose>` |
 * | `trigger` | `ReactElement` |  | Element that opens it, when uncontrolled |
 * | `open` | `boolean` |  | Controlled state |
 * | `onOpenChange` | `(open: boolean) => void` |  |  |
 *
 * ### DialogClose
 *
 * | Prop | Type | Default | Description |
 * |---|---|---|---|
 * | `children` | `ReactElement` | **required** | Element that closes the dialog, e.g. a Button |
 *
 * ### Drawer
 *
 * | Prop | Type | Default | Description |
 * |---|---|---|---|
 * | `title` | `ReactNode` | **required** | Heading; also the accessible name |
 * | `description` | `ReactNode` |  | Line under the title |
 * | `children` | `ReactNode` |  | Body; it scrolls |
 * | `footer` | `ReactNode` |  | Buttons. Wrap a closing one in `<DrawerClose>` |
 * | `side` | `'right' \| 'left' \| 'bottom'` | `'right'` | Edge it slides from; swiping back toward it dismisses |
 * | `size` | `'sm' \| 'md' \| 'lg'` | `'md'` | Width for left/right: 360 · 480 · 720px |
 * | `trigger` | `ReactElement` |  | Element that opens it, when uncontrolled |
 * | `open` | `boolean` |  | Controlled state |
 * | `defaultOpen` | `boolean` |  | Initial state when uncontrolled |
 * | `onOpenChange` | `(open: boolean) => void` |  |  |
 * | `className` | `string` |  | On the panel |
 *
 * ### DrawerClose
 *
 * | Prop | Type | Default | Description |
 * |---|---|---|---|
 * | `children` | `ReactElement` | **required** | Element that closes the drawer, e.g. a Button |
 *
 * ### ToastProvider
 *
 * | Prop | Type | Default | Description |
 * |---|---|---|---|
 * | `children` | `ReactNode` | **required** | The app |
 *
 * ### useToast
 *
 * | Prop | Type | Default | Description |
 * |---|---|---|---|
 * | `title` | `string` | **required** |  |
 * | `description` | `string` |  | Line under the title |
 * | `tone` | `'ok' \| 'warn' \| 'err' \| 'brand'` |  | Picks the icon; `'err'` also stays until closed and is announced at once |
 * | `icon` | `ReactNode` |  | Replaces the tone's icon, e.g. `<Badge size="sm" live />` for work in progress |
 * | `timeout` | `number` | `4000` (`'err'`: `0`) | Milliseconds; `0` keeps it until closed |
 *
 * Options (`ToastOptions`) of the `toast(options)` function that `useToast()` returns; it returns the toast id.
 *
 * ## Files
 *
 * - `overlays.tsx`: Dialog, DialogClose, Drawer, DrawerClose, ToastProvider, useToast
 * - `overlays.css`: `.dtx-backdrop`, `.dtx-dialog*`, `.dtx-drawer*`, `.dtx-toast*`
 *
 * Catalog: `#/catalog/dialog`, `#/catalog/drawer`, `#/catalog/toast`
 *
 
 */

import type { ReactNode } from 'react';
import { Dialog as BDialog } from '@base-ui/react/dialog';
import { Drawer as BDrawer } from '@base-ui/react/drawer';
import { Toast } from '@base-ui/react/toast';
import { X } from 'lucide-react';
import { cx } from '../../cx';
import { Badge, toneIcon, type StatusTone } from '../badge/badge';
import { Button } from '../button/button';

/** Modal dialog: backdrop fades, panel scales .94 → 1 with emphasis easing; exit is faster. */
export function Dialog({ trigger, title, description, children, footer, open, onOpenChange }: {
  trigger?: React.ReactElement; title: ReactNode; description?: ReactNode; children?: ReactNode;
  /** Buttons; wrap a closing button in <DialogClose>. */
  footer?: ReactNode; open?: boolean; onOpenChange?: (open: boolean) => void;
}) {
  return (
    <BDialog.Root open={open} onOpenChange={o => onOpenChange?.(o)}>
      {trigger && <BDialog.Trigger render={trigger} />}
      <BDialog.Portal>
        <BDialog.Backdrop className="dtx-backdrop" />
        <BDialog.Popup className="dtx-dialog">
          <BDialog.Title className="dtx-dialog__title">{title}</BDialog.Title>
          {description && <BDialog.Description className="dtx-dialog__desc">{description}</BDialog.Description>}
          {children}
          {footer && <div className="dtx-dialog__foot">{footer}</div>}
        </BDialog.Popup>
      </BDialog.Portal>
    </BDialog.Root>
  );
}
export function DialogClose({ children }: { children: React.ReactElement }) {
  return <BDialog.Close render={children} />;
}

const swipeTo = { right: 'right', left: 'left', bottom: 'down' } as const;
export type DrawerProps = {
  trigger?: React.ReactElement; title: ReactNode; description?: ReactNode; children?: ReactNode;
  /** Buttons; wrap a closing button in <DrawerClose>. */
  footer?: ReactNode;
  /** Edge it slides from; swiping back toward that edge dismisses it. */
  side?: 'right' | 'left' | 'bottom';
  /** Width for left/right: sm 360 · md 480 · lg 720px, always leaving a 40px strip of the page. */
  size?: 'sm' | 'md' | 'lg';
  open?: boolean; defaultOpen?: boolean; onOpenChange?: (open: boolean) => void; className?: string;
};
/** Side panel (record detail, filters) or bottom sheet. Header and footer stay put; the body scrolls. */
export function Drawer({ trigger, title, description, children, footer, side = 'right', size = 'md', open, defaultOpen, onOpenChange, className }: DrawerProps) {
  return (
    <BDrawer.Root open={open} defaultOpen={defaultOpen} onOpenChange={o => onOpenChange?.(o)} swipeDirection={swipeTo[side]}>
      {trigger && <BDrawer.Trigger render={trigger} />}
      <BDrawer.Portal>
        <BDrawer.Backdrop className="dtx-backdrop dtx-drawer-backdrop" />
        <BDrawer.Viewport className="dtx-drawer-viewport">
          <BDrawer.Popup className={cx('dtx-drawer', `dtx-drawer--${side}`, side !== 'bottom' && size !== 'md' && `dtx-drawer--${size}`, className)}>
            {side === 'bottom' && <div className="dtx-drawer__handle" aria-hidden />}
            <div className="dtx-drawer__head">
              <div className="dtx-drawer__heading">
                <BDrawer.Title className="dtx-dialog__title">{title}</BDrawer.Title>
                {description && <BDrawer.Description className="dtx-dialog__desc">{description}</BDrawer.Description>}
              </div>
              <BDrawer.Close render={<Button variant="ghost" size="sm" icon aria-label="Close" />}><X size={18} /></BDrawer.Close>
            </div>
            <BDrawer.Content className="dtx-drawer__body">{children}</BDrawer.Content>
            {footer && <div className="dtx-drawer__foot">{footer}</div>}
          </BDrawer.Popup>
        </BDrawer.Viewport>
      </BDrawer.Portal>
    </BDrawer.Root>
  );
}
export function DrawerClose({ children }: { children: React.ReactElement }) {
  return <BDrawer.Close render={children} />;
}

/** Wrap the app once. Toasts stack, expand on hover, swipe right/down to dismiss. */
export function ToastProvider({ children }: { children: ReactNode }) {
  return (
    <Toast.Provider>
      {children}
      <Toast.Portal>
        <Toast.Viewport className="dtx-toast-viewport"><ToastList /></Toast.Viewport>
      </Toast.Portal>
    </Toast.Provider>
  );
}

/** `body`: extra content under the text, e.g. UploadToast's progress and file list. */
type ToastData = { icon?: ReactNode; body?: ReactNode };
function ToastList() {
  const { toasts } = Toast.useToastManager();
  return toasts.map(t => (
    <Toast.Root key={t.id} toast={t} className="dtx-toast" data-tone={t.type} swipeDirection={['right', 'down']}>
      <Toast.Content className="dtx-toast__content">
        {(t.data as ToastData | undefined)?.icon}
        <div className="dtx-toast__text">
          <Toast.Title className="dtx-toast__title" />
          <Toast.Description className="dtx-toast__desc" />
        </div>
        <Toast.Close className="dtx-toast__close" aria-label="Close"><X size={14} /></Toast.Close>
        {(t.data as ToastData | undefined)?.body}
      </Toast.Content>
    </Toast.Root>
  ));
}

export type ToastTone = StatusTone;
export type ToastOptions = {
  title: string;
  description?: string;
  /** Picks the icon. 'err' also stays until closed and is announced at once. */
  tone?: ToastTone;
  /** Replaces the tone's icon. */
  icon?: ReactNode;
  /** ms; 0 keeps it until closed. Default 4000, or 0 for 'err' (an error must not vanish before it is read). */
  timeout?: number;
};

/** const toast = useToast(); toast({ title, description, tone }). Returns the toast id. */
export function useToast() {
  const m = Toast.useToastManager();
  return ({ title, description, tone, icon, timeout = tone === 'err' ? 0 : 4000 }: ToastOptions) =>
    m.add({
      title, description, timeout, type: tone, priority: tone === 'err' ? 'high' : 'low',
      data: { icon: icon ?? (tone && <Badge tone={tone} size="sm" icon={toneIcon[tone]} aria-hidden />) },
    });
}
