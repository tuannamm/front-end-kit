import { Fragment, useMemo, type ReactNode } from 'react';
import { Select as BSelect } from '@base-ui/react/select';
import { Combobox } from '@base-ui/react/combobox';
import { Check, ChevronDown, Search, X } from 'lucide-react';
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
const toLabel = (o: SelectOption | null) => o?.label ?? '';
const sameOption = (a: SelectOption, b: SelectOption) => a?.value === b?.value;
const matches = (o: SelectOption, q: string) => fold(`${o.label} ${o.description ?? ''}`).includes(fold(q));

function useOptions(items: SelectOption[] | SelectGroup[]) {
  return useMemo(() => {
    const groups: SelectGroup[] = isGroups(items) ? items : [{ label: '', items }];
    const flat = groups.flatMap(g => g.items);
    const itemCls = cx('dtx-select-item', flat.some(o => o.description) && 'dtx-select-item--rich');
    return { groups, flat, byValue: new Map(flat.map(o => [o.value, o])), itemCls };
  }, [items]);
}

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
  const { groups, flat, byValue, itemCls } = useOptions(items);
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
      isItemEqualToValue={sameOption}
      filter={matches}
      disabled={props.disabled}
      autoHighlight
    >
      <Combobox.Trigger className={trigCls} aria-label={props['aria-label']}>
        <Combobox.Value>{(v: SelectOption | null) => <span className="dtx-select-value" data-placeholder={v ? undefined : ''}><ValueBody o={v ?? undefined} placeholder={placeholder} /></span>}</Combobox.Value>
        {chev}
      </Combobox.Trigger>
      <ComboPopup grouped={isGroups(items)} itemCls={itemCls} label={props['aria-label'] ?? placeholder} emptyText={props.emptyText}>
        <div className="dtx-select-search"><Search aria-hidden /><Combobox.Input placeholder={props.searchPlaceholder ?? 'Tìm…'} /></div>
      </ComboPopup>
    </Combobox.Root>
  );
}

export type MultiSelectProps = Omit<SelectProps, 'value' | 'defaultValue' | 'onValueChange' | 'searchable' | 'searchPlaceholder'> & {
  value?: string[];
  defaultValue?: string[];
  onValueChange?: (value: string[]) => void;
};

/**
 * Several values as removable chips. Same items as Select (flat, grouped, icon, description).
 * Typing in the box filters accent-insensitively; Backspace removes the last chip, ←/→ move between chips.
 */
export function MultiSelect(props: MultiSelectProps) {
  const { items, placeholder = 'Chọn…', size = 'md', className } = props;
  const { groups, flat, byValue, itemCls } = useOptions(items);
  const toOptions = (vs?: string[]) => vs?.flatMap(v => byValue.get(v) ?? []);
  return (
    <Combobox.Root
      multiple
      items={isGroups(items) ? groups.map(g => ({ value: g.label, items: g.items })) : flat}
      value={toOptions(props.value)}
      defaultValue={toOptions(props.defaultValue)}
      onValueChange={v => props.onValueChange?.((v as SelectOption[]).map(o => o.value))}
      itemToStringLabel={toLabel}
      isItemEqualToValue={sameOption}
      filter={matches}
      disabled={props.disabled}
      autoHighlight
    >
      <Combobox.InputGroup className={cx('dtx-select-trigger dtx-ms', size === 'sm' && 'dtx-select-trigger--sm', className)}>
        <Combobox.Value>
          {(v: SelectOption[]) => (
            <Combobox.Chips className="dtx-chips" aria-label={v.length ? 'Đã chọn' : undefined}>
              {v.map(o => (
                <Combobox.Chip key={o.value} className="dtx-badge dtx-badge--surface dtx-badge--lg dtx-tone-neutral dtx-ms__chip" aria-label={o.label}>
                  <span>{o.label}</span>
                  <Combobox.ChipRemove className="dtx-badge__remove" aria-label={`Bỏ chọn ${o.label}`}><X size={10} strokeWidth={2.5} /></Combobox.ChipRemove>
                </Combobox.Chip>
              ))}
              <Combobox.Input className="dtx-ms__input" placeholder={v.length ? undefined : placeholder} aria-label={props['aria-label']} />
            </Combobox.Chips>
          )}
        </Combobox.Value>
        <Combobox.Trigger className="dtx-ms__toggle" aria-label="Mở danh sách"><ChevronDown className="dtx-select-chev" aria-hidden /></Combobox.Trigger>
      </Combobox.InputGroup>
      <ComboPopup grouped={isGroups(items)} itemCls={itemCls} label={props['aria-label'] ?? placeholder} emptyText={props.emptyText} />
    </Combobox.Root>
  );
}

function ComboPopup({ grouped, itemCls, label, emptyText, children }: { grouped: boolean; itemCls: string; label: string; emptyText?: string; children?: ReactNode }) {
  const item = (o: SelectOption) => <Combobox.Item key={o.value} value={o} disabled={o.disabled} className={itemCls}><OptionBody o={o} /></Combobox.Item>;
  return (
    <Combobox.Portal>
      <Combobox.Positioner className="dtx-select-positioner" sideOffset={6} align="start">
        <Combobox.Popup className="dtx-select-popup" aria-label={label}>
          {children}
          <Combobox.Empty className="dtx-select-empty">{emptyText ?? 'Không tìm thấy kết quả'}</Combobox.Empty>
          <Combobox.List>
            {grouped
              ? (g: { value: string; items: SelectOption[] }) => (
                  <Combobox.Group key={g.value} items={g.items}>
                    <Combobox.GroupLabel className="dtx-select-group-label">{g.value}</Combobox.GroupLabel>
                    <Combobox.Collection>{item}</Combobox.Collection>
                  </Combobox.Group>
                )
              : item}
          </Combobox.List>
        </Combobox.Popup>
      </Combobox.Positioner>
    </Combobox.Portal>
  );
}
