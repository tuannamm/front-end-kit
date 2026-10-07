/** Zoom presets for the −/+ buttons. 1 = 100%: a PDF point shown at CSS 96 dpi, as other viewers do. */
export const ZOOM_STEPS = [0.25, 0.5, 0.75, 1, 1.25, 1.5, 2, 3, 4];
export const ZOOM_MIN = ZOOM_STEPS[0];
export const ZOOM_MAX = ZOOM_STEPS[ZOOM_STEPS.length - 1];
/** PDF points (1/72 in) to CSS px (1/96 in). */
export const PT_TO_PX = 96 / 72;

export const clampZoom = (scale: number) => Math.min(ZOOM_MAX, Math.max(ZOOM_MIN, scale));

/** Next preset above (dir 1) or below (dir -1) the current scale, so 87% steps to 100%, not 112%. */
export function stepZoom(scale: number, dir: 1 | -1) {
  const next = dir > 0 ? ZOOM_STEPS.find(s => s > scale + 0.001) : ZOOM_STEPS.findLast(s => s < scale - 0.001);
  return next ?? (dir > 0 ? ZOOM_MAX : ZOOM_MIN);
}

/** 0-based index of the page whose box holds y; `tops` ascending. */
export function pageAt(tops: number[], y: number) {
  let i = 0;
  while (i + 1 < tops.length && tops[i + 1] <= y) i++; // ponytail: linear scan per scroll event, binary search past ~10k pages
  return i;
}

/** What the reader typed in the page box, clamped to 1…count; null when it is not a number. */
export function parsePage(text: string, count: number) {
  const n = Number.parseInt(text, 10);
  return Number.isFinite(n) && count > 0 ? Math.min(count, Math.max(1, n)) : null;
}

export type PdfError = { title: string; hint: string; retry: boolean };

/** pdf.js exceptions are matched by name, so this file needs no pdf.js import. */
export function describeError(e: unknown): PdfError {
  const { name, status } = (e ?? {}) as { name?: string; status?: number };
  if (name === 'PasswordException') return { title: 'File PDF này có mật khẩu.', hint: 'Gỡ mật khẩu trong phần mềm đã tạo file rồi mở lại.', retry: false };
  if (name === 'InvalidPDFException') return { title: 'File không phải PDF hợp lệ hoặc đã bị hỏng.', hint: 'Mở thử file gốc trên máy, hoặc xuất lại file PDF.', retry: false };
  if (name === 'ResponseException' || name === 'MissingPDFException') {
    return status === 404 || name === 'MissingPDFException'
      ? { title: 'Không tìm thấy file (HTTP 404).', hint: 'Kiểm tra lại đường dẫn hoặc quyền truy cập file.', retry: true }
      : { title: `Máy chủ trả lỗi${status ? ` HTTP ${status}` : ''} khi tải file.`, hint: 'Thử lại sau ít phút.', retry: true };
  }
  return { title: 'Không mở được tài liệu.', hint: 'Kiểm tra kết nối mạng rồi thử lại.', retry: true };
}
