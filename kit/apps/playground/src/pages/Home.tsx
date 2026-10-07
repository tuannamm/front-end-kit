import { useCallback, useEffect, useLayoutEffect, useRef, useState, type CSSProperties, type ReactNode } from 'react';
import { ArrowRight, Check } from 'lucide-react';
import {
  Badge, BoxOverlay, Button, CompareSlider, ConfidenceBadge, ConfidenceBar, CountUp, Display, Lede, Logo, Reveal, SampleInvoice, ScanBeam,
  Carousel, SectionHeader, Skeleton, Steps, Switch, TechBackdrop, sampleInvoiceInset, useReducedMotion, type OcrBox,
} from '@dtx/ui';
import { categories, entries } from '../catalog/entries';
import { CopyCode } from '../catalog/Catalog';
import { Tile } from '../catalog/overview';
import { demoPair } from '../demo-pairs';
import { invoiceFields, invoiceRows } from '../data';
import { useT } from '../i18n';

const ready = entries.filter(e => e.status === 'ready');
const aiEntries = ready.filter(e => e.category.startsWith('AI'));
/** Editorial pick for the gallery, one carousel page per 8; ids that no longer exist are skipped. */
const featured = ['steps', 'select', 'table', 'notification', 'command-palette', 'daterange', 'kpi', 'timeline',
  'alert', 'pagination', 'slider', 'breadcrumb', 'charts', 'confidence', 'datepicker', 'upload']
  .flatMap(id => entries.find(e => e.id === id && e.status === 'ready') ?? []);
const PAGE = 8;
const pages = Array.from({ length: Math.ceil(featured.length / PAGE) }, (_, p) => featured.slice(p * PAGE, (p + 1) * PAGE));

const SCAN = 2400;
const LOOP = 7200;

/**
 * Below-the-fold blocks marked data-reveal fade up as they scroll in. Content is visible by default: only blocks that
 * start below the viewport are hidden, and only when motion is allowed.
 */
function useScrollReveal() {
  const root = useRef<HTMLElement>(null);
  const reduced = useReducedMotion();
  useLayoutEffect(() => {
    if (reduced || !root.current) return;
    const els = [...root.current.querySelectorAll<HTMLElement>('[data-reveal]')].filter(el => el.getBoundingClientRect().top > innerHeight);
    const io = new IntersectionObserver(list => list.forEach(e => {
      if (!e.isIntersecting) return;
      (e.target as HTMLElement).dataset.reveal = 'in';
      io.unobserve(e.target);
    }), { rootMargin: '0px 0px -8% 0px' });
    els.forEach(el => { el.dataset.reveal = 'wait'; io.observe(el); });
    return () => { io.disconnect(); els.forEach(el => { el.dataset.reveal = ''; }); };
  }, [reduced]);
  return root;
}

/** The kit doing its job: a page is scanned, boxes appear under the beam, fields come out with a confidence. Loops while on screen. */
function HeroDemo() {
  const t = useT();
  const reduced = useReducedMotion();
  const box = useRef<HTMLDivElement>(null);
  const [lines, setLines] = useState<OcrBox[]>([]);
  const onBoxes = useCallback((b: OcrBox[]) => setLines(b), []);
  const [run, setRun] = useState(0);
  const [phase, setPhase] = useState(reduced ? 3 : 1);
  const [onScreen, setOnScreen] = useState(true);

  useEffect(() => {
    const io = new IntersectionObserver(([e]) => setOnScreen(e.isIntersecting));
    io.observe(box.current!);
    return () => io.disconnect();
  }, []);

  useEffect(() => {
    if (reduced) { setPhase(3); return; }
    if (!onScreen) return;
    setPhase(1);
    const timers = [setTimeout(() => setPhase(2), SCAN), setTimeout(() => setPhase(3), SCAN + 1100), setTimeout(() => setRun(r => r + 1), LOOP)];
    return () => timers.forEach(clearTimeout);
  }, [run, onScreen, reduced]);

  const fields = invoiceFields.map(f => ({ ...f, label: invoiceRows.flatMap(r => 'field' in r && r.field === f.key ? [r.label] : [])[0] ?? f.key }));
  return (
    <div ref={box} className="pg-hero-demo">
      <Steps size="sm" current={phase} aria-label={t('Tiến độ xử lý mẫu', 'Sample processing progress')} className="pg-hero-demo__steps"
        items={[{ title: t('Tiền xử lý', 'Preprocess') }, { title: t('Nhận dạng', 'Recognize') }, { title: t('Trích xuất', 'Extract') }]} />
      <div className="pg-hero-demo__page">
        <ScanBeam key={run} duration={SCAN} active={!reduced}>
          <BoxOverlay boxes={lines} textInset={sampleInvoiceInset} animate={false}><SampleInvoice onBoxes={onBoxes} /></BoxOverlay>
        </ScanBeam>
      </div>
      <div className="pg-hero-demo__fields" aria-live="off">
        <span className="text-xs font-medium text-fg-muted">{t('Trường đã trích xuất', 'Extracted fields')}</span>
        <dl key={run} className="m-0 grid gap-2">
          {/* skeleton while the page is read, then the fields: the kit's own phase 1 → phase 2 */}
          {fields.map((f, i) => phase < 2 ? (
            <div key={f.key} className="pg-hero-demo__field pg-hero-demo__field--wait" aria-hidden><Skeleton width="40%" height={9} /><Skeleton width={`${55 + (i * 17) % 35}%`} height={13} /></div>
          ) : (
            <Reveal key={f.key} effect="slide-in" index={i} stagger={110} className="pg-hero-demo__field">
              <dt className="truncate text-xs text-fg-muted">{f.label}</dt>
              <dd className="m-0 flex items-center justify-between gap-2"><span className="truncate text-sm font-medium dtx-num">{f.value}</span><ConfidenceBadge value={f.confidence} /></dd>
            </Reveal>
          ))}
        </dl>
      </div>
    </div>
  );
}

function Stat({ value, label }: { value: ReactNode; label: string }) {
  return <div className="grid gap-1"><dt className="order-2 text-sm text-fg-muted">{label}</dt><dd className="m-0 text-3xl font-bold tracking-tight">{value}</dd></div>;
}

/** Same three controls in each theme: the theme is a property of the block, not of the page. */
function ThemePair() {
  const t = useT();
  return (
    <div className="pg-why__art grid grid-cols-2 gap-2" inert aria-hidden>
      {(['light', 'dark'] as const).map((th, i) => (
        <div key={th} data-theme={th} className="pg-rise grid content-center justify-items-start gap-2 rounded-md border border-border bg-surface p-3" style={{ '--j': i } as CSSProperties}>
          <Button size="sm">{th === 'light' ? t('Sáng', 'Light') : t('Tối', 'Dark')}</Button>
          <Badge tone="ok" variant="surface" dot>99.2%</Badge>
          <Switch label="QC" defaultChecked />
        </div>
      ))}
    </div>
  );
}

export function Home() {
  const t = useT();
  const root = useScrollReveal();
  const reduced = useReducedMotion();
  const toStart = () => document.getElementById('start')?.scrollIntoView({ behavior: reduced ? 'auto' : 'smooth' });

  const why = [
    {
      title: t('Đúng brand DIGI-TEXX', 'On brand by default'),
      text: t('Màu, chữ và logo theo Branding Guidelines 2024. Roboto, xanh DIGI-TEXX #2582D7 dẫn dắt, logo luôn là file gốc.', 'Colour, type and logo follow the 2024 Branding Guidelines. Roboto, DIGI-TEXX Blue #2582D7 leads, logos are always the original files.'),
      art: (
        <div className="pg-why__art grid content-center gap-1.5" aria-hidden>
          {[['var(--dtx-blue)', '100%'], ['var(--dtx-navy)', '64%'], ['var(--dtx-light)', '44%'], ['var(--dtx-lime)', '28%']].map(([c, w], i) => (
            <i key={c} className="pg-grow block h-3.5 rounded-[2px]" style={{ background: c, width: w, '--j': i } as CSSProperties} />
          ))}
        </div>
      ),
    },
    {
      title: t('Sáng và tối cho mọi thứ', 'Light and dark for everything'),
      text: t('Mọi màu đi qua token --dtx-*. Đặt data-theme lên bất kỳ khối nào, cả khối đổi theo, chữ cũng vậy.', 'Every colour goes through --dtx-* tokens. Put data-theme on any block and the whole block follows, text included.'),
      art: <ThemePair />,
    },
    {
      title: t('WCAG 2.2 AA được đo', 'WCAG 2.2 AA, measured'),
      text: t('npm test kiểm tra tương phản của token; test:a11y đo màu trình duyệt thật sự vẽ, ở cả hai giao diện.', 'npm test checks token contrast; test:a11y measures what the browser actually paints, in both themes.'),
      art: (
        <ul className="pg-why__art m-0 grid list-none content-center gap-2 p-0 text-sm">
          {[t('Chữ thường ≥ 4.5:1', 'Body text ≥ 4.5:1'), t('Chữ lớn, viền, icon ≥ 3:1', 'Large text, borders, icons ≥ 3:1'), t('Focus luôn nhìn thấy', 'Focus always visible')].map((l, i) => (
            <li key={l} className="pg-rise flex items-center gap-2" style={{ '--j': i } as CSSProperties}><Check className="size-4 flex-none text-[var(--dtx-tone-ok)]" aria-hidden />{l}</li>
          ))}
        </ul>
      ),
    },
    {
      title: t('Sẵn cho bài toán AI', 'Built for AI work'),
      text: t('Khung OCR, độ tin cậy, hiệu ứng quét, so sánh trước/sau và tiền xử lý: hiển thị kết quả AI mà không phải tự vẽ.', 'OCR boxes, confidence, the scan effect, before/after and preprocessing: show AI results without drawing them yourself.'),
      art: (
        <div className="pg-why__art grid content-center gap-2.5" aria-hidden>
          {[98.6, 84.2, 61.5].map((v, i) => <div key={v} className="pg-grow" style={{ '--j': i } as CSSProperties}><ConfidenceBar value={v} /></div>)}
        </div>
      ),
    },
  ];

  const steps = [
    {
      title: t('Thêm kit vào app', 'Add the kit to your app'),
      text: t('App nằm trong kit/apps/ dùng chung workspace, rồi chạy npm install ở thư mục kit.', 'Apps live in kit/apps/ and share the workspace; then run npm install in kit.'),
      code: '// kit/apps/<your-app>/package.json\n"dependencies": {\n  "@dtx/tokens": "0.1.0",\n  "@dtx/ui": "0.1.0"\n}',
    },
    {
      title: t('Nạp CSS', 'Load the CSS'),
      text: t('Kit nằm dưới các utility của Tailwind. Tailwind là tuỳ chọn.', 'The kit sits under Tailwind utilities. Tailwind is optional.'),
      code: '@layer theme, base, dtx, components, utilities;\n@import "tailwindcss";               /* optional */\n@import "@dtx/tokens/fonts.css";\n@import "@dtx/ui/styles.css";\n@import "@dtx/tokens/tailwind.css";  /* optional */',
    },
    {
      title: t('Dùng component', 'Use the components'),
      text: t('Bọc app bằng hai provider một lần, sau đó import component cần dùng.', 'Wrap the app in the two providers once, then import what you need.'),
      code: "import { Button, ToastProvider, TooltipProvider } from '@dtx/ui';\n\nexport function App() {\n  return (\n    <TooltipProvider><ToastProvider>\n      <Button>Tạo lô mới</Button>\n    </ToastProvider></TooltipProvider>\n  );\n}",
    },
  ];

  return (
    <main ref={root} className="pg-home">
      <TechBackdrop className="border-b border-border">
        <div className="mx-auto grid max-w-[1240px] items-center gap-14 px-4 pt-14 pb-20 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.05fr)]">
          <Reveal>
            <Display>{t(<>DIGI-TEXX<br /><em>Frontend Kit</em></>, <>DIGI-TEXX<br /><em>Frontend Kit</em></>)}</Display>
            <div className="mt-6"><Lede>{t('Bộ component React, design token và mẫu giao diện AI dùng chung cho sản phẩm và POC của DIGI-TEXX. Đúng brand, đủ sáng tối, đạt WCAG 2.2 AA ngay từ dòng code đầu tiên.', 'React components, design tokens and AI interface patterns shared by every DIGI-TEXX product and POC. On brand, light and dark, WCAG 2.2 AA from the first line of code.')}</Lede></div>
            <div className="mt-8 flex flex-wrap gap-3">
              <Button size="lg" href="#/catalog">{t('Xem danh mục', 'Browse the catalog')}<ArrowRight /></Button>
              <Button size="lg" variant="secondary" onClick={toStart}>{t('Bắt đầu sử dụng', 'Get started')}</Button>
            </div>
            <dl className="mt-12 grid max-w-xl grid-cols-2 gap-x-8 gap-y-6 border-t border-border pt-6 sm:grid-cols-4">
              <Stat value={<CountUp value={ready.length} duration={1200} />} label={t('mục sẵn dùng', 'entries ready')} />
              <Stat value={<CountUp value={aiEntries.length} duration={1200} />} label={t('thành phần AI', 'AI components')} />
              <Stat value="2" label={t('giao diện sáng, tối', 'themes, light and dark')} />
              <Stat value="AA" label="WCAG 2.2" />
            </dl>
          </Reveal>
          <Reveal effect="scale" delay={150}><HeroDemo /></Reveal>
        </div>
      </TechBackdrop>

      <section className="mx-auto max-w-[1240px] px-4 py-20" aria-labelledby="why-h">
        <div data-reveal=""><SectionHeader id="why-h" title={t('Có gì trong kit', 'What the kit gives you')} description={t('Những quyết định khó đã được làm một lần, kiểm tra tự động, để mỗi sản phẩm không phải làm lại.', 'The hard decisions are made once and checked automatically, so no product has to make them again.')} /></div>
        <div className="mt-10 grid gap-x-8 gap-y-10 sm:grid-cols-2 lg:grid-cols-4">
          {why.map((w, i) => (
            <article key={w.title} data-reveal="" className="pg-why grid content-start gap-3 border-t border-border pt-5" style={{ '--i': i } as CSSProperties}>
              {w.art}
              <h3 className="m-0 mt-2 text-lg font-bold">{w.title}</h3>
              <p className="m-0 text-sm text-fg-muted">{w.text}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="border-y border-border bg-[var(--pg-band)]" aria-labelledby="gallery-h">
        <div className="mx-auto max-w-[1240px] px-4 py-20">
          <div data-reveal="" className="flex flex-wrap items-end justify-between gap-6">
            <SectionHeader id="gallery-h" title={t(`${ready.length} mục, ví dụ chạy thật`, `${ready.length} entries, live examples`)} description={t(`${categories.length} nhóm, từ token tới component AI. Mỗi mục có ví dụ tương tác, dòng import và bảng props lấy từ README.`, `${categories.length} groups, from tokens to AI components. Each entry has interactive examples, an import line and a props table taken from its README.`)} />
            <Button variant="secondary" href="#/catalog">{t('Xem toàn bộ', 'See all')}<ArrowRight /></Button>
          </div>
          <Carousel className="mt-10" aria-label={t('Component nổi bật', 'Featured components')} autoPlay interval={1000}>
            {pages.map((page, p) => (
              <ul key={p} className="m-0 grid list-none grid-cols-[repeat(auto-fill,minmax(232px,1fr))] gap-4 p-0">
                {/* only the first page reveals on scroll: later pages sit off to the side, where the observer never sees them */}
                {page.map((e, i) => <li key={e.id} data-reveal={p ? undefined : ''} className="min-w-0" style={{ '--i': i % 4 } as CSSProperties}><Tile e={e} /></li>)}
              </ul>
            ))}
          </Carousel>
        </div>
      </section>

      <section className="mx-auto grid max-w-[1240px] items-center gap-12 px-4 py-20 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]" aria-labelledby="ai-h">
        <div data-reveal="" className="grid gap-6">
          <SectionHeader id="ai-h" title={t('Kết quả AI, nhìn là hiểu', 'AI results people can read')} description={t('Người duyệt cần so ảnh gốc với cái AI đọc được. Kit có sẵn các mảnh đó, dùng riêng hoặc ghép lại.', 'Reviewers need to compare the original with what the AI read. The kit has those pieces, alone or combined.')} />
          <ul className="m-0 flex list-none flex-wrap gap-2 p-0">
            {aiEntries.map(e => <li key={e.id}><a href={`#/catalog/${e.id}`} className="pg-chip">{e.name}</a></li>)}
          </ul>
        </div>
        <div data-reveal="" className="grid justify-items-center gap-3" style={{ '--i': 1 } as CSSProperties}>
          <div className="w-full max-w-sm"><CompareSlider {...demoPair('binarize', <SampleInvoice />)} /></div>
          <p className="m-0 text-sm text-fg-muted">{t('Kéo, hoặc Tab tới thanh trượt rồi dùng ←/→.', 'Drag, or Tab to the slider and use ←/→.')}</p>
        </div>
      </section>

      <section id="start" className="scroll-mt-20 border-t border-border bg-surface" aria-labelledby="start-h">
        <div className="mx-auto max-w-[1240px] px-4 py-20">
          <div data-reveal=""><SectionHeader id="start-h" title={t('Bắt đầu trong ba bước', 'Start in three steps')} description={t('Kit là workspace nội bộ, chưa phát hành lên npm.', 'The kit is an internal workspace, not published to npm.')} /></div>
          <ol className="m-0 mt-10 grid list-none gap-6 p-0 lg:grid-cols-3">
            {steps.map((s, i) => (
              <li key={s.title} data-reveal="" className="grid min-w-0 content-start gap-3" style={{ '--i': i } as CSSProperties}>
                <div className="flex items-center gap-3">
                  <span className="pg-step-n dtx-num" aria-hidden>{i + 1}</span>
                  <h3 className="m-0 text-lg font-bold">{s.title}</h3>
                </div>
                <p className="m-0 text-sm text-fg-muted">{s.text}</p>
                <CopyCode code={s.code} />
              </li>
            ))}
          </ol>
        </div>
      </section>

      <TechBackdrop circuit={false}>
        <div className="mx-auto flex max-w-[1240px] flex-wrap items-center justify-between gap-8 px-4 py-16">
          <div data-reveal="" className="grid gap-3">
            <Display as="h2">{t(<>Giao diện <em>DIGI-TEXX</em>,<br />nhanh hơn</>, <><em>DIGI-TEXX</em> interfaces,<br />faster</>)}</Display>
            <p className="m-0 max-w-xl text-fg-muted">{t('Xem ví dụ thật trong App demo, hoặc mở danh mục để chọn component.', 'See it working in the App demo, or open the catalog to pick components.')}</p>
          </div>
          <div data-reveal="" className="flex flex-wrap gap-3" style={{ '--i': 1 } as CSSProperties}>
            <Button size="lg" href="#/catalog">{t('Xem danh mục', 'Browse the catalog')}<ArrowRight /></Button>
            <Button size="lg" variant="secondary" href="#/app">{t('Mở App demo', 'Open the App demo')}</Button>
          </div>
        </div>
        <footer className="border-t border-border">
          <div className="mx-auto flex max-w-[1240px] flex-wrap items-center gap-6 px-4 py-6 text-sm text-fg-muted">
            <Logo variant="horizontal-white" width={130} />
            <span>Frontend Kit v0.1</span>
            <span className="ml-auto">© 2026 DIGI-TEXX Vietnam</span>
          </div>
        </footer>
      </TechBackdrop>
    </main>
  );
}
