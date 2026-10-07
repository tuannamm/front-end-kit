// Pure helpers behind FileDropzone; no DOM, so file.check.ts can run them in node.

type FileLike = { name: string; size: number; type: string };
export type FileRejection<F extends FileLike = File> = { file: F; reason: string };

const num = new Intl.NumberFormat('vi-VN', { maximumFractionDigits: 1 });
/** 1536 → "1,5 KB" (binary units, Vietnamese decimal comma). */
export function formatBytes(bytes: number): string {
  const units = ['B', 'KB', 'MB', 'GB', 'TB'];
  let v = bytes, i = 0;
  while (v >= 1024 && i < units.length - 1) { v /= 1024; i++; }
  return `${num.format(i ? v : Math.round(v))} ${units[i]}`;
}

const tokens = (accept?: string) => (accept ?? '').split(',').map(t => t.trim().toLowerCase()).filter(Boolean);

/** Same rules as <input accept>: ".pdf", "image/*", "application/pdf". An empty accept takes everything. */
export function acceptsFile(file: Pick<FileLike, 'name' | 'type'>, accept?: string): boolean {
  const list = tokens(accept);
  if (!list.length) return true;
  const name = file.name.toLowerCase(), type = file.type.toLowerCase();
  return list.some(t => t.startsWith('.') ? name.endsWith(t) : t.endsWith('/*') ? type.startsWith(t.slice(0, -1)) : type === t);
}

const wildcard: Record<string, string> = { image: 'ảnh', video: 'video', audio: 'âm thanh' };
/** ".pdf,image/*" → "PDF, ảnh": for hints and rejection messages. */
export function acceptLabel(accept?: string): string {
  const labels = tokens(accept).map(t => t.startsWith('.') ? t.slice(1).toUpperCase()
    : t.endsWith('/*') ? wildcard[t.slice(0, -2)] ?? t : t.split('/')[1]?.toUpperCase() ?? t);
  return [...new Set(labels)].join(', ');
}

/** Splits picked files into accepted and rejected (with a reason that says how to recover). */
export function checkFiles<F extends FileLike>(files: F[], { accept, maxSize, multiple = true }: { accept?: string; maxSize?: number; multiple?: boolean }) {
  const accepted: F[] = [], rejected: FileRejection<F>[] = [];
  for (const file of files) {
    if (!acceptsFile(file, accept)) rejected.push({ file, reason: `Định dạng không hỗ trợ. Chỉ nhận ${acceptLabel(accept)}.` });
    else if (maxSize !== undefined && file.size > maxSize) rejected.push({ file, reason: `Tệp ${formatBytes(file.size)}, vượt giới hạn ${formatBytes(maxSize)}.` });
    else if (!multiple && accepted.length) rejected.push({ file, reason: 'Chỉ chọn được 1 tệp.' });
    else accepted.push(file);
  }
  return { accepted, rejected };
}
