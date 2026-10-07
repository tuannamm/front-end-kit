import { useEffect, useId, useRef, useState, type DragEvent, type ReactNode } from 'react';
import { Toast } from '@base-ui/react/toast';
import { CheckCircle2, ChevronDown, CircleAlert, File as FileIcon, FileArchive, FileImage, FileText, RotateCw, Upload, X } from 'lucide-react';
import { cx } from '../../cx';
import { Badge } from '../badge/badge';
import { Button } from '../button/button';
import { acceptLabel, checkFiles, formatBytes, type FileRejection } from './file';

export type FileDropzoneProps = {
  /** Accepted files of one pick or drop. Uploading them is the app's job; show them with <FileList>. */
  onFiles: (files: File[]) => void;
  /** Rejected files; the dropzone also lists them under itself until the next pick. */
  onReject?: (rejections: FileRejection[]) => void;
  /** Same as <input accept>: ".pdf,image/*". */
  accept?: string;
  /** Bytes. */
  maxSize?: number;
  multiple?: boolean;
  disabled?: boolean;
  label?: ReactNode;
  /** Defaults to the accepted formats and size limit, e.g. "PDF, ảnh · tối đa 20 MB". */
  hint?: ReactNode;
  description?: ReactNode;
  error?: ReactNode;
  /** One row instead of a tall box, for forms and narrow panels. */
  compact?: boolean;
  className?: string;
  'aria-label'?: string;
};

/** Drop files or click / Enter to pick. Validates type and size; never uploads by itself. */
export function FileDropzone({ onFiles, onReject, accept, maxSize, multiple = true, disabled, label, hint, description, error, compact, className, 'aria-label': ariaLabel }: FileDropzoneProps) {
  const id = useId();
  const input = useRef<HTMLInputElement>(null);
  const [over, setOver] = useState(false);
  const [rejected, setRejected] = useState<FileRejection[]>([]);
  const autoHint = [acceptLabel(accept), maxSize !== undefined && `tối đa ${formatBytes(maxSize)}`].filter(Boolean).join(' · ');
  const shownHint = hint ?? autoHint;

  const take = (list: FileList | null) => {
    if (disabled || !list?.length) return;
    const { accepted, rejected: bad } = checkFiles([...list], { accept, maxSize, multiple });
    setRejected(bad);
    if (bad.length) onReject?.(bad);
    if (accepted.length) onFiles(accepted);
  };
  // dragover/drop are always cancelled, even when disabled: otherwise the browser opens the dropped file and leaves the app
  const onDragOver = (e: DragEvent) => {
    if (!e.dataTransfer.types.includes('Files')) return;
    e.preventDefault();
    e.dataTransfer.dropEffect = disabled ? 'none' : 'copy';
    if (!disabled) setOver(true);
  };
  const onDragLeave = (e: DragEvent) => { if (!e.currentTarget.contains(e.relatedTarget as Node | null)) setOver(false); };
  const onDrop = (e: DragEvent) => { e.preventDefault(); setOver(false); take(e.dataTransfer.files); };

  const describedBy = [shownHint && `${id}h`, description && `${id}d`, (error || rejected.length) && `${id}e`].filter(Boolean).join(' ') || undefined;
  return (
    // drag handlers sit on the wrapper: a disabled button gets no drag events, and the drop must still be cancelled
    <div className={cx('dtx-field', className)} onDragEnter={onDragOver} onDragOver={onDragOver} onDragLeave={onDragLeave} onDrop={onDrop}>
      {label && <span id={`${id}l`} className="dtx-field__label">{label}</span>}
      <button type="button" className={cx('dtx-drop', compact && 'dtx-drop--compact')} disabled={disabled} data-over={over || undefined}
        aria-label={label ? undefined : ariaLabel} aria-labelledby={label ? `${id}l ${id}t` : undefined} aria-describedby={describedBy}
        aria-invalid={error || rejected.length ? true : undefined}
        onClick={() => input.current?.click()}>
        <Upload className="dtx-drop__icon" aria-hidden />
        <span id={`${id}t`} className="dtx-drop__text">
          {over ? 'Thả để thêm tệp' : <>Kéo thả {multiple ? 'tệp' : '1 tệp'} vào đây hoặc <span className="dtx-drop__cta">chọn từ máy</span></>}
        </span>
        {shownHint && <span id={`${id}h`} className="dtx-drop__hint">{shownHint}</span>}
      </button>
      {/* reset after each pick so choosing the same file again still fires change */}
      <input ref={input} type="file" hidden tabIndex={-1} accept={accept} multiple={multiple} onChange={e => { take(e.target.files); e.target.value = ''; }} />
      {description && <span id={`${id}d`} className="dtx-field__desc">{description}</span>}
      {(error || rejected.length > 0) && (
        <div id={`${id}e`} className="dtx-field__error" role="alert">
          {error}
          {rejected.length > 0 && <ul className="dtx-drop__rejects">{rejected.map((r, i) => <li key={i}><b>{r.file.name}</b>: {r.reason}</li>)}</ul>}
        </div>
      )}
    </div>
  );
}

export function FileList({ children, className, 'aria-label': ariaLabel }: { children: ReactNode; className?: string; 'aria-label'?: string }) {
  return <ul className={cx('dtx-files', className)} aria-label={ariaLabel}>{children}</ul>;
}

export type FileItemProps = {
  name: string;
  /** Bytes. */
  size?: number;
  status?: 'queued' | 'uploading' | 'done' | 'error';
  /** 0–100 while uploading. */
  progress?: number;
  /** What failed and how to recover; shown when status is error. */
  error?: ReactNode;
  /** Thumbnail URL (e.g. URL.createObjectURL(file)) for images. */
  thumb?: string;
  /** Remove; while uploading it reads "Huỷ tải". */
  onRemove?: () => void;
  onRetry?: () => void;
};

const iconFor = (name: string) => /\.pdf$/i.test(name) ? FileText : /\.(jpe?g|png|gif|webp|tiff?|bmp|heic)$/i.test(name) ? FileImage
  : /\.(zip|7z|rar|tar|gz)$/i.test(name) ? FileArchive : FileIcon;

/** One file row: icon or thumbnail, name, size, status, progress, and remove / retry. */
export function FileItem({ name, size, status = 'done', progress = 0, error, thumb, onRemove, onRetry }: FileItemProps) {
  const Icon = iconFor(name);
  // a thumbnail that fails to decode (corrupt or unsupported image) falls back to the type icon
  const [broken, setBroken] = useState(false);
  useEffect(() => setBroken(false), [thumb]);
  const pct = Math.round(Math.min(100, Math.max(0, progress)));
  const state = { queued: 'Đang chờ', uploading: 'Đang tải lên', done: 'Đã tải lên', error: error ?? 'Tải lên thất bại' }[status];
  return (
    <li className="dtx-file" data-status={status}>
      <span className="dtx-file__icon">{thumb && !broken ? <img src={thumb} alt="" width={36} height={36} onError={() => setBroken(true)} /> : <Icon aria-hidden />}</span>
      <div className="dtx-file__main">
        <span className="dtx-file__name" title={name}>{name}</span>
        <span className="dtx-file__meta">
          {size !== undefined && <span className="dtx-num">{formatBytes(size)}</span>}
          {/* status changes are announced; the ticking percentage is not */}
          <span className="dtx-file__state" role="status">{status === 'done' && <CheckCircle2 aria-hidden />}{state}</span>
          {status === 'uploading' && <span className="dtx-num" aria-hidden>{pct}%</span>}
        </span>
        {status === 'uploading' && (
          <div className="dtx-file__bar" role="progressbar" aria-valuenow={pct} aria-valuemin={0} aria-valuemax={100} aria-label={`Đang tải ${name}`}>
            <i style={{ transform: `scaleX(${pct / 100})` }} />
          </div>
        )}
      </div>
      {(onRetry && status === 'error' || onRemove) && (
        <div className="dtx-file__actions">
          {onRetry && status === 'error' && <Button variant="ghost" size="sm" icon aria-label={`Thử lại ${name}`} onClick={onRetry}><RotateCw /></Button>}
          {onRemove && <Button variant="ghost" size="sm" icon aria-label={`${status === 'uploading' ? 'Huỷ tải' : 'Xoá'} ${name}`} onClick={onRemove}><X /></Button>}
        </div>
      )}
    </li>
  );
}

export type UploadToastItem = FileItemProps & { id: string | number };
type Phase = 'active' | 'failed' | 'done';

/**
 * Upload progress in a toast (stacks with the other toasts): count, overall bar and a collapsible file list with
 * retry / remove per file. Pass the current files on every change; renders nothing itself. It stays while files upload
 * or have failed, closes 5s after all are done, and when closed by the user returns only once more files are added.
 * The list puts files needing attention first (failed, uploading, queued) and scrolls without a visible scrollbar.
 * Needs <ToastProvider>. Unmounting it closes the toast, so render it outside the Drawer / Dialog that picks the files
 * (their content unmounts on close).
 */
export function UploadToast({ items }: { items: UploadToastItem[] }) {
  const m = Toast.useToastManager();
  const toastId = useRef<string | null>(null);
  const phase = useRef<Phase | null>(null);
  const count = useRef(items.length);
  const closedAt = useRef(-1); // item count when the toast was closed
  count.current = items.length;
  // only what is shown: a parent re-rendering with an equal list must not restart the auto-close timer
  const sig = items.map(i => `${i.id}:${i.status}:${Math.round(i.progress ?? 0)}`).join('|');
  useEffect(() => {
    if (!items.length) {
      if (toastId.current) m.close(toastId.current);
      toastId.current = null; phase.current = null; closedAt.current = -1;
      return;
    }
    if (closedAt.current >= 0 && items.length <= closedAt.current) return;
    closedAt.current = -1;
    const n = items.length;
    const done = items.filter(i => i.status === 'done').length, failed = items.filter(i => i.status === 'error').length;
    const next: Phase = done + failed < n ? 'active' : failed ? 'failed' : 'done';
    const opts = {
      title: next === 'active' ? `Đang tải lên ${done}/${n} tệp` : next === 'failed' ? `${failed}/${n} tệp tải lên thất bại` : `Đã tải lên ${n} tệp`,
      description: next === 'active' ? (failed ? `${failed} tệp lỗi` : undefined) : next === 'failed' ? 'Thử lại hoặc xoá từng tệp.' : undefined,
      data: {
        icon: next === 'active' ? <Badge size="sm" live /> : next === 'failed' ? <Badge tone="err" size="sm" icon={<CircleAlert />} /> : <Badge tone="ok" size="sm" icon={<CheckCircle2 />} />,
        body: <UploadToastBody items={items} active={next === 'active'} />,
      },
      // sent only when the phase changes: every timeout update restarts the timer
      ...(next !== phase.current && { timeout: next === 'done' ? 5000 : 0 }),
    };
    phase.current = next;
    if (toastId.current) m.update(toastId.current, opts);
    else toastId.current = m.add({ ...opts, onClose: () => { closedAt.current = count.current; toastId.current = null; phase.current = null; } });
  }, [sig]); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => () => { if (toastId.current) m.close(toastId.current); }, []); // eslint-disable-line react-hooks/exhaustive-deps
  return null;
}

const rank = { error: 0, uploading: 1, queued: 2, done: 3 };

function UploadToastBody({ items, active }: { items: UploadToastItem[]; active: boolean }) {
  const [open, setOpen] = useState(true);
  const shown = [...items].sort((a, b) => rank[a.status ?? 'done'] - rank[b.status ?? 'done']);
  const listId = useId();
  const pct = Math.round(items.reduce((s, i) => s + (i.status === 'done' ? 100 : i.status === 'uploading' ? i.progress ?? 0 : 0), 0) / items.length);
  return (
    <div className="dtx-toast__body">
      {active && <div className="dtx-file__bar" role="progressbar" aria-valuenow={pct} aria-valuemin={0} aria-valuemax={100} aria-label="Tiến độ tải lên"><i style={{ transform: `scaleX(${pct / 100})` }} /></div>}
      <button type="button" className="dtx-toast__toggle" aria-expanded={open} aria-controls={listId} onClick={() => setOpen(o => !o)}>
        {open ? 'Ẩn danh sách' : `Xem ${items.length} tệp`}<ChevronDown aria-hidden />
      </button>
      <div id={listId} hidden={!open}>
        <FileList aria-label="Tệp đang tải lên">{shown.map(({ id, ...item }) => <FileItem key={id} {...item} />)}</FileList>
      </div>
    </div>
  );
}
