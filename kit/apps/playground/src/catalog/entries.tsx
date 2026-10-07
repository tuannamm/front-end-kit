import { Fragment, useCallback, useState, type ReactNode } from 'react';
import { AlertTriangle, BarChart3, CheckCircle2, CircleAlert, CircleCheck, FileStack, House, Inbox, Layers, LayoutDashboard, ListFilter, Lock, MessageSquare, ScanText, SearchX, Send, Settings, Sparkles, TrendingUp, Upload, Users } from 'lucide-react';
import {
  Alert, AppShell, Breadcrumb, Carousel, Collapse, Masonry, Splitter, Steps, Timeline, Watermark, Slider, Textarea, Avatar, EmptyState, AvatarPicker, Badge, Icon, Calendar, Checkbox, CheckboxGroup, DatePicker, DateRangePicker, RadioGroup, addDays, formatDate, todayIso, BoxOverlay, Button, Card, CardHeader, CategoryBar, CommandButton, CompareSlider, ConfidenceBadge, ConfidenceBar, ConfidenceDots,
  CountUp, Counter, DataTable, Dialog, DialogClose, Drawer, DrawerClose, Display, FileDropzone, FileItem, FileList, UploadToast, DocumentScan, Eyebrow, Field, HexIcon, IconTile, Input, Kbd, KpiCard, Lede,
  Logo, Meter, MultiSelect, Notification, NotificationList, OcrShowcase, PdfViewer, Preprocess, PreprocessPipeline, ProgressRing, Reveal, SampleInvoice, ScanBeam, ScanReveal, SectionHeader, Segmented, Select, Sidebar,
  SidebarGroup, SidebarItem, SidebarWorkspace, Skeleton, SkeletonText, Sparkline, StackedBarChart, Switch, Tabs, TargetBar, TechBackdrop,
  Tooltip, Topbar, mascotUrl, sampleInvoiceRegions, sampleInvoiceInset, type DateRange, type NormalizedOcr, type NotificationItem, type OcrBox, type GeometryStep, type ScanPhase, type Tone,
} from '@dtx/ui';
import { aiThroughput, batches, hours, invoiceFields, invoiceRows, manualThroughput, olderBatches, type Batch } from '../data';
import { docTypeGroups, shiftOptions, statusOptions } from '../options';
import { RealBoxes, RealEnhance, RealShowcase, RealUnwarp } from './real';
import { demoPair, type DemoStep } from '../demo-pairs';
import { useFakeUpload } from '../fake-upload';
import { AlertDemo, MasonryLiveDemo, SplitterListDemo, StepsWizardDemo, PaginationDemo, SliderThresholdDemo, MenuExportDemo, MenuRowDemo, MenuViewDemo, CommandListDemo, CommandPaletteDemo, DurationBars, EasingCurves, ExitDemo, LoadableDemo, StaggerList, SwatchGrid, ToastDemo, TypeScale, radii, spacing } from './demos';

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
export type Entry = { id: string; name: string; category: Category; status: 'ready' | 'planned'; summary: string; importLine?: string; demos: Demo[] };

const imp = (names: string) => `import { ${names} } from '@dtx/ui';`;
const stages = [
  { title: 'Tiếp nhận', description: '3.860 trang' },
  { title: 'Nhận dạng', subTitle: 'Còn 00:08', description: '2.140 / 3.860 trang' },
  { title: 'Bàn giao', description: 'Sau khi QC đạt' },
];
const tileHeights = [150, 0, 90, 70, 150, 150, 50, 80, 50, 90, 100, 150, 60, 50, 80];
const feedback = [
  { who: 'Phòng Lưu trữ, Ngân hàng Đông Á Mới', text: 'Lô 03 bàn giao sớm hai ngày, độ chính xác trường thông tin vượt cam kết.' },
  { who: 'Chi nhánh Đà Nẵng', text: 'Cần thêm trường “Nơi cấp” cho hồ sơ CCCD.' },
  { who: 'Ban Quản lý dự án', text: 'Báo cáo tiến độ hằng tuần rõ ràng. Đề nghị bổ sung biểu đồ số trang theo ngày và tách riêng các lô có hồ sơ gốc bị rách, ố để chúng tôi theo dõi việc phục chế song song với số hoá.' },
  { who: 'Kế toán', text: 'Hoá đơn tháng 9 đã nhận.' },
  { who: 'Phòng Pháp chế', text: 'Biên bản nghiệm thu cần ghi rõ tỷ lệ mẫu kiểm tra 5% cho từng lô.' },
  { who: 'Trung tâm Dữ liệu', text: 'File xuất JSON khớp schema v2. Cảm ơn đội QC đã xử lý nhanh 12 trang lỗi.' },
];
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
function DrawerRecord() {
  const b = batches[1];
  const rows: [string, ReactNode][] = [['Mã lô', b.id], ['Loại tài liệu', b.type[0]], ['Khách hàng', `${b.client} (mẫu)`], ['Ngày nhận', formatDate(b.received)], ['Số trang', b.pages?.toLocaleString('vi-VN') ?? '—'], ['Độ chính xác', b.accuracy === undefined ? '—' : `${b.accuracy.toFixed(2)}%`], ['Hạn SLA', b.sla]];
  const log = Array.from({ length: 12 }, (_, i) => `${String(8 + (i >> 1)).padStart(2, '0')}:${i % 2 ? '35' : '05'} · Trang ${i * 300 + 1}–${(i + 1) * 300} đã OCR xong`);
  return (
    <Drawer trigger={<Button variant="secondary">Xem chi tiết lô</Button>} title={`Lô ${b.id}`} description={`${b.type[0]} · ${b.client} (mẫu)`}
      footer={<><DrawerClose><Button variant="ghost">Đóng</Button></DrawerClose><Button>Mở hàng đợi QC</Button></>}>
      <dl className="m-0 grid grid-cols-[auto_minmax(0,1fr)] gap-x-6 gap-y-3 text-sm">
        {rows.map(([k, v]) => <Fragment key={k}><dt className="text-fg-muted">{k}</dt><dd className="m-0 font-medium dtx-num">{v}</dd></Fragment>)}
      </dl>
      <h3 className="mb-2 mt-6 text-sm font-bold">Lịch sử xử lý</h3>
      <ol className="m-0 grid list-none gap-0 p-0 text-sm">{log.map(l => <li key={l} className="border-b border-border py-2 dtx-num last:border-b-0">{l}</li>)}</ol>
    </Drawer>
  );
}
function DrawerFilters() {
  return (
    <Drawer side="left" size="sm" trigger={<Button variant="secondary">Bộ lọc</Button>} title="Lọc lô tài liệu"
      footer={<><DrawerClose><Button variant="ghost">Xoá lọc</Button></DrawerClose><DrawerClose><Button>Áp dụng</Button></DrawerClose></>}>
      <div className="grid gap-4">
        <Field label="Ca làm việc"><Select items={shiftOptions} placeholder="Mọi ca" /></Field>
        <DateRangePicker label="Ngày nhận" placeholder="Mọi ngày nhận" />
        <CheckboxGroup label="Trạng thái" selectAll="Tất cả" options={[{ value: 'qc', label: 'Đang QC' }, { value: 'risk', label: 'Nguy cơ trễ' }, { value: 'done', label: 'Hoàn tất' }, { value: 'error', label: 'Lỗi' }]} defaultValue={['qc', 'risk']} />
      </div>
    </Drawer>
  );
}

function UploadDemo() {
  const { add, rows } = useFakeUpload();
  return (
    <div className="w-full max-w-xl">
      <FileDropzone label="Tài liệu cần xử lý" accept=".pdf,.jpg,.jpeg,.png,.tif,.tiff,.zip" maxSize={20 * 1024 * 1024} onFiles={add} />
      <UploadToast items={rows('Mất kết nối khi tải lên. Bấm thử lại.')} />
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
        <Topbar><Breadcrumb items={[{ label: 'Vận hành' }, { label: 'Tổng quan' }]} /><CommandButton /></Topbar>
        <div className="p-5 text-sm text-fg-muted">Nội dung trang</div>
      </AppShell>
    </div>
  );
}

const news: { tone: Tone; tag: string; title: string; text: string }[] = [
  { tone: 'brand', tag: 'Tính năng mới', title: 'Đọc chữ viết tay trên hồ sơ bồi thường', text: 'Bản 2.4 nhận dạng ghi chú viết tay, độ chính xác 96,8% trên bộ thử 12.000 trang.' },
  { tone: 'ok', tag: 'Hiệu năng', title: 'Xử lý lô nhanh hơn 32%', text: 'Hàng đợi OCR chạy song song theo trang; lô 4.000 trang xong trong khoảng 18 phút.' },
  { tone: 'warn', tag: 'Bảo trì', title: 'Tạm dừng nhận lô 22:00–23:00 thứ Bảy', text: 'Các lô gửi trong khung giờ này được xếp hàng và chạy ngay sau khi bảo trì xong.' },
  { tone: 'violet', tag: 'AI', title: 'Gợi ý trường thông tin cho mẫu mới', text: 'Tải lên 5 hồ sơ mẫu, hệ thống đề xuất danh sách trường cần trích xuất để bạn duyệt.' },
];
const BatchSlide = ({ b }: { b: Batch }) => (
  <a href="#/catalog/carousel" className="grid h-full content-start gap-1 rounded-lg border border-border bg-surface p-4 text-fg no-underline hover:border-border-strong">
    <span className="dtx-id text-sm font-medium">{b.id}</span>
    <span className="text-sm">{b.type[0]}</span>
    <span className="text-xs text-fg-muted">{b.client} · <span className="dtx-num">{b.pages?.toLocaleString('vi-VN') ?? '—'}</span> trang</span>
  </a>
);

const planned = (id: string, name: string, category: Category, summary: string): Entry => ({ id, name, category, status: 'planned', summary, demos: [] });

function AvatarPickerDemo() {
  const [src, setSrc] = useState<string>();
  const change = (file: File | null) => { if (src) URL.revokeObjectURL(src); setSrc(file ? URL.createObjectURL(file) : undefined); };
  return <><AvatarPicker name="Nguyễn Thị Thuận" src={src} onChange={change} /><AvatarPicker name="Nguyễn Thị Thuận" src={src} size="lg" onChange={change} /><AvatarPicker name="Trần Minh" shape="square" onChange={() => {}} /></>;
}

// Stand-in for a user photo (the mascot is reserved for empty states / onboarding / 404, never an avatar)
const ago = (min: number) => new Date(Date.now() - min * 60_000);
const notifications: NotificationItem[] = [
  { id: 1, icon: <CircleAlert />, tone: 'err', title: 'Lô HD-5517 lỗi OCR ở 12 trang', description: 'Ảnh quá mờ. Quét lại các trang này hoặc chuyển sang nhập tay.', time: ago(4) },
  { id: 2, icon: <CheckCircle2 />, tone: 'ok', title: 'Lô BH-2210 đã qua QC', description: '3.860 trang · độ chính xác 99,2%', time: ago(38) },
  { id: 3, icon: <Sparkles />, tone: 'violet', title: 'AI gợi ý kiểm tra lại 24 trường', description: 'Hoá đơn VAT của khách hàng Bảo hiểm Bảo Việt chi nhánh Hà Nội, các trường có độ tin cậy dưới 80% cần một người duyệt lại trước khi xuất.', time: ago(190), read: true },
  { id: 4, icon: <Users />, tone: 'brand', title: 'Trần Minh giao cho bạn lô TD-0931', description: 'Hạn SLA: 17:00 hôm nay.', time: ago(26 * 60), read: true },
  { id: 5, icon: <AlertTriangle />, tone: 'warn', title: 'Dung lượng lưu trữ đã dùng 85%', time: ago(5 * 24 * 60), read: true },
];
const manyUnread = (n: number) => Array.from({ length: n }, (_, i): NotificationItem => ({ id: i, title: `Thông báo ${i + 1}` }));
const demoPdf = `${import.meta.env.BASE_URL}demo/hop-dong-mau.pdf`;
/** Never finishes reading, so the loading state can be shown without a slow network. */
class StalledBlob extends Blob { arrayBuffer() { return new Promise<ArrayBuffer>(() => {}); } }
const stalled = new StalledBlob([]);
const notPdf = new Blob(['Đây không phải file PDF.'], { type: 'application/pdf' });

function PdfOpenDemo() {
  const [file, setFile] = useState<File | null>(null);
  return (
    <div className="grid w-full gap-3">
      <FileDropzone compact multiple={false} label="File PDF" accept=".pdf,application/pdf" maxSize={50 * 1024 * 1024} onFiles={fs => setFile(fs[0] ?? null)} />
      <PdfViewer src={file} fileName={file?.name} className="h-[480px]" />
    </div>
  );
}

function NotificationDemo() {
  const [items, setItems] = useState(notifications);
  const [next, setNext] = useState(100);
  const markRead = (id: NotificationItem['id']) => setItems(xs => xs.map(x => (x.id === id ? { ...x, read: true } : x)));
  const arrive = () => { setItems(xs => [{ id: next, icon: <FileStack />, tone: 'brand', title: `Lô mới NV-${next} đã vào hàng đợi`, description: '120 trang · khách hàng Ngân hàng Đông Á', time: new Date() }, ...xs]); setNext(n => n + 1); };
  return (
    <div className="grid w-full max-w-xl gap-3">
      <div className="flex items-center gap-3 rounded-md border border-border bg-surface px-4 py-2">
        <Breadcrumb items={[{ label: 'Vận hành' }, { label: 'Tổng quan' }]} />
        <span className="ml-auto flex items-center gap-2">
          <Notification items={items} onSelect={n => markRead(n.id)} onMarkAllRead={() => setItems(xs => xs.map(x => ({ ...x, read: true })))}
            footer={<Button variant="ghost" size="sm">Xem tất cả thông báo</Button>} />
          <Avatar name="Nguyễn Thị Thuận" size="sm" shape="circle" />
        </span>
      </div>
      <div className="flex flex-wrap gap-2"><Button variant="secondary" size="sm" onClick={arrive}>Giả lập thông báo mới</Button><Button variant="ghost" size="sm" onClick={() => setItems(notifications)}>Đặt lại</Button></div>
    </div>
  );
}

const demoPhoto = 'data:image/svg+xml,' + encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><rect width="64" height="64" fill="#B9D7EE"/><circle cx="32" cy="26" r="12" fill="#5B6F8F"/><path d="M8 64c2-14 12-21 24-21s22 7 24 21z" fill="#5B6F8F"/></svg>');

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
    importLine: imp('Button'), demos: [
      { title: 'Variants', code: '<Button>Lưu</Button>\n<Button variant="secondary">Huỷ</Button>', render: () => <><Button>Lưu thay đổi</Button><Button variant="secondary">Huỷ</Button><Button variant="ghost">Xem chi tiết</Button><Button variant="danger">Xoá lô</Button></> },
      { title: 'Sizes', render: () => <><Button size="sm">Small</Button><Button>Medium</Button><Button size="lg">Discover our Demo</Button></> },
      { title: 'Icon & disabled', render: () => <><Button icon variant="secondary" aria-label="Cài đặt"><Settings /></Button><Button><Sparkles />Trích xuất bằng AI</Button><Button disabled>Đang khoá</Button></> }] },
  { id: 'badge', name: 'Badge', category: 'Core', status: 'ready', summary: 'Alpha-based tones (Radix soft/surface model): one rule works in both themes. Violet is AI-only and sits next to blue.',
    importLine: imp('Badge'), demos: [
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
    importLine: imp('Select, type SelectOption, type SelectGroup'), demos: [
      { title: '1 · Plain list', note: 'No icon, no group, no description.', code: "<Select items={[{ value: 'am', label: 'Ca sáng' }, …]} />", render: () => <SelectDemo label="Ca làm việc" items={shiftOptions} defaultValue="am" /> },
      { title: '2 · With icons', render: () => <SelectDemo label="Loại tài liệu" items={docTypeGroups.flatMap(g => g.items).map(({ description: _d, ...o }) => o)} defaultValue="vat" /> },
      { title: '3 · With descriptions', render: () => <SelectDemo label="Loại tài liệu" items={docTypeGroups.flatMap(g => g.items).map(({ icon: _i, ...o }) => o)} defaultValue="claim" /> },
      { title: '4 · Grouped + icon + description', render: () => <SelectDemo label="Loại tài liệu" items={docTypeGroups} defaultValue="vat" /> },
      { title: '5 · Searchable', note: 'Type “bao hiem” or “vat”.', render: () => <SelectDemo label="Loại tài liệu" items={docTypeGroups} defaultValue="vat" searchable searchPlaceholder="Tìm loại tài liệu…" /> },
      { title: '6 · Mixed options', note: 'Some options have a description, some an icon, some neither.', render: () => <SelectDemo label="Trạng thái" items={statusOptions} defaultValue="all" /> },
      { title: '7 · Small, no visible label', render: () => <div className="w-52"><Select size="sm" aria-label="Lọc theo trạng thái" items={statusOptions} defaultValue="all" /></div> }] },
  { id: 'steps', name: 'Steps', category: 'Core', status: 'ready', summary: 'Where the user is in a sequence: a wizard, a checkout, the stages of a batch. Finished, in progress, waiting or failed, from one `current`. Horizontal until the titles no longer fit, then vertical by itself. Clickable for wizards; filled or outlined, two sizes.',
    importLine: imp('Steps, type StepItem'),
    demos: [
      { title: '1 · Filled and outlined, two sizes', note: 'current={1}: the first step is finished, the second in progress, the third waits. The line after a finished step is blue.', code: "<Steps current={1} items={[\n  { title: 'Tiếp nhận', description: '3.860 trang' },\n  { title: 'Nhận dạng', subTitle: 'Còn 00:08', description: '2.140 / 3.860 trang' },\n  { title: 'Bàn giao', description: 'Sau khi QC đạt' },\n]} />\n<Steps variant=\"outlined\" … />\n<Steps size=\"sm\" … />", render: () => <div className="grid w-full gap-8">
        <Steps aria-label="Tiến độ lô" current={1} items={stages} />
        <Steps aria-label="Tiến độ lô" current={1} items={stages} variant="outlined" />
        <Steps aria-label="Tiến độ lô" current={1} items={stages} size="sm" />
        <Steps aria-label="Tiến độ lô" current={1} items={stages} size="sm" variant="outlined" />
      </div> },
      { title: '2 · A failed step', note: 'status="error" on the current step: a cross, the title in red, read as “Lỗi: …”.', code: '<Steps current={2} status="error" items={…} />', render: () => <div className="w-full"><Steps aria-label="Tiến độ lô VC-7702" current={2} status="error" items={[
        { title: 'Tiếp nhận' }, { title: 'Tiền xử lý' }, { title: 'Nhận dạng', description: 'Lỗi ở 12 trang: ảnh quá mờ' }, { title: 'Bàn giao' }]} /></div> },
      { title: '3 · Wizard', note: 'onChange makes each step a button: click one, or use the buttons below.', code: '<Steps current={step} onChange={setStep} items={…} />', render: () => <StepsWizardDemo /> },
      { title: '4 · Vertical', note: 'orientation="vertical", for a side panel. Descriptions can be long.', code: '<Steps orientation="vertical" current={2} items={…} />', render: () => <div className="w-full max-w-sm"><Steps aria-label="Quy trình xử lý" orientation="vertical" current={2} items={[
        { title: 'Tiếp nhận hồ sơ', description: '412 hồ sơ, 3.860 trang, đủ biên bản giao nhận' },
        { title: 'Tiền xử lý', description: 'Cắt viền, chỉnh nghiêng, khử nhiễu' },
        { title: 'Nhận dạng (OCR)', subTitle: '55%', description: '2.140 / 3.860 trang' },
        { title: 'Kiểm tra chất lượng', description: 'Mẫu ngẫu nhiên 5% số trang' },
        { title: 'Bàn giao' }]} /></div> },
      { title: '5 · Too many to fit', note: 'Six long titles: horizontal on a wide screen, vertical by itself once they no longer fit. Narrow the window to see it switch.', render: () => <div className="w-full"><Steps aria-label="Quy trình hợp đồng" size="sm" current={3} items={[
        { title: 'Khởi tạo hợp đồng' }, { title: 'Pháp chế duyệt' }, { title: 'Khách hàng ký' }, { title: 'Số hoá hồ sơ gốc' }, { title: 'Kiểm tra chất lượng' }, { title: 'Nghiệm thu, thanh toán' }]} /></div> }] },
  { id: 'watermark', name: 'Watermark', category: 'Core', status: 'ready', summary: 'Repeated, rotated text over a document, record or page: marks it confidential and names who viewed it and when, so a screenshot can be traced. One canvas tiled as a CSS mask; follows the theme, stays in print, never blocks the pointer. A deterrent, not protection.',
    importLine: imp('Watermark'),
    demos: [
      { title: '1 · Confidential record', note: 'Two lines: a label, then who and when. Select the text or press the button under it: the watermark never catches the pointer.', code: "<Watermark content={['DIGI-TEXX · Tài liệu mật', 'Nguyễn Minh Anh · 14:32 · 07/10/2026']}>\n  <RecordDetail />\n</Watermark>", render: () => <div className="w-full max-w-3xl [contain:inline-size]"><Watermark content={['DIGI-TEXX · Tài liệu mật', 'Nguyễn Minh Anh · 14:32 · 07/10/2026']}>
        <div className="overflow-hidden rounded-lg border border-border">
          <div className="dtx-table-wrap"><table className="dtx-table"><thead><tr><th>Lô</th><th>Khách hàng</th><th>Loại</th><th style={{ textAlign: 'right' }}>Trang</th></tr></thead>
            <tbody>{batches.map(b => <tr key={b.id}><td>{b.id}</td><td>{b.client}</td><td>{b.type[0]}</td><td style={{ textAlign: 'right' }}>{b.pages?.toLocaleString('vi-VN') ?? '–'}</td></tr>)}</tbody></table></div>
          <div className="flex justify-end border-t border-border p-3"><Button variant="secondary" size="sm">Xuất danh sách</Button></div>
        </div>
      </Watermark></div> },
      { title: '2 · Draft', note: 'One big word, wider apart: fontSize={28} rotate={-30} gap={[160, 120]}.', code: '<Watermark content="BẢN NHÁP" fontSize={28} rotate={-30} gap={[160, 120]}>…</Watermark>', render: () => <div className="w-full max-w-3xl"><Watermark content="BẢN NHÁP" fontSize={28} rotate={-30} gap={[160, 120]}>
        <article className="grid gap-3 rounded-lg border border-border p-6"><h3 className="m-0 text-xl font-bold italic">Quy trình kiểm tra chất lượng lô số hoá</h3>
          <p className="m-0 text-sm leading-relaxed text-fg-muted">Mỗi lô được kiểm tra mẫu ngẫu nhiên 5% số trang. Trường có độ tin cậy dưới ngưỡng được chuyển sang người duyệt; lô đạt khi độ chính xác sau QC từ 99,5% trở lên.</p>
          <p className="m-0 text-sm leading-relaxed text-fg-muted">Lô không đạt được xử lý lại miễn phí trong 5 ngày làm việc và kiểm tra lại toàn bộ các trường đã sửa.</p></article>
      </Watermark></div> },
      { title: '3 · On white paper', note: 'The paper stays white in the dark theme, so the watermark colour is set for it: --dtx-watermark-color: rgb(0 0 0 / .12).', code: "<Watermark className=\"[--dtx-watermark-color:rgb(0_0_0/.12)]\" content={['Bản sao kiểm tra', 'Không có giá trị pháp lý']}>\n  <InvoicePage />\n</Watermark>", render: () => <div className="w-full max-w-md"><Watermark className="[--dtx-watermark-color:rgb(0_0_0/.12)]" content={['Bản sao kiểm tra', 'Không có giá trị pháp lý']} gap={[60, 60]}>
        <div className="overflow-hidden rounded-md border border-border"><SampleInvoice /></div>
      </Watermark></div> }] },
  { id: 'splitter', name: 'Splitter', category: 'Core', status: 'ready', summary: 'Panels with draggable handles: list and detail, document and fields, editor and log. Sizes in px or %, min/max per panel held while dragging and on resize. Collapsible panels fold under half their min, or with Enter / double-click on the handle. Handles are keyboard separators. Nest for a grid of panes.',
    importLine: imp('Splitter, type SplitterPanel'),
    demos: [
      { title: '1 · List and detail', note: 'defaultSize 280px, min 200px, max 60%, collapsible. Drag the list under 100px and it folds; double-click the line to open it again. The line under the box shows what onResizeEnd saves.', code: "<Splitter onResizeEnd={save} panels={[\n  { label: 'Danh sách lô', defaultSize: 280, min: 200, max: '60%', collapsible: true, content: <BatchList /> },\n  { label: 'Chi tiết lô', min: 240, content: <BatchDetail /> },\n]} />", render: () => <SplitterListDemo /> },
      { title: '2 · Three panes: pages, document, fields', note: 'Each handle moves only its two neighbours. The fields pane is collapsible: focus the second line and press Enter.', code: "<Splitter panels={[\n  { label: 'Trang', defaultSize: 160, min: 120, content: <PageList /> },\n  { label: 'Tài liệu', min: 280, content: <Document /> },\n  { label: 'Trường dữ liệu', defaultSize: '30%', min: 220, collapsible: true, content: <Fields /> },\n]} />", render: () => <div className="h-96 w-full overflow-hidden rounded-lg border border-border"><Splitter panels={[
        { label: 'Trang', defaultSize: 160, min: 120, content: <ol className="m-0 grid list-none gap-1 p-2">{[1, 2, 3, 4, 5, 6].map(n => <li key={n} className={`rounded-md px-3 py-2 text-sm ${n === 1 ? 'bg-surface-2 font-medium' : 'text-fg-muted'}`}>Trang {n}</li>)}</ol> },
        { label: 'Tài liệu', min: 280, content: <div className="p-4"><SampleInvoice /></div> },
        { label: 'Trường dữ liệu', defaultSize: '30%', min: 220, collapsible: true, content: <dl className="m-0 grid gap-3 p-4">{invoiceFields.map(f => <div key={f.key} className="grid gap-0.5"><dt className="text-xs text-fg-muted">{f.key}</dt><dd className="m-0 text-sm font-medium">{f.value}</dd></div>)}</dl> },
      ]} /></div> },
      { title: '3 · Stacked, nested', note: 'A vertical Splitter inside the right pane: editor above, log below (min 80px). The outer one needs no height of its own; the vertical one fills the pane.', code: "<Splitter panels={[\n  { label: 'Tệp', defaultSize: 200, min: 140, content: <Files /> },\n  { content: <Splitter orientation=\"vertical\" panels={[{ label: 'Trình soạn', min: 120, content: <Editor /> }, { label: 'Nhật ký', defaultSize: '35%', min: 80, content: <Log /> }]} /> },\n]} />", render: () => <div className="h-96 w-full overflow-hidden rounded-lg border border-border"><Splitter panels={[
        { label: 'Tệp', defaultSize: 200, min: 140, content: <ul className="m-0 grid list-none gap-1 p-3 text-sm">{['schema-hoa-don.json', 'quy-tac-qc.yaml', 'mau-xuat.csv'].map(f => <li key={f} className="truncate">{f}</li>)}</ul> },
        { content: <Splitter orientation="vertical" className="h-full" panels={[
          { label: 'Trình soạn', min: 120, content: <pre className="m-0 p-4 text-xs leading-relaxed">{'{\n  "invoice_no": { "required": true },\n  "vat_amount": { "min_confidence": 95 }\n}'}</pre> },
          { label: 'Nhật ký', defaultSize: '35%', min: 80, content: <div className="grid gap-1 p-4 text-xs text-fg-muted"><span>09:12 Kiểm tra schema: hợp lệ</span><span>09:12 3 trường, 1 quy tắc độ tin cậy</span></div> },
        ]} /> },
      ]} /></div> }] },
  { id: 'masonry', name: 'Masonry', category: 'Core', status: 'ready', summary: 'Columns of tiles of different heights: notes, document thumbnails, uneven widgets. Each tile goes to the shortest column; the column count follows the container width, not the viewport. Re-flows when a tile changes size (an image loads, a panel opens). Tab order is the children\'s order.',
    importLine: imp('Masonry'),
    demos: [
      { title: '1 · Tiles of mixed heights', note: 'Numbered in DOM order: 1–4 fill the first row, then each tile drops into the shortest column. Resize the window: the count follows the width.', code: '<Masonry aria-label="Tài liệu">\n  {tiles.map(t => <Tile key={t.id} {...t} />)}\n</Masonry>', render: () => <div className="w-full"><Masonry aria-label="Tài liệu">
        {tileHeights.map((h, i) => i === 1
          ? <figure key={i} className="m-0 overflow-hidden rounded-lg border border-border bg-surface"><div className="border-b border-border"><SampleInvoice /></div><figcaption className="grid gap-1 p-3"><strong className="text-sm">Hoá đơn GTGT 0001234</strong><span className="text-xs text-fg-muted">Nhận dạng 99,1% · 2 trang</span></figcaption></figure>
          : <div key={i} className="rounded-lg border border-border bg-surface p-3 text-sm" style={{ minHeight: h }}>{i + 1}</div>)}
      </Masonry></div> },
      { title: '2 · Notes of different lengths', note: 'Text tiles keep their natural height. minColumnWidth={220}.', code: '<Masonry minColumnWidth={220} aria-label="Phản hồi">{notes}</Masonry>', render: () => <div className="w-full"><Masonry minColumnWidth={220} aria-label="Phản hồi khách hàng">
        {feedback.map(f => <blockquote key={f.who} className="m-0 grid gap-2 rounded-lg border border-border bg-surface p-4"><p className="m-0 text-sm leading-relaxed">{f.text}</p><footer className="text-xs text-fg-muted">{f.who}</footer></blockquote>)}
      </Masonry></div> },
      { title: '3 · Live content', note: 'Open a note or add one: the grid re-flows on every size change.', render: () => <MasonryLiveDemo /> },
      { title: '4 · Fixed columns', note: 'columns={2} gap={8}: two columns at any width.', code: '<Masonry columns={2} gap={8}>{tiles}</Masonry>', render: () => <div className="w-full max-w-md"><Masonry columns={2} gap={8}>
        {[96, 56, 72, 120, 64, 88].map((h, i) => <div key={i} className="rounded-md border border-border bg-surface p-2 text-sm" style={{ minHeight: h }}>{i + 1}</div>)}
      </Masonry></div> }] },
  { id: 'timeline', name: 'Timeline', category: 'Core', status: 'ready', summary: 'Events in order down a rail: activity log, audit trail, the steps of a batch. Square markers in a tone, or icons; done, current (ringed) and pending (hollow, dashed line). Relative or exact times in a <time> element, the full time on hover.',
    importLine: imp('Timeline, type TimelineItem'),
    demos: [
      { title: '1 · Activity log', note: 'Newest first, relative times. Tones mark the outcome; the title says it too.', code: "<Timeline aria-label=\"Hoạt động của lô HD-5517\" items={[\n  { title: 'Bàn giao cho khách hàng', time, tone: 'ok' },\n  { title: 'OCR lỗi 12 trang', description: 'Ảnh mờ, đã chuyển QC thủ công.', time, tone: 'err' },\n  …\n]} />", render: () => <div className="w-full max-w-lg"><Timeline aria-label="Hoạt động của lô HD-5517" items={[
        { title: 'Bàn giao cho khách hàng', time: ago(4), tone: 'ok' },
        { title: 'Trần Thu Hà duyệt QC', description: '3.848 / 3.860 trang đạt, độ chính xác 99,7%.', time: ago(52) },
        { title: 'OCR lỗi 12 trang', description: 'Ảnh mờ, đã chuyển QC thủ công.', time: ago(3 * 60 + 10), tone: 'err' },
        { title: 'Nhận dạng xong 3.860 trang', time: ago(26 * 60) },
        { title: 'Nguyễn Minh Anh tải lên lô HD-5517', time: ago(3 * 24 * 60), tone: 'neutral' },
      ]} /></div> },
      { title: '2 · Steps of a batch', note: 'Oldest first, exact times. status="current" rings the marker (aria-current="step"); pending ones are hollow, behind a dashed line.', code: "<Timeline timeStyle=\"absolute\" items={[\n  { title: 'Tiếp nhận hồ sơ', time },\n  { title: 'Nhận dạng (OCR)', description: '2.140 / 3.860 trang', status: 'current' },\n  { title: 'Kiểm tra chất lượng', status: 'pending' },\n]} />", render: () => <div className="w-full max-w-lg"><Timeline aria-label="Tiến độ lô HD-5517" timeStyle="absolute" items={[
        { title: 'Tiếp nhận hồ sơ', description: '3.860 trang, 412 hồ sơ', time: '2026-10-06T08:30:00+07:00' },
        { title: 'Tiền xử lý', description: 'Cắt viền, chỉnh nghiêng, khử nhiễu', time: '2026-10-06T10:05:00+07:00' },
        { title: 'Nhận dạng (OCR)', description: '2.140 / 3.860 trang', status: 'current' },
        { title: 'Kiểm tra chất lượng', status: 'pending' },
        { title: 'Bàn giao', status: 'pending' },
      ]} /></div> },
      { title: '3 · Icons and rich content', note: 'icon swaps the square for an icon; description takes any content.', render: () => <div className="w-full max-w-lg"><Timeline aria-label="Lịch sử hồ sơ" timeStyle="absolute" items={[
        { title: 'Gửi lại khách hàng', icon: <Send />, time: '2026-10-07T09:12:00+07:00', tone: 'ok' },
        { title: 'Trần Thu Hà bình luận', icon: <MessageSquare />, time: '2026-10-07T08:47:00+07:00', description: <p className="m-0 border-l-2 border-border pl-3 italic">Trang 14 thiếu dấu giáp lai, đề nghị bên A bổ sung bản gốc.</p> },
        { title: 'Phát hiện thiếu trang', icon: <AlertTriangle />, time: '2026-10-07T08:30:00+07:00', tone: 'warn', description: <Badge tone="warn" variant="surface" size="sm">Thiếu 2 trang</Badge> },
        { title: 'Tải lên', icon: <Upload />, time: '2026-10-06T16:02:00+07:00', tone: 'neutral' },
        { title: 'Ký số', icon: <Lock />, status: 'pending' },
      ]} /></div> },
      { title: '4 · Narrow, long titles', note: 'Titles wrap beside the marker; the time drops under the title when there is no room.', render: () => <div className="w-full max-w-xs"><Timeline timeStyle="absolute" items={[
        { title: 'Phụ lục hợp đồng tín dụng Ngân hàng Đông Á Mới được ký và gửi lại', time: '2026-10-07T09:12:00+07:00', tone: 'ok' },
        { title: 'Biên bản nghiệm thu lô 03', time: '2026-10-05T14:00:00+07:00' },
      ]} /></div> }] },
  { id: 'collapse', name: 'Collapse', category: 'Core', status: 'ready', summary: 'Sections that open and close under their headings: FAQ, settings groups, long record details. Several open at once, or one at a time (accordion). A second line and a right-side slot (badge, switch) per header. Closed panels stay findable with Ctrl/⌘+F, which opens them.',
    importLine: imp('Collapse, type CollapseItem'),
    demos: [
      { title: '1 · FAQ, one at a time', note: 'multiple={false}: opening a question closes the open one. Try Ctrl+F “300 dpi”: the browser finds it in a closed panel and opens it.', code: "<Collapse multiple={false} defaultValue={['sla']} items={[\n  { value: 'sla', title: 'SLA được tính từ lúc nào?', content: '…' },\n  …\n]} />", render: () => <div className="w-full max-w-2xl"><Collapse multiple={false} defaultValue={['sla']} items={[
        { value: 'sla', title: 'SLA được tính từ lúc nào?', content: 'Từ khi lô được nhận đủ hồ sơ gốc và bàn giao biên bản. Lô thiếu hồ sơ được tạm dừng SLA cho tới khi bổ sung đủ.' },
        { value: 'format', title: 'Hệ thống nhận những định dạng nào?', content: 'PDF, TIFF nhiều trang, JPG và PNG. Ảnh chụp điện thoại được chỉnh nghiêng và khử bóng trước khi OCR; bản quét nên đạt 300 dpi trở lên.' },
        { value: 'qc', title: 'Khi nào một trường được chuyển sang QC thủ công?', content: 'Khi độ tin cậy của trường thấp hơn ngưỡng đã cấu hình (mặc định 85%), hoặc khi trường bắt buộc bị trống.' },
        { value: 'delete', title: 'Dữ liệu được lưu bao lâu?', content: 'Ảnh gốc được xoá sau 30 ngày kể từ ngày bàn giao; dữ liệu trích xuất được giữ theo hợp đồng.' },
      ]} /></div> },
      { title: '2 · Settings groups', note: 'bordered, a second line under each title, a status on the right. “Xuất dữ liệu” is disabled. Several can be open at once.', code: "<Collapse bordered headingLevel={2} items={[\n  { value: 'ocr', title: 'Nhận dạng (OCR)', description: 'Ngôn ngữ, ngưỡng tin cậy', extra: <Badge tone=\"ok\">Đang bật</Badge>, content: <OcrSettings /> },\n]} />", render: () => <div className="w-full max-w-2xl"><Collapse bordered defaultValue={['ocr']} items={[
        { value: 'ocr', title: 'Nhận dạng (OCR)', description: 'Ngôn ngữ, ngưỡng tin cậy', extra: <Badge tone="ok" variant="surface" size="sm">Đang bật</Badge>, content: <Field label="Ngưỡng tin cậy tối thiểu"><Slider defaultValue={85} min={50} max={100} format={{ style: 'unit', unit: 'percent' }} /></Field> },
        { value: 'notify', title: 'Thông báo', description: 'Email và trong ứng dụng', extra: <Badge variant="surface" size="sm">3 kênh</Badge>, content: 'Gửi thông báo khi lô có nguy cơ trễ SLA, khi lô bị lỗi và khi lô được bàn giao.' },
        { value: 'export', title: 'Xuất dữ liệu', description: 'Cần quyền Quản trị', disabled: true, content: 'Định dạng và lịch xuất tự động.' },
      ]} /></div> },
      { title: '3 · Long titles', note: 'Titles wrap; the chevron and the right-side badge stay on the first line.', render: () => <div className="w-full max-w-sm"><Collapse items={[
        { value: 'a', title: 'Hợp đồng dịch vụ số hoá tài liệu lưu trữ giai đoạn 2026–2027 cho Ngân hàng Đông Á Mới', extra: <Badge variant="surface" size="sm">12</Badge>, content: 'Phụ lục, biên bản nghiệm thu và lịch bàn giao theo từng lô.' },
        { value: 'b', title: 'Biên bản', content: 'Ba biên bản đã ký.' },
      ]} /></div> }] },
  { id: 'carousel', name: 'Carousel', category: 'Core', status: 'ready', summary: 'A row of slides that scrolls sideways with native scroll snapping: swipe, trackpad, arrow buttons, dots, or arrow keys once the row has focus. One slide at a time or a row of cards with the next one peeking. Dots for up to 10 slides, a “3–5 / 20” count beyond. Controls hide when everything fits. No autoplay.',
    importLine: imp('Carousel'),
    demos: [
      { title: '1 · One slide at a time', note: 'Arrows page through; the dot of the slide in view is a longer pill. Press a dot to jump.', code: '<Carousel aria-label="Tin mới">\n  {news.map(n => <NewsSlide key={n.id} {...n} />)}\n</Carousel>', render: () => <div className="w-full max-w-xl"><Carousel aria-label="Tin mới">
        {news.map(n => <div key={n.title} className="grid h-full content-start justify-items-start gap-2 rounded-lg border border-border bg-surface p-5"><Badge tone={n.tone} variant="surface" size="sm">{n.tag}</Badge><h3 className="m-0 text-lg font-bold italic leading-snug">{n.title}</h3><p className="m-0 text-sm text-fg-muted">{n.text}</p></div>)}
      </Carousel></div> },
      { title: '2 · Card row', note: 'slideWidth="min(240px, 80%)": several cards per page, the next one peeks. Each dot of a card in view is lit. Tab into a card: the row scrolls to it.', code: '<Carousel aria-label="Lô gần đây" slideWidth="min(240px, 80%)">\n  {batches.map(b => <BatchCard key={b.id} batch={b} />)}\n</Carousel>', render: () => <div className="w-full"><Carousel aria-label="Lô gần đây" slideWidth="min(240px, 80%)">{[...batches, ...olderBatches.slice(0, 3)].map(b => <BatchSlide key={b.id} b={b} />)}</Carousel></div> },
      { title: '3 · Many slides: a count', note: 'Over 10 slides the dots become “1–4 / 20”.', render: () => <div className="w-full"><Carousel aria-label="Tất cả lô" slideWidth="min(240px, 80%)">{[...batches, ...olderBatches.slice(0, 15)].map(b => <BatchSlide key={b.id} b={b} />)}</Carousel></div> },
      { title: '4 · Everything fits', note: 'Two cards in a wide row: no controls. On a phone the same row overflows and the controls appear.', render: () => <div className="w-full"><Carousel aria-label="Lô ưu tiên" slideWidth="240px">{batches.slice(0, 2).map(b => <BatchSlide key={b.id} b={b} />)}</Carousel></div> }] },
  { id: 'slider', name: 'Slider', category: 'Core', status: 'ready', summary: 'One value or a range on a track: a threshold, a page range, a budget. Arrow keys step, Page Up/Down take a large step, Home/End jump to the ends. `onValueCommitted` runs once on release, the place to fetch or save. Values are formatted with Intl, on screen and for screen readers; the readout keeps a fixed width so the track never resizes.',
    importLine: imp('Slider'),
    demos: [
      { title: '1 · In a Field, saved on release', note: 'Drag: the readout follows every move, “Đã lưu” changes only when the thumb is released.', code: "<Field label=\"Ngưỡng tin cậy tối thiểu\">\n  <Slider value={value} onValueChange={setValue} onValueCommitted={save} min={50} max={100} format={{ style: 'unit', unit: 'percent' }} />\n</Field>", render: () => <SliderThresholdDemo /> },
      { title: '2 · Range', note: 'Pass [from, to]. The thumbs are named “Số trang: Từ” and “Số trang: Đến”; they cannot cross.', code: '<Slider aria-label="Số trang" defaultValue={[500, 3000]} max={5000} step={100} largeStep={1000} />', render: () => <div className="w-full max-w-md"><Slider aria-label="Số trang" defaultValue={[500, 3000]} max={5000} step={100} largeStep={1000} /></div> },
      { title: '3 · Currency', note: 'format takes Intl options; the readout is as wide as “20.000.000 ₫”.', code: "<Slider aria-label=\"Ngân sách tháng\" defaultValue={5000000} max={20000000} step={500000} format={{ style: 'currency', currency: 'VND' }} />", render: () => <div className="w-full max-w-md"><Slider aria-label="Ngân sách tháng" defaultValue={5000000} max={20000000} step={500000} format={{ style: 'currency', currency: 'VND' }} /></div> },
      { title: '4 · Disabled, no readout', render: () => <div className="w-full max-w-md"><Slider aria-label="Âm lượng" defaultValue={40} disabled showValue={false} /></div> }] },
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
  { id: 'drawer', name: 'Drawer', category: 'Core', status: 'ready', summary: 'Side panel for record detail or filters, or a bottom sheet on phones. Slides in from its edge (page · emphasis), exits faster; swipe toward the edge to dismiss. Header and footer stay put, the body scrolls. Popups inside (Select, DatePicker) sit above it.',
    importLine: imp('Drawer, DrawerClose'),
    demos: [
      { title: '1 · Record detail (right)', note: 'Long body scrolls under a fixed header and footer.', render: () => <DrawerRecord /> },
      { title: '2 · Filters (left, sm)', note: 'Select and DateRangePicker popups open above the drawer.', render: () => <DrawerFilters /> },
      { title: '3 · Bottom sheet', note: 'Drag the handle or swipe down to close.', render: () => <Drawer side="bottom" trigger={<Button variant="secondary">Thao tác với lô</Button>} title="Lô HD-5517" description="3.860 trang · Nguy cơ trễ SLA"><div className="grid gap-2"><Button variant="secondary">Chuyển ưu tiên Khẩn</Button><Button variant="secondary">Giao cho người khác</Button><DrawerClose><Button variant="danger">Huỷ lô</Button></DrawerClose></div></Drawer> }] },
  { id: 'upload', name: 'File upload / dropzone', category: 'Core', status: 'ready', summary: 'FileDropzone picks files (drop, click or Enter), checks type and size, and lists rejections with the reason; it never uploads. Upload progress goes to UploadToast: count, overall bar and a collapsible list with retry / remove, still visible after a drawer or dialog closes. FileList + FileItem show the same rows inline when a toast does not fit. The hint defaults to the accepted formats and size limit.',
    importLine: imp('FileDropzone, UploadToast, FileList, FileItem, formatBytes'),
    demos: [
      { title: '1 · Drop or pick, progress in a toast', note: 'Progress shows bottom-right. Try a file over 20 MB or a .docx to see rejections. Every 3rd file fails once; retry it from the toast.', render: () => <UploadDemo /> },
      { title: '2 · File states (inline FileList)', note: 'Static: queued, uploading, done, error. The same rows UploadToast lists.', render: () => (
        <FileList aria-label="Trạng thái tệp" className="w-full max-w-xl">
          <FileItem name="HD-5517_trang-001-120.pdf" size={18_400_000} status="queued" onRemove={() => {}} />
          <FileItem name="BH-2210_bien-ban-giam-dinh.pdf" size={4_210_000} status="uploading" progress={45} onRemove={() => {}} />
          <FileItem name="scan_CMND_mat-truoc.jpg" size={812_000} status="done" onRemove={() => {}} />
          <FileItem name="TD-0931_phu-luc-hop-dong-tin-dung-ngan-hang-dong-a-moi-ban-scan-mau.tiff" size={56_700_000} status="error" error="Mất kết nối khi tải lên. Bấm thử lại." onRetry={() => {}} onRemove={() => {}} />
        </FileList>) },
      { title: '3 · Compact, one file, in a form', render: () => <div className="grid w-full max-w-md gap-4"><Field label="Tên mẫu"><Input defaultValue="Hoá đơn VAT" /></Field><FileDropzone compact multiple={false} label="Tệp mẫu" description="Một trang PDF đã điền đủ các trường." accept=".pdf" maxSize={10 * 1024 * 1024} onFiles={() => {}} /></div> },
      { title: '4 · Error and disabled', render: () => <div className="grid w-full max-w-md gap-4"><FileDropzone compact label="Ảnh chữ ký" accept="image/*" error="Cần ít nhất một ảnh chữ ký." onFiles={() => {}} /><FileDropzone compact label="Tài liệu bổ sung" disabled description="Lô đã khoá, không thêm tệp được." onFiles={() => {}} /></div> }] },
  { id: 'toast', name: 'Toast', category: 'Core', status: 'ready', summary: 'Stacks, expands on hover, swipe right/down to dismiss. Wrap the app once in <ToastProvider>. tone picks the icon; an error (tone \'err\') stays until closed, is announced at once, and has a red-tinted edge.', importLine: imp('ToastProvider, useToast, type ToastOptions'),
    demos: [{ title: 'Success · error · warning · in progress', note: 'The error toast stays until you close it.', code: "const toast = useToast();\ntoast({ title: 'Đã lưu lô BH-2210', tone: 'ok' });\ntoast({ title: 'Không gửi được lô BH-2210', description: 'Máy chủ OCR không phản hồi…', tone: 'err' });", render: () => <ToastDemo /> }] },
  { id: 'menu', name: 'Menu', category: 'Core', status: 'ready', summary: 'Actions behind a button: row actions (“⋯”), export, view options. Actions close the menu; checkbox and radio entries keep it open so several can be changed in a row. Icons, a second line, key hints, links, groups, separators, disabled and destructive items. Arrow keys, typeahead and Esc built in.',
    importLine: imp('Menu, type MenuEntry, type MenuAction, type MenuCheckbox, type MenuRadio, type MenuGroup'),
    demos: [
      { title: '1 · Row actions', note: 'Icon-only trigger named after its row. “Lịch sử thay đổi” is disabled; the destructive item is last, after a separator.', code: "<Menu align=\"end\" trigger={<Button variant=\"ghost\" size=\"sm\" icon aria-label=\"Thao tác cho HD-5517\"><MoreHorizontal aria-hidden /></Button>} items={[\n  { label: 'Xem chi tiết', icon: <Eye />, onSelect: open },\n  { label: 'Nhân bản', icon: <Copy />, shortcut: 'Ctrl D', onSelect: duplicate },\n  { label: 'Lịch sử thay đổi', icon: <History />, disabled: true },\n  'separator',\n  { label: 'Xoá lô HD-5517', icon: <Trash2 />, danger: true, onSelect: confirmDelete },\n]} />", render: () => <MenuRowDemo /> },
      { title: '2 · Export, grouped', note: 'A group heading, a second line per format, and a link at the end.', render: () => <MenuExportDemo /> },
      { title: '3 · View options', note: 'Column toggles and a sort order. Both keep the menu open; “Mã lô” cannot be hidden.', render: () => <MenuViewDemo /> }] },
  { id: 'pagination', name: 'Pagination', category: 'Core', status: 'ready', summary: 'Page controls for a table or a list of cards: a “21–40 trên 1.234 dòng” summary, an optional rows-per-page picker and the page buttons. The page list keeps 7 slots so buttons do not jump; in a narrow container it collapses to “Trang 7 / 62”. Changing the page size keeps the first row on screen.',
    importLine: imp('Pagination'),
    demos: [
      { title: '1 · Many pages, rows per page', note: 'Page 7 of 62: first, gap, 6–8, gap, last. Change “Mỗi trang” to 50: the page moves so row 121 stays on screen.', code: '<Pagination page={page} total={1234} pageSize={size} onPageChange={setPage} onPageSizeChange={setSize} itemLabel="hồ sơ" />', render: () => <PaginationDemo total={1234} start={7} sizes itemLabel="hồ sơ" /> },
      { title: '2 · Few pages', note: 'Five pages fit, so there is no gap. At page 1 “Trang trước” is aria-disabled and keeps focus.', render: () => <PaginationDemo total={45} size={10} /> },
      { title: '3 · Narrow container', note: 'Under 360px of width the page list becomes “Trang 7 / 62” between the arrows.', render: () => <div className="w-full max-w-[320px] rounded-md border border-border bg-surface p-3"><PaginationDemo total={1234} start={7} /></div> },
      { title: '4 · No rows', note: 'Nothing to page through: both arrows are off. Show an EmptyState above it.', render: () => <PaginationDemo total={0} /> }] },
  { id: 'breadcrumb', name: 'Breadcrumb', category: 'Core', status: 'ready', summary: 'Where this page sits: root → … → current page. The current page is plain text with aria-current; parents are links, buttons (client-side routing) or plain text. Long labels truncate, crumbs shrink with the space (the trail never widens its container), and long trails fold their middle into “…”.',
    importLine: imp('Breadcrumb, type BreadcrumbItem'),
    demos: [
      { title: '1 · In a topbar', note: '“Vận hành” has no page of its own, so it is plain text.', code: "<Breadcrumb items={[\n  { label: 'Vận hành' },\n  { label: 'Lô tài liệu', href: '/ops/batches' },\n  { label: 'HD-5517' },\n]} />", plain: true, render: () => <div className="w-full rounded-md border border-border bg-surface px-4 py-2">
        <Breadcrumb items={[{ label: 'Vận hành' }, { label: 'Lô tài liệu', href: '#/catalog/breadcrumb' }, { label: 'HD-5517' }]} />
      </div> },
      { title: '2 · Long trail, folded', note: 'Seven levels: the first, “…”, then the last three. Press “…” to show the rest.', render: () => <Breadcrumb items={[
        { label: 'Trang chủ', href: '#/catalog/breadcrumb', icon: <House /> }, { label: 'Khách hàng', href: '#/catalog/breadcrumb' }, { label: 'Ngân hàng Đông Á Mới', href: '#/catalog/breadcrumb' },
        { label: 'Hợp đồng 2026', href: '#/catalog/breadcrumb' }, { label: 'Lô TD-0931', href: '#/catalog/breadcrumb' }, { label: 'Trang 12', href: '#/catalog/breadcrumb' }, { label: 'Trường “Số hợp đồng”' }]} /> },
      { title: '3 · Long labels in a narrow box', note: 'The longest label gives up the most room; the full text stays in the title tooltip and for screen readers.', render: () => <div className="w-full max-w-[340px] rounded-md border border-border bg-surface px-3 py-2">
        <Breadcrumb items={[{ label: 'Chuỗi bán lẻ Phương Nam', href: '#/catalog/breadcrumb' }, { label: 'Hoá đơn VAT tháng 10/2026', href: '#/catalog/breadcrumb' }, { label: 'HD-5517_hoa-don-ban-hang-chi-nhanh-thu-duc.pdf' }]} />
      </div> }] },
  { id: 'textarea', name: 'Textarea', category: 'Core', status: 'ready', summary: 'Multi-line Input for notes, rejection reasons and comments. Starts at `rows` lines and grows with its text up to `maxRows`, then scrolls. `maxLength` adds a counter; screen readers hear it only near the limit. Inside Field it gets the label, description and error like Input.',
    importLine: imp('Field, Textarea'),
    demos: [
      { title: '1 · With a counter', note: 'Type or paste: the box grows to 6 lines, then scrolls. The counter darkens in the last 10%.', code: '<Field label="Lý do từ chối" description="Đội scan sẽ thấy ghi chú này.">\n  <Textarea name="reason" maxLength={200} maxRows={6} />\n</Field>', render: () => <div className="w-full max-w-lg">
        <Field label="Lý do từ chối" description="Đội scan sẽ thấy ghi chú này."><Textarea name="reason" maxLength={200} maxRows={6} placeholder="Ví dụ: trang 4 bị mờ, cần quét lại ở 300 dpi" /></Field>
      </div> },
      { title: '2 · Filled · error · disabled', render: () => <div className="grid w-full max-w-lg gap-5">
        <Field label="Ghi chú QC"><Textarea defaultValue={'Trang 4, 9 và 15 bị nghiêng hơn 5°, đã chỉnh tự động.\nTrường "Số hợp đồng" ở trang 2 bị che một phần bởi con dấu; đã nhập tay theo bản gốc.\nCần khách hàng xác nhận lại ngày ký ở trang cuối.'} /></Field>
        <Field label="Lý do từ chối" error="Nhập lý do để đội scan biết cần làm gì."><Textarea maxLength={200} /></Field>
        <Field label="Ghi chú của khách hàng" description="Chỉ đọc: lô đã bàn giao."><Textarea disabled defaultValue="Ưu tiên các hồ sơ năm 2024 trước." rows={2} /></Field>
      </div> }] },
  { id: 'empty-state', name: 'Empty state', category: 'Core', status: 'ready', summary: 'What a list, table, panel or page shows when it has nothing to show: first use, no results, filtered to nothing, no permission, failed load. Says what happened and offers one way forward. DataTable, NotificationList, PdfViewer and CommandPalette all render it.',
    importLine: imp('EmptyState'),
    demos: [
      { title: '1 · First use', note: 'The mascot belongs here (and in onboarding and 404), never next to an error.', code: '<EmptyState mascot title="Chưa có lô tài liệu nào" action={<Button>Tạo lô đầu tiên</Button>}>\n  Tải hồ sơ lên để bắt đầu số hoá. Hệ thống nhận PDF, TIFF và ảnh chụp.\n</EmptyState>', plain: true, render: () => <Card className="w-full">
        <EmptyState mascot title="Chưa có lô tài liệu nào" action={<><Button>Tạo lô đầu tiên</Button><Button variant="ghost">Xem hướng dẫn</Button></>}>Tải hồ sơ lên để bắt đầu số hoá. Hệ thống nhận PDF, TIFF và ảnh chụp.</EmptyState>
      </Card> },
      { title: '2 · No results · filtered to nothing · no permission · failed load', plain: true, render: () => <div className="grid w-full grid-cols-[repeat(auto-fit,minmax(min(100%,300px),1fr))] gap-3">
        <Card><EmptyState icon={<SearchX />} title="Không tìm thấy “HD-99”">Kiểm tra lại mã lô, hoặc tìm theo tên khách hàng.</EmptyState></Card>
        <Card><EmptyState icon={<ListFilter />} title="Không có lô nào khớp bộ lọc" action={<Button variant="secondary">Xoá bộ lọc</Button>}>Đang lọc: Đang QC, nhận từ 01/10 đến 05/10.</EmptyState></Card>
        <Card><EmptyState icon={<Lock />} title="Bạn chưa có quyền xem báo cáo này" action={<Button variant="secondary">Gửi yêu cầu cho trưởng ca</Button>}>Trưởng ca hoặc quản trị viên có thể cấp quyền.</EmptyState></Card>
        <Card><EmptyState tone="err" title="Không tải được danh sách lô" action={<Button variant="secondary">Thử lại</Button>}>Máy chủ không phản hồi. Kiểm tra kết nối mạng rồi thử lại.</EmptyState></Card>
      </div> },
      { title: '3 · Small, inside a table and a panel', note: 'size="sm": 24px icon, less padding. DataTable turns plain text into the same look.', plain: true, render: () => <div className="grid w-full grid-cols-[repeat(auto-fit,minmax(min(100%,300px),1fr))] gap-3">
        <Card><DataTable rowKey={(b: { id: string }) => b.id} rows={[]} columns={[{ key: 'id', header: 'Mã lô', render: b => b.id }, { key: 'c', header: 'Khách hàng', render: () => '' }]} empty="Chưa có lô nào trong ca này" /></Card>
        <Card><EmptyState size="sm" icon={<Inbox />} title="Hàng đợi QC trống">Lô mới cần kiểm tra sẽ hiện ở đây.</EmptyState></Card>
      </div> }] },
  { id: 'alert', name: 'Alert', category: 'Core', status: 'ready', summary: 'A message that stays in the page until its cause is gone: a form that failed as a whole, a locked batch, planned maintenance. Four tones, each with its own icon and a tinted hairline; an error is announced at once. Optional action and close button. Field errors stay in Field; news of a moment ago goes to a toast.',
    importLine: imp('Alert'),
    demos: [
      { title: '1 · Tones', render: () => <div className="grid w-full gap-3">
        <Alert title="Bảo trì hệ thống lúc 22:00 tối nay">Máy chủ OCR tạm dừng khoảng 30 phút. Các lô đang chạy sẽ tiếp tục sau đó.</Alert>
        <Alert tone="ok" title="Đã bàn giao lô NS-0418">2.105 trang, độ chính xác 99,83%. Khách hàng đã nhận thông báo.</Alert>
        <Alert tone="warn" title="3 lô có nguy cơ trễ SLA">Lô gần hạn nhất là HD-5517, hạn 16:15.</Alert>
        <Alert tone="err" title="Không lưu được hồ sơ HS-0142">Mất kết nối máy chủ. Dữ liệu vẫn còn trên máy này; kiểm tra mạng rồi lưu lại.</Alert>
      </div> },
      { title: '2 · Action and close', note: 'The close button only hides the alert; the app decides when it may come back.', code: '<Alert tone="err" title="Không lưu được hồ sơ HS-0142" action={<Button size="sm" onClick={save}>Lưu lại</Button>}>\n  Mất kết nối máy chủ. Dữ liệu vẫn còn trên máy này.\n</Alert>', render: () => <div className="grid w-full gap-3">
        <Alert tone="err" title="Không lưu được hồ sơ HS-0142" action={<><Button size="sm">Lưu lại</Button><Button size="sm" variant="ghost">Tải bản nháp về máy</Button></>}>Mất kết nối máy chủ. Dữ liệu vẫn còn trên máy này.</Alert>
        <AlertDemo />
      </div> },
      { title: '3 · Title only · text only · no icon · long text', render: () => <div className="grid w-full gap-3">
        <Alert tone="ok" title="Đã lưu mẫu trích xuất “Hoá đơn VAT 2026”" />
        <Alert tone="warn">Bạn đang xem dữ liệu của ca trước. Số liệu ca sáng cập nhật lúc 08:00.</Alert>
        <Alert icon={false} title="Lô này chỉ đọc">Lô đã bàn giao cho khách hàng nên không sửa được kết quả. Liên hệ trưởng ca nếu cần mở lại.</Alert>
        <Alert tone="err" title="Không nhận dạng được 12 trang trong lô TD-0931_phu-luc-hop-dong-tin-dung-ngan-hang-dong-a-moi-ban-scan-mau.tiff">Ảnh quá mờ hoặc bị che khuất. Quét lại các trang 4, 9, 15, 16, 22, 31, 40, 41, 42, 57, 58 và 63 ở độ phân giải tối thiểu 300 dpi rồi tải lên lại.</Alert>
      </div> }] },
  { id: 'command-palette', name: 'Command palette', category: 'Core', status: 'ready', summary: 'Ctrl/⌘+K search over pages, records and actions. Typing filters without caring about accents or word order (“lo 5517” finds “Lô HD-5517”), ↑/↓ move, Enter runs the item and closes the palette. Groups, icons, a second line, key hints and disabled items with a reason.',
    importLine: imp('CommandPalette, CommandList, CommandButton, type CommandItem'),
    demos: [
      { title: '1 · Opened from the search box', note: 'In an app Ctrl/⌘+K opens it too; it is off here because the catalog shows each demo twice. Try it on the App page.', code: '<CommandPalette items={items} trigger={<CommandButton placeholder="Tìm lô, khách hàng, lệnh…" />} />', render: () => <CommandPaletteDemo /> },
      { title: '2 · The open list (CommandList)', note: 'Static. Type “phuong nam”, “invoice” or “zz” to see a match by client, by English keyword, and the empty state.', render: () => <CommandListDemo /> }] },
  { id: 'notification', name: 'Notification', category: 'Core', status: 'ready', summary: 'Bell button with the unread count; clicking it opens the notifications in a popover. Unread rows have a blue tint, a heavier title and a square dot. Picking a row closes the panel; marking it read and loading the list are the app\'s job. NotificationList is the same panel on its own, for a full page. Times read “5 phút trước”, then calendar days, then the date.',
    importLine: imp('Notification, NotificationList, type NotificationItem'),
    demos: [
      { title: '1 · Bell in a topbar', note: 'Click the bell, pick a row to mark it read, or add one to see the count pop.', code: '<Notification items={items} onSelect={n => markRead(n.id)} onMarkAllRead={markAllRead}\n  footer={<Button variant="ghost" size="sm" href="/notifications">Xem tất cả thông báo</Button>} />', render: () => <NotificationDemo /> },
      { title: '2 · The open panel (NotificationList)', note: 'Static: 2 unread, 3 read, one long description clamped to two lines.', render: () => <div className="w-full max-w-[380px] rounded-lg border border-border bg-surface"><NotificationList items={notifications} onSelect={() => {}} onMarkAllRead={() => {}} footer={<Button variant="ghost" size="sm">Xem tất cả thông báo</Button>} /></div> },
      { title: '3 · Empty · loading · error', render: () => <div className="grid w-full grid-cols-[repeat(auto-fit,minmax(260px,1fr))] gap-3">{[<NotificationList key="e" items={[]} />, <NotificationList key="l" items={[]} loading />, <NotificationList key="x" items={[]} error="Không tải được thông báo. Kiểm tra kết nối mạng rồi thử lại." onRetry={() => {}} />].map(l => <div key={l.key} className="rounded-lg border border-border bg-surface">{l}</div>)}</div> },
      { title: '4 · Count: none, a few, more than 99', render: () => <><Notification items={[]} /><Notification items={manyUnread(3)} /><Notification items={manyUnread(120)} /></> }] },
  { id: 'pdf-viewer', name: 'PDF Viewer', category: 'Core', status: 'ready', summary: 'Scrolling column of PDF pages with page and zoom controls and a download button. Takes a URL, a File/Blob or the bytes. pdf.js loads with the first viewer and parses in a worker; only pages near the view are drawn, so long files stay light. Zoom keeps your place; “Vừa chiều rộng” follows the container width. Loading (with progress for URLs), empty, error (password, not a PDF, HTTP) and per-page failure states are built in. No text layer yet: pages are images to assistive tech.',
    importLine: imp('PdfViewer'),
    demos: [
      { title: '1 · Multi-page file from a URL', note: 'Synthetic 4-page contract: 3 portrait A4 pages and a landscape one. Scroll, type a page number, zoom with − / +.', code: '<PdfViewer src="/demo/hop-dong-mau.pdf" fileName="hop-dong-mau.pdf" />', render: () => <PdfViewer src={demoPdf} fileName="hop-dong-mau.pdf" className="w-full" /> },
      { title: '2 · Open a file from the computer', note: 'The File goes straight to the viewer; nothing is uploaded.', code: 'const [file, setFile] = useState<File | null>(null);\n<FileDropzone compact multiple={false} accept=".pdf" onFiles={fs => setFile(fs[0])} />\n<PdfViewer src={file} fileName={file?.name} />', render: () => <PdfOpenDemo /> },
      { title: '3 · Empty · loading · error', render: () => <div className="grid w-full grid-cols-[repeat(auto-fit,minmax(260px,1fr))] gap-3"><PdfViewer className="h-[300px]" /><PdfViewer src={stalled} className="h-[300px]" /><PdfViewer src={notPdf} fileName="khong-phai-pdf.pdf" className="h-[300px]" /></div> }] },
  { id: 'avatar', name: 'Avatar', category: 'Core', status: 'ready', summary: 'Photo when src loads; otherwise initials of the first + last word (Vietnamese diacritics kept), or a person icon when the name has no letter. Square or circle, navy tile. The name is the accessible label. AvatarPicker makes it a button that opens a dialog to pick, preview, remove and save a photo (it hands back the File; uploading is the app\'s job).', importLine: imp('Avatar, AvatarPicker'),
    demos: [
      { title: '1 · Square and circle', render: () => <><Avatar name="Nguyễn Thị Thuận" /><Avatar name="Nguyễn Thị Thuận" shape="circle" /><Avatar name="Trần Minh" size="sm" /><Avatar name="Trần Minh" size="sm" shape="circle" /><Avatar name="Nguyễn Thị Thuận" size="lg" shape="circle" /></> },
      { title: '2 · Photo, broken photo, fallbacks', code: '<Avatar name="Phạm Hồng Nhung" src={user.photoUrl} shape="circle" />\n<Avatar name="Lê Văn An" src="/khong-ton-tai.jpg" />  // falls back to "LA"\n<Avatar name="" />  // no letter: person icon', render: () => <><Avatar name="Phạm Hồng Nhung" src={demoPhoto} shape="circle" /><Avatar name="Phạm Hồng Nhung" src={demoPhoto} /><Avatar name="Lê Văn An" src="/khong-ton-tai.jpg" shape="circle" /><Avatar name="Đặng" shape="circle" /><Avatar name="" shape="circle" /></> },
      { title: '3 · Click to change the photo (AvatarPicker)', code: 'const [src, setSrc] = useState<string>();\n<AvatarPicker name="Nguyễn Thị Thuận" src={src}\n  onChange={file => setSrc(file ? URL.createObjectURL(file) : undefined)} />', render: () => <AvatarPickerDemo /> }] },
  { id: 'icon', name: 'Icon', category: 'Core', status: 'ready', summary: 'Any lucide-react icon on the kit size scale (12 · 14 · 16 · 20 · 24px) and tones. Decorative by default (hidden from assistive tech); give it a label when no text next to it says what it means, and a Tooltip so sighted users get the same words. Inside Button, Badge and other kit parts the part sets the size, so a bare lucide icon works there too.',
    importLine: imp('Icon'),
    demos: [
      { title: '1 · Sizes', render: () => <>{(['xs', 'sm', 'md', 'lg', 'xl'] as const).map(s => <span key={s} className="grid grid-rows-[24px_auto] place-items-center gap-2 text-xs text-fg-muted"><Icon icon={FileStack} size={s} /><span>{s}</span></span>)}</> },
      { title: '2 · Tones', render: () => <>{(['brand', 'ok', 'warn', 'err', 'neutral', 'violet', 'muted'] as const).map(t => <span key={t} className="grid justify-items-center gap-2 text-xs text-fg-muted"><Icon icon={t === 'ok' ? CircleCheck : t === 'warn' ? AlertTriangle : t === 'err' ? CircleAlert : Sparkles} size="lg" tone={t} /><span>{t}</span></span>)}</> },
      { title: '3 · Decorative or meaningful', code: '<Button><ScanText />Chạy OCR</Button>            // the text says it: decorative\n<Tooltip content="Đã duyệt">\n  <span tabIndex={0}><Icon icon={CircleCheck} tone="ok" label="Đã duyệt" /></span>\n</Tooltip>                                        // alone: label + tooltip',
        render: () => <><Button variant="secondary"><ScanText />Chạy OCR</Button><p className="m-0 text-sm"><Icon icon={FileStack} size="sm" tone="muted" /> HD-5517 · 3.860 trang</p><Tooltip content="Đã duyệt"><span tabIndex={0} className="inline-grid rounded-sm"><Icon icon={CircleCheck} tone="ok" size="lg" label="Đã duyệt" /></span></Tooltip><Tooltip content="Cần kiểm tra lại"><span tabIndex={0} className="inline-grid rounded-sm"><Icon icon={AlertTriangle} tone="warn" size="lg" label="Cần kiểm tra lại" /></span></Tooltip></> }] },
  { id: 'checkbox', name: 'Checkbox & Radio', category: 'Core', status: 'ready', summary: 'Checkbox for one on/off choice, CheckboxGroup for several, RadioGroup for exactly one from a short visible list (more than ~6 options: use Select). Whole row is clickable; arrow keys move inside a RadioGroup.',
    importLine: imp('Checkbox, CheckboxGroup, RadioGroup, type ChoiceOption'),
    demos: [
      { title: '1 · Checkbox states', note: 'Static: unchecked, checked, mixed, disabled.', render: () => <div className="grid gap-1"><Checkbox label="Tự động gửi email" /><Checkbox label="Bỏ qua trang trắng" defaultChecked /><Checkbox label="Một phần lô đã chọn" indeterminate /><Checkbox label="Khoá cấu hình" disabled /><Checkbox label="Bắt buộc QC lần 2" disabled defaultChecked /></div> },
      { title: '2 · Description and error', render: () => <div className="grid max-w-sm gap-3"><Checkbox label="Lưu ảnh gốc 90 ngày" description="Dung lượng tăng khoảng 2 lần." defaultChecked /><Checkbox label="Tôi đồng ý với điều khoản xử lý dữ liệu" required error="Cần đồng ý điều khoản trước khi tạo lô." /></div> },
      { title: '3 · CheckboxGroup with “select all”', note: 'Parent is mixed while only some are ticked.', code: '<CheckboxGroup label="…" selectAll="Tất cả loại" options={types} value={value} onValueChange={setValue} />', render: () => <CheckboxGroupControlled /> },
      { title: '4 · CheckboxGroup, descriptions + disabled option', render: () => <CheckboxGroup label="Định dạng xuất" options={exportOptions} defaultValue={['xlsx']} description="Chọn ít nhất một định dạng." /> },
      { title: '5 · RadioGroup', render: () => <RadioGroup label="Mức ưu tiên" defaultValue="normal" options={[{ value: 'urgent', label: 'Khẩn', description: 'Xử lý trong 2 giờ' }, { value: 'normal', label: 'Bình thường', description: 'Trong ngày' }, { value: 'low', label: 'Thấp', description: 'Trong 3 ngày' }]} /> },
      { title: '6 · RadioGroup in a row, disabled option', render: () => <RadioGroup label="Ca làm việc" row defaultValue="am" options={[{ value: 'am', label: 'Ca sáng' }, { value: 'pm', label: 'Ca chiều' }, { value: 'night', label: 'Ca đêm', disabled: true }]} /> },
      { title: '7 · Group error', render: () => <RadioGroup label="Ngôn ngữ tài liệu" row options={[{ value: 'vi', label: 'Tiếng Việt' }, { value: 'en', label: 'English' }, { value: 'mixed', label: 'Song ngữ' }]} error="Chọn ngôn ngữ để chọn đúng mô hình OCR." /> }] },
  { id: 'multiselect', name: 'MultiSelect', category: 'Core', status: 'ready', summary: 'Several values as removable chips. Same items as Select (flat, grouped, icon, description). Typing filters accent-insensitively; Backspace removes the last chip, ← / → move between chips.',
    importLine: imp('MultiSelect, type SelectOption, type SelectGroup'), demos: [
      { title: '1 · Plain list', code: "<MultiSelect items={shiftOptions} defaultValue={['am', 'pm']} />", render: () => <MultiSelectDemo label="Ca làm việc" items={shiftOptions} defaultValue={['am', 'pm']} /> },
      { title: '2 · Empty', note: 'Placeholder until the first chip.', render: () => <MultiSelectDemo label="Ca làm việc" items={shiftOptions} placeholder="Chọn ca…" /> },
      { title: '3 · Grouped + icon + description', note: 'Type “nhan su” or “ngan hang”.', render: () => <MultiSelectDemo label="Loại tài liệu" items={docTypeGroups} defaultValue={['vat', 'claim']} /> },
      { title: '4 · Many chips wrap', note: 'The box grows; long labels truncate.', render: () => <MultiSelectDemo label="Loại tài liệu" items={docTypeGroups} defaultValue={['vat', 'bank', 'claim', 'hr', 'bill']} /> },
      { title: '5 · Controlled', render: () => <MultiSelectControlled /> },
      { title: '6 · Small, no visible label', render: () => <div className="w-64"><MultiSelect size="sm" aria-label="Lọc theo trạng thái" items={statusOptions} defaultValue={['qc', 'risk']} /></div> },
      { title: '7 · Disabled', render: () => <MultiSelectDemo label="Ca làm việc" items={shiftOptions} defaultValue={['night']} disabled /> }] },
  { id: 'daterange', name: 'DateRangePicker', category: 'Core', status: 'ready', summary: 'One bar showing “from – to”. In the calendar the first click sets the start, the second the end, in either order; the band previews the range under the pointer or keyboard focus. No limits unless you pass `min` / `max`. Value { from, to } in ISO; a half-picked range is never emitted (Escape keeps the old one).',
    importLine: imp('DateRangePicker, type DateRange'),
    demos: [
      { title: '1 · Controlled, no limits', code: '<DateRangePicker label="Kỳ báo cáo" value={range} onValueChange={setRange} />', render: () => <DateRangeControlled /> },
      { title: '2 · Empty', render: () => <div className="w-72"><DateRangePicker label="Ngày nhận hồ sơ" /></div> },
      { title: '3 · Limited by props', note: 'min = 90 days ago, max = today.', code: '<DateRangePicker min={addDays(todayIso(), -90)} max={todayIso()} />', render: () => <div className="w-72"><DateRangePicker label="Ngày xử lý" description="Trong 90 ngày gần nhất." min={addDays(todayIso(), -90)} max={todayIso()} /></div> },
      { title: '4 · Small filter, ISO format, no visible label', render: () => <div className="w-64"><DateRangePicker size="sm" format="yyyy-MM-dd" aria-label="Lọc theo ngày nhận" defaultValue={{ from: '2026-09-01', to: '2026-09-30' }} /></div> },
      { title: '5 · Error · disabled', render: () => <div className="grid w-72 gap-4"><DateRangePicker label="Thời hạn hợp đồng" error="Thời hạn tối đa 12 tháng." defaultValue={{ from: '2026-01-01', to: '2027-06-30' }} /><DateRangePicker label="Kỳ đã khoá sổ" disabled defaultValue={{ from: '2026-09-01', to: '2026-09-30' }} /></div> },
      { title: '6 · Calendar in range mode (the open state)', note: 'Ends filled, days between on a tinted band.', render: () => <div className="w-[296px] rounded-md border border-border bg-surface p-2"><Calendar range={{ from: addDays(todayIso(), -4), to: addDays(todayIso(), 5) }} /></div> }] },
  { id: 'datepicker', name: 'DatePicker · Calendar', category: 'Core', status: 'ready', summary: 'Type dd/MM/yyyy (also 5-10-2026 or 05102026), or any `format`, or pick from a Monday-first calendar. Value is an ISO string (“2026-10-05”): no timezone shifts. Invalid or out-of-range typing reverts on blur. Calendar keys: arrows, Home/End, PageUp/PageDown (+Shift = year); Alt+↓ opens it from the input.',
    importLine: imp('DatePicker, Calendar, parseDate, formatDate'),
    demos: [
      { title: '1 · Controlled', note: 'Type “5/10/2026” or “05102026”.', code: '<DatePicker value={value} onValueChange={setValue} />', render: () => <DatePickerControlled /> },
      { title: '2 · Custom format', note: 'Same ISO value, different display. Typing follows the format order.', code: '<DatePicker format="yyyy-MM-dd" value={value} onValueChange={setValue} />', render: () => <DatePickerFormats /> },
      { title: '3 · Empty', render: () => <div className="w-64"><Field label="Ngày sinh"><DatePicker max={todayIso()} /></Field></div> },
      { title: '4 · Range limit', note: 'Only today to +30 days.', render: () => <div className="w-64"><Field label="Hạn SLA" description="Trong vòng 30 ngày."><DatePicker min={todayIso()} max={addDays(todayIso(), 30)} defaultValue={addDays(todayIso(), 3)} /></Field></div> },
      { title: '5 · Error', render: () => <div className="w-64"><Field label="Ngày ký hợp đồng" error="Ngày ký phải trước ngày hiệu lực."><DatePicker defaultValue="2026-11-20" /></Field></div> },
      { title: '6 · Small, no visible label · disabled', render: () => <div className="grid w-48 gap-3"><DatePicker size="sm" aria-label="Lọc từ ngày" defaultValue="2026-10-01" /><DatePicker size="sm" aria-label="Ngày khoá sổ" defaultValue="2026-09-30" disabled /></div> },
      { title: '7 · Calendar (the open state)', note: 'Selected, today (ring), outside-month and disabled days.', render: () => <div className="w-[296px] rounded-md border border-border bg-surface p-2"><Calendar value={addDays(todayIso(), 2)} min={addDays(todayIso(), -3)} /></div> }] },

  // ───────────── Layout ─────────────
  { id: 'card', name: 'Card', category: 'Layout', status: 'ready', summary: 'Hairline surface. CardHeader takes a title and an action slot.', importLine: imp('Card, CardHeader, CardBody'),
    demos: [{ title: 'Card', render: () => <Card className="w-full max-w-md"><CardHeader title="Hàng đợi QC" action={<Badge variant="surface">14 lô</Badge>} /><div className="p-4 text-sm text-fg-muted">Nội dung</div></Card> }] },
  { id: 'app-shell', name: 'AppShell & Sidebar', category: 'Layout', status: 'ready', summary: 'Workspace header, collapsible groups (height animates), active bar, counts, attention counters, shortcut hints on hover, 60px rail mode.',
    importLine: imp('AppShell, Sidebar, SidebarWorkspace, SidebarGroup, SidebarItem, SidebarFooter, Topbar, CommandButton'),
    demos: [{ title: 'Interactive', plain: true, render: () => <RailDemo /> }] },

  // ───────────── Data ─────────────
  { id: 'kpi', name: 'KpiCard', category: 'Data', status: 'ready', summary: 'One structure for every KPI: label + badge, value, 28px viz row, caption with icon. Attention is shown by badge, viz and icon, never by card chrome.',
    importLine: imp('KpiCard'), demos: [{ title: 'Four variants', plain: true, render: () => (
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <KpiCard label="Tài liệu xử lý hôm nay" badge={<Badge size="sm" tone="ok" variant="surface">▲ 12.4%</Badge>} value={<CountUp value={48210} />} viz={<Sparkline data={[4, 7, 6, 11, 10, 15, 14, 20, 19, 23]} />} tone="ok" captionIcon={<TrendingUp />} caption={<><b>+5,320</b> so với hôm qua</>} />
        <KpiCard label="Tự động hoàn toàn (STP)" badge={<Badge size="sm" tone="ok" variant="surface">▲ 2.1 pt</Badge>} value="87.3" unit="%" viz={<Sparkline data={[8, 9, 7, 10, 12, 11, 14, 16, 15, 18]} />} tone="ok" captionIcon={<TrendingUp />} caption={<><b>Tăng 4 tuần</b> liên tiếp</>} />
        <KpiCard label="Độ chính xác sau QC" badge={<Badge size="sm" variant="surface">Đạt mục tiêu</Badge>} value="99.62" unit="%" viz={<TargetBar value={99.62} target={99.5} min={98} max={100} label="99.62% / mục tiêu 99.5%" />} captionIcon={<CircleCheck />} caption={<>Mục tiêu <b>99.5%</b></>} />
        <KpiCard label="Lô có nguy cơ trễ SLA" badge={<Badge size="sm" tone="warn" variant="surface" live>Cần xử lý</Badge>} value="3" unit="/ 128 lô" viz={<CategoryBar segments={[{ value: 125, color: 'var(--dtx-primary)', label: 'đúng hạn' }, { value: 2, color: 'var(--dtx-amber)', label: 'sắp trễ' }, { value: 1, color: 'var(--dtx-red)', label: 'đã trễ' }]} />} tone="warn" captionIcon={<AlertTriangle />} caption={<><b>1 đã trễ</b> · 2 sắp trễ</>} />
      </div>) }] },
  { id: 'table', name: 'DataTable', category: 'Data', status: 'ready', summary: 'Tabular numbers, hairline rows, hover, right-aligned numeric columns, own horizontal scroll.', importLine: imp('DataTable, type Column'),
    demos: [{ title: 'Batches', plain: true, render: () => <Card><DataTable rowKey={b => b.id} rows={batches.slice(0, 3)} columns={[{ key: 'id', header: 'Mã lô', render: b => <span className="dtx-id">{b.id}</span> }, { key: 't', header: 'Loại', render: b => b.type[0] }, { key: 'p', header: 'Trang', align: 'right', render: b => b.pages?.toLocaleString('en-US') ?? '—' }, { key: 'a', header: 'Độ chính xác', align: 'right', render: b => `${b.accuracy}%` }]} /></Card> },
      { title: 'Empty', note: '`empty` says what happened and how to recover.', plain: true, render: () => <Card><DataTable rowKey={(b: { id: string }) => b.id} rows={[]} columns={[{ key: 'id', header: 'Mã lô', render: b => b.id }, { key: 't', header: 'Loại', render: () => '' }]} empty={<EmptyState size="sm" icon={<ListFilter />} title="Không có lô nào khớp bộ lọc" action={<Button variant="secondary" size="sm">Xoá bộ lọc</Button>} />} /></Card> }] },
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
    demos: [
      { title: 'Real document · project 1266', note: 'seg → rec v2 → LiLT v11 output from the test split, played through the same component.', plain: true, render: () => <RealShowcase /> },
      { title: 'Default pipeline (sample invoice)', replay: true, plain: true, render: run => <SampleShowcase run={run} /> },
      { title: 'With layout analysis', replay: true, plain: true, render: run => <SampleShowcase run={run} stages={['crop', 'deskew', 'detect', 'recognize', 'layout', 'extract']} /> }] },
  { id: 'box-overlay', name: 'BoxOverlay', category: 'AI · Shared', status: 'ready', summary: 'Bounding boxes over any page (0–1 coordinates), built to check the AI reading against the original. lens (default): the region magnified with the AI text directly beneath, same scale and left edge. blink: the box flips original ↔ AI in place. Boxes are keyboard-reachable buttons.',
    importLine: imp('BoxOverlay, type OcrBox'), demos: [
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
    importLine: imp('DocumentScan, type ScanRow, type ScanField'), demos: [
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

