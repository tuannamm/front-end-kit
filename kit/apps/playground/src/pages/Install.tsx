import type { ReactNode } from 'react';
import { Tabs } from '@dgtx/ui-frek';
import { CopyCode } from '../catalog/Catalog';
import { useT, type Translate } from '../i18n';

const REGISTRY = 'https://nexus.digi-texx.vn/repository/npm/';
const CSS_TAILWIND = '@layer theme, base, dtx, components, utilities;  /* first line */\n@import "tailwindcss";\n@import "@dgtx/ui-frek/fonts.css";\n@import "@dgtx/ui-frek/styles.css";\n@import "@dgtx/ui-frek/tailwind.css";              /* bg-surface, text-fg-muted… */';
const CSS_PLAIN = '@import "@dgtx/ui-frek/fonts.css";\n@import "@dgtx/ui-frek/styles.css";';

/** The setup steps, shared by the home page (short form) and the install page (with details), so they never drift apart. */
export const setupSteps = (t: Translate) => [
  {
    id: 'install',
    title: t('Cài gói từ Nexus', 'Install from Nexus'),
    text: t('Gói chỉ có trên Nexus của công ty: trỏ npm về Nexus một lần, rồi cài.', 'The package lives only on the company Nexus: point npm at it once, then install.'),
    code: `npm config set registry ${REGISTRY}\nnpm i @dgtx/ui-frek`,
  },
  {
    id: 'css',
    title: t('Nạp CSS', 'Load the CSS'),
    text: t('Kit nằm dưới các utility của Tailwind. Tailwind là tuỳ chọn.', 'The kit sits under Tailwind utilities. Tailwind is optional.'),
    code: CSS_TAILWIND,
  },
  {
    id: 'use',
    title: t('Dùng component', 'Use the components'),
    text: t('Bọc app bằng hai provider một lần, sau đó import component cần dùng.', 'Wrap the app in the two providers once, then import what you need.'),
    code: "import { Button, ToastProvider, TooltipProvider } from '@dgtx/ui-frek';\n\nexport function App() {\n  return (\n    <TooltipProvider><ToastProvider>\n      <Button>Tạo lô mới</Button>\n    </ToastProvider></TooltipProvider>\n  );\n}",
  },
];

export function Install() {
  const t = useT();
  const steps = setupSteps(t);
  const more: Record<string, ReactNode> = {
    install: (
      <>
        <p className="m-0">{t(<>Lệnh trên ghi dòng <code>registry=</code> vào <code>~/.npmrc</code> (Windows: <code>%USERPROFILE%\.npmrc</code>). Muốn sửa tay thì thêm đúng dòng này vào file đó:</>, <>The command writes a <code>registry=</code> line to <code>~/.npmrc</code> (Windows: <code>%USERPROFILE%\.npmrc</code>). To edit it by hand, add exactly this line to that file:</>)}</p>
        <CopyCode code={`registry=${REGISTRY}`} />
        <p className="m-0">{t(<>Bản thử nghiệm: <code>npm i @dgtx/ui-frek@alpha</code>. Không có tag thì npm luôn cài bản ổn định mới nhất.</>, <>Pre-release: <code>npm i @dgtx/ui-frek@alpha</code>. Without a tag npm always installs the latest stable version.</>)}</p>
      </>
    ),
    css: (
      <>
        <Tabs className="min-w-0" items={[
          { value: 'tw', label: t('Có Tailwind', 'With Tailwind'), content: <CopyCode code={CSS_TAILWIND} /> },
          { value: 'plain', label: t('Không Tailwind', 'Without Tailwind'), content: <CopyCode code={CSS_PLAIN} /> },
        ]} />
        <p className="m-0">{t('Đặt vào file CSS gốc của app. Thứ tự import là thứ tự cascade, nên giữ nguyên.', 'Put this in the app\'s root CSS file. Import order is cascade order, so keep it as is.')}</p>
      </>
    ),
    use: <p className="m-0">{t(<>Props của từng component nằm trong <a href="#/catalog">Danh mục</a>, kèm dòng import để sao chép.</>, <>Every component's props are in the <a href="#/catalog">Catalog</a>, with an import line to copy.</>)}</p>,
  };

  return (
    <main className="pg-doc mx-auto grid max-w-[960px] gap-12 px-4 py-6">
      <header className="grid gap-2">
        <h1 className="m-0 text-3xl font-bold tracking-tight">{t('Cài đặt', 'Installation')}</h1>
        <p className="m-0 max-w-[68ch] text-fg-muted">{t(<>Đưa <code>@dgtx/ui-frek</code> vào một app React: component, CSS và design token trong một gói.</>, <>Add <code>@dgtx/ui-frek</code> to a React app: components, CSS and design tokens in one package.</>)}</p>
      </header>

      <section className="grid gap-6" aria-labelledby="steps-h">
        <h2 id="steps-h" className="m-0 text-xl font-bold">{t('Các bước', 'Steps')}</h2>
        <ol className="m-0 grid list-none gap-10 p-0">
          {steps.map((s, i) => (
            <li key={s.id} className="grid min-w-0 gap-3 border-t border-border pt-5">
              <div className="flex items-center gap-3">
                <span className="pg-step-n dtx-num" aria-hidden>{i + 1}</span>
                <h3 className="m-0 text-lg font-bold">{s.title}</h3>
              </div>
              <p className="m-0 max-w-[68ch] text-fg-muted">{s.text}</p>
              {/* the CSS step shows its two variants as tabs instead */}
              {s.id !== 'css' && <CopyCode code={s.code} />}
              <div className="grid min-w-0 gap-3 text-sm text-fg-muted [&>p]:max-w-[68ch]">{more[s.id]}</div>
            </li>
          ))}
        </ol>
      </section>
    </main>
  );
}
