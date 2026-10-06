import { createContext, useContext, type ComponentProps, type ReactNode } from 'react';
import { Collapsible } from '@base-ui/react/collapsible';
import { ChevronRight, ChevronsUpDown, Search } from 'lucide-react';
import { cx } from '../cx';
import { Kbd } from '../core/badge';

const RailCtx = createContext(false);

/** App frame: sidebar + main. `rail` collapses the sidebar to a 60px icon strip. */
/** `fill`: edge to edge in a parent with a set height (the real app layout): the sidebar stays put, the main area scrolls. */
export function AppShell({ sidebar, rail = false, fill, children, className }: { sidebar: ReactNode; rail?: boolean; fill?: boolean; children: ReactNode; className?: string }) {
  return (
    <RailCtx.Provider value={rail}>
      <div className={cx('dtx-shell', fill && 'dtx-shell--fill', className)} data-rail={rail ? '' : undefined}>
        {sidebar}
        <div className="dtx-shell__main">{children}</div>
      </div>
    </RailCtx.Provider>
  );
}

export function Sidebar({ children, 'aria-label': label = 'Điều hướng' }: { children: ReactNode; 'aria-label'?: string }) {
  return <nav className="dtx-sidebar" aria-label={label}>{children}</nav>;
}

export function SidebarWorkspace({ logo, name, subtitle, onClick }: { logo: ReactNode; name: string; subtitle?: string; onClick?: () => void }) {
  return (
    <button type="button" className="dtx-sidebar__ws" onClick={onClick} title={name}>
      {logo}
      <span className="dtx-rail-hide"><b>{name}</b>{subtitle && <small>{subtitle}</small>}</span>
      <ChevronsUpDown className="dtx-rail-hide" aria-hidden />
    </button>
  );
}

/** Collapsible nav section (height animates). */
export function SidebarGroup({ label, defaultOpen = true, children }: { label: string; defaultOpen?: boolean; children: ReactNode }) {
  return (
    <Collapsible.Root defaultOpen={defaultOpen} className="dtx-sidebar__group">
      <Collapsible.Trigger className="dtx-sidebar__group-label"><ChevronRight aria-hidden />{label}</Collapsible.Trigger>
      <Collapsible.Panel className="dtx-sidebar__items">{children}</Collapsible.Panel>
    </Collapsible.Root>
  );
}

export type SidebarItemProps = Omit<ComponentProps<'a'>, 'children'> & {
  icon: ReactNode;
  label: string;
  active?: boolean;
  /** Muted number; hidden on hover in favour of the shortcut. */
  count?: number;
  /** Replaces count: a <Counter> or <Badge> for items that need attention. */
  badge?: ReactNode;
  kbd?: string;
  /** Amber dot in rail mode. */
  alert?: boolean;
};
export function SidebarItem({ icon, label, active, count, badge, kbd, alert, className, ...rest }: SidebarItemProps) {
  const rail = useContext(RailCtx);
  return (
    <a className={cx('dtx-sidebar__item', className)} aria-current={active ? 'page' : undefined} data-alert={alert ? '' : undefined} title={rail ? label : undefined} {...rest}>
      {icon}
      <span className="dtx-rail-hide">{label}</span>
      {(count !== undefined || badge || kbd) && (
        <span className="dtx-sidebar__meta dtx-rail-hide">
          {badge ?? (count !== undefined && <span className="dtx-sidebar__count">{count.toLocaleString('en-US')}</span>)}
          {kbd && <Kbd>{kbd}</Kbd>}
        </span>
      )}
    </a>
  );
}

export function SidebarFooter({ children }: { children: ReactNode }) {
  return <div className="dtx-sidebar__foot">{children}</div>;
}

export function Topbar({ children }: { children: ReactNode }) {
  return <div className="dtx-topbar">{children}</div>;
}

/** Opens a command palette; pair with a global Ctrl/⌘+K listener. */
export function CommandButton({ placeholder = 'Tìm kiếm…', shortcut = 'Ctrl K', onClick }: { placeholder?: string; shortcut?: string; onClick?: () => void }) {
  return <button type="button" className="dtx-cmdk" onClick={onClick}><Search aria-hidden /><span className="dtx-cmdk__text">{placeholder}</span><Kbd>{shortcut}</Kbd></button>;
}
