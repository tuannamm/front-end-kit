import { Grid2x2, Layers, FolderOpen, ScanLine, Users } from 'lucide-react';
import { Button, Card, DocumentScan, Display, Eyebrow, HexIcon, Lede, Logo, Reveal, SectionHeader, TechBackdrop } from '@dtx/ui';
import { invoiceFields, invoiceRows } from '../data';
import { useT, type Translate } from '../i18n';

const solutions = (t: Translate) => [
  { icon: <Layers />, kicker: 'AI Data Extraction', name: 'DIGI-XTRACT', text: t('Trích xuất dữ liệu từ hoá đơn, hồ sơ, biểu mẫu bằng AI, kèm điểm tin cậy cho từng trường.', 'AI extraction from invoices, files and forms, with a confidence score for every field.'), wide: true },
  { icon: <ScanLine />, kicker: 'Digitization', name: 'DIGI-SCAN', text: t('Quét và số hoá tài liệu khối lượng lớn, chuẩn hoá ảnh và phân loại tự động.', 'High-volume scanning and digitization, with image cleanup and automatic classification.'), wide: true },
  { icon: <FolderOpen />, kicker: 'Document Management', name: 'DIGI-DMS', text: t('Lưu trữ, tìm kiếm và phân quyền tài liệu điện tử.', 'Store, search and control access to electronic documents.') },
  { icon: <Grid2x2 />, kicker: 'Business Suite', name: 'ONE DIGI-SOFT', text: t('Bộ phần mềm quản trị doanh nghiệp hợp nhất.', 'One integrated suite for running the business.') },
  { icon: <Users />, kicker: 'Operations', name: t('Dịch vụ BPO', 'BPO services'), text: t('Nhập liệu, kiểm tra và xử lý nghiệp vụ theo SLA.', 'Data entry, checking and business processing under SLA.') },
];

export function Website() {
  const t = useT();
  return (
    <main>
      <TechBackdrop>
        <div className="mx-auto flex max-w-[1240px] flex-wrap items-center gap-8 px-4 py-5">
          <Logo variant="horizontal-white" width={150} />
          <nav aria-label="Site" className="hidden gap-6 text-sm sm:flex">
            {[t('Giải pháp', 'Solutions'), t('Dịch vụ BPO', 'BPO services'), t('Khách hàng', 'Clients'), t('Tin tức', 'News'), t('Tuyển dụng', 'Careers')].map((l, i) => (
              <a key={l} href="#/website" className={`border-b-2 py-1.5 no-underline ${i === 0 ? 'border-brand text-fg' : 'border-transparent text-fg-muted hover:text-fg'}`}>{l}</a>
            ))}
          </nav>
        </div>
        <div className="mx-auto grid max-w-[1240px] items-center gap-12 px-4 pt-10 pb-18 lg:grid-cols-[1.05fr_1fr]">
          <Reveal>
            <Eyebrow>{t('AI · Số hoá · BPO', 'AI · Digitization · BPO')}</Eyebrow>
            <div className="mt-5"><Display>{t(<>Số hoá dữ liệu.<br /><em>Tăng tốc</em> vận hành.</>, <>Digitize data.<br /><em>Accelerate</em> operations.</>)}</Display></div>
            <div className="mt-5"><Lede>{t('DIGI-TEXX kết hợp AI trích xuất dữ liệu với đội ngũ vận hành chuyên nghiệp, biến chứng từ giấy thành dữ liệu sạch, sẵn sàng cho hệ thống của bạn.', 'DIGI-TEXX pairs AI data extraction with a professional operations team, turning paper records into clean data ready for your systems.')}</Lede></div>
            <div className="mt-8 flex flex-wrap gap-3">
              <Button size="lg" href="#/website">{t('Xem demo DIGI-XTRACT', 'See the DIGI-XTRACT demo')}</Button>
              <Button size="lg" variant="secondary" href="#/website">{t('Liên hệ tư vấn', 'Talk to an expert')}</Button>
            </div>
          </Reveal>
          <Reveal effect="scale" delay={120}>
            <DocumentScan fileName="hoa-don-0347.pdf" title="HOÁ ĐƠN GIÁ TRỊ GIA TĂNG" rows={invoiceRows} fields={invoiceFields} />
          </Reveal>
        </div>
      </TechBackdrop>

      <section className="mx-auto max-w-[1240px] px-4 py-18" aria-labelledby="sol-h">
        <SectionHeader id="sol-h" title={t('Giải pháp của DIGI-TEXX', 'DIGI-TEXX solutions')} description={t('Bốn nền tảng phần mềm và dịch vụ vận hành, dùng riêng hoặc kết hợp theo quy trình của doanh nghiệp.', 'Four software platforms and an operations service, used alone or combined to fit your workflow.')} />
        <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-6">
          {solutions(t).map((s, i) => (
            <Reveal key={s.name} index={i} className={s.wide ? 'sm:col-span-3' : 'sm:col-span-2'}>
              <Card className="dtx-hover-lift grid h-full content-start gap-3 p-6">
                <HexIcon>{s.icon}</HexIcon>
                <h3 className="m-0 text-xl font-bold"><small className="mb-1.5 block text-xs font-medium tracking-[.1em] text-link uppercase">{s.kicker}</small>{s.name}</h3>
                <p className="m-0 text-sm text-fg-muted">{s.text}</p>
              </Card>
            </Reveal>
          ))}
          <Reveal index={5} className="sm:col-span-6">
            <div data-theme="dark" className="flex flex-wrap items-center gap-6 rounded-lg bg-navy p-6 text-fg">
              <div className="min-w-0 flex-1">
                <h3 className="m-0 text-xl font-bold"><small className="mb-1.5 block text-xs font-medium tracking-[.1em] text-light uppercase">{t('Case study · mẫu', 'Case study · sample')}</small>{t('Từ 3 ngày xuống dưới 4 giờ cho một bộ hồ sơ bảo hiểm', 'From 3 days to under 4 hours for one insurance claim file')}</h3>
                <p className="mt-1 mb-0 text-sm text-fg-muted">{t('Nội dung minh hoạ cho bố cục. Số liệu thật sẽ do Marketing cung cấp.', 'Placeholder content for the layout. Marketing will supply the real figures.')}</p>
              </div>
              <Button variant="secondary" href="#/website">{t('Đọc case study', 'Read the case study')}</Button>
            </div>
          </Reveal>
        </div>
      </section>

      <footer data-theme="dark" className="bg-[var(--dtx-canvas-dark)] text-sm text-fg-muted">
        <div className="mx-auto flex max-w-[1240px] flex-wrap items-center gap-6 px-4 py-8">
          <Logo variant="horizontal-white" width={140} />
          <span>www.digi-texx.com</span>
          <span className="ml-auto">© 2026 DIGI-TEXX Vietnam</span>
        </div>
      </footer>
    </main>
  );
}
