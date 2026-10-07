import { useEffect, useRef, useState } from 'react';
import type { UploadToastItem } from '@dtx/ui';

export type Upload = { id: number; file: File; status: 'uploading' | 'done' | 'error'; progress: number; thumb?: string; failOnce: boolean };

/** Fake uploads for demos: progress ticks every 200ms; every 3rd file fails once at ~60% so the error and retry states show. */
export function useFakeUpload() {
  const [items, setItems] = useState<Upload[]>([]);
  const nextId = useRef(1);
  const busy = items.some(i => i.status === 'uploading');
  useEffect(() => {
    if (!busy) return;
    const timer = setInterval(() => setItems(list => list.map(i => {
      if (i.status !== 'uploading') return i;
      const progress = Math.min(100, i.progress + 6 + (i.id % 3) * 5);
      if (i.failOnce && progress >= 60) return { ...i, status: 'error', failOnce: false };
      return progress >= 100 ? { ...i, progress: 100, status: 'done' } : { ...i, progress };
    })), 200);
    return () => clearInterval(timer);
  }, [busy]);
  const add = (files: File[]) => setItems(list => [...list, ...files.map(file => {
    const id = nextId.current++;
    return { id, file, status: 'uploading' as const, progress: 0, failOnce: id % 3 === 0, thumb: file.type.startsWith('image/') ? URL.createObjectURL(file) : undefined };
  })]);
  const remove = (u: Upload) => { if (u.thumb) URL.revokeObjectURL(u.thumb); setItems(list => list.filter(i => i.id !== u.id)); };
  const retry = (u: Upload) => setItems(list => list.map(i => i.id === u.id ? { ...i, status: 'uploading', progress: 0 } : i));
  const clear = () => setItems(list => { list.forEach(u => u.thumb && URL.revokeObjectURL(u.thumb)); return []; });
  /** Rows for <UploadToast> / <FileItem>, with retry and remove wired. */
  const rows = (error: string): UploadToastItem[] => items.map(u => ({
    id: u.id, name: u.file.name, size: u.file.size, status: u.status, progress: u.progress, thumb: u.thumb,
    error: u.status === 'error' ? error : undefined, onRetry: () => retry(u), onRemove: () => remove(u),
  }));
  return { items, add, remove, retry, clear, rows };
}
