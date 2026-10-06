import { useLayoutEffect, useRef } from 'react';
import type { OcrBox, RegionKind } from './box-overlay';

/* A synthetic VAT invoice drawn in SVG, for demos and docs. Line boxes are measured
   from the rendered text, so overlays line up exactly; region boxes come from the layout. */
const W = 600, H = 780;
type Line = { id: string; x: number; y: number; size: number; bold?: boolean; text: string; conf: number; kind: RegionKind; anchor?: 'end' };
const LINES: Line[] = [
  { id: 'company', x: 40, y: 62, size: 15, bold: true, text: 'CÔNG TY TNHH MINH PHÁT', conf: 99.4, kind: 'title' },
  { id: 'title', x: 40, y: 104, size: 22, bold: true, text: 'HOÁ ĐƠN GIÁ TRỊ GIA TĂNG', conf: 99.1, kind: 'title' },
  { id: 'no', x: 40, y: 146, size: 13, text: 'Số hoá đơn: 0000347', conf: 99.8, kind: 'field' },
  { id: 'date', x: 40, y: 170, size: 13, text: 'Ngày: 02/10/2026', conf: 99.6, kind: 'field' },
  { id: 'tax', x: 330, y: 146, size: 13, text: 'MST: 0312 456 789', conf: 97.9, kind: 'field' },
  { id: 'addr', x: 330, y: 170, size: 13, text: 'Q.7, TP. Hồ Chí Minh', conf: 91.3, kind: 'text' },
  { id: 'r1', x: 92, y: 262, size: 13, text: 'Giấy in A4 (thùng)', conf: 98.7, kind: 'table' },
  { id: 'r2', x: 92, y: 292, size: 13, text: 'Mực in laser HP 85A', conf: 86.4, kind: 'table' },
  { id: 'r3', x: 92, y: 322, size: 13, text: 'Bìa hồ sơ nhựa', conf: 72.5, kind: 'table' },
  { id: 'vat', x: 560, y: 410, size: 13, text: 'Thuế GTGT 8%: 1.152.000', conf: 94.2, kind: 'field', anchor: 'end' },
  { id: 'total', x: 560, y: 440, size: 15, bold: true, text: 'Tổng cộng: 15.552.000 ₫', conf: 99.7, kind: 'field', anchor: 'end' },
  { id: 'note', x: 40, y: 735, size: 11, text: 'Hoá đơn điện tử tra cứu tại hoadon.minhphat.vn', conf: 88.0, kind: 'text' },
];
const REGIONS: OcrBox[] = ([
  { id: 'reg-head', kind: 'title', x: 28, y: 40, w: 410, h: 76 },
  { id: 'reg-meta', kind: 'text', x: 28, y: 128, w: 544, h: 52 },
  { id: 'reg-table', kind: 'table', x: 28, y: 214, w: 544, h: 136 },
  { id: 'reg-total', kind: 'field', x: 330, y: 390, w: 242, h: 60 },
  { id: 'reg-sign', kind: 'signature', x: 60, y: 560, w: 170, h: 100 },
  { id: 'reg-stamp', kind: 'stamp', x: 390, y: 540, w: 150, h: 140 },
] as OcrBox[]).map(r => ({ ...r, x: r.x / W, y: r.y / H, w: r.w / W, h: r.h / H }));

export const sampleInvoiceRegions = REGIONS;
/** Line boxes are measured with this padding around the glyphs; pass it as BoxOverlay textInset. */
export const sampleInvoiceInset = 4;

/** onBoxes receives the measured line boxes (with text and confidence) once fonts are ready. */
export function SampleInvoice({ onBoxes, className }: { onBoxes?: (boxes: OcrBox[]) => void; className?: string }) {
  const ref = useRef<SVGSVGElement>(null);
  useLayoutEffect(() => {
    if (!onBoxes || !ref.current) return;
    let live = true;
    const measure = () => {
      if (!live || !ref.current) return;
      const boxes = LINES.map(l => {
        const el = ref.current!.querySelector<SVGTextElement>(`[data-id="${l.id}"]`)!;
        const b = el.getBBox(), p = sampleInvoiceInset;
        return { id: l.id, kind: l.kind, text: l.text, confidence: l.conf, x: (b.x - p) / W, y: (b.y - p / 2) / H, w: (b.width + 2 * p) / W, h: (b.height + p) / H };
      });
      onBoxes(boxes);
    };
    measure();
    document.fonts?.ready.then(measure);
    return () => { live = false; };
  }, [onBoxes]);
  const cols = [40, 80, 360, 420, 490];
  return (
    <svg ref={ref} className={className} viewBox={`0 0 ${W} ${H}`} role="img" aria-label="Hoá đơn mẫu" style={{ display: 'block', width: '100%', height: 'auto', background: '#FFFFFF' }}>
      <g fontFamily="var(--dtx-font)" fill="#231F20">
        {LINES.map(l => <text key={l.id} data-id={l.id} x={l.x} y={l.y} fontSize={l.size} fontWeight={l.bold ? 700 : 400} textAnchor={l.anchor}>{l.text}</text>)}
        <rect x="40" y="220" width="520" height="24" fill="#EEF1F5" />
        {['STT', 'Tên hàng', 'SL', 'Đơn giá', 'Thành tiền'].map((h, i) => <text key={h} x={cols[i] + 8} y="236" fontSize="11" fontWeight="700">{h}</text>)}
        {[262, 292, 322].map((y, i) => (
          <g key={y} fontSize="13">
            <text x="48" y={y}>{i + 1}</text>
            <text x="368" y={y}>{[12, 4, 30][i]}</text>
            <text x="428" y={y}>{['650.000', '1.250.000', '18.000'][i]}</text>
            <text x="498" y={y}>{['7.800.000', '5.000.000', '540.000'][i]}</text>
            <line x1="40" x2="560" y1={y + 10} y2={y + 10} stroke="#D5D9E0" />
          </g>
        ))}
        {cols.slice(1).map(x => <line key={x} x1={x} x2={x} y1="220" y2="342" stroke="#D5D9E0" />)}
        <rect x="40" y="220" width="520" height="122" fill="none" stroke="#B9BFC9" />
        <text x="80" y="580" fontSize="11" fontWeight="700">NGƯỜI MUA HÀNG</text>
        <path d="M78 625c18-22 30 14 46-6s20-18 30 2 22-10 34 0" fill="none" stroke="#1A3C8F" strokeWidth="2" />
        <text x="410" y="560" fontSize="11" fontWeight="700">NGƯỜI BÁN HÀNG</text>
        <g transform="translate(465 615) rotate(-12)" fill="none" stroke="#C42B2B" strokeWidth="3" opacity=".85">
          <circle r="52" /><circle r="40" strokeWidth="1.5" />
          <text textAnchor="middle" y="6" fontSize="14" fontWeight="700" fill="#C42B2B" stroke="none">ĐÃ KÝ</text>
        </g>
        <line x1="40" x2="560" y1="712" y2="712" stroke="#D5D9E0" />
      </g>
    </svg>
  );
}
