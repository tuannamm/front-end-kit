/**
 * # Avatar · AvatarPicker
 *
 * A person's photo, or their initials when there is no photo.
 *
 * ```tsx
 * import { Avatar, AvatarPicker } from '@dgtx/ui-frek';
 *
 * <Avatar name="Jane Smith" src={user.photo} />            // "JS" while the photo loads or if it fails
 * <AvatarPicker name={user.name} src={user.photo} onChange={file => file ? uploadPhoto(file) : removePhoto()} />
 * ```
 *
 * ## Notes
 *
 * - Fallback order: photo, then the initials of the first and last word (Vietnamese diacritics kept), then a person icon.
 * - `name` is the accessible label (`role="img"`) and the default hover title. `title=""` turns the title off.
 * - The navy tile with white initials is the same in both themes (`theme-fixed`).
 * - **AvatarPicker:** a button that opens a dialog to pick, preview, remove and save a photo. Nothing changes until
 *   "Save photo". `onChange` receives the `File`, or `null` when the photo was removed. Uploading is the app's job.
 *   The default is PNG/JPEG/WEBP up to 5 MB. The preview's object URL is revoked when the dialog closes.
 *
 * ## Props
 *
 * ### Avatar
 *
 * | Prop | Type | Default | Description |
 * |---|---|---|---|
 * | `name` | `string` | **required** | Initials, accessible label and default hover title |
 * | `src` | `string` |  | Photo URL |
 * | `size` | `'sm' \| 'md' \| 'lg'` | `'md'` | 28 · 32 · 64px |
 * | `shape` | `'square' \| 'circle'` | `'square'` |  |
 * | `title` | `string` |  | Hover title. Default: `name`; `""` turns it off |
 *
 * ### AvatarPicker
 *
 * | Prop | Type | Default | Description |
 * |---|---|---|---|
 * | `name` | `string` | **required** | As Avatar |
 * | `onChange` | `(file: File \| null) => void` | **required** | On save: the picked image, or null when the photo was removed |
 * | `src` | `string` |  | Current photo URL |
 * | `size` | `'sm' \| 'md' \| 'lg'` | `'md'` | As Avatar |
 * | `shape` | `'square' \| 'circle'` | `'circle'` |  |
 * | `accept` | `string` | `'image/png,image/jpeg,image/webp'` |  |
 * | `maxSize` | `number` | 5 MB | Bytes |
 *
 * ## Files
 *
 * - `avatar.tsx`: Avatar, AvatarPicker. Uses Button, Tooltip, Dialog and FileDropzone.
 * - `avatar.css`: `.dtx-avatar*`
 * - `initials.ts` + `initials.check.ts`: initials helper and its node check
 *
 * Catalog: `#/catalog/avatar`
 *
 * @generated from README.md in this folder. Edit the README, then run `npm run docs:sync`.
 */

import { useState } from 'react';
import { Camera, User } from 'lucide-react';
import { cx } from '../../cx';
import { Button } from '../button/button';
import { Tooltip } from '../controls/controls';
import { FileDropzone } from '../file-upload/file-upload';
import { initials } from './initials';
import { Dialog, DialogClose } from '../overlays/overlays';

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
  const label = name.trim() || 'User';
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

/** Avatar as a button: opens a dialog to pick, preview, remove and save the photo. Nothing changes until "Save photo". */
export function AvatarPicker({ name, src, size, shape = 'circle', onChange, accept = 'image/png,image/jpeg,image/webp', maxSize = 5 * 1024 * 1024 }: AvatarPickerProps) {
  const [open, setOpen] = useState(false);
  // undefined: unchanged · null: removed · picked: its preview URL belongs to this dialog and is revoked on close
  const [draft, setDraft] = useState<{ file: File; url: string } | null>();
  const shown = draft === undefined ? src : draft?.url;
  const replace = (next?: { file: File; url: string } | null) => { if (draft) URL.revokeObjectURL(draft.url); setDraft(next); };
  const close = () => { replace(undefined); setOpen(false); };
  const label = name.trim() || 'User';
  return (
    <>
      <Tooltip content="Change photo">
        <button type="button" className={cx('dtx-avatar-btn', shape === 'circle' && 'dtx-avatar-btn--circle')}
          aria-label={`Change photo of ${label}`} aria-haspopup="dialog" onClick={() => setOpen(true)}>
          <Avatar name={name} src={src} size={size} shape={shape} title="" />
          <span className="dtx-avatar-btn__cam" aria-hidden><Camera /></span>
        </button>
      </Tooltip>
      <Dialog open={open} onOpenChange={o => (o ? setOpen(true) : close())} title="Profile photo"
        footer={<>
          {shown && <Button variant="ghost" className="dtx-avatar-picker__remove" onClick={() => replace(null)}>Remove photo</Button>}
          <DialogClose><Button variant="ghost">Cancel</Button></DialogClose>
          <Button disabled={draft === undefined || (draft === null && !src)} onClick={() => { onChange(draft ? draft.file : null); close(); }}>Save photo</Button>
        </>}>
        <div className="dtx-avatar-picker__preview">
          <Avatar name={name} src={shown} size="lg" shape={shape} title="" />
          <p><b>{label}</b><span>{shown ? 'Photo is cropped to fit.' : 'No photo yet, showing initials.'}</span></p>
        </div>
        <FileDropzone compact multiple={false} accept={accept} maxSize={maxSize} label="New photo"
          onFiles={([file]) => replace({ file, url: URL.createObjectURL(file) })} />
      </Dialog>
    </>
  );
}
