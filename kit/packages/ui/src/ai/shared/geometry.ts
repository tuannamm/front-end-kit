import type { OcrBox } from './box-overlay';

/** Any box shape OCR engines emit. Pixels unless `units: 'normalized'`. */
export type BoxInput =
  | [x: number, y: number, w: number, h: number]
  | { x: number; y: number; w: number; h: number }
  | { x1: number; y1: number; x2: number; y2: number }
  | Array<[number, number]>; // polygon (PaddleOCR / EasyOCR quads)

/** Converts any BoxInput to a 0–1 box. Polygons become their bounding rectangle. */
export function toBox(b: BoxInput, W = 1, H = 1): Pick<OcrBox, 'x' | 'y' | 'w' | 'h'> {
  let x: number, y: number, w: number, h: number;
  if (Array.isArray(b) && Array.isArray(b[0])) {
    const pts = b as Array<[number, number]>, xs = pts.map(p => p[0]), ys = pts.map(p => p[1]);
    x = Math.min(...xs); y = Math.min(...ys); w = Math.max(...xs) - x; h = Math.max(...ys) - y;
  } else if (Array.isArray(b)) [x, y, w, h] = b as [number, number, number, number];
  else if ('x1' in b) { x = b.x1; y = b.y1; w = b.x2 - b.x1; h = b.y2 - b.y1; }
  else ({ x, y, w, h } = b);
  return { x: x / W, y: y / H, w: w / W, h: h / H };
}

