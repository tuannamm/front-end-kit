import { createElement, type ReactNode } from 'react';
import { Accordion } from '@base-ui/react/accordion';
import { ChevronDown } from 'lucide-react';
import { cx } from '../../cx';

export type CollapseItem = {
  value: string;
  title: ReactNode;
  /** Second line under the title, e.g. a summary of what is inside. */
  description?: ReactNode;
  content: ReactNode;
  /** Right side of the header, outside the toggle button, so it may be interactive (Badge, Switch, Menu). */
  extra?: ReactNode;
  disabled?: boolean;
};

export type CollapseProps = {
  items: CollapseItem[];
  /** Several panels open at once. false = opening one closes the others (accordion). */
  multiple?: boolean;
  /** Open panels (controlled). */
  value?: string[];
  defaultValue?: string[];
  onValueChange?: (value: string[]) => void;
  /** Wraps the list in a hairline box. Leave it off inside a Card. */
  bordered?: boolean;
  /** Level of the header headings, to fit the page outline. */
  headingLevel?: 2 | 3 | 4 | 5 | 6;
  className?: string;
};

/**
 * Sections that open and close under their headings: FAQ, settings groups, long details.
 * Closed panels stay in the page, so Ctrl/⌘+F finds their text and opens them.
 */
export function Collapse({ items, multiple = true, value, defaultValue, onValueChange, bordered, headingLevel = 3, className }: CollapseProps) {
  return (
    <Accordion.Root
      className={cx('dtx-collapse', bordered && 'dtx-collapse--bordered', className)} multiple={multiple} hiddenUntilFound
      value={value} defaultValue={defaultValue} onValueChange={v => onValueChange?.(v as string[])}
    >
      {items.map(it => (
        <Accordion.Item key={it.value} value={it.value} disabled={it.disabled} className="dtx-collapse__item">
          <Accordion.Header className="dtx-collapse__header" render={createElement(`h${headingLevel}`)}>
            <Accordion.Trigger className="dtx-collapse__trigger">
              <ChevronDown className="dtx-collapse__chev" aria-hidden />
              <span className="dtx-collapse__title">{it.title}{it.description && <small>{it.description}</small>}</span>
            </Accordion.Trigger>
            {it.extra && <span className="dtx-collapse__extra">{it.extra}</span>}
          </Accordion.Header>
          <Accordion.Panel className="dtx-collapse__panel"><div className="dtx-collapse__body">{it.content}</div></Accordion.Panel>
        </Accordion.Item>
      ))}
    </Accordion.Root>
  );
}
