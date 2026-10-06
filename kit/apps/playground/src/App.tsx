import { useEffect, useState } from 'react';
import { Logo, ThemeToggle } from '@dtx/ui';
import { Website } from './pages/Website';
import { AppDemo } from './pages/AppDemo';
import { Poc } from './pages/Poc';
import { Catalog } from './catalog/Catalog';

const useHash = () => {
  const [h, setH] = useState(location.hash || '#/catalog');
  useEffect(() => { const f = () => setH(location.hash || '#/catalog'); addEventListener('hashchange', f); return () => removeEventListener('hashchange', f); }, []);
  return h;
};
const NAV = [['catalog', 'Danh mục'], ['website', 'Website'], ['app', 'App'], ['poc', 'POC']] as const;

export function App() {
  const hash = useHash();
  const [, page, id] = hash.split('/');
  useEffect(() => { scrollTo(0, 0); }, [page, id]);
  return (
    // App demo fills the viewport (below this header) like a real app; other pages scroll as documents
    <div className={page === 'app' ? 'flex h-dvh flex-col max-[960px]:h-auto' : undefined}>
      <header className="sticky top-0 z-40 border-b border-border bg-[color-mix(in_srgb,var(--dtx-bg)_82%,transparent)] backdrop-blur-md">
        <div className="mx-auto flex max-w-[1400px] flex-wrap items-center gap-4 px-4 py-2.5">
          <a href="#/catalog" className="flex items-center gap-2.5 text-sm font-bold text-fg no-underline"><Logo variant="square" width={38} />Frontend Kit <span className="font-normal text-fg-muted">v0.1</span></a>
          <nav aria-label="Trang" className="dtx-seg">
            {NAV.map(([p, l]) => <a key={p} href={`#/${p}`} className="dtx-seg__item inline-flex items-center no-underline" data-pressed={page === p ? '' : undefined} aria-current={page === p ? 'page' : undefined}>{l}</a>)}
          </nav>
          <span className="ml-auto" />
          <ThemeToggle />
        </div>
      </header>
      {page === 'website' ? <Website /> : page === 'app' ? <AppDemo /> : page === 'poc' ? <Poc /> : <Catalog id={id} go={i => { location.hash = i ? `#/catalog/${i}` : '#/catalog'; }} />}
    </div>
  );
}
