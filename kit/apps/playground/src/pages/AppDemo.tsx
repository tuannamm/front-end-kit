import { Fragment, useEffect, useRef, useState, type ReactElement, type ReactNode } from 'react';
import { AlertTriangle, BarChart3, CalendarDays, CheckCircle2, CircleAlert, CircleCheck, Clock, FileStack, LayoutDashboard, MoreHorizontal, PanelLeft, ScanText, Settings, TrendingUp, Users, type LucideIcon } from 'lucide-react';
import {
  AppShell, AvatarPicker, Badge, Icon, type IconProps, Button, Card, CardHeader, CategoryBar, Checkbox, CheckboxGroup, CommandButton, CountUp, Counter, DataTable, DateRangePicker, Dialog, DialogClose, Drawer, DrawerClose, Field, FileDropzone, Select, UploadToast,
  KpiCard, Logo, Meter, MultiSelect, RadioGroup, Segmented, Sidebar, SidebarFooter, SidebarGroup, SidebarItem, SidebarWorkspace, Sparkline,
  StackedBarChart, TargetBar, Tooltip, Topbar, formatDate, todayIso, useToast, type Column, type DateRange,
} from '@dtx/ui';
import { aiThroughput, batches, hours, manualThroughput, type Batch } from '../data';
import { useT, type Translate } from '../i18n';
import { useFakeUpload } from '../fake-upload';

const statusLabel = (t: Translate): Record<Batch['status'], string> => ({
  processing: t('Đang xử lý', 'Processing'),
  qc: t('Đang QC', 'In QC'), risk: t('Nguy cơ trễ', 'At risk'), done: t('Hoàn tất', 'Done'), error: t('Lỗi mẫu', 'Template error'),
});
const statusBadge = (label: Record<Batch['status'], string>): Record<Batch['status'], ReactElement> => ({
  processing: <Badge tone="violet" live>{label.processing}</Badge>,
  qc: <Badge tone="brand" live>{label.qc}</Badge>,
  risk: <Badge tone="warn" variant="surface" dot>{label.risk}</Badge>,
  done: <Badge tone="ok" icon={<CheckCircle2 />}>{label.done}</Badge>,
  error: <Badge tone="err" icon={<CircleAlert />}>{label.error}</Badge>,
});
const exportScopes = (t: Translate) => [
  { value: 'shift', label: t('Ca sáng', 'Morning shift'), description: t('128 lô · 48.210 tài liệu', '128 batches · 48,210 documents') },
  { value: 'today', label: t('Hôm nay', 'Today'), description: t('214 lô · 81.930 tài liệu', '214 batches · 81,930 documents') },
  { value: '7d', label: t('7 ngày qua', 'Last 7 days'), description: t('1.402 lô · 512.640 tài liệu', '1,402 batches · 512,640 documents') },
];
const exportFormats = (t: Translate) => [
  { value: 'xlsx', label: 'Excel (.xlsx)' },
  { value: 'csv', label: 'CSV' },
  { value: 'json', label: 'JSON', description: t('Giữ toạ độ ô và độ tin cậy', 'Keeps cell coordinates and confidence') },
];
const columns = (t: Translate, label: Record<Batch['status'], string>, onOpen: (b: Batch) => void): Column<Batch>[] => {
  const badge = statusBadge(label);
  return [
    { key: 'id', header: t('Mã lô', 'Batch'), render: b => <button type="button" className="dtx-id" aria-label={t(`Xem chi tiết lô ${b.id}`, `View batch ${b.id}`)} onClick={() => onOpen(b)}>{b.id}</button> },
    { key: 'type', header: t('Loại tài liệu', 'Document type'), render: b => t(...b.type) },
    { key: 'client', header: t('Khách hàng', 'Client'), render: b => `${b.client} ${t('(mẫu)', '(sample)')}` },
    { key: 'received', header: t('Ngày nhận', 'Received'), render: b => <span className="dtx-num">{formatDate(b.received)}</span> },
    { key: 'pages', header: t('Trang', 'Pages'), align: 'right', render: b => b.pages?.toLocaleString('en-US') ?? '—' },
    { key: 'acc', header: t('Độ chính xác', 'Accuracy'), align: 'right', render: b => b.accuracy === undefined ? '—' : `${b.accuracy.toFixed(2)}%` },
    { key: 'status', header: t('Trạng thái', 'Status'), render: b => badge[b.status] },
    { key: 'sla', header: t('Hạn SLA', 'SLA due'), align: 'right', render: b => b.sla },
  ];
};
const queue = (t: Translate) => [
  { name: t('Hồ sơ bồi thường · BH-2210', 'Claim file · BH-2210'), meta: t('Bảo hiểm (mẫu) · 1.240 trang', 'Insurance (sample) · 1,240 pages'), left: t('còn 1g 20p', '1h 20m left'), pct: 72 },
  { name: t('Hoá đơn VAT · HD-5517', 'VAT invoice · HD-5517'), meta: t('Bán lẻ (mẫu) · 3.860 trang', 'Retail (sample) · 3,860 pages'), left: t('còn 3g 05p', '3h 05m left'), pct: 45 },
  { name: t('Hợp đồng tín dụng · TD-0931', 'Credit agreement · TD-0931'), meta: t('Ngân hàng (mẫu) · 610 trang', 'Banking (sample) · 610 pages'), left: t('còn 5g 40p', '5h 40m left'), pct: 18 },
];

/** Record detail for one batch: opened from the batch id in the table. */
function BatchDrawer({ batch: b, open, onOpenChange, t, label }: { batch: Batch | null; open: boolean; onOpenChange: (open: boolean) => void; t: Translate; label: Record<Batch['status'], string> }) {
  const toast = useToast();
  if (!b) return null;
  const client = `${b.client} ${t('(mẫu)', '(sample)')}`;
  const rows: [string, ReactNode][] = [
    [t('Trạng thái', 'Status'), statusBadge(label)[b.status]], [t('Loại tài liệu', 'Document type'), t(...b.type)], [t('Khách hàng', 'Client'), client],
    [t('Ngày nhận', 'Received'), formatDate(b.received)], [t('Số trang', 'Pages'), b.pages?.toLocaleString('en-US') ?? '—'],
    [t('Độ chính xác', 'Accuracy'), b.accuracy === undefined ? '—' : `${b.accuracy.toFixed(2)}%`], [t('Hạn SLA', 'SLA due'), b.sla],
  ];
  const last: Record<Batch['status'], string> = {
    processing: t('Đang tiền xử lý và OCR', 'Preprocessing and OCR in progress'),
    qc: t('Đang chờ kiểm tra QC', 'Waiting for QC'), risk: t(`Cảnh báo: có thể trễ hạn SLA ${b.sla}`, `Warning: may miss the ${b.sla} SLA`),
    done: t('QC đã duyệt, đã bàn giao cho khách hàng', 'Approved by QC and delivered'), error: t('Không khớp mẫu trích xuất, cần cập nhật mẫu', 'Does not match the extraction template; update the template'),
  };
  const log = b.pages === undefined || b.accuracy === undefined
    ? [t(`Đã tải lên ${b.files ?? 0} tệp`, `Uploaded ${files(t, b.files ?? 0)}`), last[b.status]]
    : [
      t(`Nhận ${b.pages.toLocaleString('en-US')} trang`, `Received ${b.pages.toLocaleString('en-US')} pages`),
      t('Tiền xử lý xong: cắt, chỉnh nghiêng', 'Preprocessing done: crop, deskew'),
      t(`OCR và trích xuất xong · ${b.accuracy.toFixed(2)}%`, `OCR and extraction done · ${b.accuracy.toFixed(2)}%`),
      last[b.status],
    ];
  // finished steps are checked; the last one carries the batch status (its text says the same, so the icon is decorative)
  const lastIcon: Record<Batch['status'], [LucideIcon, IconProps['tone']]> = {
    processing: [Clock, 'brand'], qc: [Clock, 'muted'], risk: [AlertTriangle, 'warn'], done: [CircleCheck, 'ok'], error: [CircleAlert, 'err'],
  };
  // nothing to act on while processing
  const action: Partial<Record<Batch['status'], string>> = { qc: t('Mở hàng đợi QC', 'Open QC queue'), risk: t('Mở hàng đợi QC', 'Open QC queue'), done: t('Tải kết quả', 'Download results'), error: t('Sửa mẫu trích xuất', 'Fix extraction template') };
  return (
    <Drawer open={open} onOpenChange={onOpenChange} title={t(`Lô ${b.id}`, `Batch ${b.id}`)} description={`${t(...b.type)} · ${client}`}
      footer={<><DrawerClose><Button variant="ghost">{t('Đóng', 'Close')}</Button></DrawerClose>
        {action[b.status] && <DrawerClose><Button onClick={() => toast({ title: action[b.status]!, description: b.id })}>{action[b.status]}</Button></DrawerClose>}</>}>
      <dl className="m-0 grid grid-cols-[auto_minmax(0,1fr)] items-center gap-x-6 gap-y-3 text-sm">
        {rows.map(([k, v]) => <Fragment key={k}><dt className="text-fg-muted">{k}</dt><dd className="m-0 font-medium dtx-num">{v}</dd></Fragment>)}
      </dl>
      <h3 className="mb-2 mt-6 text-sm font-bold">{t('Lịch sử xử lý', 'Processing history')}</h3>
      <ol className="m-0 list-none p-0 text-sm">{log.map((l, i) => {
        const [icon, tone] = i === log.length - 1 ? lastIcon[b.status] : [CircleCheck, 'ok' as const];
        return <li key={l} className="flex items-start gap-2 border-b border-border py-2 dtx-num last:border-b-0"><Icon icon={icon} tone={tone} className="mt-0.5" />{l}</li>;
      })}</ol>
    </Drawer>
  );
}

const files = (t: Translate, n: number) => t(`${n} tệp`, `${n} ${new Intl.PluralRules('en').select(n) === 'one' ? 'file' : 'files'}`);

/** "+ New batch": client, document type and files; fake uploads, validated on submit. The new batch shows up in the table, not in a toast. */
function NewBatchDrawer({ t, onCreate }: { t: Translate; onCreate: (b: Batch) => void }) {
  const nextNo = useRef(9001);
  const up = useFakeUpload();
  const [open, setOpen] = useState(false);
  const [client, setClient] = useState<string | null>(null);
  const [type, setType] = useState<string | null>(null);
  const [tried, setTried] = useState(false);
  const clients = batches.map(b => ({ value: b.client, label: `${b.client} ${t('(mẫu)', '(sample)')}` }));
  const types = batches.map(b => ({ value: b.type[1], label: t(...b.type) }));
  const uploading = up.items.filter(u => u.status === 'uploading').length;
  const failed = up.items.filter(u => u.status === 'error').length;
  const done = up.items.length - uploading - failed;
  const errors = {
    client: !client && t('Chọn khách hàng.', 'Choose a client.'),
    type: !type && t('Chọn loại tài liệu.', 'Choose a document type.'),
    files: !up.items.length ? t('Thêm ít nhất một tệp.', 'Add at least one file.')
      : failed ? t(`${failed} tệp tải lỗi: thử lại hoặc xoá.`, `${files(t, failed)} failed: retry or remove them.`)
      : uploading ? t(`Đợi ${uploading} tệp tải xong.`, `Wait for ${files(t, uploading)} to finish.`) : false,
  };
  const reset = () => { up.clear(); setClient(null); setType(null); setTried(false); };
  const submit = () => {
    if (errors.client || errors.type || errors.files) { setTried(true); return; }
    const sample = batches.find(b => b.type[1] === type)!;
    onCreate({ id: `${sample.id.split('-')[0]}-${nextNo.current++}`, type: sample.type, client: client!, status: 'processing', sla: '—', received: todayIso(), files: done });
    reset(); setOpen(false);
  };
  return (<>
    {/* outside the Drawer: its content unmounts on close, and the progress toast must outlive it */}
    <UploadToast items={up.rows(t('Mất kết nối khi tải lên. Bấm thử lại.', 'Connection lost while uploading. Retry.'))} />
    <Drawer open={open} onOpenChange={setOpen} trigger={<Button>{t('+ Tạo lô mới', '+ New batch')}</Button>}
      title={t('Tạo lô mới', 'New batch')} description={t('Tải tệp lên để bắt đầu tiền xử lý và OCR.', 'Upload files to start preprocessing and OCR.')}
      footer={<>
        {up.items.length > 0 && <span className="mr-auto self-center text-xs text-fg-muted dtx-num">{t(`${done}/${up.items.length} tệp đã tải lên`, `${done}/${up.items.length} files uploaded`)}</span>}
        <DrawerClose><Button variant="ghost" onClick={reset}>{t('Huỷ', 'Cancel')}</Button></DrawerClose>
        <Button onClick={submit}>{t('Tạo lô', 'Create batch')}</Button>
      </>}>
      <div className="grid gap-4">
        <Field label={t('Khách hàng', 'Client')} error={tried && errors.client}><Select items={clients} value={client} onValueChange={setClient} placeholder={t('Chọn khách hàng', 'Choose a client')} /></Field>
        <Field label={t('Loại tài liệu', 'Document type')} error={tried && errors.type}><Select items={types} value={type} onValueChange={setType} placeholder={t('Chọn loại tài liệu', 'Choose a document type')} /></Field>
        <FileDropzone label={t('Tài liệu', 'Documents')} accept=".pdf,.jpg,.jpeg,.png,.tif,.tiff,.zip" maxSize={50 * 1024 * 1024} onFiles={up.add} error={tried && errors.files} />
      </div>
    </Drawer>
  </>);
}

export function AppDemo() {
  const t = useT();
  const label = statusLabel(t), scopes = exportScopes(t), fmts = exportFormats(t);
  const statusFilter = Object.entries(label).map(([value, l]) => ({ value, label: l }));
  const [rail, setRail] = useState(false);
  const [status, setStatus] = useState<string[]>(['qc', 'risk']);
  const [received, setReceived] = useState<DateRange>({ from: null, to: null });
  const [scope, setScope] = useState('shift');
  const [formats, setFormats] = useState(['xlsx']);
  const [withImages, setWithImages] = useState(false);
  // batch outlives `open` so the drawer keeps its content while sliding out
  const [detail, setDetail] = useState<Batch | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const openDetail = (b: Batch) => { setDetail(b); setDetailOpen(true); };
  const toast = useToast();
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'b') { e.preventDefault(); setRail(r => !r); } };
    addEventListener('keydown', onKey); return () => removeEventListener('keydown', onKey);
  }, []);
  const [photo, setPhoto] = useState<string>();
  const me = 'Nguyễn Thị Thuận';
  // no backend: the photo lives in this tab as an object URL
  const savePhoto = (file: File | null) => {
    if (photo) URL.revokeObjectURL(photo);
    setPhoto(file ? URL.createObjectURL(file) : undefined);
    toast({ title: file ? t('Đã cập nhật ảnh đại diện', 'Profile photo updated') : t('Đã xoá ảnh đại diện', 'Profile photo removed'), icon: <Badge tone="ok" size="sm" icon={<CheckCircle2 />} /> });
  };
  const [created, setCreated] = useState<Batch[]>([]);
  const [announce, setAnnounce] = useState('');
  // the new batch must be visible: widen filters that would hide it (the chip / range change shows why)
  const addBatch = (b: Batch) => {
    setCreated(c => [b, ...c]);
    setStatus(s => s.length && !s.includes(b.status) ? [...s, b.status] : s);
    setReceived(r => (r.from && b.received < r.from) || (r.to && b.received > r.to) ? { from: null, to: null } : r);
    setAnnounce(t(`Đã tạo lô ${b.id}, đang xử lý.`, `Created batch ${b.id}, processing.`));
  };
  const rows = [...created, ...batches].filter(b => (!status.length || status.includes(b.status))
    && (!received.from || b.received >= received.from) && (!received.to || b.received <= received.to));
  const resetFilters = () => { setStatus([]); setReceived({ from: null, to: null }); };

  const sidebar = (
    <Sidebar>
      <SidebarWorkspace logo={<Logo variant="square" />} name="DIGI-XTRACT" subtitle="Operations console" />
      <SidebarGroup label={t('Vận hành', 'Operations')}>
        <SidebarItem href="#/app" icon={<LayoutDashboard />} label={t('Tổng quan', 'Overview')} active kbd="G O" />
        <SidebarItem href="#/app" icon={<FileStack />} label={t('Lô tài liệu', 'Batches')} count={128} kbd="G L" />
        <SidebarItem href="#/app" icon={<CircleCheck />} label={t('Kiểm tra (QC)', 'Quality check (QC)')} badge={<Counter tone="warn">14</Counter>} alert />
        <SidebarItem href="#/app" icon={<ScanText />} label={t('Mẫu trích xuất', 'Extraction templates')} badge={<Badge size="sm" variant="outline">{t('Mới', 'New')}</Badge>} />
        <SidebarItem href="#/app" icon={<BarChart3 />} label={t('Báo cáo', 'Reports')} />
      </SidebarGroup>
      <SidebarGroup label={t('Quản trị', 'Administration')}>
        <SidebarItem href="#/app" icon={<Users />} label={t('Khách hàng', 'Clients')} count={32} />
        <SidebarItem href="#/app" icon={<Settings />} label={t('Cài đặt', 'Settings')} />
      </SidebarGroup>
      <SidebarFooter>
        <AvatarPicker name={me} src={photo} size="sm" onChange={savePhoto} />
        <span className="dtx-rail-hide min-w-0"><b>Nguyễn Thị Thuận</b><small>{t('QC Lead · Ca sáng', 'QC Lead · Morning shift')}</small></span>
        <Button variant="ghost" size="sm" icon aria-label={t('Tài khoản', 'Account')} className="dtx-rail-hide ml-auto"><MoreHorizontal /></Button>
      </SidebarFooter>
    </Sidebar>
  );

  return (
    <main className="min-h-0 flex-1">
      <AppShell fill sidebar={sidebar} rail={rail}>
        <Topbar>
          <Tooltip content={rail ? t('Mở rộng thanh bên', 'Expand sidebar') : t('Thu gọn thanh bên', 'Collapse sidebar')} shortcut="Ctrl B">
            <Button variant="secondary" icon aria-label={t('Thu gọn thanh bên', 'Collapse sidebar')} aria-pressed={rail} onClick={() => setRail(r => !r)}><PanelLeft /></Button>
          </Tooltip>
          <span className="text-sm text-fg-muted">{t('Vận hành', 'Operations')} / <b className="font-medium text-fg">{t('Tổng quan', 'Overview')}</b></span>
          <CommandButton placeholder={t('Tìm lô, khách hàng, lệnh…', 'Search batches, clients, commands…')} />
          <AvatarPicker name={me} src={photo} onChange={savePhoto} />
        </Topbar>

        <div className="grid gap-6 px-5 pt-6 pb-8">
          <div className="flex flex-wrap items-end gap-4">
            <div>
              <h1 className="m-0 text-2xl font-bold tracking-tight">{t('Tổng quan vận hành', 'Operations overview')}</h1>
              <p className="mt-1 mb-0 text-sm text-fg-muted"><Icon icon={CalendarDays} size="sm" /> {t('Thứ Hai, 05/10/2026 · Ca sáng', 'Monday, 05/10/2026 · Morning shift')} <Badge tone="neutral" variant="outline" size="sm">{t('Dữ liệu mẫu', 'Sample data')}</Badge></p>
            </div>
            <div className="ml-auto flex flex-wrap gap-2">
              <Dialog
                trigger={<Button variant="secondary">{t('Xuất báo cáo', 'Export report')}</Button>}
                title={t('Xuất báo cáo', 'Export report')}
                description={t('File sẽ được gửi vào hộp thư của bạn.', 'The file will be sent to your inbox.')}
                footer={<><DialogClose><Button variant="ghost">{t('Huỷ', 'Cancel')}</Button></DialogClose><DialogClose><Button disabled={!formats.length} onClick={() => toast({ title: t('Đang tạo báo cáo', 'Generating report'), description: `${scopes.find(o => o.value === scope)?.label} · ${fmts.filter(o => formats.includes(o.value)).map(o => o.label).join(', ')}${withImages ? t(' · kèm ảnh gốc', ' · with original images') : ''}`, icon: <Badge tone="brand" size="sm" live /> })}>{t('Xuất báo cáo', 'Export report')}</Button></DialogClose></>}
              >
                <div className="grid gap-5 py-2">
                  <RadioGroup label={t('Phạm vi', 'Scope')} options={scopes} value={scope} onValueChange={setScope} />
                  <CheckboxGroup label={t('Định dạng', 'Format')} row options={fmts} value={formats} onValueChange={setFormats} error={formats.length ? undefined : t('Chọn ít nhất một định dạng.', 'Choose at least one format.')} />
                  <Checkbox label={t('Gửi kèm ảnh gốc', 'Attach original images')} description={t('File nén, dung lượng lớn hơn khoảng 20 lần.', 'Zipped, about 20 times larger.')} checked={withImages} onCheckedChange={setWithImages} />
                </div>
              </Dialog>
              <NewBatchDrawer t={t} onCreate={addBatch} />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <KpiCard label={t('Tài liệu xử lý hôm nay', 'Documents processed today')} badge={<Badge size="sm" tone="ok" variant="surface">▲ 12.4%</Badge>} value={<CountUp value={48210} />}
              viz={<Sparkline data={[4, 7, 6, 11, 10, 15, 14, 20, 19, 23]} />} tone="ok" captionIcon={<TrendingUp />} caption={t(<><b>+5,320</b> so với hôm qua</>, <><b>+5,320</b> vs. yesterday</>)} />
            <KpiCard label={t('Tự động hoàn toàn (STP)', 'Straight-through (STP)')} badge={<Badge size="sm" tone="ok" variant="surface">▲ 2.1 pt</Badge>} value={<CountUp value={87.3} decimals={1} />} unit="%"
              viz={<Sparkline data={[8, 9, 7, 10, 12, 11, 14, 16, 15, 18]} />} tone="ok" captionIcon={<TrendingUp />} caption={t(<><b>Tăng 4 tuần</b> liên tiếp</>, <>Up <b>4 weeks</b> in a row</>)} />
            <KpiCard label={t('Độ chính xác sau QC', 'Accuracy after QC')} badge={<Badge size="sm" variant="surface">{t('Đạt mục tiêu', 'On target')}</Badge>} value={<CountUp value={99.62} decimals={2} />} unit="%"
              viz={<TargetBar value={99.62} target={99.5} min={98} max={100} label={t('99.62% so với mục tiêu 99.5%, thang 98–100%', '99.62% vs. 99.5% target, scale 98–100%')} />} captionIcon={<CircleCheck />} caption={t(<>Mục tiêu <b>99.5%</b> · vượt 0.12 pt</>, <>Target <b>99.5%</b> · ahead by 0.12 pt</>)} />
            <KpiCard label={t('Lô có nguy cơ trễ SLA', 'Batches at risk of missing SLA')} badge={<Badge size="sm" tone="warn" variant="surface" live>{t('Cần xử lý', 'Needs action')}</Badge>} value="3" unit={t('/ 128 lô', '/ 128 batches')}
              viz={<CategoryBar segments={[{ value: 125, color: 'var(--dtx-primary)', label: t('đúng hạn', 'on time') }, { value: 2, color: 'var(--dtx-amber)', label: t('sắp trễ', 'due soon') }, { value: 1, color: 'var(--dtx-red)', label: t('đã trễ', 'overdue') }]} />}
              tone="warn" captionIcon={<AlertTriangle />} caption={t(<><b>1 đã trễ</b> · 2 sắp trễ trong 1 giờ</>, <><b>1 overdue</b> · 2 due within 1 hour</>)} />
          </div>

          <div className="grid grid-cols-1 gap-4 lg:grid-cols-[2fr_1fr]">
            <Card aria-labelledby="thr">
              <CardHeader id="thr" title={t('Sản lượng theo giờ', 'Hourly throughput')} action={<Segmented aria-label={t('Khoảng thời gian', 'Time range')} options={[{ value: 'today', label: t('Hôm nay', 'Today') }, { value: '7d', label: t('7 ngày', '7 days') }]} />} />
              <div className="p-4">
                <StackedBarChart label={t('Tài liệu mỗi giờ, AI và thủ công', 'Documents per hour, AI and manual')} labels={hours} max={8000} step={2000}
                  series={[{ name: t('AI tự động', 'AI automated'), color: 'var(--dtx-primary)', data: aiThroughput }, { name: t('Xử lý thủ công', 'Manual processing'), color: 'var(--dtx-light)', data: manualThroughput }]} />
              </div>
            </Card>
            <Card aria-labelledby="qc">
              <CardHeader id="qc" title={t('Hàng đợi QC', 'QC queue')} action={<Badge variant="surface">{t('14 lô', '14 batches')}</Badge>} />
              {queue(t).map(q => (
                <div key={q.name} className="grid grid-cols-[minmax(0,1fr)_auto] gap-x-3 gap-y-1 border-b border-border px-4 py-3 text-sm last:border-b-0 dtx-num">
                  <b className="truncate font-medium">{q.name}</b><small className="text-xs text-fg-muted">{q.pct}%</small>
                  <small className="text-xs text-fg-muted">{q.meta}</small><small className="text-xs text-fg-muted"><Icon icon={Clock} size="xs" /> {q.left}</small>
                  <div className="col-span-2"><Meter value={q.pct} label={`${q.name}: ${q.pct}%`} /></div>
                </div>
              ))}
            </Card>
          </div>

          <Card aria-labelledby="batches">
            <CardHeader id="batches" title={t('Lô tài liệu gần đây', 'Recent batches')} action={<>
              <div className="w-60 max-w-full"><DateRangePicker size="sm" aria-label={t('Lọc theo ngày nhận', 'Filter by received date')} placeholder={t('Mọi ngày nhận', 'Any received date')} value={received} onValueChange={setReceived} /></div>
              <div className="w-72 max-w-full"><MultiSelect size="sm" aria-label={t('Lọc theo trạng thái', 'Filter by status')} placeholder={t('Tất cả trạng thái', 'All statuses')} items={statusFilter} value={status} onValueChange={setStatus} /></div>
            </>} />
            <DataTable caption={t('Lô tài liệu gần đây', 'Recent batches')} columns={columns(t, label, openDetail)} rows={rows} rowKey={b => b.id}
              empty={<div className="grid justify-items-center gap-2"><span>{t('Không có lô nào khớp bộ lọc.', 'No batches match the filters.')}</span><Button variant="secondary" size="sm" onClick={resetFilters}>{t('Xoá bộ lọc', 'Clear filters')}</Button></div>} />
          </Card>
        </div>
        <p role="status" className="dtx-sr">{announce}</p>
        <BatchDrawer batch={detail} open={detailOpen} onOpenChange={setDetailOpen} t={t} label={label} />
      </AppShell>
    </main>
  );
}
