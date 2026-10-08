# Breadcrumb

Where this page sits: root → … → current page. Put it in the `Topbar` or above the page title.

```tsx
import { Breadcrumb } from '@dtx/ui';

<Breadcrumb items={[
  { label: 'Vận hành', href: '/ops' },
  { label: 'Lô tài liệu', href: '/ops/batches' },
  { label: 'HD-5517' },
]} />

// client-side routing: onClick runs instead of the page load, the href stays for "open in new tab"
{ label: 'Lô tài liệu', href: '/ops/batches', onClick: () => navigate('/ops/batches') }
```

## Notes

- A `<nav aria-label="Đường dẫn">` with an ordered list. Separators are decorative chevrons.
- The last item is the current page: plain text with `aria-current="page"`, heavier and in the body colour.
- An item with `href` is a link; with only `onClick` it is a button; with neither it is plain text (a section that has
  no page of its own, e.g. "Vận hành").
- Labels over 28 characters (40 for the current page) truncate with "…"; the full text is in `title` and in the DOM.
  On a narrow screen every crumb shrinks in proportion to its length; the trail never pushes its container wider.
- More than `maxItems` (4) items: the first, "…", then the last three. "…" (named "Hiện N mục bị ẩn") reveals the rest
  and moves focus to the first revealed crumb. Once expanded the trail wraps onto more lines instead of truncating.
- Hit areas are at least 24px tall (WCAG 2.5.8).

## Props

### Breadcrumb

| Prop | Type | Default | Description |
|---|---|---|---|
| `items` | `BreadcrumbItem[]` | **required** | From the root to the current page |
| `maxItems` | `number` | `4` | Longer trails fold their middle into "…" |
| `aria-label` | `string` | `'Đường dẫn'` | Name of the navigation landmark |
| `className` | `string` |  | Extra classes |

### BreadcrumbItem

| Prop | Type | Default | Description |
|---|---|---|---|
| `label` | `string` | **required** | Page or section name |
| `href` | `string` |  | Makes it a link |
| `onClick` | `() => void` |  | Client-side routing; with `href` it replaces the page load |
| `icon` | `ReactNode` |  | Small leading icon, e.g. a house for the root |

## Files

- `breadcrumb.tsx`: Breadcrumb, `BreadcrumbItem`
- `trail.ts`: `visibleCrumbs` (which crumbs to show), tested by `trail.check.ts`
- `breadcrumb.css`: `.dtx-crumbs*`
