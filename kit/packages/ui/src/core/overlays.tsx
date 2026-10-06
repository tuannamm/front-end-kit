import type { ReactNode } from 'react';
import { Dialog as BDialog } from '@base-ui/react/dialog';
import { Toast } from '@base-ui/react/toast';
import { X } from 'lucide-react';

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

function ToastList() {
  const { toasts } = Toast.useToastManager();
  return toasts.map(t => (
    <Toast.Root key={t.id} toast={t} className="dtx-toast" swipeDirection={['right', 'down']}>
      <Toast.Content className="dtx-toast__content">
        {(t.data as { icon?: ReactNode } | undefined)?.icon}
        <div className="dtx-toast__text">
          <Toast.Title className="dtx-toast__title" />
          <Toast.Description className="dtx-toast__desc" />
        </div>
        <Toast.Close className="dtx-toast__close" aria-label="Đóng"><X size={14} /></Toast.Close>
      </Toast.Content>
    </Toast.Root>
  ));
}

/** const toast = useToast(); toast({ title, description, icon }) */
export function useToast() {
  const m = Toast.useToastManager();
  return ({ title, description, icon, timeout = 4000 }: { title: string; description?: string; icon?: ReactNode; timeout?: number }) =>
    m.add({ title, description, timeout, data: { icon } });
}
