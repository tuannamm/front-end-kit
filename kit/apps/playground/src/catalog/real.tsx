import { useEffect, useMemo, useState } from 'react';
import { Badge, BoxOverlay, Button, CompareSlider, OcrShowcase, ScanBeam, Select, UnwarpView, normalizeOcr, type OcrBox } from '@dtx/ui';
import { sampleOptions, useSample, useSampleIndex } from '../samples';

function Picker({ value, onChange }: { value: string | null; onChange: (v: string | null) => void }) {
  const { index, error } = useSampleIndex();
  useEffect(() => { if (!value && index?.[0]) onChange(index[0].id); }, [index, value, onChange]);
  if (error) return <p className="m-0 text-sm text-fg-muted">Chưa có mẫu thật. Chạy <code>python3 apps/playground/scripts/import_1266.py</code>.</p>;
  if (!index) return null;
  return (
    <div className="flex flex-wrap items-center gap-3">
      <div className="w-72"><Select aria-label="Chọn mẫu" size="sm" items={sampleOptions(index)} value={value} onValueChange={onChange} /></div>
      <Badge tone="neutral" variant="outline" size="sm">Dự án 1266 · nội bộ</Badge>
    </div>
  );
}

/** Real scan + real engine output: hover a word to compare the scan pixels with what the model read. */
export function RealBoxes({ hover = 'lens', scan }: { hover?: 'lens' | 'blink'; scan?: boolean }) {
  const [id, setId] = useState<string | null>(null);
  const doc = useSample(id);
  const lines = useMemo<OcrBox[]>(() => (doc ? normalizeOcr(doc).lines : []), [doc]);
  const [sel, setSel] = useState<OcrBox | null>(null);
  const [pinned, setPinned] = useState<string | null>(null);
  const low = lines.filter(l => (l.confidence ?? 100) < 80).length;
  const worst = useMemo(() => [...lines].filter(l => (l.text ?? '').length > 1).sort((a, b) => (a.confidence ?? 100) - (b.confidence ?? 100)), [lines]);
  useEffect(() => { setPinned(null); }, [id]);
  return (
    <div className="grid w-full gap-3">
      <Picker value={id} onChange={setId} />
      {doc?.image && (
        <>
          <div className="flex flex-wrap gap-2">
            <Button size="sm" variant="secondary" onClick={() => setPinned(p => { const i = worst.findIndex(w => w.id === p); return worst[(i + 1) % worst.length]?.id ?? null; })}>Ghim từ kém tin cậy tiếp theo</Button>
            {pinned && <Button size="sm" variant="ghost" onClick={() => setPinned(null)}>Bỏ ghim</Button>}
          </div>
          <p className="m-0 text-xs text-fg-muted">{lines.length} từ · <b className="text-fg">{low}</b> từ dưới 80% (khung đỏ/vàng) · Rê chuột hoặc Tab qua các ô để so ảnh gốc với chữ AI đọc.</p>
          <div className="max-w-3xl">
            <ScanBeam key={id} active={!!scan} duration={2600}>
              <BoxOverlay boxes={lines} hover={hover} textInset={1} pinnedId={pinned} selectedId={sel?.id} onSelect={setSel}>
                <img src={doc.image.src} alt={doc.fileName} width={doc.image.width} height={doc.image.height} style={{ display: 'block', width: '100%', height: 'auto' }} />
              </BoxOverlay>
            </ScanBeam>
          </div>
        </>
      )}
    </div>
  );
}

export function RealShowcase() {
  const [id, setId] = useState<string | null>(null);
  const doc = useSample(id);
  return (
    <div className="grid w-full gap-3">
      <Picker value={id} onChange={setId} />
      {doc && <OcrShowcase key={id} data={doc} stages={['deskew', 'denoise', 'detect', 'recognize', 'extract']} interval={2200} />}
    </div>
  );
}

type UnwarpSample = { id: string; title: string; source: string; raw: { src: string; width: number; height: number }; unwarped: { src: string; width: number; height: number }; grid: { cols: number; rows: number; points: number[] } };

/** Real unwarp samples from project stengg (raw page + pz-auto_preprocessing /unwarp output + lattice). */
export function RealUnwarp({ run }: { run: number }) {
  const [index, setIndex] = useState<{ id: string; title: string; warp: number }[] | null>(null);
  const [id, setId] = useState<string | null>(null);
  const [doc, setDoc] = useState<UnwarpSample | null>(null);
  const [applied, setApplied] = useState(false);
  const [missing, setMissing] = useState(false);
  useEffect(() => { fetch('/samples/unwarp/index.json').then(r => (r.ok ? r.json() : Promise.reject())).then(i => { setIndex(i); setId(i[0]?.id ?? null); }, () => setMissing(true)); }, []);
  useEffect(() => { if (!id) return; setDoc(null); fetch(`/samples/unwarp/${id}.json`).then(r => r.json()).then(setDoc); }, [id]);
  // ask for phase 2 right away: UnwarpView itself holds the lattice until it has fully appeared + `hold` ms
  useEffect(() => { setApplied(false); const t = setTimeout(() => setApplied(true), 50); return () => clearTimeout(t); }, [id, run]);
  if (missing) return <p className="m-0 text-sm text-fg-muted">Chưa có mẫu. Chạy <code>python3 apps/playground/scripts/import_stengg_unwarp.py</code> (cần dịch vụ pz-auto_preprocessing).</p>;
  return (
    <div className="grid w-full gap-3">
      {index && (
        <div className="flex flex-wrap items-center gap-3">
          <div className="w-80"><Select aria-label="Chọn mẫu" size="sm" value={id} onValueChange={setId} items={index.map(s => ({ value: s.id, label: s.title, description: `độ lệch lưới tối đa ${s.warp}` }))} /></div>
          <Badge tone="neutral" variant="outline" size="sm">Dự án stengg · nội bộ</Badge>
        </div>
      )}
      <div className="flex flex-wrap gap-2">
        <Button size="sm" variant={!applied ? 'primary' : 'secondary'} onClick={() => setApplied(false)}>Phase 1 · Ảnh gốc + lưới</Button>
        <Button size="sm" variant={applied ? 'primary' : 'secondary'} onClick={() => setApplied(true)}>Phase 2 · Đã làm phẳng</Button>
        <span className="self-center text-xs text-fg-muted">Lưới hiện đủ rồi giữ 0.5 s trước khi làm phẳng.</span>
      </div>
      {doc && <div className="max-w-md"><UnwarpView key={`${doc.id}-${run}`} raw={doc.raw} unwarped={doc.unwarped} grid={doc.grid} applied={applied} /></div>}
      {doc && <p className="m-0 text-xs text-fg-muted">{doc.source} · lưới {doc.grid.cols}×{doc.grid.rows}</p>}
    </div>
  );
}

type Pair = { id: string; title: string; source: string; before: { src: string; width: number; height: number }; after: { src: string; width: number; height: number } };

/** Real raw → cleaned pairs from stengg's /preprocess, shown with CompareSlider and ScanBeam (same before/after). */
export function RealEnhance() {
  const [pairs, setPairs] = useState<Pair[] | null>(null);
  const [id, setId] = useState<string | null>(null);
  useEffect(() => { fetch('/samples/enhance/index.json').then(r => (r.ok ? r.json() : Promise.reject())).then((p: Pair[]) => { setPairs(p); setId(p[0]?.id ?? null); }, () => setPairs([])); }, []);
  if (pairs && !pairs.length) return <p className="m-0 text-sm text-fg-muted">Chưa có mẫu. Chạy <code>python3 apps/playground/scripts/import_stengg_enhance.py</code>.</p>;
  const p = pairs?.find(x => x.id === id);
  const img = (i: Pair['before']) => <img src={i.src} width={i.width} height={i.height} alt="" style={{ display: 'block', width: '100%', height: 'auto' }} />;
  return (
    <div className="grid w-full gap-3">
      {pairs && <div className="flex flex-wrap items-center gap-3"><div className="w-72"><Select aria-label="Chọn mẫu" size="sm" value={id} onValueChange={setId} items={pairs.map(x => ({ value: x.id, label: x.title }))} /></div><Badge tone="neutral" variant="outline" size="sm">Dự án stengg · nội bộ</Badge></div>}
      {p && (
        <div className="grid gap-6 sm:grid-cols-2">
          <figure className="m-0 grid gap-2"><figcaption className="text-xs"><code>CompareSlider</code></figcaption><CompareSlider before={img(p.before)} after={img(p.after)} beforeLabel="Ảnh gốc" afterLabel="Đã làm sạch" /></figure>
          <figure className="m-0 grid gap-2"><figcaption className="text-xs"><code>ScanBeam</code></figcaption><ScanBeam key={p.id} duration={2200} before={img(p.before)} after={img(p.after)} /></figure>
        </div>
      )}
      {p && <p className="m-0 text-xs text-fg-muted">{p.source}</p>}
    </div>
  );
}
