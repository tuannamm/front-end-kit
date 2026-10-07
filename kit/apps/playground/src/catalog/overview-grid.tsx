import { useEffect, useLayoutEffect, useRef, useState, type CSSProperties } from 'react';
import { Badge, Reveal } from '@dtx/ui';
import { categories, entries, type Entry } from './entries';
import { useT } from '../i18n';

/** Width the first demo lays out in (a catalog stage), before it is cropped to its content and scaled into the tile. */
const CANVAS = 480;
/** Below this a miniature stops being legible: show the top-left at this scale instead, cropped. */
const MIN_SCALE = .55;
const PAD = 12;

/** The entry's first demo, live, frozen in its final state and scaled to fit. Mounts when near the viewport. */
function Thumb({ e }: { e: Entry }) {
  const t = useT();
  const box = useRef<HTMLDivElement>(null);
  const canvas = useRef<HTMLDivElement>(null);
  const [near, setNear] = useState(false);
  const [fit, setFit] = useState<CSSProperties>({ opacity: 0 });
  const demo = e.demos[0];

  useEffect(() => {
    const io = new IntersectionObserver(([x]) => { if (x.isIntersecting) { setNear(true); io.disconnect(); } }, { rootMargin: '300px 0px' });
    io.observe(box.current!);
    return () => io.disconnect();
  }, []);

  useLayoutEffect(() => {
    const b = box.current, c = canvas.current;
    if (!near || !b || !c) return;
    // crop to the union of the demo's top-level boxes, so a lone button is not lost in a 480px stage
    const place = () => {
      const kids = [...c.children] as HTMLElement[];
      if (!kids.length) return;
      const x = Math.min(...kids.map(n => n.offsetLeft)), y = Math.min(...kids.map(n => n.offsetTop));
      const w = Math.max(...kids.map(n => n.offsetLeft + n.offsetWidth)) - x, h = Math.max(...kids.map(n => n.offsetTop + n.offsetHeight)) - y;
      const bw = b.clientWidth - 2 * PAD, bh = b.clientHeight - 2 * PAD;
      const k = Math.max(MIN_SCALE, Math.min(1, bw / w, bh / h));
      // centred when it fits; pinned to the top-left when cropped
      const tx = PAD + (w * k <= bw ? (bw - w * k) / 2 : 0) - x * k, ty = PAD + (h * k <= bh ? (bh - h * k) / 2 : 0) - y * k;
      setFit({ transform: `translate(${tx}px, ${ty}px) scale(${k})` });
    };
    const ro = new ResizeObserver(place);
    ro.observe(b); ro.observe(c);
    return () => ro.disconnect();
  }, [near]);

  return (
    <div ref={box} className="pg-thumb" data-motion="reduce" aria-hidden inert>
      {!demo ? <span className="text-xs text-fg-muted">{t('Chưa có ví dụ', 'No example yet')}</span>
        : near && <div ref={canvas} className="pg-thumb__canvas" style={{ inlineSize: CANVAS, ...fit }}>{demo.render(0)}</div>}
    </div>
  );
}

export function OverviewGrid({ shown }: { shown: Entry[] }) {
  const t = useT();
  const ready = entries.filter(e => e.status === 'ready').length;
  return (
    <Reveal className="grid gap-8">
      <header className="grid gap-2">
        <h1 className="m-0 text-3xl font-bold tracking-tight">{t('Danh mục Frontend Kit', 'Frontend Kit catalog')}</h1>
        <p className="m-0 max-w-[68ch] text-fg-muted">{t(<><b className="text-fg">{ready}</b> mục đã có, <b className="text-fg">{entries.length - ready}</b> dự kiến.</>, <><b className="text-fg">{ready}</b> ready, <b className="text-fg">{entries.length - ready}</b> planned.</>)}</p>
      </header>
      {categories.map(c => {
        const list = shown.filter(e => e.category === c.id);
        if (!list.length) return null;
        return (
          <section key={c.id} className="grid gap-3" aria-labelledby={`cat-${c.id}`}>
            <div className="flex items-baseline gap-3">
              <h2 id={`cat-${c.id}`} className="m-0 text-lg font-bold">{c.id}</h2>
              <span className="text-sm text-fg-muted">{c.blurb}</span>
              <span className="ml-auto text-xs text-fg-muted dtx-num">{list.length}</span>
            </div>
            <ul className="m-0 grid list-none grid-cols-[repeat(auto-fill,minmax(232px,1fr))] gap-4 p-0">
              {list.map(e => (
                <li key={e.id} className="min-w-0">
                  <a href={`#/catalog/${e.id}`} className="pg-tile">
                    <Thumb e={e} />
                    <span className="pg-tile__foot">
                      <span className="min-w-0 truncate font-medium" title={e.name}>{e.name}</span>
                      {e.status === 'planned' && <Badge tone="neutral" variant="outline">{t('Dự kiến', 'Planned')}</Badge>}
                    </span>
                  </a>
                </li>
              ))}
            </ul>
          </section>
        );
      })}
    </Reveal>
  );
}
