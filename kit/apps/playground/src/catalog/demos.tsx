// Interactive demo helpers used by catalog entries. Built only from @dtx/ui.
import { useEffect, useState, type CSSProperties, type ReactNode } from 'react';
import { BarChart3, ChevronDown, CircleCheck, Copy, Eye, FileDown, FileSpreadsheet, FileStack, FileText, History, LayoutDashboard, MoreHorizontal, Plus, SlidersHorizontal, Trash2 } from 'lucide-react';
import { Alert, Badge, Button, Card, CommandButton, CommandList, CommandPalette, Field, Loadable, Menu, Pagination, Slider, Reveal, SkeletonText, useToast, type CommandItem } from '@dtx/ui';
import { batches } from '../data';

export type Swatch = { name: string; hex: string; token: string; source: 'rule' | 'sampled' | 'kit'; note: string };
export const swatches: Swatch[] = [
  { name: 'DIGI-TEXX Blue', hex: '#2582D7', token: '--dtx-blue', source: 'rule', note: 'Leads every design' },
  { name: 'Lime', hex: '#A5CB1F', token: '--dtx-lime', source: 'rule', note: 'Accent, always with blue' },
  { name: 'Amber', hex: '#F6B71E', token: '--dtx-amber', source: 'rule', note: 'Accent, always with blue' },
  { name: 'Violet', hex: '#9127D6', token: '--dtx-violet', source: 'rule', note: 'Accent (AI), with blue' },
  { name: 'Ink', hex: '#231F20', token: '--dtx-ink', source: 'rule', note: 'Logo wordmark' },
  { name: 'Gray', hex: '#6E6F72', token: '--dtx-gray', source: 'rule', note: 'Logo tagline' },
  { name: 'Navy', hex: '#26385D', token: '--dtx-navy', source: 'sampled', note: 'PDF p.11 swatch 2' },
  { name: 'Ocean', hex: '#137BB6', token: '--dtx-ocean', source: 'sampled', note: 'PDF p.11 swatch 3' },
  { name: 'Sky', hex: '#30AAE0', token: '--dtx-sky', source: 'sampled', note: 'PDF p.11 swatch 4' },
  { name: 'Light', hex: '#7BD2F2', token: '--dtx-light', source: 'sampled', note: 'PDF p.11 swatch 5' },
  { name: 'Ice', hex: '#A8E5F5', token: '--dtx-ice', source: 'sampled', note: 'PDF p.11 swatch 6' },
  { name: 'Canvas dark', hex: '#1E1D23', token: '--dtx-canvas-dark', source: 'sampled', note: 'PDF page header' },
  { name: 'Panel', hex: '#F0F0F0', token: '--dtx-panel', source: 'sampled', note: 'PDF page body' },
  { name: 'Blue strong', hex: '#1A6FBF', token: '--dtx-blue-strong', source: 'kit', note: 'Fill behind small white text' },
  { name: 'Red', hex: '#C42B2B', token: '--dtx-red', source: 'kit', note: 'Solid danger fill' },
  { name: 'Link (light)', hex: '#126FA6', token: '--dtx-link', source: 'kit', note: 'Ocean darkened for AA on #F0F0F0' },
];
const srcTone = { rule: 'brand', sampled: 'warn', kit: 'neutral' } as const;

export function SwatchGrid() {
  return (
    <div className="grid grid-cols-[repeat(auto-fill,minmax(150px,1fr))] gap-3">
      {swatches.map(s => (
        <div key={s.token} className="dtx-hover-lift overflow-hidden rounded-lg border border-border bg-surface">
          <div className="h-16" style={{ background: s.hex }} />
          <div className="grid gap-0.5 p-3 text-xs">
            <b className="text-sm font-medium">{s.name}</b>
            <span className="dtx-num">{s.hex}</span>
            <code className="text-fg-muted">{s.token}</code>
            <span className="text-fg-muted">{s.note}</span>
            <span className="mt-1"><Badge size="sm" tone={srcTone[s.source]} variant="surface">{s.source}</Badge></span>
          </div>
        </div>
      ))}
    </div>
  );
}

export const typeScale = [
  { name: 'Display', spec: '700 italic · uppercase · 36–68px · 1.15', cls: 'dtx-display', text: 'Trích xuất dữ liệu' },
  { name: 'H2', spec: '700 · 24–32px · -0.01em', style: { fontSize: 'var(--dtx-text-h2)', fontWeight: 700, letterSpacing: '-.01em' }, text: 'Ứng dụng nhập liệu tự động' },
  { name: 'H3', spec: '700 · 20px', style: { fontSize: 'var(--dtx-text-lg)', fontWeight: 700 }, text: 'Nguyễn Thị Thuận đã duyệt lô BH-2210' },
  { name: 'Body', spec: '400 · 16px · 1.5', style: { maxWidth: '62ch' }, text: 'DIGI-TEXX kết hợp AI trích xuất dữ liệu với đội ngũ vận hành chuyên nghiệp, biến chứng từ giấy thành dữ liệu sạch.' },
  { name: 'Lede', spec: '300 · 20px', style: { fontSize: 'var(--dtx-text-lg)', fontWeight: 300 }, text: 'Accurate data. Faster operations.' },
  { name: 'Small', spec: '400 · 14px · muted', style: { fontSize: 'var(--dtx-text-sm)', color: 'var(--dtx-fg-muted)' }, text: 'Cập nhật lúc 09:42 · 48,210 tài liệu' },
  { name: 'Label', spec: '500 · 12px · caps · +0.1em', style: { fontSize: 'var(--dtx-text-xs)', fontWeight: 500, letterSpacing: '.1em', textTransform: 'uppercase', color: 'var(--dtx-fg-muted)' }, text: 'Độ chính xác sau QC' },
] as const;

export function TypeScale() {
  return (
    <div className="overflow-hidden rounded-lg border border-border bg-surface">
      {typeScale.map(t => (
        <div key={t.name} className="grid items-baseline gap-1 border-b border-border px-5 py-4 last:border-b-0 sm:grid-cols-[180px_minmax(0,1fr)] sm:gap-4">
          <div className="text-xs text-fg-muted"><b className="block text-sm font-medium text-fg">{t.name}</b>{t.spec}</div>
          {'cls' in t ? <p className={t.cls} style={{ fontSize: 'clamp(1.75rem, 1.2rem + 2vw, 3rem)' }}>{t.text}</p> : <p className="m-0" style={t.style as CSSProperties}>{t.text}</p>}
        </div>
      ))}
    </div>
  );
}

export const easings = [
  { name: 'Standard', token: '--dtx-ease-standard', v: [.2, 0, 0, 1], use: 'Most UI changes' },
  { name: 'Enter', token: '--dtx-ease-enter', v: [0, 0, 0, 1], use: 'Things appearing' },
  { name: 'Exit', token: '--dtx-ease-exit', v: [.3, 0, 1, 1], use: 'Things leaving' },
  { name: 'Emphasis', token: '--dtx-ease-emphasis', v: [.05, .7, .1, 1], use: 'Toggles, indicators, hero' },
];

/** Plots the bezier and runs a dot along a track with that easing. */
export function EasingCurves({ run }: { run: number }) {
  const [on, setOn] = useState(false);
  useEffect(() => { setOn(false); const t = setTimeout(() => setOn(true), 60); return () => clearTimeout(t); }, [run]);
  return (
    <div className="grid grid-cols-[repeat(auto-fill,minmax(220px,1fr))] gap-4">
      {easings.map(e => {
        const [x1, y1, x2, y2] = e.v, P = (x: number, y: number) => [x * 200, 100 - y * 100];
        const [ax, ay] = P(x1, y1), [cx, cy] = P(x2, y2);
        return (
          <Card key={e.name} className="grid gap-3 p-4">
            <div className="flex items-baseline justify-between gap-2"><b className="text-sm">{e.name}</b><code className="text-[11px] text-fg-muted">{e.token}</code></div>
            <svg viewBox="-6 -6 212 112" className="h-28 w-full overflow-visible" aria-hidden>
              <path d="M0 0V100H200" fill="none" stroke="var(--dtx-border-strong)" />
              <path d={`M0 100L${ax} ${ay}M200 0L${cx} ${cy}`} fill="none" stroke="var(--dtx-fg-muted)" strokeDasharray="2 3" />
              <path d={`M0 100C${ax} ${ay} ${cx} ${cy} 200 0`} fill="none" stroke="var(--dtx-primary)" strokeWidth="2.5" />
              <circle cx={ax} cy={ay} r="3" fill="var(--dtx-surface)" stroke="var(--dtx-fg-muted)" /><circle cx={cx} cy={cy} r="3" fill="var(--dtx-surface)" stroke="var(--dtx-fg-muted)" />
            </svg>
            <div className="h-[18px] rounded-full bg-surface-2 p-0.5 shadow-[inset_0_0_0_1px_var(--dtx-border)]">
              <div className="w-full" style={{ transition: `transform var(--dtx-dur-page) var(${e.token})`, transform: on ? 'translateX(calc(100% - 14px))' : 'none' }}>
                <i className="block size-3.5 rounded-[3px] bg-primary shadow-[0_0_12px_rgb(37_130_215/.6)]" />
              </div>
            </div>
            <p className="m-0 text-xs text-fg-muted">cubic-bezier({e.v.join(', ')}) · {e.use}</p>
          </Card>
        );
      })}
    </div>
  );
}

export const durations = [
  { n: 'instant', ms: 70, use: 'Press feedback' }, { n: 'fast', ms: 120, use: 'Hover, colour, exit of small popups' },
  { n: 'base', ms: 200, use: 'Menus, tooltips, select' }, { n: 'slow', ms: 320, use: 'Dialogs, toasts, tab indicator' },
  { n: 'page', ms: 480, use: 'Panels, page sections, charts' },
];
export function DurationBars({ run }: { run: number }) {
  const [on, setOn] = useState(false);
  useEffect(() => { setOn(false); const t = setTimeout(() => setOn(true), 60); return () => clearTimeout(t); }, [run]);
  return (
    <div className="grid gap-3">
      {durations.map(d => (
        <div key={d.n} className="grid grid-cols-[110px_minmax(0,1fr)_56px] items-center gap-3 text-xs text-fg-muted sm:grid-cols-[110px_minmax(0,1fr)_56px_minmax(0,220px)]">
          <code>--dtx-dur-{d.n}</code>
          <div className="h-2 overflow-hidden rounded-sm bg-surface-2">
            <i className="block h-full origin-left" style={{ background: 'var(--dtx-gradient-bar)', transition: `transform ${d.ms}ms var(--dtx-ease-standard)`, transform: on ? 'scaleX(1)' : 'scaleX(.03)' }} />
          </div>
          <span className="dtx-num">{d.ms}ms</span>
          <span className="hidden sm:block">{d.use}</span>
        </div>
      ))}
    </div>
  );
}

/** Exit: removes items with dtx-exit-fade-down, then unmounts on animationend. */
export function ExitDemo() {
  const all = ['Hoá đơn VAT · HD-5517', 'Hồ sơ bồi thường · BH-2210', 'Vận đơn · VC-7702'];
  const [items, setItems] = useState(all);
  const [leaving, setLeaving] = useState<string | null>(null);
  return (
    <div className="grid w-full max-w-sm gap-2">
      {items.map(i => (
        <div key={i} className={`flex items-center justify-between gap-2 rounded-md border border-border bg-surface px-3 py-2 text-sm ${leaving === i ? 'dtx-exit-fade-down' : ''}`}
          onAnimationEnd={() => { if (leaving === i) { setItems(x => x.filter(y => y !== i)); setLeaving(null); } }}>
          {i}<Button size="sm" variant="ghost" onClick={() => setLeaving(i)}>Xoá</Button>
        </div>
      ))}
      {items.length < all.length && <Button size="sm" variant="secondary" onClick={() => setItems(all)}>Khôi phục</Button>}
    </div>
  );
}

/** Skeleton → content with manual phase control, so each phase can be inspected. */
export function LoadableDemo({ run }: { run: number }) {
  const [loading, setLoading] = useState(true);
  useEffect(() => { setLoading(true); const t = setTimeout(() => setLoading(false), 1600); return () => clearTimeout(t); }, [run]);
  return (
    <div className="grid w-full max-w-sm gap-3">
      <Card className="min-h-[104px] p-4">
        <Loadable loading={loading} skeleton={<SkeletonText lines={3} />}>
          <div className="grid gap-1">
            <b className="text-sm">Hồ sơ bồi thường · BH-2210</b>
            <span className="text-xs text-fg-muted">1.240 trang · Độ chính xác 99.71%</span>
            <span className="mt-1"><Badge live>Đang QC</Badge></span>
          </div>
        </Loadable>
      </Card>
      <div className="flex gap-2">
        <Button size="sm" variant={loading ? 'primary' : 'secondary'} onClick={() => setLoading(true)}>Phase 1 · Skeleton</Button>
        <Button size="sm" variant={!loading ? 'primary' : 'secondary'} onClick={() => setLoading(false)}>Phase 2 · Content</Button>
      </div>
    </div>
  );
}

export function StaggerList({ run }: { run: number }) {
  return (
    <div key={run} className="grid w-full max-w-sm gap-2">
      {['Quét tài liệu', 'Phân loại', 'Trích xuất trường', 'Kiểm tra QC', 'Bàn giao'].map((s, i) => (
        <Reveal key={s} index={i} stagger={70}><div className="rounded-md border border-border bg-surface px-3 py-2 text-sm"><span className="dtx-num mr-2 text-fg-muted">{i + 1}</span>{s}</div></Reveal>
      ))}
    </div>
  );
}

export function ToastDemo() {
  const toast = useToast();
  return (
    <div className="flex flex-wrap gap-2">
      <Button onClick={() => toast({ title: 'Đã lưu lô BH-2210', description: '1.240 trang · 09:42', tone: 'ok' })}>Toast thành công</Button>
      <Button variant="danger" onClick={() => toast({ title: 'Không gửi được lô BH-2210', description: 'Máy chủ OCR không phản hồi. Tệp vẫn được giữ, thử lại sau ít phút.', tone: 'err' })}>Toast lỗi</Button>
      <Button variant="secondary" onClick={() => toast({ title: 'Lô HD-5517 có nguy cơ trễ SLA', description: 'Còn 1.120 trang chưa QC.', tone: 'warn' })}>Toast cảnh báo</Button>
      <Button variant="secondary" onClick={() => toast({ title: 'Đang xuất báo cáo', description: 'Bạn sẽ nhận email trong vài phút.', icon: <Badge size="sm" live /> })}>Toast đang xử lý</Button>
    </div>
  );
}

export function Stage({ children, theme, dots }: { children: ReactNode; theme?: 'light' | 'dark'; dots?: boolean }) {
  return (
    <div data-theme={theme} className={`flex min-h-[120px] flex-wrap items-center justify-center gap-4 rounded-md p-6 ${theme === 'dark' ? 'bg-bg' : 'bg-surface-2'} ${dots ? 'pg-stage' : ''}`}>
      {children}
    </div>
  );
}

export const spacing = [4, 8, 12, 16, 24, 32, 48, 64, 96];
export const radii = [{ n: 'sm', px: 4, use: 'Controls, badges' }, { n: 'md', px: 6, use: 'Buttons, inputs' }, { n: 'lg', px: 10, use: 'Cards, popovers' }, { n: 'full', px: 999, use: 'Trend pills only' }];

/** Sample palette content: pages, batches (with client and a code keyword) and actions, one disabled with its reason. */
function useCommandItems(): CommandItem[] {
  const toast = useToast();
  const run = (label: string) => () => toast({ title: label, description: 'Ví dụ: ứng dụng thật sẽ chuyển trang hoặc chạy lệnh.' });
  return [
    { id: 'go-overview', group: 'Đi tới', label: 'Tổng quan', icon: <LayoutDashboard />, keywords: ['overview', 'dashboard'], onSelect: run('Tổng quan') },
    { id: 'go-qc', group: 'Đi tới', label: 'Hàng đợi QC', icon: <CircleCheck />, keywords: ['kiểm tra', 'quality'], onSelect: run('Hàng đợi QC') },
    { id: 'go-reports', group: 'Đi tới', label: 'Báo cáo', icon: <BarChart3 />, keywords: ['reports'], onSelect: run('Báo cáo') },
    ...batches.slice(0, 4).map(b => ({ id: b.id, group: 'Lô tài liệu', label: `${b.id} · ${b.type[0]}`, description: `${b.client} · ${b.pages?.toLocaleString('vi-VN')} trang`,
      icon: <FileStack />, keywords: [b.type[1]], onSelect: run(`Mở lô ${b.id}`) })),
    { id: 'new', group: 'Lệnh', label: 'Tạo lô mới', icon: <Plus />, keywords: ['new batch'], onSelect: run('Tạo lô mới') },
    { id: 'export', group: 'Lệnh', label: 'Xuất báo cáo ca', icon: <FileDown />, shortcut: 'Ctrl E', keywords: ['export'], onSelect: run('Xuất báo cáo ca') },
    { id: 'delete', group: 'Lệnh', label: 'Xoá lô đã chọn', icon: <Trash2 />, description: 'Chỉ trưởng ca được xoá lô', disabled: true, onSelect: run('Xoá lô') },
  ];
}

export function CommandPaletteDemo() {
  return <CommandPalette hotkey={false} items={useCommandItems()} trigger={<CommandButton placeholder="Tìm lô, khách hàng, lệnh…" />} />;
}

export function CommandListDemo() {
  return <CommandList items={useCommandItems()} className="h-[420px] w-full max-w-[640px]" />;
}

/** Last picked action, announced, so the demo shows that onSelect ran. */
function Picked({ text }: { text: string }) {
  return <p className="m-0 text-xs text-fg-muted" aria-live="polite">{text ? `Vừa chọn: ${text}` : 'Chưa chọn mục nào'}</p>;
}

export function MenuRowDemo() {
  const [picked, setPicked] = useState('');
  return (
    <div className="grid justify-items-center gap-3">
      <Menu align="end" trigger={<Button variant="ghost" size="sm" icon aria-label="Thao tác cho HD-5517"><MoreHorizontal aria-hidden /></Button>} items={[
        { label: 'Xem chi tiết', icon: <Eye />, onSelect: () => setPicked('Xem chi tiết') },
        { label: 'Nhân bản', icon: <Copy />, shortcut: 'Ctrl D', onSelect: () => setPicked('Nhân bản') },
        { label: 'Lịch sử thay đổi', icon: <History />, disabled: true },
        'separator',
        { label: 'Xoá lô HD-5517', icon: <Trash2 />, danger: true, onSelect: () => setPicked('Xoá lô HD-5517') },
      ]} />
      <Picked text={picked} />
    </div>
  );
}

export function MenuExportDemo() {
  const [picked, setPicked] = useState('');
  const pick = (s: string) => () => setPicked(s);
  return (
    <div className="grid justify-items-center gap-3">
      <Menu trigger={<Button variant="secondary">Xuất file<ChevronDown aria-hidden /></Button>} items={[
        { type: 'group', label: 'Định dạng', items: [
          { label: 'Excel (.xlsx)', description: 'Giữ định dạng số và ngày', icon: <FileSpreadsheet />, onSelect: pick('Excel') },
          { label: 'CSV', description: 'Cho công cụ khác đọc', icon: <FileText />, onSelect: pick('CSV') },
          { label: 'PDF', description: 'Để in hoặc gửi khách hàng', icon: <FileDown />, onSelect: pick('PDF') },
        ] },
        'separator',
        { label: 'Lịch sử xuất file', href: '#/catalog/menu', icon: <History /> },
      ]} />
      <Picked text={picked} />
    </div>
  );
}

const menuColumns = [{ id: 'code', label: 'Mã lô' }, { id: 'client', label: 'Khách hàng' }, { id: 'pages', label: 'Số trang' }, { id: 'status', label: 'Trạng thái' }, { id: 'due', label: 'Hạn SLA' }];

export function MenuViewDemo() {
  const [shown, setShown] = useState(['code', 'client', 'status']);
  const [sort, setSort] = useState('due');
  const sorts = [{ value: 'due', label: 'Hạn SLA gần nhất' }, { value: 'pages', label: 'Nhiều trang nhất' }, { value: 'new', label: 'Mới tạo' }];
  const toggle = (id: string, on: boolean) => setShown(s => on ? menuColumns.map(c => c.id).filter(c => c === id || s.includes(c)) : s.filter(c => c !== id));
  return (
    <div className="grid justify-items-center gap-3">
      <Menu trigger={<Button variant="secondary" size="sm"><SlidersHorizontal aria-hidden />Hiển thị</Button>} items={[
        { type: 'group', label: 'Cột', items: menuColumns.map(c => ({ type: 'checkbox' as const, label: c.label, checked: shown.includes(c.id), disabled: c.id === 'code', onCheckedChange: (on: boolean) => toggle(c.id, on) })) },
        'separator',
        { type: 'group', label: 'Sắp xếp theo', items: [{ type: 'radio', value: sort, onValueChange: setSort, options: sorts }] },
      ]} />
      <p className="m-0 text-xs text-fg-muted">Cột: {menuColumns.filter(c => shown.includes(c.id)).map(c => c.label).join(', ')} · Sắp xếp: {sorts.find(o => o.value === sort)?.label}</p>
    </div>
  );
}

export function PaginationDemo({ total, start = 1, size: initial = 20, sizes, itemLabel }: { total: number; start?: number; size?: number; sizes?: boolean; itemLabel?: string }) {
  const [page, setPage] = useState(start);
  const [size, setSize] = useState(initial);
  return <Pagination page={page} total={total} pageSize={size} onPageChange={setPage} onPageSizeChange={sizes ? setSize : undefined} itemLabel={itemLabel} />;
}

export function SliderThresholdDemo() {
  const [value, setValue] = useState(85);
  const [saved, setSaved] = useState(85);
  return (
    <div className="grid w-full max-w-md gap-2">
      <Field label="Ngưỡng tin cậy tối thiểu" description="Trường dưới ngưỡng này được chuyển sang QC thủ công.">
        <Slider value={value} onValueChange={setValue} onValueCommitted={setSaved} min={50} max={100} format={{ style: 'unit', unit: 'percent' }} />
      </Field>
      <p className="m-0 text-xs text-fg-muted" aria-live="polite">Đã lưu: {saved}%</p>
    </div>
  );
}

/** Closable warning with its one action; closing it leaves a way back so the demo can be replayed. */
export function AlertDemo() {
  const [shown, setShown] = useState(true);
  if (!shown) return <Button variant="secondary" onClick={() => setShown(true)}>Hiện lại cảnh báo</Button>;
  return (
    <Alert tone="warn" title="Lô HD-5517 có thể trễ hạn SLA 16:15" onClose={() => setShown(false)} className="w-full"
      action={<Button size="sm" variant="secondary">Mở hàng đợi QC</Button>}>
      Còn 1.120 trang chưa QC. Chuyển lô sang mức Khẩn hoặc giao thêm người kiểm tra.
    </Alert>
  );
}
