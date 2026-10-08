import { useEffect, useState } from 'react';
import { Logo, Segmented, ThemeToggle } from '@dtx/ui';
import { setLang, useLang, useT, type Lang } from './i18n';
import { Website } from './pages/Website';
import { AppDemo } from './pages/AppDemo';
import { Poc } from './pages/Poc';
import { Catalog } from './catalog/Catalog';
import { Home } from './pages/Home';

const useHash = () => {
  const [h, setH] = useState(location.hash || '#/home');
  useEffect(() => { const f = () => setH(location.hash || '#/home'); addEventListener('hashchange', f); return () => removeEventListener('hashchange', f); }, []);
  return h;
};
const NAV = [['home', 'Giới thiệu', 'Home'], ['catalog', 'Danh mục', 'Catalog'], ['website', 'Website', 'Website'], ['app', 'App', 'App'], ['poc', 'POC', 'POC']] as const;

export function App() {
  const t = useT();
  const lang = useLang();
  const hash = useHash();
  const [, page, id] = hash.split('/');
  useEffect(() => { scrollTo(0, 0); }, [page, id]);
  // the product demos keep the kit's own palette; the kit's home and catalog wear the brand-tinted one
  const brand = !['website', 'app', 'poc'].includes(page);
  const prefs = (
    <div className="flex items-center gap-2">
      <Segmented aria-label="Ngôn ngữ / Language" value={lang} onValueChange={v => setLang(v as Lang)} options={[{ value: 'vi', label: 'VI' }, { value: 'en', label: 'EN' }]} />
      <ThemeToggle />
    </div>
  );
  const view = page === 'website' ? <Website /> : page === 'app' ? <AppDemo /> : page === 'poc' ? <Poc /> : page === 'catalog' ? <Catalog id={id} go={i => { location.hash = i ? `#/catalog/${i}` : '#/catalog'; }} /> : null;
  return (
    // App demo fills the viewport (below this header) like a real app; other pages scroll as documents
    <div className={page === 'app' ? 'flex h-dvh flex-col max-[960px]:h-auto' : brand ? 'pg-brand' : undefined}>
      {/* the home page is a landing page: no app header, its hero carries the language and theme switches */}
      {view && <header className="sticky top-0 z-40 border-b border-border bg-[color-mix(in_srgb,var(--dtx-bg)_82%,transparent)] backdrop-blur-md">
        <div className="mx-auto flex max-w-[1400px] flex-wrap items-center gap-4 px-4 py-2.5">
          <a href="#/home" className="flex items-center gap-2.5 text-sm font-bold text-fg no-underline"><Logo variant="square" width={38} />Frontend Kit <span className="font-normal text-fg-muted">v0.1</span></a>
          <nav aria-label={t('Trang', 'Pages')} className="dtx-seg">
            {NAV.map(([p, vi, en]) => <a key={p} href={`#/${p}`} className="dtx-seg__item inline-flex items-center no-underline" data-pressed={page === p ? '' : undefined} aria-current={page === p ? 'page' : undefined}>{t(vi, en)}</a>)}
          </nav>
          <div className="ml-auto">{prefs}</div>
        </div>
      </header>}
      {view ?? <Home prefs={prefs} />}
    </div>
  );
}
