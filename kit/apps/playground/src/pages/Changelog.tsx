import { useMemo, useState } from 'react';
import { changelog, type ChangeUnit } from 'virtual:changelog';
import { Badge, Button, EmptyState, Pagination, Segmented, Select, Timeline, type Tone } from '@dgtx/ui-frek';
import { entries, type Entry } from '../catalog/entries';
import { useT } from '../i18n';

type Kind = 'new' | 'improve' | 'fix' | 'other';
/** Commit subjects follow `type(scope): text`; the type word says what kind of change it was. Unknown words read as "other". */
const KIND: Record<string, Kind> = { implement: 'new', add: 'new', init: 'new', enhance: 'improve', update: 'improve', refactor: 'improve', fix: 'fix' };
const TONE: Record<Kind, Tone> = { new: 'ok', improve: 'brand', fix: 'warn', other: 'neutral' };
const PAGE_SIZE = 20;

function parse(subject: string) {
  const m = /^(\w+)(?:\(([^)]*)\))?:\s*(.+)$/.exec(subject);
  return m ? { kind: KIND[m[1].toLowerCase()] ?? 'other', text: m[3] } : { kind: 'other' as const, text: subject };
}

/** Catalog entries by the names their import line brings in, so a changed file links to the entries that use it. */
const byName = new Map<string, Entry[]>();
for (const e of entries) for (const n of /import \{([^}]*)\}/.exec(e.importLine ?? '')?.[1].split(',') ?? []) {
  const name = n.trim();
  if (name) byName.set(name, [...(byName.get(name) ?? []), e]);
}
const entriesOf = (units: ChangeUnit[]) => [...new Set(units.flatMap(u => u.names.flatMap(n => byName.get(n) ?? [])))];

const commits = (changelog ?? []).map(c => {
  const linked = entriesOf(c.units);
  // units that name no catalog entry: shared files (README, styles.css), tokens, or files that no longer exist
  const loose = c.units.filter(u => !u.names.some(n => byName.has(n))).map(u => u.label);
  return { ...c, ...parse(c.subject), linked, loose };
});
const touched = [...new Set(commits.flatMap(c => c.linked))].sort((a, b) => a.name.localeCompare(b.name));

/** `id`: a catalog entry id from the URL (#/changelog/<id>), so a component's history can be linked to. */
export function Changelog({ id, go }: { id?: string; go: (id?: string) => void }) {
  const t = useT();
  const [kind, setKind] = useState<Kind | 'all'>('all');
  const [page, setPage] = useState(1);
  const entry = touched.find(e => e.id === id);
  const shown = useMemo(() => commits.filter(c => (kind === 'all' || c.kind === kind) && (!entry || c.linked.includes(entry))), [kind, entry]);
  const words: Record<Kind, string> = { new: t('Mới', 'New'), improve: t('Cải tiến', 'Improved'), fix: t('Sửa lỗi', 'Fixed'), other: t('Khác', 'Other') };
  const pick = (k: string) => { setKind(k as Kind | 'all'); setPage(1); };
  const clear = () => { pick('all'); go(); };

  return (
    <main className="mx-auto grid max-w-[960px] gap-6 px-4 py-6">
      <header className="grid gap-2">
        <h1 className="m-0 text-3xl font-bold tracking-tight">{t('Nhật ký thay đổi', 'Changelog')}</h1>
        <p className="m-0 max-w-[68ch] text-fg-muted">
          {t('Mọi commit chạm vào kit/packages/, lấy thẳng từ git khi build, kèm các component bị ảnh hưởng.', 'Every commit that touched kit/packages/, read from git at build time, with the components it changed.')}
        </p>
      </header>

      {changelog === null ? (
        <EmptyState tone="err" title={t('Bản build này không có lịch sử git', 'This build has no git history')}>
          {t('Chạy npm run dev hoặc npm run build trong bản sao có thư mục .git.', 'Run npm run dev or npm run build in a clone that has its .git folder.')}
        </EmptyState>
      ) : !commits.length ? (
        <EmptyState title={t('Chưa có thay đổi nào', 'No changes yet')}>{t('Commit đầu tiên vào kit/packages/ sẽ hiện ở đây.', 'The first commit to kit/packages/ shows up here.')}</EmptyState>
      ) : (
        <>
          <div className="flex flex-wrap items-center gap-3">
            <Segmented aria-label={t('Loại thay đổi', 'Kind of change')} value={kind} onValueChange={pick}
              options={[{ value: 'all', label: t('Tất cả', 'All') }, ...(['new', 'improve', 'fix'] as const).map(k => ({ value: k, label: words[k] }))]} />
            <div className="w-full sm:w-72"><Select aria-label={t('Component', 'Component')} searchable searchPlaceholder={t('Tìm component…', 'Find a component…')}
              value={entry?.id ?? 'all'} onValueChange={v => { setPage(1); go(v && v !== 'all' ? v : undefined); }}
              items={[{ value: 'all', label: t('Tất cả component', 'All components') }, ...touched.map(e => ({ value: e.id, label: e.name, description: e.category }))]} /></div>
            <span className="text-sm text-fg-muted" aria-live="polite">{t(`${shown.length} thay đổi`, `${shown.length} ${shown.length === 1 ? 'change' : 'changes'}`)}</span>
          </div>

          {!shown.length ? (
            <EmptyState title={t('Không có thay đổi nào khớp bộ lọc', 'No changes match these filters')} action={<Button variant="secondary" onClick={clear}>{t('Xoá bộ lọc', 'Clear filters')}</Button>}>
              {t('Thử loại thay đổi hoặc component khác.', 'Try another kind of change or component.')}
            </EmptyState>
          ) : (
            <>
              <Timeline timeStyle="absolute" aria-label={t('Các thay đổi, mới nhất trước', 'Changes, newest first')}
                items={shown.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE).map(c => ({
                  time: c.date,
                  tone: TONE[c.kind],
                  title: <span className="inline-flex flex-wrap items-center gap-2">{c.text}<Badge size="sm" tone={TONE[c.kind]} variant="outline">{words[c.kind]}</Badge></span>,
                  description: (
                    <div className="grid gap-2">
                      {!!c.linked.length && (
                        <ul className="m-0 flex list-none flex-wrap gap-2 p-0">
                          {c.linked.map(e => <li key={e.id}><a href={`#/catalog/${e.id}`} className="pg-chip">{e.name}</a></li>)}
                        </ul>
                      )}
                      <span className="text-xs text-fg-muted">
                        <span className="dtx-num">{c.hash}</span>
                        {!!c.loose.length && <> · {t('Tệp khác', 'Other files')}: {c.loose.join(', ')}</>}
                      </span>
                    </div>
                  ),
                }))} />
              {shown.length > PAGE_SIZE && <Pagination page={page} total={shown.length} pageSize={PAGE_SIZE} onPageChange={setPage} itemLabel={t('thay đổi', 'changes')} />}
            </>
          )}
        </>
      )}
    </main>
  );
}
