import { useCallback, useState, type ReactNode } from 'react';
import { AlertTriangle, BarChart3, CheckCircle2, CircleAlert, CircleCheck, FileStack, LayoutDashboard, Layers, ScanText, Settings, Sparkles, TrendingUp, Users } from 'lucide-react';
import {
  AppShell, Avatar, Badge, Calendar, Checkbox, CheckboxGroup, DatePicker, DateRangePicker, RadioGroup, addDays, todayIso, BoxOverlay, Button, Card, CardHeader, CategoryBar, CommandButton, CompareSlider, ConfidenceBadge, ConfidenceBar, ConfidenceDots,
  CountUp, Counter, DataTable, Dialog, DialogClose, Display, DocumentScan, Eyebrow, Field, HexIcon, IconTile, Input, Kbd, KpiCard, Lede,
  Logo, Meter, MultiSelect, OcrShowcase, Preprocess, PreprocessPipeline, ProgressRing, Reveal, SampleInvoice, ScanBeam, ScanReveal, SectionHeader, Segmented, Select, Sidebar,
  SidebarGroup, SidebarItem, SidebarWorkspace, Skeleton, SkeletonText, Sparkline, StackedBarChart, Switch, Tabs, TargetBar, TechBackdrop,
  Tooltip, Topbar, mascotUrl, sampleInvoiceRegions, sampleInvoiceInset, type DateRange, type NormalizedOcr, type OcrBox, type GeometryStep, type ScanPhase, type Tone,
} from '@dtx/ui';
import { aiThroughput, batches, hours, invoiceFields, invoiceRows, manualThroughput } from '../data';
import { docTypeGroups, shiftOptions, statusOptions } from '../options';
import { RealBoxes, RealEnhance, RealShowcase, RealUnwarp } from './real';
import { demoPair, type DemoStep } from '../demo-pairs';
import { DurationBars, EasingCurves, ExitDemo, LoadableDemo, StaggerList, SwatchGrid, ToastDemo, TypeScale, radii, spacing } from './demos';

export type Category = 'Foundations' | 'Core' | 'Layout' | 'Data' | 'Motion' | 'Brand' | 'AI · Shared' | 'AI · Preprocess' | 'AI · OCR' | 'AI · Extraction' | 'AI · Try-on' | 'AI · Enhance' | 'AI · Remove background';
export const categories: { id: Category; folder: string; blurb: string }[] = [
  { id: 'Foundations', folder: '@dtx/tokens', blurb: 'Colour, type, spacing, shape, elevation, contrast.' },
  { id: 'Core', folder: 'ui/src/core', blurb: 'Generic controls every screen uses.' },
  { id: 'Layout', folder: 'ui/src/layout', blurb: 'Page structure and app frame.' },
  { id: 'Data', folder: 'ui/src/data', blurb: 'KPIs, tables and small charts.' },
  { id: 'Motion', folder: 'ui/src/motion', blurb: 'Tokens and reusable motion, one phase per entry.' },
  { id: 'Brand', folder: 'ui/src/brand', blurb: 'DIGI-TEXX identity pieces from the Guidelines PDF.' },
  { id: 'AI · Shared', folder: 'ui/src/ai/shared', blurb: 'Reused across AI tasks: boxes, confidence, compare, sample page.' },
  { id: 'AI · Preprocess', folder: 'ui/src/ai/preprocess', blurb: 'Crop, unwarp, deskew, denoise, binarize: each a two-phase animation.' },
  { id: 'AI · OCR', folder: 'ui/src/ai/ocr', blurb: 'Engine JSON → boxes, and the POC pipeline player.' },
  { id: 'AI · Extraction', folder: 'ui/src/ai/extraction', blurb: 'Field extraction (VLM) visuals.' },
  { id: 'AI · Try-on', folder: 'ui/src/ai/try-on', blurb: 'Planned.' },
  { id: 'AI · Enhance', folder: 'ui/src/ai/enhance', blurb: 'Planned.' },
  { id: 'AI · Remove background', folder: 'ui/src/ai/remove-bg', blurb: 'Planned.' },
];

export type Demo = { title: string; note?: string; replay?: boolean; /** theme-fixed demo, e.g. a logo variant made for one background */ only?: 'light' | 'dark'; plain?: boolean; code?: string; render: (run: number) => ReactNode };
export type Entry = { id: string; name: string; category: Category; status: 'ready' | 'planned'; summary: string; importLine?: string; props?: [string, string, string][]; demos: Demo[] };

const imp = (names: string) => `import { ${names} } from '@dtx/ui';`;
const tones: Tone[] = ['brand', 'ok', 'warn', 'err', 'neutral', 'violet'];
const toneLabel: Record<Tone, string> = { brand: 'Thông tin', ok: 'Hoàn tất', warn: 'Cảnh báo', err: 'Lỗi', neutral: 'Nháp', violet: 'AI gợi ý' };

/** Measures the sample invoice once and shares the boxes with the demos. */
function useInvoiceBoxes(): [OcrBox[], (b: OcrBox[]) => void] {
  const [boxes, setBoxes] = useState<OcrBox[]>([]);
  return [boxes, useCallback((b: OcrBox[]) => setBoxes(b), [])];
}
function InvoiceBoxes({ colorBy = 'confidence', regions, run, hover }: { colorBy?: 'confidence' | 'kind' | 'plain'; regions?: boolean; run: number; hover?: 'lens' | 'blink' }) {
  const [lines, setLines] = useInvoiceBoxes();
  const [sel, setSel] = useState<OcrBox | null>(null);
  return (
    <div className="grid w-full max-w-3xl gap-2">
      <BoxOverlay key={run} hover={hover} textInset={sampleInvoiceInset} boxes={regions ? sampleInvoiceRegions : lines} colorBy={regions ? 'kind' : colorBy} showLabels={regions} selectedId={sel?.id} onSelect={setSel}>
        <SampleInvoice onBoxes={setLines} />
      </BoxOverlay>
      <p className="m-0 text-xs text-fg-muted">{sel ? <>Đã chọn: <b className="text-fg">{sel.text ?? sel.kind}</b></> : 'Rê chuột hoặc Tab vào một ô để xem chữ và độ tin cậy. Click để chọn.'}</p>
    </div>
  );
}
/** Static interaction states side by side, so reviewers see hover/selected without a pointer. */
function BoxStates({ mode }: { mode: 'states' | 'styles' }) {
  const [lines, setLines] = useInvoiceBoxes();
  const items = mode === 'states'
    ? [{ name: 'Rest', note: 'tất cả ô hiển thị', props: {} }, { name: 'Hover / focus', note: 'pinnedId="r2"', props: { pinnedId: 'r2' } }, { name: 'Selected', note: 'selectedId="total"', props: { selectedId: 'total' } }]
    : (['lens', 'blink'] as const).map(h => ({ name: `hover="${h}"`, note: { lens: 'ảnh gốc phóng to, chữ AI ngay bên dưới, cùng tỉ lệ và cùng mép trái', blink: 'ô nháy giữa ảnh gốc và chữ AI tại chỗ (đứng yên khi giảm chuyển động)' }[h], props: { hover: h, pinnedId: 'r2' } }));
  return (
    <div className="grid gap-6">
      {items.map(st => (
        <figure key={st.name} className="m-0 grid max-w-[820px] content-start gap-2">
          <figcaption className="text-xs"><code className="font-medium text-fg">{st.name}</code> <span className="text-fg-muted">· {st.note}</span></figcaption>
          <BoxOverlay boxes={lines} animate={false} textInset={sampleInvoiceInset} {...st.props}><SampleInvoice onBoxes={setLines} /></BoxOverlay>
        </figure>
      ))}
    </div>
  );
}
function SampleShowcase({ stages, run }: { stages?: Parameters<typeof OcrShowcase>[0]['stages']; run: number }) {
  const [lines, setLines] = useInvoiceBoxes();
  const data: NormalizedOcr = {
    lines, regions: sampleInvoiceRegions,
    fields: [
      { key: 'seller', label: 'Đơn vị bán', value: 'Công ty TNHH Minh Phát', confidence: 99.4, lineId: 'company' },
      { key: 'invoice_no', label: 'Số hoá đơn', value: '0000347', confidence: 99.8, lineId: 'no' },
      { key: 'issue_date', label: 'Ngày', value: '2026-10-02', confidence: 99.6, lineId: 'date' },
      { key: 'tax_code', label: 'MST', value: '0312456789', confidence: 97.9, lineId: 'tax' },
      { key: 'vat', label: 'Thuế GTGT', value: '1,152,000', confidence: 94.2, lineId: 'vat' },
      { key: 'total', label: 'Tổng cộng', value: '15,552,000 VND', confidence: 99.7, lineId: 'total' },
    ],
  };
  return <div className="w-full"><OcrShowcase key={run} data={data} stages={stages} page={<SampleInvoice onBoxes={setLines} />} title="DIGI-XTRACT" /></div>;
}
function PreprocessToggle({ effect }: { effect: GeometryStep }) {
  const [applied, setApplied] = useState(false);
  return (
    <div className="grid w-full max-w-sm gap-3">
      <Preprocess effect={effect} applied={applied}><SampleInvoice /></Preprocess>
      <Segmented aria-label="Trạng thái" value={applied ? 'after' : 'before'} onValueChange={v => setApplied(v === 'after')} options={[{ value: 'before', label: 'Phase 1 · Ảnh gốc' }, { value: 'after', label: 'Phase 2 · Đã xử lý' }]} />
    </div>
  );
}
function ScanPhaseDemo({ phase, run }: { phase?: ScanPhase; run: number }) {
  return <div className="w-full max-w-xl"><DocumentScan key={run} fileName="hoa-don-0347.pdf" title="HOÁ ĐƠN GIÁ TRỊ GIA TĂNG" rows={invoiceRows} fields={invoiceFields} phase={phase} /></div>;
}
function SelectDemo(props: Parameters<typeof Select>[0] & { label: string }) {
  const { label, ...rest } = props;
  return <div className="w-72"><Field label={label}><Select {...rest} /></Field></div>;
}
function MultiSelectDemo(props: Parameters<typeof MultiSelect>[0] & { label: string }) {
  const { label, ...rest } = props;
  return <div className="w-72"><Field label={label}><MultiSelect {...rest} /></Field></div>;
}
function MultiSelectControlled() {
  const [value, setValue] = useState(['vat', 'hr']);
  return (
    <div className="grid w-72 gap-2">
      <Field label="Loại tài liệu cần xử lý"><MultiSelect items={docTypeGroups} value={value} onValueChange={setValue} /></Field>
      <p className="m-0 text-xs text-fg-muted">value = <code>{JSON.stringify(value)}</code></p>
    </div>
  );
}
const exportOptions = [
  { value: 'xlsx', label: 'Excel (.xlsx)', description: 'Một dòng mỗi tài liệu' },
  { value: 'json', label: 'JSON', description: 'Giữ toạ độ ô và độ tin cậy' },
  { value: 'pdf', label: 'PDF có lớp chữ', description: 'Tìm kiếm được · sắp ra mắt', disabled: true },
];
function CheckboxGroupControlled() {
  const [value, setValue] = useState(['vat']);
  const types = [{ value: 'vat', label: 'Hoá đơn VAT' }, { value: 'claim', label: 'Hồ sơ bồi thường' }, { value: 'hr', label: 'Hồ sơ nhân sự' }, { value: 'bill', label: 'Vận đơn' }];
  return (
    <div className="grid gap-2">
      <CheckboxGroup label="Loại tài liệu cần QC" selectAll="Tất cả loại" options={types} value={value} onValueChange={setValue} />
      <p className="m-0 text-xs text-fg-muted">value = <code>{JSON.stringify(value)}</code></p>
    </div>
  );
}
function DatePickerControlled() {
  const [value, setValue] = useState<string | null>('2026-10-05');
  return (
    <div className="grid w-64 gap-2">
      <Field label="Ngày nhận hồ sơ"><DatePicker value={value} onValueChange={setValue} /></Field>
      <p className="m-0 text-xs text-fg-muted">value = <code>{JSON.stringify(value)}</code></p>
    </div>
  );
}
function DatePickerFormats() {
  const [format, setFormat] = useState('yyyy-MM-dd');
  const [value, setValue] = useState<string | null>('2026-10-05');
  return (
    <div className="grid justify-items-start gap-4">
      <Segmented aria-label="Định dạng ngày" value={format} onValueChange={setFormat} options={['dd/MM/yyyy', 'yyyy-MM-dd', 'MM/dd/yyyy', 'd.M.yyyy'].map(f => ({ value: f, label: f }))} />
      <div className="grid w-64 gap-2">
        <Field label="Ngày phát hành"><DatePicker format={format} value={value} onValueChange={setValue} /></Field>
        <p className="m-0 text-xs text-fg-muted">value = <code>{JSON.stringify(value)}</code></p>
      </div>
    </div>
  );
}
function DateRangeControlled() {
  const [range, setRange] = useState<DateRange>({ from: '2026-10-01', to: '2026-10-15' });
  return (
    <div className="grid w-72 gap-2">
      <DateRangePicker label="Kỳ báo cáo" value={range} onValueChange={setRange} />
      <p className="m-0 text-xs text-fg-muted">value = <code>{JSON.stringify(range)}</code></p>
    </div>
  );
}
function RailDemo() {
  const [rail, setRail] = useState(false);
  return (
    <div className="grid w-full gap-3">
      <Switch label="Thu gọn (rail)" checked={rail} onCheckedChange={setRail} />
      <AppShell rail={rail} className="min-h-[360px]" sidebar={
        <Sidebar>
          <SidebarWorkspace logo={<Logo variant="square" />} name="DIGI-XTRACT" subtitle="Operations console" />
          <SidebarGroup label="Vận hành">
            <SidebarItem href="#" onClick={e => e.preventDefault()} icon={<LayoutDashboard />} label="Tổng quan" active kbd="G O" />
            <SidebarItem href="#" onClick={e => e.preventDefault()} icon={<FileStack />} label="Lô tài liệu" count={128} kbd="G L" />
            <SidebarItem href="#" onClick={e => e.preventDefault()} icon={<CircleCheck />} label="Kiểm tra (QC)" badge={<Counter tone="warn">14</Counter>} alert />
            <SidebarItem href="#" onClick={e => e.preventDefault()} icon={<ScanText />} label="Mẫu trích xuất" badge={<Badge size="sm" variant="outline">Mới</Badge>} />
          </SidebarGroup>
          <SidebarGroup label="Quản trị" defaultOpen={false}>
            <SidebarItem href="#" onClick={e => e.preventDefault()} icon={<Users />} label="Khách hàng" count={32} />
            <SidebarItem href="#" onClick={e => e.preventDefault()} icon={<Settings />} label="Cài đặt" />
          </SidebarGroup>
        </Sidebar>
      }>
        <Topbar><span className="text-sm text-fg-muted">Vận hành / <b className="font-medium text-fg">Tổng quan</b></span><CommandButton /></Topbar>
        <div className="p-5 text-sm text-fg-muted">Nội dung trang</div>
      </AppShell>
    </div>
  );
}

const planned = (id: string, name: string, category: Category, summary: string): Entry => ({ id, name, category, status: 'planned', summary, demos: [] });

export const entries: Entry[] = [
  // ───────────── Foundations ─────────────
  { id: 'color', name: 'Colour', category: 'Foundations', status: 'ready', summary: 'Every colour is tagged by source: rule (stated in the Guidelines PDF), sampled (in PDF artwork, pixel-sampled), kit (our UI decision).',
    importLine: '@import "@dtx/tokens/theme.css";  /* var(--dtx-blue), var(--dtx-surface)… */',
    demos: [{ title: 'Palette', plain: true, render: () => <SwatchGrid /> },
      { title: 'Semantic tokens follow the theme', note: 'Components use semantic tokens only (--dtx-bg, --dtx-surface, --dtx-fg…). data-theme="dark" on any element flips that subtree.', render: () => (
        <div className="grid w-full gap-3 sm:grid-cols-2">{[undefined, 'dark'].map(t => (
          <div key={t ?? 'l'} data-theme={t ?? 'light'} className="grid gap-2 rounded-lg border border-border bg-bg p-4 text-sm">
            <b>{t ? 'Dark' : 'Light'}</b>
            {['bg', 'surface', 'surface-2', 'fg', 'fg-muted', 'link', 'primary', 'border'].map(k => <div key={k} className="flex items-center gap-2"><i className="block size-5 rounded-sm border border-border" style={{ background: `var(--dtx-${k})` }} /><code className="text-xs">--dtx-{k}</code></div>)}
          </div>))}
        </div>) }] },
  { id: 'typography', name: 'Typography', category: 'Foundations', status: 'ready', summary: 'Roboto only (Guidelines §07), Arial fallback. Headlines: Roboto Bold Italic uppercase. Numbers: tabular figures. Line-height ≥ 1.15 so Vietnamese stacked diacritics never clip.',
    importLine: '@import "@dtx/tokens/fonts.css";  /* self-hosted Roboto variable, latin + vietnamese subsets */',
    demos: [{ title: 'Type scale', plain: true, render: () => <TypeScale /> }] },
  { id: 'spacing', name: 'Spacing & radius', category: 'Foundations', status: 'ready', summary: '4px base unit (8px for layout). Radius is squared and small: tech feel, matching the logo’s square dots.',
    demos: [
      { title: 'Spacing scale', render: () => <div className="grid w-full max-w-md gap-2">{spacing.map(s => <div key={s} className="flex items-center gap-3 text-xs text-fg-muted"><code className="w-10 dtx-num">{s}px</code><i className="block h-3 rounded-sm bg-primary" style={{ width: s * 3 }} /></div>)}</div> },
      { title: 'Radius', render: () => <div className="flex flex-wrap gap-4">{radii.map(r => <div key={r.n} className="grid justify-items-center gap-2 text-xs text-fg-muted"><div className="size-16 border-2 border-primary bg-surface" style={{ borderRadius: Math.min(r.px, 32) }} /><b className="text-fg">{r.n} · {r.px === 999 ? 'full' : `${r.px}px`}</b>{r.use}</div>)}</div> }] },
  { id: 'elevation', name: 'Elevation', category: 'Foundations', status: 'ready', summary: 'Hairline borders instead of heavy shadows. Shadow only for floating layers; blue glow only on focus and primary hover.',
    demos: [{ title: 'Levels', render: () => (
      <div className="flex flex-wrap gap-4 text-xs">
        <div className="grid size-28 place-items-center rounded-lg border border-border bg-surface">e0 · border</div>
        <div className="grid size-28 place-items-center rounded-lg border border-border-strong bg-surface shadow-[inset_0_1px_0_rgb(255_255_255/.05)]">e1 · card</div>
        <div className="grid size-28 place-items-center rounded-lg border border-border bg-surface shadow-pop">e3 · popover</div>
        <button className="dtx-btn dtx-btn--primary h-28 w-28 hover:shadow-none" style={{ boxShadow: '0 0 0 3px rgb(37 130 215 / .3), 0 0 24px rgb(37 130 215 / .45)' }}>glow · focus</button>
      </div>) }] },
  { id: 'contrast', name: 'Contrast', category: 'Foundations', status: 'ready', summary: 'WCAG 2.2 AA. `npm test` checks 64 token pairs in both themes and fails the build below 4.5:1 (text) / 3:1 (UI).',
    demos: [{ title: 'Key pairs', render: () => (
      <table className="dtx-table max-w-xl"><tbody>
        {[['#2582D7', '#fff', 'White on DIGI-TEXX Blue', '4.00 · large text only (≥19px bold)'], ['#1A6FBF', '#fff', 'White on Blue strong', '5.16 · AA'], ['#1E1D23', '#2582D7', 'Brand blue on dark', '4.18 · large text only'], ['#1E1D23', '#30AAE0', 'Sky on dark', '6.34 · AA'], ['#F0F0F0', '#126FA6', 'Link on page', '5.09 · AA']].map(([bg, fg, n, r]) => (
          <tr key={n}><td><span data-a11y-demo className="inline-grid h-7 w-16 place-items-center rounded-sm text-xs font-medium" style={{ background: bg, color: fg }}>Aa</span></td><td>{n}</td><td className="dtx-r">{r}</td></tr>))}
      </tbody></table>) }] },

  // ───────────── Core ─────────────
  { id: 'button', name: 'Button', category: 'Core', status: 'ready', summary: 'Primary fills use Blue strong for small labels (AA). Large (19px bold) may use DIGI-TEXX Blue. Press scales to .97.',
    importLine: imp('Button'), props: [['variant', "'primary' | 'secondary' | 'ghost' | 'danger'", 'Default primary'], ['size', "'sm' | 'md' | 'lg'", 'lg = 19px bold'], ['icon', 'boolean', 'Square icon-only; needs aria-label'], ['href', 'string', 'Renders an <a>']],
    demos: [
      { title: 'Variants', code: '<Button>Lưu</Button>\n<Button variant="secondary">Huỷ</Button>', render: () => <><Button>Lưu thay đổi</Button><Button variant="secondary">Huỷ</Button><Button variant="ghost">Xem chi tiết</Button><Button variant="danger">Xoá lô</Button></> },
      { title: 'Sizes', render: () => <><Button size="sm">Small</Button><Button>Medium</Button><Button size="lg">Discover our Demo</Button></> },
      { title: 'Icon & disabled', render: () => <><Button icon variant="secondary" aria-label="Cài đặt"><Settings /></Button><Button><Sparkles />Trích xuất bằng AI</Button><Button disabled>Đang khoá</Button></> }] },
  { id: 'badge', name: 'Badge', category: 'Core', status: 'ready', summary: 'Alpha-based tones (Radix soft/surface model): one rule works in both themes. Violet is AI-only and sits next to blue.',
    importLine: imp('Badge'), props: [['tone', "'brand' | 'ok' | 'warn' | 'err' | 'neutral' | 'violet'", ''], ['variant', "'soft' | 'surface' | 'outline' | 'solid'", 'Default soft'], ['size', "'sm' | 'md' | 'lg'", ''], ['dot / live', 'boolean', 'live = pulsing, only while running'], ['pill', 'boolean', 'Trend deltas only'], ['icon', 'ReactNode', ''], ['onRemove', '() => void', 'Removable filter chip']],
    demos: [
      { title: 'Tone × variant', plain: true, render: () => (
        <div className="dtx-card overflow-x-auto"><table className="dtx-table"><thead><tr><th>Variant</th>{tones.map(t => <th key={t}>{t}</th>)}</tr></thead><tbody>
          {(['soft', 'surface', 'outline', 'solid'] as const).map(v => <tr key={v}><td className="text-xs text-fg-muted">{v}</td>{tones.map(t => <td key={t}><Badge tone={t} variant={v}>{toneLabel[t]}</Badge></td>)}</tr>)}
          <tr><td className="text-xs text-fg-muted">dot</td>{tones.map(t => <td key={t}><Badge tone={t} variant="surface" dot>{toneLabel[t]}</Badge></td>)}</tr>
        </tbody></table></div>) },
      { title: 'Live, icon, sizes, pill', render: () => <><Badge live>Đang xử lý</Badge><Badge tone="warn" variant="surface" live>Cần xử lý</Badge><Badge tone="ok" icon={<CheckCircle2 />}>Đạt SLA</Badge><Badge tone="err" icon={<CircleAlert />}>Lỗi mẫu</Badge><Badge size="sm">Small</Badge><Badge size="lg">Large</Badge><Badge tone="ok" pill variant="surface">▲ 12.4%</Badge></> },
      { title: 'Removable filter', render: () => <RemovableChips /> }] },
  { id: 'counter', name: 'Counter · ProgressRing · Kbd · IconTile', category: 'Core', status: 'ready', summary: 'Small helpers that sit inside nav items, badges, options and tooltips.',
    importLine: imp('Counter, ProgressRing, Kbd, IconTile'),
    demos: [{ title: 'Helpers', render: () => <><Counter tone="warn">14</Counter><Counter>128</Counter><Counter tone="err" solid>3</Counter><Badge variant="surface" icon={<ProgressRing value={62} />}>62% đã duyệt</Badge><Badge tone="ok" variant="surface" icon={<ProgressRing value={100} />}>100%</Badge><Kbd>Ctrl K</Kbd><IconTile tone="violet"><Sparkles /></IconTile></> }] },
  { id: 'input', name: 'Field & Input', category: 'Core', status: 'ready', summary: 'Base UI Field wires label, description and error for screen readers. Focus: blue ring + soft glow.',
    importLine: imp('Field, Input'),
    demos: [{ title: 'States', render: () => <div className="grid w-full max-w-sm gap-4"><Field label="Tên lô tài liệu" description="Tối đa 60 ký tự."><Input defaultValue="Hồ sơ bồi thường tháng 10" /></Field><Field label="Email nhận báo cáo" error="Email chưa đúng định dạng."><Input defaultValue="qc@digi-texx" /></Field><Field label="Ghi chú"><Input placeholder="Nhập ghi chú…" /></Field></div> }] },
  { id: 'select', name: 'Select', category: 'Core', status: 'ready', summary: 'One API for every dropdown. Icon, description and group are optional per option, so any mix works. `searchable` adds an accent-insensitive search (“bao hiem” finds “Bảo hiểm”).',
    importLine: imp('Select, type SelectOption, type SelectGroup'), props: [['items', 'SelectOption[] | SelectGroup[]', 'Flat or grouped'], ['searchable', 'boolean', 'Search box inside the popup'], ['value / defaultValue / onValueChange', 'string | null', ''], ['size', "'sm' | 'md'", ''], ['placeholder, emptyText, searchPlaceholder', 'string', '']],
    demos: [
      { title: '1 · Plain list', note: 'No icon, no group, no description.', code: "<Select items={[{ value: 'am', label: 'Ca sáng' }, …]} />", render: () => <SelectDemo label="Ca làm việc" items={shiftOptions} defaultValue="am" /> },
      { title: '2 · With icons', render: () => <SelectDemo label="Loại tài liệu" items={docTypeGroups.flatMap(g => g.items).map(({ description: _d, ...o }) => o)} defaultValue="vat" /> },
      { title: '3 · With descriptions', render: () => <SelectDemo label="Loại tài liệu" items={docTypeGroups.flatMap(g => g.items).map(({ icon: _i, ...o }) => o)} defaultValue="claim" /> },
      { title: '4 · Grouped + icon + description', render: () => <SelectDemo label="Loại tài liệu" items={docTypeGroups} defaultValue="vat" /> },
      { title: '5 · Searchable', note: 'Type “bao hiem” or “vat”.', render: () => <SelectDemo label="Loại tài liệu" items={docTypeGroups} defaultValue="vat" searchable searchPlaceholder="Tìm loại tài liệu…" /> },
      { title: '6 · Mixed options', note: 'Some options have a description, some an icon, some neither.', render: () => <SelectDemo label="Trạng thái" items={statusOptions} defaultValue="all" /> },
      { title: '7 · Small, no visible label', render: () => <div className="w-52"><Select size="sm" aria-label="Lọc theo trạng thái" items={statusOptions} defaultValue="all" /></div> }] },
  { id: 'switch', name: 'Switch', category: 'Core', status: 'ready', summary: 'Thumb moves with emphasis easing. Label is clickable.', importLine: imp('Switch'),
    demos: [{ title: 'States', render: () => <><Switch label="Tự động QC" defaultChecked /><Switch label="Gửi email" /><Switch label="Khoá" disabled /></> }] },
  { id: 'tabs', name: 'Tabs', category: 'Core', status: 'ready', summary: 'Underline indicator glides between tabs (slow · emphasis). Panel content fades up.', importLine: imp('Tabs'),
    demos: [{ title: 'Tabs', render: () => <div className="w-full max-w-md"><Tabs items={[{ value: 'a', label: 'Tổng quan', content: <p className="m-0 text-sm text-fg-muted">48.210 tài liệu hôm nay.</p> }, { value: 'b', label: 'Lô tài liệu', content: <p className="m-0 text-sm text-fg-muted">128 lô đang xử lý.</p> }, { value: 'c', label: 'Kiểm tra QC', content: <p className="m-0 text-sm text-fg-muted">14 lô chờ duyệt.</p> }]} /></div> }] },
  { id: 'segmented', name: 'Segmented', category: 'Core', status: 'ready', summary: 'Single choice for filters and ranges. Soft (default) or solid.', importLine: imp('Segmented'),
    demos: [{ title: 'Soft & solid', render: () => <><Segmented aria-label="Khoảng" options={[{ value: 'd', label: 'Hôm nay' }, { value: 'w', label: '7 ngày' }, { value: 'm', label: '30 ngày' }]} /><Segmented solid aria-label="Chế độ" options={[{ value: 'a', label: 'AI' }, { value: 'm', label: 'Thủ công' }]} /></> }] },
  { id: 'tooltip', name: 'Tooltip', category: 'Core', status: 'ready', summary: 'Short hint with optional shortcut. Wrap the app once in <TooltipProvider>.', importLine: imp('Tooltip, TooltipProvider'),
    demos: [{ title: 'Hover or focus', render: () => <><Tooltip content="Thu gọn thanh bên" shortcut="Ctrl B"><Button variant="secondary">Hover me</Button></Tooltip><Tooltip content="Tìm kiếm"><Button variant="secondary" icon aria-label="Tìm kiếm"><ScanText /></Button></Tooltip></> }] },
  { id: 'dialog', name: 'Dialog', category: 'Core', status: 'ready', summary: 'Backdrop fades; panel scales .94 → 1 (slow · emphasis); exit is faster (fast · exit). Focus is trapped and restored.', importLine: imp('Dialog, DialogClose'),
    demos: [{ title: 'Confirm', render: () => <Dialog trigger={<Button variant="danger">Xoá lô</Button>} title="Xoá lô HD-5517?" description="3.860 trang sẽ bị xoá vĩnh viễn." footer={<><DialogClose><Button variant="ghost">Huỷ</Button></DialogClose><DialogClose><Button variant="danger">Xoá</Button></DialogClose></>} /> }] },
  { id: 'toast', name: 'Toast', category: 'Core', status: 'ready', summary: 'Stacks, expands on hover, swipe right/down to dismiss. Wrap the app once in <ToastProvider>.', importLine: imp('ToastProvider, useToast'),
    demos: [{ title: 'Trigger', code: "const toast = useToast();\ntoast({ title: 'Đã lưu', description: '…', icon })", render: () => <ToastDemo /> }] },
  { id: 'avatar', name: 'Avatar', category: 'Core', status: 'ready', summary: 'Initials from first + last word, navy tile.', importLine: imp('Avatar'),
    demos: [{ title: 'Sizes', render: () => <><Avatar name="Nguyễn Thị Thuận" /><Avatar name="Trần Minh" size="sm" /></> }] },
  { id: 'checkbox', name: 'Checkbox & Radio', category: 'Core', status: 'ready', summary: 'Checkbox for one on/off choice, CheckboxGroup for several, RadioGroup for exactly one from a short visible list (more than ~6 options: use Select). Whole row is clickable; arrow keys move inside a RadioGroup.',
    importLine: imp('Checkbox, CheckboxGroup, RadioGroup, type ChoiceOption'),
    props: [['label', 'ReactNode', 'Checkbox label, or group legend'], ['options', 'ChoiceOption[]', '{ value, label, description?, disabled? }'], ['value / defaultValue / onValueChange', 'string[] (CheckboxGroup) · string (RadioGroup)', ''], ['checked / defaultChecked / onCheckedChange', 'boolean', 'Checkbox'], ['indeterminate', 'boolean', 'Checkbox mixed state'], ['selectAll', 'ReactNode', 'CheckboxGroup parent checkbox label'], ['row', 'boolean', 'Options side by side'], ['description, error', 'ReactNode', ''], ['disabled, required, name', '', '']],
    demos: [
      { title: '1 · Checkbox states', note: 'Static: unchecked, checked, mixed, disabled.', render: () => <div className="grid gap-1"><Checkbox label="Tự động gửi email" /><Checkbox label="Bỏ qua trang trắng" defaultChecked /><Checkbox label="Một phần lô đã chọn" indeterminate /><Checkbox label="Khoá cấu hình" disabled /><Checkbox label="Bắt buộc QC lần 2" disabled defaultChecked /></div> },
      { title: '2 · Description and error', render: () => <div className="grid max-w-sm gap-3"><Checkbox label="Lưu ảnh gốc 90 ngày" description="Dung lượng tăng khoảng 2 lần." defaultChecked /><Checkbox label="Tôi đồng ý với điều khoản xử lý dữ liệu" required error="Cần đồng ý điều khoản trước khi tạo lô." /></div> },
      { title: '3 · CheckboxGroup with “select all”', note: 'Parent is mixed while only some are ticked.', code: '<CheckboxGroup label="…" selectAll="Tất cả loại" options={types} value={value} onValueChange={setValue} />', render: () => <CheckboxGroupControlled /> },
      { title: '4 · CheckboxGroup, descriptions + disabled option', render: () => <CheckboxGroup label="Định dạng xuất" options={exportOptions} defaultValue={['xlsx']} description="Chọn ít nhất một định dạng." /> },
      { title: '5 · RadioGroup', render: () => <RadioGroup label="Mức ưu tiên" defaultValue="normal" options={[{ value: 'urgent', label: 'Khẩn', description: 'Xử lý trong 2 giờ' }, { value: 'normal', label: 'Bình thường', description: 'Trong ngày' }, { value: 'low', label: 'Thấp', description: 'Trong 3 ngày' }]} /> },
      { title: '6 · RadioGroup in a row, disabled option', render: () => <RadioGroup label="Ca làm việc" row defaultValue="am" options={[{ value: 'am', label: 'Ca sáng' }, { value: 'pm', label: 'Ca chiều' }, { value: 'night', label: 'Ca đêm', disabled: true }]} /> },
      { title: '7 · Group error', render: () => <RadioGroup label="Ngôn ngữ tài liệu" row options={[{ value: 'vi', label: 'Tiếng Việt' }, { value: 'en', label: 'English' }, { value: 'mixed', label: 'Song ngữ' }]} error="Chọn ngôn ngữ để chọn đúng mô hình OCR." /> }] },
  { id: 'multiselect', name: 'MultiSelect', category: 'Core', status: 'ready', summary: 'Several values as removable chips. Same items as Select (flat, grouped, icon, description). Typing filters accent-insensitively; Backspace removes the last chip, ← / → move between chips.',
    importLine: imp('MultiSelect, type SelectOption, type SelectGroup'), props: [['items', 'SelectOption[] | SelectGroup[]', 'Same as Select'], ['value / defaultValue / onValueChange', 'string[]', ''], ['size', "'sm' | 'md'", ''], ['placeholder, emptyText', 'string', ''], ['disabled', 'boolean', '']],
    demos: [
      { title: '1 · Plain list', code: "<MultiSelect items={shiftOptions} defaultValue={['am', 'pm']} />", render: () => <MultiSelectDemo label="Ca làm việc" items={shiftOptions} defaultValue={['am', 'pm']} /> },
      { title: '2 · Empty', note: 'Placeholder until the first chip.', render: () => <MultiSelectDemo label="Ca làm việc" items={shiftOptions} placeholder="Chọn ca…" /> },
      { title: '3 · Grouped + icon + description', note: 'Type “nhan su” or “ngan hang”.', render: () => <MultiSelectDemo label="Loại tài liệu" items={docTypeGroups} defaultValue={['vat', 'claim']} /> },
      { title: '4 · Many chips wrap', note: 'The box grows; long labels truncate.', render: () => <MultiSelectDemo label="Loại tài liệu" items={docTypeGroups} defaultValue={['vat', 'bank', 'claim', 'hr', 'bill']} /> },
      { title: '5 · Controlled', render: () => <MultiSelectControlled /> },
      { title: '6 · Small, no visible label', render: () => <div className="w-64"><MultiSelect size="sm" aria-label="Lọc theo trạng thái" items={statusOptions} defaultValue={['qc', 'risk']} /></div> },
      { title: '7 · Disabled', render: () => <MultiSelectDemo label="Ca làm việc" items={shiftOptions} defaultValue={['night']} disabled /> }] },
  { id: 'daterange', name: 'DateRangePicker', category: 'Core', status: 'ready', summary: 'One bar showing “from – to”. In the calendar the first click sets the start, the second the end, in either order; the band previews the range under the pointer or keyboard focus. No limits unless you pass `min` / `max`. Value { from, to } in ISO; a half-picked range is never emitted (Escape keeps the old one).',
    importLine: imp('DateRangePicker, type DateRange'),
    props: [['value / defaultValue / onValueChange', '{ from: string | null; to: string | null }', 'ISO'], ['min / max', 'string', 'Optional ISO bounds, inclusive. Default: none'], ['format', 'string', "As DatePicker, default 'dd/MM/yyyy'"], ['label / aria-label', 'ReactNode / string', 'Visible label, or a name when there is none'], ['description, error', 'ReactNode', ''], ['size, placeholder, disabled', '', ''], ['name', 'string', 'Submits nameFrom / nameTo']],
    demos: [
      { title: '1 · Controlled, no limits', code: '<DateRangePicker label="Kỳ báo cáo" value={range} onValueChange={setRange} />', render: () => <DateRangeControlled /> },
      { title: '2 · Empty', render: () => <div className="w-72"><DateRangePicker label="Ngày nhận hồ sơ" /></div> },
      { title: '3 · Limited by props', note: 'min = 90 days ago, max = today.', code: '<DateRangePicker min={addDays(todayIso(), -90)} max={todayIso()} />', render: () => <div className="w-72"><DateRangePicker label="Ngày xử lý" description="Trong 90 ngày gần nhất." min={addDays(todayIso(), -90)} max={todayIso()} /></div> },
      { title: '4 · Small filter, ISO format, no visible label', render: () => <div className="w-64"><DateRangePicker size="sm" format="yyyy-MM-dd" aria-label="Lọc theo ngày nhận" defaultValue={{ from: '2026-09-01', to: '2026-09-30' }} /></div> },
      { title: '5 · Error · disabled', render: () => <div className="grid w-72 gap-4"><DateRangePicker label="Thời hạn hợp đồng" error="Thời hạn tối đa 12 tháng." defaultValue={{ from: '2026-01-01', to: '2027-06-30' }} /><DateRangePicker label="Kỳ đã khoá sổ" disabled defaultValue={{ from: '2026-09-01', to: '2026-09-30' }} /></div> },
      { title: '6 · Calendar in range mode (the open state)', note: 'Ends filled, days between on a tinted band.', render: () => <div className="w-[296px] rounded-md border border-border bg-surface p-2"><Calendar range={{ from: addDays(todayIso(), -4), to: addDays(todayIso(), 5) }} /></div> }] },
  { id: 'datepicker', name: 'DatePicker · Calendar', category: 'Core', status: 'ready', summary: 'Type dd/MM/yyyy (also 5-10-2026 or 05102026), or any `format`, or pick from a Monday-first calendar. Value is an ISO string (“2026-10-05”): no timezone shifts. Invalid or out-of-range typing reverts on blur. Calendar keys: arrows, Home/End, PageUp/PageDown (+Shift = year); Alt+↓ opens it from the input.',
    importLine: imp('DatePicker, Calendar, parseDate, formatDate'),
    props: [['value / defaultValue / onValueChange', 'string | null', "ISO 'yyyy-MM-dd'"], ['min / max', 'string', 'ISO, inclusive'], ['format', 'string', "dd / d, MM / M, yyyy, any separator. Default 'dd/MM/yyyy'"], ['size', "'sm' | 'md'", ''], ['placeholder', 'string', 'Default: format in lower case'], ['name', 'string', 'Submits the ISO value'], ['disabled', 'boolean', '']],
    demos: [
      { title: '1 · Controlled', note: 'Type “5/10/2026” or “05102026”.', code: '<DatePicker value={value} onValueChange={setValue} />', render: () => <DatePickerControlled /> },
      { title: '2 · Custom format', note: 'Same ISO value, different display. Typing follows the format order.', code: '<DatePicker format="yyyy-MM-dd" value={value} onValueChange={setValue} />', render: () => <DatePickerFormats /> },
      { title: '3 · Empty', render: () => <div className="w-64"><Field label="Ngày sinh"><DatePicker max={todayIso()} /></Field></div> },
      { title: '4 · Range limit', note: 'Only today to +30 days.', render: () => <div className="w-64"><Field label="Hạn SLA" description="Trong vòng 30 ngày."><DatePicker min={todayIso()} max={addDays(todayIso(), 30)} defaultValue={addDays(todayIso(), 3)} /></Field></div> },
      { title: '5 · Error', render: () => <div className="w-64"><Field label="Ngày ký hợp đồng" error="Ngày ký phải trước ngày hiệu lực."><DatePicker defaultValue="2026-11-20" /></Field></div> },
      { title: '6 · Small, no visible label · disabled', render: () => <div className="grid w-48 gap-3"><DatePicker size="sm" aria-label="Lọc từ ngày" defaultValue="2026-10-01" /><DatePicker size="sm" aria-label="Ngày khoá sổ" defaultValue="2026-09-30" disabled /></div> },
      { title: '7 · Calendar (the open state)', note: 'Selected, today (ring), outside-month and disabled days.', render: () => <div className="w-[296px] rounded-md border border-border bg-surface p-2"><Calendar value={addDays(todayIso(), 2)} min={addDays(todayIso(), -3)} /></div> }] },
  planned('upload', 'File upload / dropzone', 'Core', 'Drag-drop PDFs and images, per-file progress.'),
  planned('drawer', 'Drawer', 'Core', 'Side panel for record detail.'),

  // ───────────── Layout ─────────────
  { id: 'card', name: 'Card', category: 'Layout', status: 'ready', summary: 'Hairline surface. CardHeader takes a title and an action slot.', importLine: imp('Card, CardHeader, CardBody'),
    demos: [{ title: 'Card', render: () => <Card className="w-full max-w-md"><CardHeader title="Hàng đợi QC" action={<Badge variant="surface">14 lô</Badge>} /><div className="p-4 text-sm text-fg-muted">Nội dung</div></Card> }] },
  { id: 'app-shell', name: 'AppShell & Sidebar', category: 'Layout', status: 'ready', summary: 'Workspace header, collapsible groups (height animates), active bar, counts, attention counters, shortcut hints on hover, 60px rail mode.',
    importLine: imp('AppShell, Sidebar, SidebarWorkspace, SidebarGroup, SidebarItem, SidebarFooter, Topbar, CommandButton'),
    props: [['AppShell.rail', 'boolean', 'Icon strip; labels become tooltips'], ['AppShell.fill', 'boolean', 'Edge to edge in a parent with a set height; sidebar stays, main scrolls (see App page)'], ['SidebarItem.count', 'number', 'Muted; swaps to kbd on hover'], ['SidebarItem.badge', 'ReactNode', 'For items needing attention'], ['SidebarItem.alert', 'boolean', 'Amber dot in rail mode']],
    demos: [{ title: 'Interactive', plain: true, render: () => <RailDemo /> }] },
  planned('command-palette', 'Command palette', 'Layout', 'Ctrl/⌘+K: jump to batches, clients, actions.'),
  planned('empty-state', 'Empty state', 'Layout', 'Mascot (64–160px), one sentence, one action.'),

  // ───────────── Data ─────────────
  { id: 'kpi', name: 'KpiCard', category: 'Data', status: 'ready', summary: 'One structure for every KPI: label + badge, value, 28px viz row, caption with icon. Attention is shown by badge, viz and icon, never by card chrome.',
    importLine: imp('KpiCard'), props: [['label, value, unit', '', ''], ['badge', 'ReactNode', 'Top-right status'], ['viz', 'ReactNode', 'Sparkline / TargetBar / CategoryBar'], ['caption, captionIcon, tone', '', 'tone colours the icon']],
    demos: [{ title: 'Four variants', plain: true, render: () => (
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <KpiCard label="Tài liệu xử lý hôm nay" badge={<Badge size="sm" tone="ok" variant="surface">▲ 12.4%</Badge>} value={<CountUp value={48210} />} viz={<Sparkline data={[4, 7, 6, 11, 10, 15, 14, 20, 19, 23]} />} tone="ok" captionIcon={<TrendingUp />} caption={<><b>+5,320</b> so với hôm qua</>} />
        <KpiCard label="Tự động hoàn toàn (STP)" badge={<Badge size="sm" tone="ok" variant="surface">▲ 2.1 pt</Badge>} value="87.3" unit="%" viz={<Sparkline data={[8, 9, 7, 10, 12, 11, 14, 16, 15, 18]} />} tone="ok" captionIcon={<TrendingUp />} caption={<><b>Tăng 4 tuần</b> liên tiếp</>} />
        <KpiCard label="Độ chính xác sau QC" badge={<Badge size="sm" variant="surface">Đạt mục tiêu</Badge>} value="99.62" unit="%" viz={<TargetBar value={99.62} target={99.5} min={98} max={100} label="99.62% / mục tiêu 99.5%" />} captionIcon={<CircleCheck />} caption={<>Mục tiêu <b>99.5%</b></>} />
        <KpiCard label="Lô có nguy cơ trễ SLA" badge={<Badge size="sm" tone="warn" variant="surface" live>Cần xử lý</Badge>} value="3" unit="/ 128 lô" viz={<CategoryBar segments={[{ value: 125, color: 'var(--dtx-primary)', label: 'đúng hạn' }, { value: 2, color: 'var(--dtx-amber)', label: 'sắp trễ' }, { value: 1, color: 'var(--dtx-red)', label: 'đã trễ' }]} />} tone="warn" captionIcon={<AlertTriangle />} caption={<><b>1 đã trễ</b> · 2 sắp trễ</>} />
      </div>) }] },
  { id: 'table', name: 'DataTable', category: 'Data', status: 'ready', summary: 'Tabular numbers, hairline rows, hover, right-aligned numeric columns, own horizontal scroll.', importLine: imp('DataTable, type Column'),
    demos: [{ title: 'Batches', plain: true, render: () => <Card><DataTable rowKey={b => b.id} rows={batches.slice(0, 3)} columns={[{ key: 'id', header: 'Mã lô', render: b => <span className="dtx-id">{b.id}</span> }, { key: 't', header: 'Loại', render: b => b.type[0] }, { key: 'p', header: 'Trang', align: 'right', render: b => b.pages.toLocaleString('en-US') }, { key: 'a', header: 'Độ chính xác', align: 'right', render: b => `${b.accuracy}%` }]} /></Card> },
      { title: 'Empty', note: '`empty` says what happened and how to recover.', plain: true, render: () => <Card><DataTable rowKey={(b: { id: string }) => b.id} rows={[]} columns={[{ key: 'id', header: 'Mã lô', render: b => b.id }, { key: 't', header: 'Loại', render: () => '' }]} empty={<div className="grid justify-items-center gap-2"><span>Không có lô nào khớp bộ lọc.</span><Button variant="secondary" size="sm">Xoá bộ lọc</Button></div>} /></Card> }] },
  { id: 'charts', name: 'Sparkline · TargetBar · CategoryBar · Meter', category: 'Data', status: 'ready', summary: 'Small, honest charts: each one draws to its own stated scale.', importLine: imp('Sparkline, TargetBar, CategoryBar, Meter'),
    demos: [{ title: 'Inline charts', replay: true, render: run => <div key={run} className="grid w-full max-w-sm gap-5"><Sparkline data={[3, 5, 4, 8, 7, 11, 10, 14]} label="Xu hướng" /><TargetBar value={99.62} target={99.5} min={98} max={100} label="Độ chính xác" /><CategoryBar legend segments={[{ value: 125, color: 'var(--dtx-primary)', label: 'Đúng hạn' }, { value: 2, color: 'var(--dtx-amber)', label: 'Sắp trễ' }, { value: 1, color: 'var(--dtx-red)', label: 'Đã trễ' }]} /><Meter value={62} label="Tiến độ" /></div> }] },
  { id: 'bar-chart', name: 'StackedBarChart', category: 'Data', status: 'ready', summary: 'One scale for bars, gridlines and labels. Bars grow in with a small stagger.', importLine: imp('StackedBarChart'),
    demos: [{ title: 'Throughput', replay: true, plain: true, render: run => <Card key={run} className="p-4"><StackedBarChart label="Sản lượng theo giờ" labels={hours} max={8000} step={2000} series={[{ name: 'AI tự động', color: 'var(--dtx-primary)', data: aiThroughput }, { name: 'Thủ công', color: 'var(--dtx-light)', data: manualThroughput }]} /></Card> }] },
  planned('line-chart', 'Line / area chart', 'Data', 'Multi-series trends with hover readout.'),
  planned('table-sort', 'Table sorting & pagination', 'Data', 'Sortable headers, page size, sticky header.'),

  // ───────────── Motion ─────────────
  { id: 'easing', name: 'Easing', category: 'Motion', status: 'ready', summary: 'Four curves (Material 3). Standard for most changes, enter for appearing, exit for leaving, emphasis for indicators and toggles.',
    importLine: 'transition: transform var(--dtx-dur-base) var(--dtx-ease-standard);', demos: [{ title: 'Curves', replay: true, plain: true, render: run => <EasingCurves run={run} /> }] },
  { id: 'duration', name: 'Duration', category: 'Motion', status: 'ready', summary: 'Larger things move longer. Exit runs at about 70% of enter.', demos: [{ title: 'Tokens', replay: true, render: run => <div className="w-full"><DurationBars run={run} /></div> }] },
  { id: 'fade-up', name: 'Enter · fade up', category: 'Motion', status: 'ready', summary: 'Default entrance for sections and cards: 10px rise + fade, page duration, enter easing.', importLine: imp('Reveal') + '\n<Reveal effect="fade-up">…</Reveal>  /* or className="dtx-enter-fade-up" */',
    demos: [{ title: 'Replay', replay: true, render: run => <Reveal key={run}><Card className="p-5 text-sm">Tổng quan vận hành</Card></Reveal> }] },
  { id: 'fade', name: 'Enter · fade', category: 'Motion', status: 'ready', summary: 'Opacity only. Use inside dense lists and for content swaps.', demos: [{ title: 'Replay', replay: true, render: run => <Reveal key={run} effect="fade"><Card className="p-5 text-sm">Nội dung đã tải</Card></Reveal> }] },
  { id: 'scale-in', name: 'Enter · scale', category: 'Motion', status: 'ready', summary: '.94 → 1 with emphasis. Popups, dialogs, hero visuals.', demos: [{ title: 'Replay', replay: true, render: run => <Reveal key={run} effect="scale"><Card className="p-5 text-sm">Hộp thoại</Card></Reveal> }] },
  { id: 'slide-in', name: 'Enter · slide in', category: 'Motion', status: 'ready', summary: 'From the right, 24px. Toasts, side panels.', demos: [{ title: 'Replay', replay: true, render: run => <Reveal key={run} effect="slide-in"><Card className="p-5 text-sm">Thông báo mới</Card></Reveal> }] },
  { id: 'stagger', name: 'Stagger', category: 'Motion', status: 'ready', summary: 'Reveal with `index` delays each item (default 60ms). Keep lists under ~8 staggered items.', demos: [{ title: 'Replay', replay: true, render: run => <StaggerList run={run} /> }] },
  { id: 'exit', name: 'Exit · fade down', category: 'Motion', status: 'ready', summary: 'Base duration, exit easing; unmount on animationend.', importLine: 'className="dtx-exit-fade-down"  onAnimationEnd={remove}', demos: [{ title: 'Remove items', render: () => <ExitDemo /> }] },
  { id: 'skeleton', name: 'Skeleton (phase 1)', category: 'Motion', status: 'ready', summary: 'Placeholder with shimmer, sized like the final content so nothing shifts.', importLine: imp('Skeleton, SkeletonText'),
    demos: [{ title: 'Shapes', render: () => <div className="grid w-full max-w-sm gap-4"><SkeletonText lines={3} /><div className="flex items-center gap-3"><Skeleton width={32} height={32} radius={6} /><div className="grid flex-1 gap-2"><Skeleton width="60%" /><Skeleton width="35%" /></div></div></div> }] },
  { id: 'content-reveal', name: 'Content reveal (phase 2)', category: 'Motion', status: 'ready', summary: 'When data arrives, the real content enters with fade-up. Same component as Reveal.', demos: [{ title: 'Replay', replay: true, render: run => <Reveal key={run}><Card className="grid w-72 gap-1 p-4"><b className="text-sm">Hồ sơ bồi thường · BH-2210</b><span className="text-xs text-fg-muted">1.240 trang · 99.71%</span></Card></Reveal> }] },
  { id: 'loadable', name: 'Skeleton → content', category: 'Motion', status: 'ready', summary: 'Composition of phase 1 + phase 2. <Loadable loading skeleton>{content}</Loadable>. Use the phase buttons to inspect each.', importLine: imp('Loadable'),
    demos: [{ title: 'Auto (1.6s) or step through', replay: true, render: run => <LoadableDemo run={run} /> }] },
  { id: 'count-up', name: 'Count-up', category: 'Motion', status: 'ready', summary: 'Ease-out quart from 0. First load of KPI values only, never on every refresh.', importLine: imp('CountUp'),
    demos: [{ title: 'Replay', replay: true, render: run => <span key={run} className="text-4xl font-bold tracking-tight"><CountUp value={48210} /></span> }] },
  { id: 'micro', name: 'Press · hover lift', category: 'Motion', status: 'ready', summary: 'Press: scale .97 at instant. Hover lift: −3px + shadow + blue border at base. Class dtx-hover-lift.',
    demos: [{ title: 'Try it', render: () => <><Button>Nhấn giữ</Button><Card className="dtx-hover-lift p-4 text-sm">Hover card</Card></> }] },
  { id: 'live-pulse', name: 'Live pulse', category: 'Motion', status: 'ready', summary: 'Ping on the square dot while a process runs. Stops when done (Geist status-dot rule).', demos: [{ title: 'Running', render: () => <><Badge live>Đang trích xuất</Badge><Badge tone="warn" variant="surface" live>Cần xử lý</Badge></> }] },
  { id: 'reduced-motion', name: 'Reduced motion', category: 'Motion', status: 'ready', summary: 'OS setting or data-motion="reduce" on any element: movement drops to ~0ms, state changes stay. JS animations (CountUp, DocumentScan) jump to the end.',
    demos: [{ title: 'Scoped with data-motion="reduce"', replay: true, render: run => <div data-motion="reduce" className="flex gap-3"><Reveal key={run}><Card className="p-4 text-sm">Không chuyển động</Card></Reveal><Badge live>Live</Badge></div> }] },

  // ───────────── Brand ─────────────
  { id: 'logo', name: 'Logo', category: 'Brand', status: 'ready', summary: 'Official files, never recoloured, rotated or given effects (PDF p.10). Clear space ≥ ½ symbol height. Minimum 10 mm print; kit floor 120px horizontal / 38px square.', importLine: imp('Logo'),
    demos: [{ title: 'Light background', only: 'light', render: () => <><Logo variant="horizontal" /><Logo variant="square" width={48} /></> }, { title: 'Dark background', only: 'dark', render: () => <Logo variant="horizontal-white" /> }, { title: 'On DIGI-TEXX Blue', render: () => <div className="rounded-md bg-brand p-6"><Logo variant="square-on-blue" width={56} /></div> }] },
  { id: 'tech-backdrop', name: 'TechBackdrop', category: 'Brand', status: 'ready', summary: 'Always-dark band: fading grid, blue glow, circuit traces that draw in. Sets data-theme="dark" on itself.', importLine: imp('TechBackdrop'),
    demos: [{ title: 'Hero band', replay: true, plain: true, render: run => <TechBackdrop key={run} className="rounded-lg"><div className="grid gap-4 p-10"><Eyebrow>AI · Số hoá · BPO</Eyebrow><Display as="p">Số hoá dữ liệu. <em>Tăng tốc</em> vận hành.</Display><Lede>Biến chứng từ giấy thành dữ liệu sạch.</Lede></div></TechBackdrop> }] },
  { id: 'type-brand', name: 'Display · Lede · Eyebrow · SectionHeader', category: 'Brand', status: 'ready', summary: 'Display = Roboto Bold Italic uppercase; <em> gets the sky gradient. SectionHeader has the 48×6 gradient bar.', importLine: imp('Display, Lede, Eyebrow, SectionHeader'),
    demos: [{ title: 'Section header', render: () => <SectionHeader title="Giải pháp của DIGI-TEXX" description="Bốn nền tảng phần mềm và dịch vụ vận hành." /> }] },
  { id: 'hex', name: 'HexIcon · Mascot', category: 'Brand', status: 'ready', summary: 'Hexagon icon container (brand motif). Mascot for empty states, onboarding, 404 only, 64–160px.', importLine: imp('HexIcon, mascotUrl'),
    demos: [{ title: 'Motifs', render: () => <><HexIcon><Layers /></HexIcon><HexIcon><BarChart3 /></HexIcon><img src={mascotUrl} alt="Robot DIGI-TEXX" width={96} /></> }] },

  // ───────────── OCR ─────────────
  { id: 'ocr-showcase', name: 'OcrShowcase (POC player)', category: 'AI · OCR', status: 'ready', summary: 'Give it an image + engine JSON (OcrDocument) and it plays the pipeline: raw → unwarp → binarize → OCR_det → OCR_rec → extraction. Try your own data on the POC page.',
    importLine: imp('OcrShowcase, normalizeOcr, type OcrDocument') + "\n<OcrShowcase data={json} stages={['unwarp','binarize','detect','recognize','extract']} />",
    props: [['data', 'OcrDocument | NormalizedOcr', 'image + lines(box,text,confidence) + regions? + fields?'], ['stages', "OcrStage[]", "crop | unwarp | deskew | denoise | binarize | grayscale | detect | recognize | layout | extract"], ['stage / onStageChange', 'number', 'Controlled; 0 = raw'], ['autoPlay, loop, interval', '', 'Built-in player'], ['scan', 'boolean', 'Beam during detection'], ['page', 'ReactNode', 'Used when data.image is absent']],
    demos: [
      { title: 'Real document · project 1266', note: 'seg → rec v2 → LiLT v11 output from the test split, played through the same component.', plain: true, render: () => <RealShowcase /> },
      { title: 'Default pipeline (sample invoice)', replay: true, plain: true, render: run => <SampleShowcase run={run} /> },
      { title: 'With layout analysis', replay: true, plain: true, render: run => <SampleShowcase run={run} stages={['crop', 'deskew', 'detect', 'recognize', 'layout', 'extract']} /> }] },
  { id: 'box-overlay', name: 'BoxOverlay', category: 'AI · Shared', status: 'ready', summary: 'Bounding boxes over any page (0–1 coordinates), built to check the AI reading against the original. lens (default): the region magnified with the AI text directly beneath, same scale and left edge. blink: the box flips original ↔ AI in place. Boxes are keyboard-reachable buttons.',
    importLine: imp('BoxOverlay, type OcrBox'), props: [['boxes', 'OcrBox[]', '{ id, x, y, w, h, text?, confidence?, kind? }'], ['colorBy', "'confidence' | 'kind' | 'plain'", ''], ['showLabels', 'boolean', 'Region tags'], ['selectedId / onSelect', '', ''], ['hideText', 'boolean', 'Detection stage'], ['hover', "'lens' | 'blink'", 'Compare mode (default lens)'], ['pinnedId', 'string | null', 'Render a box in its hover state without a pointer']],
    demos: [
      { title: 'Real scan · project 1266 (lens)', note: 'Real civil-registry pages with real seg → rec v2 output. Confidence = recognition score.', plain: true, render: () => <RealBoxes /> },
      { title: 'Real scan · blink', plain: true, render: () => <RealBoxes hover="blink" /> },
      { title: 'Real scan · boxes appear under the scan', note: '<ScanBeam> around <BoxOverlay>: the beam reveals the boxes.', replay: true, plain: true, render: run => <RealBoxes key={run} scan /> },
      { title: 'Compare modes: lens · blink', note: 'Goal: check what the AI read against the original with the least eye travel. Same box (r2, 86.4%) pinned in each mode.', plain: true, render: () => <BoxStates mode="styles" /> },
      { title: 'States: rest · hover · selected', note: 'Static, no pointer needed. At rest nothing is dimmed; the spotlight dim appears only while a box is hovered/focused (pinnedId fakes that for docs).', plain: true, render: () => <BoxStates mode="states" /> },
      { title: 'Live · lens (default)', note: 'Hover or Tab through the boxes: the original and the AI reading line up one above the other.', replay: true, render: run => <InvoiceBoxes run={run} /> },
      { title: 'Live · blink', note: 'Hold the pointer on a box: it flips original ↔ AI every 0.7s; any misread shows up as flicker.', replay: true, render: run => <InvoiceBoxes run={run} hover="blink" /> },
      { title: 'Detection only (plain)', replay: true, render: run => <InvoiceBoxes run={run} colorBy="plain" /> },
      { title: 'Layout regions · coloured by kind', replay: true, render: run => <InvoiceBoxes run={run} regions /> }] },
  { id: 'confidence', name: 'Confidence', category: 'AI · Shared', status: 'ready', summary: 'ConfidenceBadge, ConfidenceBar and ConfidenceDots (five square dots, the logo motif) share thresholds (default high 95, low 80). confidenceLevel() for your own logic.', importLine: imp('ConfidenceBadge, ConfidenceBar, ConfidenceDots, confidenceLevel'),
    demos: [{ title: 'Levels', render: () => <div className="grid w-full max-w-md gap-3">{[99.7, 95.2, 91.3, 86.4, 72.5].map(v => <div key={v} className="grid grid-cols-[auto_auto_1fr] items-center gap-3"><ConfidenceDots value={v} /><ConfidenceBadge value={v} showLabel /><ConfidenceBar value={v} /></div>)}</div> }] },
  { id: 'document-scan', name: 'DocumentScan', category: 'AI · Extraction', status: 'ready', summary: 'Hero extraction visual composed from ScanBeam (vertical) + row highlights + field reveal: each linked row highlights as the beam passes and its field appears with a confidence score. Auto-plays and loops, or control `phase`.',
    importLine: imp('DocumentScan, type ScanRow, type ScanField'), props: [['rows', 'ScanRow[]', '{ label, value, field? } | { rule: true }'], ['fields', 'ScanField[]', '{ key, value, confidence }'], ['phase', "'idle' | 'scanning' | 'done'", 'Leave undefined to auto-play'], ['loop, scanMs, lowConfidence', '', '']],
    demos: [
      { title: 'Full loop', replay: true, plain: true, render: run => <ScanPhaseDemo run={run} /> },
      { title: 'Phase 1 · idle', plain: true, render: run => <ScanPhaseDemo run={run} phase="idle" /> },
      { title: 'Phase 2 · scanning (beam + highlight + field reveal)', replay: true, plain: true, render: run => <ScanPhaseDemo run={run} phase="scanning" /> },
      { title: 'Phase 3 · done', note: 'vat_amount 94.2% shows in warning colour (below lowConfidence 95).', plain: true, render: run => <ScanPhaseDemo run={run} phase="done" /> }] },
  { id: 'pipeline', name: 'PreprocessPipeline', category: 'AI · Preprocess', status: 'ready', summary: 'Chains preprocessing steps with a stepper. Geometry steps (crop, unwarp, deskew) animate the page; pixel steps (denoise, binarize) clean it line by line under a scan, finishing exactly when the scan ends. Auto-plays, or control `step`.', importLine: imp('PreprocessPipeline'),
    demos: [{ title: 'crop → unwarp → deskew → denoise → binarize', replay: true, render: run => <div className="w-full max-w-sm"><PreprocessPipeline key={run}><SampleInvoice /></PreprocessPipeline></div> }] },
  ...(['crop', 'unwarp', 'deskew'] as GeometryStep[]).map((e): Entry => ({
    id: `pp-${e}`, name: `Preprocess · ${e}`, category: 'AI · Preprocess', status: 'ready',
    summary: { crop: 'Page on a desk → page fills the frame; corner handles mark the detected page.', unwarp: 'The 3D lattice of the page (from the /unwarp service, or synthetic for demos): points pop in on the raw page, then align to a regular grid as the page flattens. UnwarpView shows real results (raw + unwarped + grid).', deskew: 'Tilted −3.5° → straight; baseline guides fade out.', }[e],
    importLine: imp('Preprocess') + `\n<Preprocess effect="${e}" applied={done}><img … /></Preprocess>`,
    demos: [
      ...(e === 'unwarp' ? [{ title: 'Real · stengg (UnwarpView)', note: 'Real pages, real pz-auto_preprocessing lattice. Raw page + lattice → scan reveals the unwarped page with the lattice aligned, then it fades.', replay: true, plain: true,
        code: '<UnwarpView raw={raw} unwarped={unwarped} grid={{ cols, rows, points }} applied={done} />', render: (run: number) => <RealUnwarp run={run} /> }] : []),
      { title: e === 'unwarp' ? 'Synthetic page (Preprocess)' : 'Toggle the two phases', render: () => <PreprocessToggle effect={e} /> },
    ],
  })),
  { id: 'pixel-steps', name: 'Pixel steps · before/after', category: 'AI · Preprocess', status: 'ready',
    summary: 'Binarize, denoise and grayscale are a before/after PAIR of pages: the service\'s two images. The kit has no component and no step type for them. Show any pair with CompareSlider (by hand) or ScanBeam (by scan), same before/after props. The synthetic demos below fake the pair with a playground-only helper.',
    importLine: imp('CompareSlider, ScanBeam') + '\n<CompareSlider before={<img src={raw} />} after={<img src={clean} />} />\n<ScanBeam before={<img src={raw} />} after={<img src={clean} />} />',
    props: [['before', 'ReactNode', 'Raw page (real image)'], ['after', 'ReactNode', 'Processed page (real image)']],
    demos: [
      { title: 'Real pair · stengg /preprocess', note: 'Raw page and the service\'s cleaned page, shown both ways with the same before/after props.', plain: true, replay: true, render: run => <RealEnhance key={run} /> },
      ...(['binarize', 'denoise', 'grayscale'] as const).map(step => ({ title: `${step} (synthetic) · slider and scan`, replay: true, plain: true,
        code: `<CompareSlider before={raw} after={processed} />\n<ScanBeam before={raw} after={processed} />`,
        render: (run: number) => <PairBothWays key={run} step={step} /> })),
    ] },
  { id: 'compare', name: 'CompareSlider', category: 'AI · Shared', status: 'ready', summary: 'Before/after page comparison, slider only. Drag or use arrow keys (native range input underneath). Pass any two pages as before/after.', importLine: imp('CompareSlider'),
    demos: [{ title: 'Raw vs binarized', render: () => <div className="w-full max-w-sm"><CompareSlider {...demoPair('binarize', <SampleInvoice />)} /></div> }] },
  { id: 'scan-beam', name: 'ScanBeam', category: 'AI · Shared', status: 'ready', summary: 'The one scanning effect in the kit. It owns the reveal: everything inside (BoxOverlay boxes, a `before` → children wipe, any <ScanReveal>) appears in sync with the beam. reveal sets how: progressive (line by line under the beam), whole (pops in when touched) or none.',
    importLine: imp('ScanBeam, ScanReveal') + '\n<ScanBeam direction="vertical" duration={2000} reveal="progressive">\n  <BoxOverlay boxes={lines}>{page}</BoxOverlay>\n</ScanBeam>',
    props: [['direction', "'vertical' | 'horizontal'", 'Default vertical'], ['duration', 'number', 'ms per pass, default 2400'],
      ['reveal', "'progressive' | 'whole' | 'none'", 'How content inside appears. Default progressive'],
      ['before', 'ReactNode', 'Page shown ahead of the beam; children is revealed behind it (wipe)'],
      ['beam', 'boolean', 'false hides the beam line, keeps the reveal (pure wipe)'],
      ['repeat', "number | 'infinite'", 'Default 1; content reveals on the first pass'], ['active', 'boolean', 'Show and play; change key to replay'],
      ['band', 'number', 'Glow thickness px, default 48'], ['onEnd', '() => void', 'After the last pass']],
    demos: [
      { title: 'Beam only (reveal="none")', replay: true, render: run => <div className="w-full max-w-xs"><ScanBeam key={run} reveal="none" duration={2000}><SampleInvoice /></ScanBeam></div> },
      { title: 'Horizontal, looping', render: () => <div className="w-full max-w-xs"><ScanBeam reveal="none" direction="horizontal" repeat="infinite" duration={1800}><SampleInvoice /></ScanBeam></div> },
      { title: 'Boxes · progressive (default)', note: 'Each box is drawn under the beam line by line; tall/wide boxes grow with it.', replay: true,
        code: '<ScanBeam duration={2200}>\n  <BoxOverlay boxes={lines}>{page}</BoxOverlay>\n</ScanBeam>', render: run => <ScanBoxes key={run} /> },
      { title: 'Boxes · progressive vs whole', note: 'Same scan, horizontal. whole: the full box pops in when the beam first touches it.', replay: true, plain: true,
        render: run => <div className="grid gap-6 sm:grid-cols-2"><div className="grid gap-2"><code className="text-xs">reveal="progressive"</code><ScanBoxes key={`p${run}`} direction="horizontal" duration={1800} /></div><div className="grid gap-2"><code className="text-xs">reveal="whole"</code><ScanBoxes key={`w${run}`} direction="horizontal" duration={1800} reveal="whole" /></div></div> },
      { title: 'Wipe · binarize under the beam (before=…)', note: 'Raw ahead of the beam, binarized behind it, fully clean when the pass ends.', replay: true,
        code: '<ScanBeam duration={2000} before={raw} after={binarized} />', render: run => <ScanClean key={run} /> },
      { title: 'Wipe without the beam line (beam={false})', replay: true, render: run => <ScanClean key={run} beam={false} /> },
      { title: 'Wipe + boxes in one pass', note: 'Both are inside the same ScanBeam, so they share its timing.', replay: true, render: run => <ScanClean key={run} withBoxes /> },
      { title: 'Any element: <ScanReveal>', note: 'Give it x/y/w/h (fractions of the beam area). Here three highlight bands.', replay: true, render: run => <ScanRevealDemo key={run} /> }] },
  { id: 'sample-invoice', name: 'SampleInvoice', category: 'AI · Shared', status: 'ready', summary: 'Synthetic Vietnamese VAT invoice in SVG for demos. Line boxes are measured from the rendered text (onBoxes), regions come from the layout.', importLine: imp('SampleInvoice, sampleInvoiceRegions'),
    demos: [{ title: 'Page', render: () => <div className="w-full max-w-sm shadow-pop"><SampleInvoice /></div> }] },
  planned('polygon-box', 'Polygon boxes', 'AI · Shared', 'Draw rotated/curved quads as-is instead of bounding rectangles.'),
  planned('field-link', 'Field ↔ box connector', 'AI · Extraction', 'Line from an extracted field to its source box.'),
  planned('heatmap', 'Confidence heatmap', 'AI · OCR', 'Page tint by local confidence for QC triage.'),
  planned('box-editor', 'Box editor', 'AI · OCR', 'Drag/resize boxes and correct text for human-in-the-loop QC.'),
  planned('table-extract', 'Table extraction view', 'AI · Extraction', 'Detected table grid with cell-level confidence.'),
  planned('vlm-qa', 'VLM answer with evidence', 'AI · Extraction', 'Question → answer, with the boxes the model used highlighted.'),
  planned('tryon-compare', 'Try-on result viewer', 'AI · Try-on', 'Person + garment → result, with CompareSlider.'),
  planned('enhance-compare', 'Enhance before/after', 'AI · Enhance', 'Super-resolution / denoise with zoom loupe + CompareSlider.'),
  planned('rmbg-mask', 'Background removal mask', 'AI · Remove background', 'Mask reveal animation over a checkerboard, edge refine.'),
];

/** BoxOverlay inside ScanBeam: boxes reveal with the beam (mode set on the beam). */
function ScanBoxes({ direction = 'vertical', duration = 2200, reveal }: { direction?: 'vertical' | 'horizontal'; duration?: number; reveal?: 'progressive' | 'whole' }) {
  const [lines, setLines] = useInvoiceBoxes();
  return (
    <div className="w-full max-w-sm">
      <ScanBeam direction={direction} duration={duration} reveal={reveal}>
        <BoxOverlay boxes={lines} textInset={sampleInvoiceInset}><SampleInvoice onBoxes={setLines} /></BoxOverlay>
      </ScanBeam>
    </div>
  );
}

/** ScanBeam with `before`: the page cleans up line by line behind the beam. */
function ScanClean({ effect = 'binarize', direction = 'vertical', duration = 2000, beam, withBoxes }: { effect?: DemoStep; direction?: 'vertical' | 'horizontal'; duration?: number; beam?: boolean; withBoxes?: boolean }) {
  const [lines, setLines] = useInvoiceBoxes();
  const { after } = demoPair(effect, <SampleInvoice onBoxes={setLines} />);
  const { before } = demoPair(effect, <SampleInvoice />);
  return (
    <div className="w-full max-w-xs">
      <ScanBeam direction={direction} duration={duration} beam={beam} before={before}>
        {withBoxes ? <BoxOverlay boxes={lines} textInset={sampleInvoiceInset}>{after}</BoxOverlay> : after}
      </ScanBeam>
    </div>
  );
}

function ScanRevealDemo() {
  return (
    <div className="w-full max-w-xs">
      <ScanBeam duration={2200}>
        <div className="relative"><SampleInvoice />
          {[[.06, .17, .5, .06], [.06, .28, .88, .17], [.55, .5, .38, .08]].map(([x, y, w, h], i) => (
            <ScanReveal key={i} x={x} y={y} w={w} h={h} className="rounded-sm bg-[rgb(37_130_215/.18)] ring-1 ring-primary"><span /></ScanReveal>
          ))}
        </div>
      </ScanBeam>
    </div>
  );
}

/** One pair, both presentations: the same before/after go into CompareSlider and ScanBeam. */
function PairBothWays({ step }: { step: DemoStep }) {
  const pair = demoPair(step, <SampleInvoice />);
  return (
    <div className="grid gap-6 sm:grid-cols-2">
      <figure className="m-0 grid gap-2"><figcaption className="text-xs"><code>CompareSlider</code> <span className="text-fg-muted">· kéo để so</span></figcaption><div className="max-w-xs"><CompareSlider {...pair} /></div></figure>
      <figure className="m-0 grid gap-2"><figcaption className="text-xs"><code>ScanBeam</code> <span className="text-fg-muted">· quét để so</span></figcaption><div className="max-w-xs"><ScanBeam duration={2000} {...pair} /></div></figure>
    </div>
  );
}

function RemovableChips() {
  const all = ['Hoá đơn VAT', 'Ca sáng', 'Trễ SLA'];
  const [chips, setChips] = useState(all);
  return <>{chips.map(c => <Badge key={c} tone={c === 'Trễ SLA' ? 'brand' : 'neutral'} variant="surface" className="dtx-enter-scale" onRemove={() => setChips(x => x.filter(y => y !== c))}>{c}</Badge>)}{chips.length < all.length && <Button size="sm" variant="ghost" onClick={() => setChips(all)}>Khôi phục</Button>}</>;
}

