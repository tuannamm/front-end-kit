import type { OcrBox } from './box-overlay';

/** Any box shape OCR engines emit. Pixels unless `units: 'normalized'`. */
export type BoxInput =
  | [x: number, y: number, w: number, h: number]
  | { x: number; y: number; w: number; h: number }
  | { x1: number; y1: number; x2: number; y2: number }
  | Array<[number, number]>; // polygon (PaddleOCR / EasyOCR quads)

/** Bounding rectangle of a polygon, in the polygon's units. */
export function bounds(points: ReadonlyArray<readonly [number, number]>) {
  const xs = points.map(p => p[0]), ys = points.map(p => p[1]);
  const x = Math.min(...xs), y = Math.min(...ys);
  return { x, y, w: Math.max(...xs) - x, h: Math.max(...ys) - y };
}

/**
 * Converts any BoxInput to a 0–1 box. A polygon keeps its shape in `points` (BoxOverlay draws it as-is) beside its
 * bounding rectangle; a 4-point polygon that is an upright rectangle is just the rectangle.
 */
export function toBox(b: BoxInput, W = 1, H = 1): Pick<OcrBox, 'x' | 'y' | 'w' | 'h' | 'points'> {
  let x: number, y: number, w: number, h: number;
  if (Array.isArray(b) && Array.isArray(b[0])) {
    const pts = b as Array<[number, number]>;
    ({ x, y, w, h } = bounds(pts)); // in source units, then scaled once below, like the other shapes
    const upright = pts.length === 4 && pts.every(([px, py]) => (px === x || px === x + w) && (py === y || py === y + h));
    if (!upright) return { x: x / W, y: y / H, w: w / W, h: h / H, points: pts.map(([px, py]): [number, number] => [px / W, py / H]) };
  } else if (Array.isArray(b)) [x, y, w, h] = b as [number, number, number, number];
  else if ('x1' in b) { x = b.x1; y = b.y1; w = b.x2 - b.x1; h = b.y2 - b.y1; }
  else ({ x, y, w, h } = b);
  return { x: x / W, y: y / H, w: w / W, h: h / H };
}

