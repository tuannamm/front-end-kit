/**
 * # Breadcrumb
 *
 * Where this page sits: root → … → current page. Put it in the `Topbar` or above the page title.
 *
 * ```tsx
 * import { Breadcrumb } from '@dgtx/ui-frek';
 *
 * <Breadcrumb items={[
 *   { label: 'Operations', href: '/ops' },
 *   { label: 'Batches', href: '/ops/batches' },
 *   { label: 'HD-5517' },
 * ]} />
 *
 * // client-side routing: onClick runs instead of the page load, the href stays for "open in new tab"
 * { label: 'Batches', href: '/ops/batches', onClick: () => navigate('/ops/batches') }
 * ```
 *
 * ## Notes
 *
 * - A `<nav aria-label="Breadcrumb">` with an ordered list. Separators are decorative chevrons.
 * - The last item is the current page: plain text with `aria-current="page"`, heavier and in the body colour.
 * - An item with `href` is a link; with only `onClick` it is a button; with neither it is plain text (a section that has
 *   no page of its own, e.g. "Operations").
 * - Labels over 28 characters (40 for the current page) truncate with "…"; the full text is in `title` and in the DOM.
 *   On a narrow screen every crumb shrinks in proportion to its length; the trail never pushes its container wider.
 * - More than `maxItems` (4) items: the first, "…", then the last three. "…" (named "Show N hidden items") reveals the rest
 *   and moves focus to the first revealed crumb. Once expanded the trail wraps onto more lines instead of truncating.
 * - Hit areas are at least 24px tall (WCAG 2.5.8).
 *
 * ## Props
 *
 * ### Breadcrumb
 *
 * | Prop | Type | Default | Description |
 * |---|---|---|---|
 * | `items` | `BreadcrumbItem[]` | **required** | From the root to the current page |
 * | `maxItems` | `number` | `4` | Longer trails fold their middle into "…" |
 * | `aria-label` | `string` | `'Breadcrumb'` | Name of the navigation landmark |
 * | `className` | `string` |  | Extra classes |
 *
 * ### BreadcrumbItem
 *
 * | Prop | Type | Default | Description |
 * |---|---|---|---|
 * | `label` | `string` | **required** | Page or section name |
 * | `href` | `string` |  | Makes it a link |
 * | `onClick` | `() => void` |  | Client-side routing; with `href` it replaces the page load |
 * | `icon` | `ReactNode` |  | Small leading icon, e.g. a house for the root |
 *
 * ## Files
 *
 * - `breadcrumb.tsx`: Breadcrumb, `BreadcrumbItem`
 * - `trail.ts`: `visibleCrumbs` (which crumbs to show), tested by `trail.check.ts`
 * - `breadcrumb.css`: `.dtx-crumbs*`
 *
 * @generated from README.md in this folder. Edit the README, then run `npm run docs:sync`.
 */

import { useEffect, useRef, useState, type ReactNode } from 'react';
import { ChevronRight } from 'lucide-react';
import { cx } from '../../cx';
import { visibleCrumbs } from './trail';

export type BreadcrumbItem = {
  label: string;
  /** Link target. Without href or onClick the crumb is plain text (e.g. a section with no page of its own). */
  href?: string;
  /** For client-side routing instead of a full page load. */
  onClick?: () => void;
  /** Small leading icon, e.g. a house for the root. */
  icon?: ReactNode;
};

export type BreadcrumbProps = {
  /** From the root to the current page; the last item is the current page and never a link. */
  items: BreadcrumbItem[];
  /** Longer trails show the first item, "…" and the last `maxItems - 1`. "…" reveals the rest. */
  maxItems?: number;
  'aria-label'?: string;
  className?: string;
};

function Crumb({ item, current }: { item: BreadcrumbItem; current: boolean }) {
  const body = <>{item.icon && <span className="dtx-crumbs__icon" aria-hidden>{item.icon}</span>}<span className="dtx-crumbs__text">{item.label}</span></>;
  if (current) return <span className="dtx-crumbs__item" aria-current="page" title={item.label}>{body}</span>;
  if (item.href !== undefined) return (
    <a className="dtx-crumbs__item dtx-crumbs__link" href={item.href} title={item.label}
      onClick={item.onClick && (e => { e.preventDefault(); item.onClick!(); })}>{body}</a>
  );
  if (item.onClick) return <button type="button" className="dtx-crumbs__item dtx-crumbs__link" title={item.label} onClick={item.onClick}>{body}</button>;
  return <span className="dtx-crumbs__item" title={item.label}>{body}</span>;
}

/** Where this page sits: root → … → current page. Long labels truncate; long trails fold their middle into "…". */
export function Breadcrumb({ items, maxItems = 4, 'aria-label': label = 'Breadcrumb', className }: BreadcrumbProps) {
  const [expanded, setExpanded] = useState(false);
  const list = useRef<HTMLOListElement>(null);
  const shown = expanded ? items.map((_, i) => i) : visibleCrumbs(items.length, maxItems);
  const hidden = items.length - shown.filter(i => i !== null).length;

  // the "…" button is gone after a click: hand focus to the first crumb it revealed
  useEffect(() => {
    if (expanded) list.current?.querySelectorAll<HTMLElement>('li')[1]?.querySelector<HTMLElement>('a, button')?.focus();
  }, [expanded]);
  // a different trail (navigation) starts folded again
  useEffect(() => setExpanded(false), [items.length]);

  return (
    <nav aria-label={label} className={cx('dtx-crumbs', className)} data-expanded={expanded ? '' : undefined}>
      <ol ref={list}>
        {shown.map((i, k) => (
          <li key={i ?? 'gap'}>
            {k > 0 && <ChevronRight className="dtx-crumbs__sep" aria-hidden />}
            {i === null
              ? <button type="button" className="dtx-crumbs__item dtx-crumbs__link dtx-crumbs__more" aria-label={`Show ${hidden} hidden items`} onClick={() => setExpanded(true)}>…</button>
              : <Crumb item={items[i]} current={i === items.length - 1} />}
          </li>
        ))}
      </ol>
    </nav>
  );
}
