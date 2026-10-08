import { useMemo, useState, type ReactNode } from 'react';
import { Check, Copy, RotateCcw } from 'lucide-react';
import { Badge, Button, Card, DataTable, Input, Reveal, Segmented } from '@dtx/ui';
import { categories, entries, type Entry } from './entries';
import { Stage } from './demos';
import { Overview } from './overview';
import { useT } from '../i18n';
import { readPropsDocs } from '../../../../packages/ui/src/props-doc';

// Props come from the components' READMEs, the same tables `npm test` checks against the source (docs.check.ts)
const readmes = import.meta.glob<string>('../../../../packages/ui/src/**/README.md', { query: '?raw', import: 'default', eager: true });
const propsDocs = new Map(Object.values(readmes).flatMap(readPropsDocs).map(d => [d.name, d]));
/** README blocks for the names in an entry's import line, e.g. "Notification, type NotificationItem". */
const docsFor = (importLine?: string) => (/\{([^}]*)\}/.exec(importLine ?? '')?.[1].split(',') ?? []).map(n => n.trim().replace(/^type /, '')).flatMap(n => propsDocs.get(n) ?? []);
/** `code` and **bold** of a README cell. */
const inline = (s: string) => s.split(/(`[^`]+`|\*\*[^*]+\*\*)/).map((p, i) =>
  p.startsWith('`') && p.endsWith('`') && p.length > 1 ? <code key={i}>{p.slice(1, -1)}</code> : p.startsWith('**') && p.endsWith('**') && p.length > 4 ? <b key={i} className="font-medium text-fg">{p.slice(2, -2)}</b> : p);

const fold = (s: string) => s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/đ/g, 'd');

export function CopyCode({ code }: { code: string }) {
  const t = useT();
  const [done, setDone] = useState(false);
  // min-w-0: a long import line scrolls inside the block instead of widening the page on phones
  return (
    <div className="relative min-w-0">
      <pre className="pg-code">{code}</pre>
      <Button size="sm" variant="ghost" icon aria-label={t('Sao chép', 'Copy')} className="!absolute top-1.5 right-1.5 !text-[#C9CBD1]"
        onClick={() => navigator.clipboard.writeText(code).then(() => { setDone(true); setTimeout(() => setDone(false), 1400); }, () => {})}>
        {done ? <Check /> : <Copy />}
      </Button>
    </div>
  );
}

export type DemoTheme = 'both' | 'light' | 'dark';

/** Demos render in light by default; "Light + Dark" shows both side by side (the a11y check always uses it). */
function Themed({ theme, plain, children }: { theme: 'light' | 'dark'; plain?: boolean; children: ReactNode }) {
  const t = useT();
  return plain
    ? <div data-theme={theme} className="min-w-0 rounded-md bg-bg p-3"><span className="mb-2 block text-[11px] font-medium tracking-[.08em] text-fg-muted uppercase">{theme === 'dark' ? t('Tối', 'Dark') : t('Sáng', 'Light')}</span>{children}</div>
    : <Stage theme={theme}>{children}</Stage>;
}

function DemoBlock({ d, theme }: { d: Entry['demos'][number]; theme: DemoTheme }) {
  const t = useT();
  const [run, setRun] = useState(0);
  const themes: Array<'light' | 'dark'> = d.only ? [d.only] : theme === 'both' ? ['light', 'dark'] : [theme];
  return (
    <Card>
      <div className="flex items-center gap-3 border-b border-border px-4 py-2.5">
        <h3 className="m-0 text-sm font-medium">{d.title}</h3>
        {d.replay && <Button size="sm" variant="ghost" className="ml-auto" onClick={() => setRun(r => r + 1)}><RotateCcw />{t('Chạy lại', 'Replay')}</Button>}
      </div>
      <div className="grid gap-3 p-4">
        {d.note && <p className="m-0 text-xs text-fg-muted">{d.note}</p>}
        {d.only && <p className="m-0 text-xs text-fg-muted">{t(`Chỉ dùng trên nền ${d.only === 'dark' ? 'tối' : 'sáng'} (theme-fixed).`, `For ${d.only} backgrounds only (theme-fixed).`)}</p>}
        <div className={themes.length > 1 && !d.plain ? 'grid gap-3 xl:grid-cols-2' : 'grid gap-3'}>
          {themes.map(t => <Themed key={t} theme={t} plain={d.plain}>{d.render(run)}</Themed>)}
        </div>
        {d.code && <CopyCode code={d.code} />}
      </div>
    </Card>
  );
}

function EntryView({ e, theme, setTheme }: { e: Entry; theme: DemoTheme; setTheme: (t: DemoTheme) => void }) {
  const t = useT();
  const cat = categories.find(c => c.id === e.category)!;
  const docs = docsFor(e.importLine);
  return (
    <Reveal key={e.id} className="grid gap-6">
      <header className="grid gap-2">
        <span className="text-xs font-medium tracking-[.1em] text-link uppercase">{e.category} · <code className="normal-case tracking-normal">{cat.folder}</code></span>
        <div className="flex flex-wrap items-center gap-3">
          <h1 className="m-0 text-3xl font-bold tracking-tight">{e.name}</h1>
          {e.status === 'ready' ? <Badge tone="ok" variant="surface" dot>{t('Đã có', 'Ready')}</Badge> : <Badge tone="neutral" variant="outline">{t('Dự kiến', 'Planned')}</Badge>}
        </div>
        <p className="m-0 max-w-[68ch] text-fg-muted">{e.summary}</p>
      </header>
      {e.importLine && <CopyCode code={e.importLine} />}
      {e.demos.length > 0 && (
        <div className="flex flex-wrap items-center gap-3 text-xs text-fg-muted">
          <Segmented aria-label={t('Giao diện của ví dụ', 'Example theme')} value={theme} onValueChange={v => setTheme(v as DemoTheme)} options={[{ value: 'both', label: t('Sáng + Tối', 'Light + Dark') }, { value: 'light', label: t('Sáng', 'Light') }, { value: 'dark', label: t('Tối', 'Dark') }]} />
          {t('Chọn Sáng + Tối để xem mỗi ví dụ trong cả hai giao diện. Popup (Select, Tooltip, Dialog) mở theo giao diện của trang.', 'Pick Light + Dark to see every example in both themes. Popups (Select, Tooltip, Dialog) open in the page theme.')}
        </div>
      )}
      {e.status === 'planned' && <Card className="p-6 text-sm text-fg-muted">{t('Chưa có. Mục này nằm trong lộ trình, để FE biết cái gì sắp có và tránh tự viết trùng.', 'Not built yet. It is on the roadmap so FE knows what is coming and does not write a duplicate.')}</Card>}
      {e.demos.map(d => <DemoBlock key={d.title} d={d} theme={theme} />)}
      {docs.length > 0 && (
        <Card>
          <div className="border-b border-border px-4 py-2.5"><h3 className="m-0 text-sm font-medium">Props</h3></div>
          {docs.map(d => (
            <section key={d.name} className="border-b border-border last:border-b-0">
              {docs.length > 1 && <h4 className="m-0 px-4 pt-3 text-sm font-medium"><code>{d.name}</code></h4>}
              {d.rows.length > 0 && <DataTable caption={`${d.name} props`} rowKey={r => r[0]} rows={d.rows} columns={[
                { key: 'n', header: 'Prop', render: r => <span className="text-xs text-link">{inline(r[0])}</span> },
                { key: 't', header: 'Type', render: r => <span className="text-xs whitespace-normal">{inline(r[1])}</span> },
                { key: 'v', header: 'Default', render: r => <span className="text-xs whitespace-normal">{inline(r[2])}</span> },
                { key: 'd', header: 'Description', render: r => <span className="text-xs whitespace-normal text-fg-muted">{inline(r[3])}</span> }]} />}
              {d.note && <p className="m-0 max-w-[80ch] px-4 py-3 text-xs text-fg-muted">{inline(d.note)}</p>}
            </section>
          ))}
        </Card>
      )}
    </Reveal>
  );
}

export function Catalog({ id, go }: { id?: string; go: (id?: string) => void }) {
  const t = useT();
  const [q, setQ] = useState('');
  const [theme, setTheme] = useState<DemoTheme>('light');
  const shown = useMemo(() => entries.filter(e => !q || fold(`${e.name} ${e.summary} ${e.category}`).includes(fold(q))), [q]);
  const entry = entries.find(e => e.id === id);
  const groups = [{ title: null, cats: categories.filter(c => !c.id.startsWith('AI')) }, { title: 'AI', cats: categories.filter(c => c.id.startsWith('AI')) }];
  return (
    <div className="mx-auto grid max-w-[1400px] gap-6 px-4 py-6 lg:grid-cols-[264px_minmax(0,1fr)]">
      <aside className="lg:sticky lg:top-[72px] lg:max-h-[calc(100vh-88px)] lg:self-start lg:overflow-y-auto" aria-label={t('Mục lục', 'Contents')}>
        <div className="grid gap-2 pb-3">
          <Input placeholder={t('Tìm thành phần…', 'Search components…')} value={q} onChange={e => setQ(e.target.value)} aria-label={t('Tìm thành phần', 'Search components')} />
        </div>
        <button type="button" onClick={() => go()} className={`dtx-sidebar__item w-full border-0 bg-transparent text-left ${!entry ? 'aria-[current]:' : ''}`} aria-current={!entry ? 'page' : undefined}>{t('Tổng quan', 'Overview')}</button>
        {groups.map(g => (
          <div key={g.title ?? 'ui'}>
            {g.title && <div className="mt-4 mb-1 border-t border-border px-2.5 pt-3 text-[11px] font-bold tracking-[.12em] text-fg uppercase">{g.title}</div>}
            {g.cats.map(c => {
              const list = shown.filter(e => e.category === c.id);
              if (!list.length) return null;
              return (
                <div key={c.id} className="mt-3">
                  <div className="flex items-center justify-between px-2.5 pb-1 text-[11px] font-medium tracking-[.06em] text-fg-muted uppercase">
                    <span>{g.title ? c.id.replace('AI · ', '') : c.id}</span>
                    <span className="dtx-num normal-case">{entries.filter(e => e.category === c.id && e.status === 'ready').length}/{entries.filter(e => e.category === c.id).length}</span>
                  </div>
                  {list.map(e => (
                    <a key={e.id} href={`#/catalog/${e.id}`} className="dtx-sidebar__item" aria-current={e.id === id ? 'page' : undefined}>
                      <i className={`block size-1.5 flex-none rounded-[1px] ${e.status === 'ready' ? 'bg-lime' : 'bg-border-strong'}`} aria-label={e.status === 'ready' ? t('Đã có', 'Ready') : t('Dự kiến', 'Planned')} />
                      <span className="truncate">{e.name}</span>
                    </a>
                  ))}
                </div>
              );
            })}
          </div>
        ))}
        {!shown.length && <p className="px-2.5 text-xs text-fg-muted">{t('Không có mục nào khớp.', 'No matching entries.')}</p>}
      </aside>
      <div className="min-w-0">{entry ? <EntryView e={entry} theme={theme} setTheme={setTheme} /> : <Overview shown={shown} />}</div>
    </div>
  );
}
