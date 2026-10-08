# Layout

Page structure: `Card` for a section of a page, and the app frame (`AppShell` with a sidebar and a topbar).

```tsx
import { AppShell, Sidebar, SidebarGroup, SidebarItem, Topbar, Card, CardHeader, CardBody } from '@dtx/ui';

<AppShell sidebar={<Sidebar><SidebarGroup label="Vận hành"><SidebarItem href="#/" icon={<LayoutDashboard />} label="Tổng quan" active /></SidebarGroup></Sidebar>}>
  <Topbar>…</Topbar>
  <Card><CardHeader title="Lô gần đây" /><CardBody>…</CardBody></Card>
</AppShell>
```

## Props

### Card

| Prop | Type | Default | Description |
|---|---|---|---|
| `className` | `string` |  | Extra classes |

Plus every `<section>` attribute.

### CardHeader

| Prop | Type | Default | Description |
|---|---|---|---|
| `title` | `ReactNode` | **required** | Rendered as an `<h2>` |
| `action` | `ReactNode` |  | Right-aligned, e.g. a Button or Segmented |
| `id` | `string` |  | Id of the heading, for `aria-labelledby` |

### CardBody

| Prop | Type | Default | Description |
|---|---|---|---|
| `className` | `string` |  | Extra classes |

Plus every `<div>` attribute.

### AppShell

| Prop | Type | Default | Description |
|---|---|---|---|
| `sidebar` | `ReactNode` | **required** | Usually a `<Sidebar>` |
| `children` | `ReactNode` | **required** | Main area |
| `rail` | `boolean` | `false` | Collapses the sidebar to a 60px icon strip; labels become tooltips |
| `fill` | `boolean` |  | Edge to edge in a parent with a set height: the sidebar stays put, the main area scrolls |
| `className` | `string` |  | Extra classes |

### Sidebar

| Prop | Type | Default | Description |
|---|---|---|---|
| `children` | `ReactNode` | **required** | Workspace, groups, footer |
| `aria-label` | `string` | `'Điều hướng'` | Name of the `<nav>` |

### SidebarWorkspace

| Prop | Type | Default | Description |
|---|---|---|---|
| `logo` | `ReactNode` | **required** | Square logo |
| `name` | `string` | **required** | Workspace name |
| `subtitle` | `string` |  | Second line |
| `onClick` | `() => void` |  | E.g. open a workspace switcher |

### SidebarGroup

| Prop | Type | Default | Description |
|---|---|---|---|
| `label` | `string` | **required** | Section title; clicking it collapses the section |
| `defaultOpen` | `boolean` | `true` | Initial state |
| `children` | `ReactNode` | **required** | SidebarItem rows |

### SidebarItem

| Prop | Type | Default | Description |
|---|---|---|---|
| `icon` | `ReactNode` | **required** | Leading icon; the only thing shown in rail mode |
| `label` | `string` | **required** | Link text, and its tooltip in rail mode |
| `active` | `boolean` |  | Current page (`aria-current="page"`) |
| `count` | `number` |  | Muted number on the right |
| `badge` | `ReactNode` |  | Replaces `count`: a Counter or Badge for items that need attention |
| `kbd` | `string` |  | Shortcut hint |
| `alert` | `boolean` |  | Amber dot in rail mode |
| `className` | `string` |  | Extra classes |

Plus every `<a>` attribute (`href`, `onClick`…).

### SidebarFooter

| Prop | Type | Default | Description |
|---|---|---|---|
| `children` | `ReactNode` | **required** | Pinned to the bottom, e.g. the signed-in user |

### Topbar

| Prop | Type | Default | Description |
|---|---|---|---|
| `children` | `ReactNode` | **required** | Breadcrumb, search, bell, avatar |

### CommandButton

| Prop | Type | Default | Description |
|---|---|---|---|
| `placeholder` | `string` | `'Tìm kiếm…'` | Text in the box |
| `shortcut` | `string` | `'Ctrl K'` (`'⌘ K'` on Apple) | Key hint; CommandPalette binds the key |
| `className` | `string` |  | Extra classes |

Plus every `<button>` prop. Pass it as `<CommandPalette trigger={<CommandButton />} />`.

## Files

- `card.tsx`: Card, CardHeader, CardBody
- `app-shell.tsx`: AppShell, Sidebar, SidebarWorkspace, SidebarGroup, SidebarItem, SidebarFooter, Topbar, CommandButton
- Styles: `.dtx-card*`, `.dtx-shell*`, `.dtx-sidebar*`, `.dtx-topbar`, `.dtx-cmdk*` in `styles.css`
