import type { ReactNode } from 'react';
import { Dialog as BDialog } from '@base-ui/react/dialog';
import { Drawer as BDrawer } from '@base-ui/react/drawer';
import { Toast } from '@base-ui/react/toast';
import { AlertTriangle, CheckCircle2, CircleAlert, Info, X } from 'lucide-react';
import { cx } from '../../cx';
import { Badge } from '../badge/badge';
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
              <BDrawer.Close render={<Button variant="ghost" size="sm" icon aria-label="Đóng" />}><X size={18} /></BDrawer.Close>
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
          {/* renders only when the toast has an action */}
          <Toast.Action render={<Button variant="secondary" size="sm" className="dtx-toast__action" />} />
        </div>
        <Toast.Close className="dtx-toast__close" aria-label="Đóng"><X size={14} /></Toast.Close>
        {(t.data as ToastData | undefined)?.body}
      </Toast.Content>
    </Toast.Root>
  ));
}

export type ToastTone = 'ok' | 'warn' | 'err' | 'brand';
export type ToastOptions = {
  title: string;
  description?: string;
  /** Picks the icon. 'err' also stays until closed and is announced at once. */
  tone?: ToastTone;
  /** Replaces the tone's icon. */
  icon?: ReactNode;
  /** One recovery step, e.g. { label: 'Thử lại', onClick: retry }. Clicking it also closes the toast. */
  action?: { label: string; onClick: () => void };
  /** ms; 0 keeps it until closed. Default 4000, or 0 for 'err' (an error must not vanish before it is read). */
  timeout?: number;
};
const toneIcon: Record<ToastTone, ReactNode> = { ok: <CheckCircle2 />, warn: <AlertTriangle />, err: <CircleAlert />, brand: <Info /> };

/** const toast = useToast(); toast({ title, description, tone }). Returns the toast id. */
export function useToast() {
  const m = Toast.useToastManager();
  return ({ title, description, tone, icon, action, timeout = tone === 'err' ? 0 : 4000 }: ToastOptions) => {
    let id = '';
    id = m.add({
      title, description, timeout, type: tone, priority: tone === 'err' ? 'high' : 'low',
      data: { icon: icon ?? (tone && <Badge tone={tone} size="sm" icon={toneIcon[tone]} aria-hidden />) },
      actionProps: action && { children: action.label, onClick: () => { action.onClick(); m.close(id); } },
    });
    return id;
  };
}
