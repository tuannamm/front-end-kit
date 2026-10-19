/**
 * # Collapse
 *
 * Sections that open and close under their headings: FAQ, settings groups, long details on a record page.
 *
 * ```tsx
 * import { Collapse } from '@dgtx/ui-frek';
 *
 * <Collapse multiple={false} defaultValue={['sla']} items={[
 *   { value: 'sla', title: 'When does the SLA start?', content: 'From the moment the batch has all original records…' },
 *   { value: 'format', title: 'Which formats does the system accept?', content: <FormatList /> },
 * ]} />
 *
 * // settings groups: a second line, a status on the right, in a hairline box
 * <Collapse bordered headingLevel={2} items={[
 *   { value: 'ocr', title: 'Recognition (OCR)', description: 'Language, confidence threshold', extra: <Badge tone="ok">On</Badge>, content: <OcrSettings /> },
 * ]} />
 * ```
 *
 * ## Notes
 *
 * - Built on the Base UI Accordion. Each header is a heading (`headingLevel`, default h3) holding a button with
 *   `aria-expanded`. Tab moves between headers, Enter/Space toggles (no arrow-key roving, per the current APG pattern).
 * - `multiple` (default) lets several panels stay open; `multiple={false}` closes the others when one opens.
 * - Closed panels stay in the DOM with `hidden="until-found"`: Ctrl/⌘+F finds their text and opens the panel.
 * - `extra` sits outside the toggle button, so it may hold a Switch or a Menu. Keep it short; it never wraps.
 * - The chevron points along the reading direction while closed (mirrored in RTL) and down when open. The panel height
 *   and opacity animate; under reduced motion it opens at once.
 * - The body lines up with the title text, past the chevron. `bordered` adds a hairline box and more inline room;
 *   inside a `Card` leave it off.
 *
 * ## Props
 *
 * ### Collapse
 *
 * | Prop | Type | Default | Description |
 * |---|---|---|---|
 * | `items` | `CollapseItem[]` | **required** |  |
 * | `multiple` | `boolean` | `true` | Several panels open at once; `false` = accordion |
 * | `value` | `string[]` |  | Open panels (controlled) |
 * | `defaultValue` | `string[]` |  | Initially open panels |
 * | `onValueChange` | `(value: string[]) => void` |  |  |
 * | `bordered` | `boolean` |  | Hairline box around the list |
 * | `headingLevel` | `2 \| 3 \| 4 \| 5 \| 6` | `3` | Level of the header headings |
 * | `className` | `string` |  | Extra classes |
 *
 * ### CollapseItem
 *
 * | Prop | Type | Default | Description |
 * |---|---|---|---|
 * | `value` | `string` | **required** | Identifies the panel in `value` |
 * | `title` | `ReactNode` | **required** | Header text |
 * | `description` | `ReactNode` |  | Second line under the title |
 * | `content` | `ReactNode` | **required** | Panel body |
 * | `extra` | `ReactNode` |  | Right side of the header, outside the button |
 * | `disabled` | `boolean` |  |  |
 *
 * ## Files
 *
 * - `collapse.tsx`: Collapse, `CollapseItem`
 * - `collapse.css`: `.dtx-collapse*`
 *
 * Catalog: `#/catalog/collapse`
 *
 * @generated from README.md in this folder. Edit the README, then run `npm run docs:sync`.
 */

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
