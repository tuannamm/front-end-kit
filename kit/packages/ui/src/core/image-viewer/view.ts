import { ZOOM_MAX, ZOOM_STEPS } from '../pdf-viewer/view.ts';

export type Size = { w: number; h: number };
export type Turn = 0 | 90 | 180 | 270;

/** Box the image takes after a quarter turn. */
export const turned = (s: Size, rot: Turn): Size => (rot % 180 ? { w: s.h, h: s.w } : s);

/** Scale that shows the whole image inside `box` with `pad` around it. Never above 100%, so a small image stays sharp. */
export function fitScale(img: Size, box: Size, pad: number) {
  const k = Math.min(1, (box.w - 2 * pad) / img.w, (box.h - 2 * pad) / img.h);
  return k > 0 ? k : 1; // a hidden or unmeasured box
}

/** The −/+ stops: the PDF presets plus the fit scale, which may sit below 25% for a big scan. */
export const zoomStops = (fit: number) => [...ZOOM_STEPS, fit].sort((a, b) => a - b);

/** ctrl + wheel and trackpad pinch: smooth, proportional to the wheel distance, within fit-or-25% … 400%. */
export function wheelZoom(scale: number, deltaY: number, min: number) {
  return Math.min(ZOOM_MAX, Math.max(min, scale * Math.exp(-deltaY / 300)));
}

export type ImageError = { title: string; hint: string; retry: boolean };

/** Formats some browsers cannot draw (Safari draws TIFF and HEIC, Chrome and Firefox do not). */
const UNDRAWABLE = /\.(tiff?|heic|heif)$|^image\/(tiff|heic|heif)$/i;

/** An <img> error carries no reason, so the message comes from what the source was. */
export function describeError(src: string | Blob, fileName?: string): ImageError {
  const name = fileName ?? (typeof src === 'string' ? src.split(/[?#]/)[0] : (src as File).name ?? '');
  const type = typeof src === 'string' ? '' : src.type;
  if (UNDRAWABLE.test(name) || UNDRAWABLE.test(type)) {
    return { title: 'Trình duyệt này không hiển thị được ảnh TIFF hoặc HEIC.', hint: 'Chuyển ảnh sang PNG hoặc JPEG rồi mở lại.', retry: false };
  }
  if (typeof src !== 'string') return { title: 'File không phải ảnh hợp lệ hoặc đã bị hỏng.', hint: 'Mở thử file gốc trên máy, hoặc xuất lại ảnh dạng PNG, JPEG hay WebP.', retry: false };
  return { title: 'Không tải được ảnh.', hint: 'Kiểm tra đường dẫn, quyền truy cập và kết nối mạng rồi thử lại.', retry: true };
}
