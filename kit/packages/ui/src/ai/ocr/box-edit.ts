import type { OcrBox } from '../shared/box-overlay';
import { bounds } from '../shared/geometry.ts';

/** What a drag holds: the whole box, or one of its corners. */
export type BoxHandle = 'move' | 'nw' | 'ne' | 'se' | 'sw';

const MIN = .005; // smallest side, 0–1 of the page
const clamp = (v: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, v));

/**
 * The box moved, or one corner dragged, by dx, dy (0–1 page units) from where the drag started. It stays on the page
 * and never turns inside out; a polygon moves and scales with its bounding rectangle.
 */
export function editBox(b: OcrBox, handle: BoxHandle, dx: number, dy: number): OcrBox {
  const poly = b.points && b.points.length > 2 ? b.points : undefined;
  const r = poly ? bounds(poly) : b;
  let x1 = r.x, y1 = r.y, x2 = r.x + r.w, y2 = r.y + r.h;
  if (handle === 'move') {
    const mx = clamp(dx, -x1, 1 - x2), my = clamp(dy, -y1, 1 - y2);
    x1 += mx; x2 += mx; y1 += my; y2 += my;
  } else {
    if (handle.includes('w')) x1 = clamp(x1 + dx, 0, x2 - MIN); else x2 = clamp(x2 + dx, x1 + MIN, 1);
    if (handle.includes('n')) y1 = clamp(y1 + dy, 0, y2 - MIN); else y2 = clamp(y2 + dy, y1 + MIN, 1);
  }
  const next = { x: x1, y: y1, w: x2 - x1, h: y2 - y1 };
  if (!poly) return { ...b, ...next };
  const sx = r.w ? next.w / r.w : 1, sy = r.h ? next.h / r.h : 1;
  return { ...b, ...next, points: poly.map(([px, py]): [number, number] => [next.x + (px - r.x) * sx, next.y + (py - r.y) * sy]) };
}
