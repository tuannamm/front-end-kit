import { Fragment, useMemo, type ReactNode } from 'react';
import { Select as BSelect } from '@base-ui/react/select';
import { Combobox } from '@base-ui/react/combobox';
import { Check, ChevronDown, Search } from 'lucide-react';
import { cx } from '../cx';
import { IconTile, type Tone } from './badge';

export type SelectOption = {
  value: string;
  label: string;
  /** Second line under the label. */
  description?: string;
  /** Rendered in a tinted tile. Mix freely: options without an icon stay aligned to text. */
  icon?: ReactNode;
  tone?: Tone;
  disabled?: boolean;
};
export type SelectGroup = { label: string; items: SelectOption[] };

export type SelectProps = {
  /** Flat options, or groups with headings. Any mix of icon / description per option. */
  items: SelectOption[] | SelectGroup[];
  value?: string | null;
  defaultValue?: string | null;
  onValueChange?: (value: string | null) => void;
  placeholder?: string;
  /** Adds a search box in the popup (accent-insensitive: "bao hiem" matches "Bảo hiểm"). */
  searchable?: boolean;
  searchPlaceholder?: string;
  emptyText?: string;
  size?: 'sm' | 'md';
  disabled?: boolean;
  /** Accessible name when there is no visible <Field label>. */
  'aria-label'?: string;
  className?: string;
};

const isGroups = (x: SelectOption[] | SelectGroup[]): x is SelectGroup[] => x.length > 0 && 'items' in x[0];
const fold = (s: string) => s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/đ/g, 'd');

function OptionBody({ o }: { o: SelectOption }) {
  return (
    <>
      {o.icon && <IconTile tone={o.tone}>{o.icon}</IconTile>}
      <span className="dtx-select-text">
        <span>{o.label}</span>
        {o.description && <small>{o.description}</small>}
      </span>
      <Check className="dtx-select-check" aria-hidden />
    </>
  );
}

function ValueBody({ o, placeholder }: { o?: SelectOption; placeholder?: string }) {
  if (!o) return <>{placeholder}</>;
  return <>{o.icon && <IconTile tone={o.tone}>{o.icon}</IconTile>}<span>{o.label}</span></>;
}

/**
 * One API for every dropdown: plain list, icons, descriptions, groups, search — or any mix.
 * Plain: Base UI Select (typeahead). searchable: Base UI Combobox with the input inside the popup.
 */
export function Select(props: SelectProps) {
  const { items, placeholder = 'Chọn…', size = 'md', className } = props;
  const groups: SelectGroup[] = useMemo(() => (isGroups(items) ? items : [{ label: '', items }]), [items]);
  const flat = useMemo(() => groups.flatMap(g => g.items), [groups]);
  const byValue = useMemo(() => new Map(flat.map(o => [o.value, o])), [flat]);
  const rich = flat.some(o => o.description);
  const itemCls = cx('dtx-select-item', rich && 'dtx-select-item--rich');
  const trigCls = cx('dtx-select-trigger', size === 'sm' && 'dtx-select-trigger--sm', className);
  const chev = <ChevronDown className="dtx-select-chev" aria-hidden />;

  if (!props.searchable) {
    return (
      <BSelect.Root items={flat.map(o => ({ value: o.value, label: o.label }))} value={props.value} defaultValue={props.defaultValue} onValueChange={v => props.onValueChange?.(v as string | null)} disabled={props.disabled}>
        <BSelect.Trigger className={trigCls} aria-label={props['aria-label']}>
          <BSelect.Value className="dtx-select-value">{(v: string | null) => <ValueBody o={v ? byValue.get(v) : undefined} placeholder={placeholder} />}</BSelect.Value>
          {chev}
        </BSelect.Trigger>
        <BSelect.Portal>
          <BSelect.Positioner className="dtx-select-positioner" sideOffset={6} alignItemWithTrigger={false}>
            <BSelect.Popup className="dtx-select-popup">
              <BSelect.List>
                {groups.map((g, gi) => (
                  <Fragment key={g.label || gi}>
                    {gi > 0 && <BSelect.Separator className="dtx-select-sep" />}
                    <BSelect.Group>
                      {g.label && <BSelect.GroupLabel className="dtx-select-group-label">{g.label}</BSelect.GroupLabel>}
                      {g.items.map(o => (
                        <BSelect.Item key={o.value} value={o.value} disabled={o.disabled} className={itemCls} label={o.label}>
                          <OptionBody o={o} />
                        </BSelect.Item>
                      ))}
                    </BSelect.Group>
                  </Fragment>
                ))}
              </BSelect.List>
            </BSelect.Popup>
          </BSelect.Positioner>
        </BSelect.Portal>
      </BSelect.Root>
    );
  }

  const toLabel = (o: SelectOption | null) => o?.label ?? '';
  const comboItems = isGroups(items) ? groups.map(g => ({ value: g.label, items: g.items })) : flat;
  const selected = props.value === undefined ? undefined : props.value ? byValue.get(props.value) ?? null : null;
  const initial = props.defaultValue ? byValue.get(props.defaultValue) ?? null : undefined;
  return (
    <Combobox.Root
      items={comboItems}
      value={selected}
      defaultValue={initial}
      onValueChange={v => props.onValueChange?.((v as SelectOption | null)?.value ?? null)}
      itemToStringLabel={toLabel}
      isItemEqualToValue={(a: SelectOption, b: SelectOption) => a?.value === b?.value}
      filter={(o: SelectOption, q: string) => fold(`${o.label} ${o.description ?? ''}`).includes(fold(q))}
      disabled={props.disabled}
      autoHighlight
    >
      <Combobox.Trigger className={trigCls} aria-label={props['aria-label']}>
        <Combobox.Value>{(v: SelectOption | null) => <span className="dtx-select-value" data-placeholder={v ? undefined : ''}><ValueBody o={v ?? undefined} placeholder={placeholder} /></span>}</Combobox.Value>
        {chev}
      </Combobox.Trigger>
      <Combobox.Portal>
        <Combobox.Positioner className="dtx-select-positioner" sideOffset={6} align="start">
          <Combobox.Popup className="dtx-select-popup" aria-label={props['aria-label'] ?? placeholder}>
            <div className="dtx-select-search"><Search aria-hidden /><Combobox.Input placeholder={props.searchPlaceholder ?? 'Tìm…'} /></div>
            <Combobox.Empty className="dtx-select-empty">{props.emptyText ?? 'Không tìm thấy kết quả'}</Combobox.Empty>
            <Combobox.List>
              {isGroups(items)
                ? (g: { value: string; items: SelectOption[] }) => (
                    <Combobox.Group key={g.value} items={g.items}>
                      <Combobox.GroupLabel className="dtx-select-group-label">{g.value}</Combobox.GroupLabel>
                      <Combobox.Collection>
                        {(o: SelectOption) => <Combobox.Item key={o.value} value={o} disabled={o.disabled} className={itemCls}><OptionBody o={o} /></Combobox.Item>}
                      </Combobox.Collection>
                    </Combobox.Group>
                  )
                : (o: SelectOption) => <Combobox.Item key={o.value} value={o} disabled={o.disabled} className={itemCls}><OptionBody o={o} /></Combobox.Item>}
            </Combobox.List>
          </Combobox.Popup>
        </Combobox.Positioner>
      </Combobox.Portal>
    </Combobox.Root>
  );
}
