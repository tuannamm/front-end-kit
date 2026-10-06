import type { OcrBox, RegionKind } from '../shared/box-overlay';
import { toBox, type BoxInput } from '../shared/geometry.ts';
export type { BoxInput };

/** POC input: one image plus what the pipeline found. Paste engine output here. */
export type OcrDocument = {
  image?: { src: string; width: number; height: number };
  fileName?: string;
  engine?: string;
  units?: 'px' | 'normalized';
  /** OCR_det + OCR_rec output, one entry per text line (or word). */
  lines: Array<{ id?: string; text: string; /** 0–1 or 0–100 */ confidence: number; box: BoxInput; kind?: RegionKind }>;
  /** Layout analysis (optional). */
  regions?: Array<{ id?: string; kind: RegionKind; box: BoxInput; label?: string }>;
  /** Extraction output (optional). `lineId` links a field to the line it came from. */
  fields?: Array<{ key: string; label?: string; value: string; confidence: number; lineId?: string }>;
};

export type NormalizedOcr = {
  lines: OcrBox[];
  regions: OcrBox[];
  fields: Array<{ key: string; label: string; value: string; confidence: number; lineId?: string }>;
};

const pct = (c: number) => (c <= 1 ? c * 100 : c);

/** Normalises an OcrDocument: 0–1 boxes, 0–100 confidence, stable ids. */
export function normalizeOcr(doc: OcrDocument): NormalizedOcr {
  const px = (doc.units ?? 'px') === 'px';
  const W = px ? doc.image?.width ?? 1 : 1, H = px ? doc.image?.height ?? 1 : 1;
  if (px && !doc.image) throw new Error('normalizeOcr: pixel boxes need image.width/height (or set units: "normalized")');
  return {
    lines: doc.lines.map((l, i) => ({ id: l.id ?? `l${i}`, text: l.text, confidence: pct(l.confidence), kind: l.kind, ...toBox(l.box, W, H) })),
    regions: (doc.regions ?? []).map((r, i) => ({ id: r.id ?? `r${i}`, kind: r.kind, label: r.label, ...toBox(r.box, W, H) })),
    fields: (doc.fields ?? []).map(f => ({ ...f, label: f.label ?? f.key, confidence: pct(f.confidence) })),
  };
}
