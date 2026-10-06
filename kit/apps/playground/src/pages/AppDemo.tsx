import { useEffect, useState, type ReactElement } from 'react';
import { AlertTriangle, BarChart3, CheckCircle2, CircleAlert, CircleCheck, FileStack, LayoutDashboard, MoreHorizontal, PanelLeft, ScanText, Settings, TrendingUp, Users } from 'lucide-react';
import {
  AppShell, Avatar, Badge, Button, Card, CardHeader, CategoryBar, CommandButton, CountUp, Counter, DataTable, Dialog, DialogClose,
  KpiCard, Logo, Meter, Segmented, Select, Sidebar, SidebarFooter, SidebarGroup, SidebarItem, SidebarWorkspace, Sparkline,
  StackedBarChart, TargetBar, Tooltip, Topbar, useToast, type Column,
} from '@dtx/ui';
import { aiThroughput, batches, hours, manualThroughput, type Batch } from '../data';
import { statusOptions } from '../options';

const statusBadge: Record<Batch['status'], ReactElement> = {
  qc: <Badge tone="brand" live>Đang QC</Badge>,
  risk: <Badge tone="warn" variant="surface" dot>Nguy cơ trễ</Badge>,
  done: <Badge tone="ok" icon={<CheckCircle2 />}>Hoàn tất</Badge>,
  error: <Badge tone="err" icon={<CircleAlert />}>Lỗi mẫu</Badge>,
};
const columns: Column<Batch>[] = [
  { key: 'id', header: 'Mã lô', render: b => <span className="dtx-id">{b.id}</span> },
  { key: 'type', header: 'Loại tài liệu', render: b => b.type },
  { key: 'client', header: 'Khách hàng', render: b => b.client },
  { key: 'pages', header: 'Trang', align: 'right', render: b => b.pages.toLocaleString('en-US') },
  { key: 'acc', header: 'Độ chính xác', align: 'right', render: b => `${b.accuracy.toFixed(2)}%` },
  { key: 'status', header: 'Trạng thái', render: b => statusBadge[b.status] },
  { key: 'sla', header: 'Hạn SLA', align: 'right', render: b => b.sla },
];
const queue = [
  { name: 'Hồ sơ bồi thường · BH-2210', meta: 'Bảo hiểm (mẫu) · 1.240 trang', left: 'còn 1g 20p', pct: 72 },
  { name: 'Hoá đơn VAT · HD-5517', meta: 'Bán lẻ (mẫu) · 3.860 trang', left: 'còn 3g 05p', pct: 45 },
  { name: 'Hợp đồng tín dụng · TD-0931', meta: 'Ngân hàng (mẫu) · 610 trang', left: 'còn 5g 40p', pct: 18 },
];

export function AppDemo() {
  const [rail, setRail] = useState(false);
  const [status, setStatus] = useState<string | null>('all');
  const toast = useToast();
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'b') { e.preventDefault(); setRail(r => !r); } };
    addEventListener('keydown', onKey); return () => removeEventListener('keydown', onKey);
  }, []);
  const rows = batches.filter(b => !status || status === 'all' || b.status === status);

  const sidebar = (
    <Sidebar>
      <SidebarWorkspace logo={<Logo variant="square" />} name="DIGI-XTRACT" subtitle="Operations console" />
      <SidebarGroup label="Vận hành">
        <SidebarItem href="#/app" icon={<LayoutDashboard />} label="Tổng quan" active kbd="G O" />
        <SidebarItem href="#/app" icon={<FileStack />} label="Lô tài liệu" count={128} kbd="G L" />
        <SidebarItem href="#/app" icon={<CircleCheck />} label="Kiểm tra (QC)" badge={<Counter tone="warn">14</Counter>} alert />
        <SidebarItem href="#/app" icon={<ScanText />} label="Mẫu trích xuất" badge={<Badge size="sm" variant="outline">Mới</Badge>} />
        <SidebarItem href="#/app" icon={<BarChart3 />} label="Báo cáo" />
      </SidebarGroup>
      <SidebarGroup label="Quản trị">
        <SidebarItem href="#/app" icon={<Users />} label="Khách hàng" count={32} />
        <SidebarItem href="#/app" icon={<Settings />} label="Cài đặt" />
      </SidebarGroup>
      <SidebarFooter>
        <Avatar name="Nguyễn Thị Thuận" size="sm" />
        <span className="dtx-rail-hide min-w-0"><b>Nguyễn Thị Thuận</b><small>QC Lead · Ca sáng</small></span>
        <Button variant="ghost" size="sm" icon aria-label="Tài khoản" className="dtx-rail-hide ml-auto"><MoreHorizontal /></Button>
      </SidebarFooter>
    </Sidebar>
  );

  return (
    <main className="mx-auto my-6 max-w-[1240px] px-4">
      <AppShell sidebar={sidebar} rail={rail}>
        <Topbar>
          <Tooltip content={rail ? 'Mở rộng thanh bên' : 'Thu gọn thanh bên'} shortcut="Ctrl B">
            <Button variant="secondary" icon aria-label="Thu gọn thanh bên" aria-pressed={rail} onClick={() => setRail(r => !r)}><PanelLeft /></Button>
          </Tooltip>
          <span className="text-sm text-fg-muted">Vận hành / <b className="font-medium text-fg">Tổng quan</b></span>
          <CommandButton placeholder="Tìm lô, khách hàng, lệnh…" />
          <Avatar name="Nguyễn Thị Thuận" />
        </Topbar>

        <div className="grid gap-6 px-5 pt-6 pb-8">
          <div className="flex flex-wrap items-end gap-4">
            <div>
              <h1 className="m-0 text-2xl font-bold tracking-tight">Tổng quan vận hành</h1>
              <p className="mt-1 mb-0 text-sm text-fg-muted">Thứ Hai, 05/10/2026 · Ca sáng <Badge tone="neutral" variant="outline" size="sm">Dữ liệu mẫu</Badge></p>
            </div>
            <div className="ml-auto flex flex-wrap gap-2">
              <Dialog
                trigger={<Button variant="secondary">Xuất báo cáo</Button>}
                title="Xuất báo cáo ca sáng?"
                description="Báo cáo gồm 128 lô, 48.210 tài liệu. File Excel sẽ được gửi vào hộp thư của bạn."
                footer={<><DialogClose><Button variant="ghost">Huỷ</Button></DialogClose><DialogClose><Button onClick={() => toast({ title: 'Đang tạo báo cáo', description: 'Bạn sẽ nhận email trong vài phút.', icon: <Badge tone="brand" size="sm" live /> })}>Xuất báo cáo</Button></DialogClose></>}
              />
              <Button onClick={() => toast({ title: 'Đã tạo lô BH-2211', description: '0 trang · Ca sáng', icon: <Badge tone="ok" size="sm" icon={<CheckCircle2 />} /> })}>+ Tạo lô mới</Button>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <KpiCard label="Tài liệu xử lý hôm nay" badge={<Badge size="sm" tone="ok" variant="surface">▲ 12.4%</Badge>} value={<CountUp value={48210} />}
              viz={<Sparkline data={[4, 7, 6, 11, 10, 15, 14, 20, 19, 23]} />} tone="ok" captionIcon={<TrendingUp />} caption={<><b>+5,320</b> so với hôm qua</>} />
            <KpiCard label="Tự động hoàn toàn (STP)" badge={<Badge size="sm" tone="ok" variant="surface">▲ 2.1 pt</Badge>} value={<CountUp value={87.3} decimals={1} />} unit="%"
              viz={<Sparkline data={[8, 9, 7, 10, 12, 11, 14, 16, 15, 18]} />} tone="ok" captionIcon={<TrendingUp />} caption={<><b>Tăng 4 tuần</b> liên tiếp</>} />
            <KpiCard label="Độ chính xác sau QC" badge={<Badge size="sm" variant="surface">Đạt mục tiêu</Badge>} value={<CountUp value={99.62} decimals={2} />} unit="%"
              viz={<TargetBar value={99.62} target={99.5} min={98} max={100} label="99.62% so với mục tiêu 99.5%, thang 98–100%" />} captionIcon={<CircleCheck />} caption={<>Mục tiêu <b>99.5%</b> · vượt 0.12 pt</>} />
            <KpiCard label="Lô có nguy cơ trễ SLA" badge={<Badge size="sm" tone="warn" variant="surface" live>Cần xử lý</Badge>} value="3" unit="/ 128 lô"
              viz={<CategoryBar segments={[{ value: 125, color: 'var(--dtx-primary)', label: 'đúng hạn' }, { value: 2, color: 'var(--dtx-amber)', label: 'sắp trễ' }, { value: 1, color: 'var(--dtx-red)', label: 'đã trễ' }]} />}
              tone="warn" captionIcon={<AlertTriangle />} caption={<><b>1 đã trễ</b> · 2 sắp trễ trong 1 giờ</>} />
          </div>

          <div className="grid grid-cols-1 gap-4 lg:grid-cols-[2fr_1fr]">
            <Card aria-labelledby="thr">
              <CardHeader id="thr" title="Sản lượng theo giờ" action={<Segmented aria-label="Khoảng thời gian" options={[{ value: 'today', label: 'Hôm nay' }, { value: '7d', label: '7 ngày' }]} />} />
              <div className="p-4">
                <StackedBarChart label="Tài liệu mỗi giờ, AI và thủ công" labels={hours} max={8000} step={2000}
                  series={[{ name: 'AI tự động', color: 'var(--dtx-primary)', data: aiThroughput }, { name: 'Xử lý thủ công', color: 'var(--dtx-light)', data: manualThroughput }]} />
              </div>
            </Card>
            <Card aria-labelledby="qc">
              <CardHeader id="qc" title="Hàng đợi QC" action={<Badge variant="surface">14 lô</Badge>} />
              {queue.map(q => (
                <div key={q.name} className="grid grid-cols-[minmax(0,1fr)_auto] gap-x-3 gap-y-1 border-b border-border px-4 py-3 text-sm last:border-b-0 dtx-num">
                  <b className="truncate font-medium">{q.name}</b><small className="text-xs text-fg-muted">{q.pct}%</small>
                  <small className="text-xs text-fg-muted">{q.meta}</small><small className="text-xs text-fg-muted">{q.left}</small>
                  <div className="col-span-2"><Meter value={q.pct} label={`${q.name}: ${q.pct}%`} /></div>
                </div>
              ))}
            </Card>
          </div>

          <Card aria-labelledby="batches">
            <CardHeader id="batches" title="Lô tài liệu gần đây" action={<div className="w-52"><Select size="sm" aria-label="Lọc theo trạng thái" items={statusOptions} value={status} onValueChange={setStatus} /></div>} />
            <DataTable caption="Lô tài liệu gần đây" columns={columns} rows={rows} rowKey={b => b.id} />
          </Card>
        </div>
      </AppShell>
    </main>
  );
}
