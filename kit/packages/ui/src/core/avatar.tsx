import { useState } from 'react';
import { Camera, User } from 'lucide-react';
import { cx } from '../cx';
import { Button } from './button';
import { Tooltip } from './controls';
import { FileDropzone } from './file-upload';
import { initials } from './initials';
import { Dialog, DialogClose } from './overlays';

export type AvatarProps = {
  name: string;
  /** Photo URL. While it loads, or when it fails, the initials show instead. */
  src?: string;
  size?: 'sm' | 'md' | 'lg';
  shape?: 'square' | 'circle';
  /** Native hover tooltip; defaults to the name, "" turns it off. */
  title?: string;
};

/** Photo, else initials of the first + last word, else a person icon. Named by `name` for assistive tech. */
export function Avatar({ name, src, size = 'md', shape = 'square', title }: AvatarProps) {
  // keyed by src, so a new src starts over without an effect
  const [img, setImg] = useState<{ src: string; ok: boolean }>();
  const cur = img?.src === src ? img : undefined;
  const loaded = cur?.ok === true, failed = cur?.ok === false;
  const label = name.trim() || 'Người dùng';
  const text = initials(name);
  return (
    <span className={cx('dtx-avatar', size !== 'md' && `dtx-avatar--${size}`, shape === 'circle' && 'dtx-avatar--circle')} title={title ?? label} aria-label={label} role="img">
      {!loaded && (text || <User aria-hidden />)}
      {src && !failed && <img src={src} alt="" onLoad={() => setImg({ src, ok: true })} onError={() => setImg({ src, ok: false })} />}
    </span>
  );
}

export type AvatarPickerProps = Omit<AvatarProps, 'title'> & {
  /** On save: the picked image, or null when the photo was removed. Uploading it is the app's job. */
  onChange: (file: File | null) => void;
  /** Default PNG, JPEG, WEBP. */
  accept?: string;
  /** Bytes; default 5 MB. */
  maxSize?: number;
};

/** Avatar as a button: opens a dialog to pick, preview, remove and save the photo. Nothing changes until "Lưu ảnh". */
export function AvatarPicker({ name, src, size, shape = 'circle', onChange, accept = 'image/png,image/jpeg,image/webp', maxSize = 5 * 1024 * 1024 }: AvatarPickerProps) {
  const [open, setOpen] = useState(false);
  // undefined: unchanged · null: removed · picked: its preview URL belongs to this dialog and is revoked on close
  const [draft, setDraft] = useState<{ file: File; url: string } | null>();
  const shown = draft === undefined ? src : draft?.url;
  const replace = (next?: { file: File; url: string } | null) => { if (draft) URL.revokeObjectURL(draft.url); setDraft(next); };
  const close = () => { replace(undefined); setOpen(false); };
  const label = name.trim() || 'Người dùng';
  return (
    <>
      <Tooltip content="Đổi ảnh đại diện">
        <button type="button" className={cx('dtx-avatar-btn', shape === 'circle' && 'dtx-avatar-btn--circle')}
          aria-label={`Đổi ảnh đại diện của ${label}`} aria-haspopup="dialog" onClick={() => setOpen(true)}>
          <Avatar name={name} src={src} size={size} shape={shape} title="" />
          <span className="dtx-avatar-btn__cam" aria-hidden><Camera /></span>
        </button>
      </Tooltip>
      <Dialog open={open} onOpenChange={o => (o ? setOpen(true) : close())} title="Ảnh đại diện"
        footer={<>
          {shown && <Button variant="ghost" className="dtx-avatar-picker__remove" onClick={() => replace(null)}>Xoá ảnh</Button>}
          <DialogClose><Button variant="ghost">Huỷ</Button></DialogClose>
          <Button disabled={draft === undefined || (draft === null && !src)} onClick={() => { onChange(draft ? draft.file : null); close(); }}>Lưu ảnh</Button>
        </>}>
        <div className="dtx-avatar-picker__preview">
          <Avatar name={name} src={shown} size="lg" shape={shape} title="" />
          <p><b>{label}</b><span>{shown ? 'Ảnh được cắt vừa khung.' : 'Chưa có ảnh, đang hiện chữ cái đầu tên.'}</span></p>
        </div>
        <FileDropzone compact multiple={false} accept={accept} maxSize={maxSize} label="Ảnh mới"
          onFiles={([file]) => replace({ file, url: URL.createObjectURL(file) })} />
      </Dialog>
    </>
  );
}
