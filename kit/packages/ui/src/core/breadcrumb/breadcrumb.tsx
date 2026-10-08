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
export function Breadcrumb({ items, maxItems = 4, 'aria-label': label = 'Đường dẫn', className }: BreadcrumbProps) {
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
              ? <button type="button" className="dtx-crumbs__item dtx-crumbs__link dtx-crumbs__more" aria-label={`Hiện ${hidden} mục bị ẩn`} onClick={() => setExpanded(true)}>…</button>
              : <Crumb item={items[i]} current={i === items.length - 1} />}
          </li>
        ))}
      </ol>
    </nav>
  );
}
