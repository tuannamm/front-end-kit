import { useMemo, useState } from 'react';
import { Badge, Button, Card, CardHeader, Field, OcrShowcase, SampleInvoice, Select, normalizeOcr, type OcrDocument, type OcrStage } from '@dtx/ui';
import { sampleOptions, useSampleIndex } from '../samples';

const EXAMPLE: OcrDocument = {
  fileName: 'my-scan.jpg',
  engine: 'PaddleOCR',
  image: { src: '', width: 1240, height: 1754 },
  lines: [
    { text: 'HOÁ ĐƠN GIÁ TRỊ GIA TĂNG', confidence: 0.991, box: [[80, 190], [700, 190], [700, 240], [80, 240]], kind: 'title' },
    { text: 'Số hoá đơn: 0000347', confidence: 0.998, box: [80, 300, 360, 34] },
    { text: 'Tổng cộng: 15.552.000 ₫', confidence: 0.942, box: { x1: 700, y1: 980, x2: 1160, y2: 1020 } },
  ],
  fields: [
    { key: 'invoice_no', label: 'Số hoá đơn', value: '0000347', confidence: 0.998, lineId: 'l1' },
    { key: 'total', label: 'Tổng cộng', value: '15552000', confidence: 0.942, lineId: 'l2' },
  ],
};
const ALL: OcrStage[] = ['crop', 'unwarp', 'deskew', 'denoise', 'binarize', 'grayscale', 'detect', 'recognize', 'layout', 'extract'];
const PRESETS: Record<string, OcrStage[]> = {
  ocr: ['unwarp', 'binarize', 'detect', 'recognize', 'extract'],
  pre: ['crop', 'unwarp', 'deskew', 'denoise', 'binarize'],
  fast: ['detect', 'recognize', 'extract'],
};

/** Paste engine JSON + pick an image → playable pipeline. Nothing leaves the browser. */
export function Poc() {
  const [json, setJson] = useState(JSON.stringify({ ...EXAMPLE, image: { ...EXAMPLE.image, src: '(chọn ảnh bên dưới)' } }, null, 2));
  const [img, setImg] = useState<{ src: string; width: number; height: number } | null>(null);
  const [preset, setPreset] = useState<string | null>('ocr');
  const [shown, setShown] = useState<OcrDocument | null>(null);
  const [error, setError] = useState<string | null>(null);
  const { index } = useSampleIndex();
  const loadSample = async (id: string | null) => {
    if (!id) return;
    const doc = (await (await fetch(`/samples/${id}.json`)).json()) as OcrDocument;
    setJson(JSON.stringify(doc, null, 2));
    if (doc.image) setImg(doc.image);
    normalizeOcr(doc); setShown(doc); setError(null);
  };

  const run = () => {
    try {
      const doc = JSON.parse(json) as OcrDocument;
      if (img) doc.image = { ...img, ...(doc.image?.width ? { width: doc.image.width, height: doc.image.height } : {}), src: img.src };
      if (!doc.image?.src || doc.image.src.startsWith('(')) throw new Error('Hãy chọn ảnh tài liệu.');
      normalizeOcr(doc); // validate early, show the message here instead of inside the player
      setShown(doc); setError(null);
    } catch (e) { setError((e as Error).message); }
  };
  const onFile = (f?: File) => {
    if (!f) return;
    const url = URL.createObjectURL(f);
    const im = new Image();
    im.onload = () => setImg({ src: url, width: im.naturalWidth, height: im.naturalHeight });
    im.src = url;
  };
  const stages = useMemo(() => PRESETS[preset ?? 'ocr'] ?? ALL, [preset]);

  return (
    <main className="mx-auto grid max-w-[1400px] gap-6 px-4 py-6">
      <header className="grid gap-2">
        <h1 className="m-0 text-3xl font-bold tracking-tight">POC nhanh với OcrShowcase</h1>
        <p className="m-0 max-w-[72ch] text-fg-muted">Dán JSON từ engine (OcrDocument), chọn ảnh, bấm Chạy. Box nhận pixel <code>[x,y,w,h]</code>, <code>{'{x1,y1,x2,y2}'}</code> hoặc polygon 4 điểm; confidence nhận 0–1 hoặc 0–100. Dữ liệu chỉ ở trong trình duyệt.</p>
      </header>
      <div className="grid gap-6 lg:grid-cols-[minmax(0,420px)_minmax(0,1fr)]">
        <Card>
          <CardHeader title="Đầu vào" action={<Badge tone="neutral" variant="outline" size="sm">OcrDocument</Badge>} />
          <div className="grid gap-4 p-4">
            {index && (
              <Field label="Mẫu thật · dự án 1266" description="Ảnh + kết quả seg → rec → LiLT thật. Nội bộ, không đưa ra ngoài.">
                <Select placeholder="Chọn một mẫu…" items={sampleOptions(index)} onValueChange={loadSample} />
              </Field>
            )}
            <Field label="Ảnh tài liệu" description={img ? `${img.width} × ${img.height}px` : 'JPG/PNG. Kích thước ảnh dùng để quy đổi box pixel.'}>
              <input type="file" accept="image/*" onChange={e => onFile(e.target.files?.[0])} className="text-sm" />
            </Field>
            <Field label="JSON">
              <textarea value={json} onChange={e => setJson(e.target.value)} spellCheck={false} rows={16} className="dtx-input h-auto py-2 font-mono text-xs leading-relaxed" />
            </Field>
            <Field label="Các bước">
              <Select value={preset} onValueChange={setPreset} items={[
                { value: 'ocr', label: 'OCR đầy đủ', description: PRESETS.ocr.join(' → ') },
                { value: 'pre', label: 'Chỉ tiền xử lý', description: PRESETS.pre.join(' → ') },
                { value: 'fast', label: 'Không tiền xử lý', description: PRESETS.fast.join(' → ') },
              ]} />
            </Field>
            {error && <p className="m-0 text-sm text-[var(--dtx-tone-err)]" role="alert">{error}</p>}
            <div className="flex gap-2"><Button onClick={run}>Chạy</Button><Button variant="secondary" onClick={() => { setShown(null); setError(null); }}>Xem ví dụ mẫu</Button></div>
          </div>
        </Card>
        <div className="min-w-0">
          {shown ? <OcrShowcase key={JSON.stringify(stages) + shown.image?.src} data={shown} stages={stages} />
            : <SampleShowcaseNote />}
        </div>
      </div>
    </main>
  );
}

function SampleShowcaseNote() {
  return (
    <div className="grid gap-3">
      <p className="m-0 text-sm text-fg-muted">Chưa có dữ liệu của bạn. Ví dụ với hoá đơn mẫu (chỉ tiền xử lý):</p>
      <OcrShowcase data={{ lines: [], regions: [], fields: [] }} stages={PRESETS.pre} page={<SampleInvoice />} title="Ví dụ" />
    </div>
  );
}
