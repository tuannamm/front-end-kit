# FileDropzone · FileList · FileItem · UploadToast

Pick files, validate them and show upload progress. **Nothing here uploads**: the app gets `File` objects and
reports progress back.

```tsx
import { FileDropzone, FileList, FileItem, UploadToast } from '@dtx/ui';

<FileDropzone label="Hồ sơ đính kèm" accept=".pdf,image/*" maxSize={20 * 1024 * 1024} onFiles={upload} />

<UploadToast items={uploads} />                     // { id, name, size, status, progress, error, onRetry, onRemove }[]

<FileList aria-label="Tệp đã tải">                  // inline rows, when a toast does not fit
  {uploads.map(u => <FileItem key={u.id} {...u} />)}
</FileList>
```

## Notes

- **Dropzone:** accepts a drop, a click or Enter. It checks type (same rules as `<input accept>`) and size, then calls
  `onFiles` with the accepted files. Rejected files are listed under it with a reason and a recovery step until the next pick.
  The hint defaults to the accepted formats and the size limit ("PDF, ảnh · tối đa 20 MB").
- Drag events are always cancelled, even when the dropzone is disabled, so a dropped file never opens in the browser tab.
- `compact`: one row, for forms and narrow panels. AvatarPicker uses it.
- **FileItem:** `queued · uploading · done · error`. Screen readers announce the status changes, but not the changing percentage.
  A thumbnail that cannot be decoded falls back to the file-type icon.
- **UploadToast:** shows a count, an overall progress bar, and a collapsible list with failed files first.
  It stays open while files upload or have failed, and closes 5s after all are done. After the user closes it, it opens again only when more files are added.
  It needs `<ToastProvider>`. Render it **outside** the Drawer or Dialog that picks the files: their content unmounts on close, and unmounting closes the toast.

## Helpers (`file.ts`, pure, no DOM)

`formatBytes` (1536 → "1,5 KB") and `acceptsFile` are exported. `acceptLabel` and `checkFiles` are internal.

## Props

### FileDropzone

| Prop | Type | Default | Description |
|---|---|---|---|
| `onFiles` | `(files: File[]) => void` | **required** | Accepted files of one pick or drop |
| `onReject` | `(rejections: FileRejection[]) => void` |  | Rejected files, with the reason |
| `accept` | `string` |  | Same as `<input accept>`, e.g. `.pdf,image/*` |
| `maxSize` | `number` |  | Bytes |
| `multiple` | `boolean` | `true` |  |
| `disabled` | `boolean` |  |  |
| `label` | `ReactNode` |  | Visible label |
| `hint` | `ReactNode` |  | Default: accepted formats and size limit |
| `description` | `ReactNode` |  | Line under the box |
| `error` | `ReactNode` |  | Error message. Marks the box invalid |
| `compact` | `boolean` |  | One row instead of a tall box |
| `aria-label` | `string` |  | Accessible name when there is no `label` |
| `className` | `string` |  | On the field wrapper |

### FileList

| Prop | Type | Default | Description |
|---|---|---|---|
| `children` | `ReactNode` | **required** | `<FileItem>` rows |
| `aria-label` | `string` |  | Accessible name of the list |
| `className` | `string` |  | Extra classes |

### FileItem

| Prop | Type | Default | Description |
|---|---|---|---|
| `name` | `string` | **required** | File name |
| `size` | `number` |  | Bytes |
| `status` | `'queued' \| 'uploading' \| 'done' \| 'error'` | `'done'` |  |
| `progress` | `number` | `0` | 0–100 while uploading |
| `error` | `ReactNode` | `'Tải lên thất bại'` | What failed and how to recover; shown when `status` is error |
| `thumb` | `string` |  | Thumbnail URL for images, e.g. `URL.createObjectURL(file)` |
| `onRemove` | `() => void` |  | Remove; reads "Huỷ tải" while uploading |
| `onRetry` | `() => void` |  | Shown when `status` is error |

### UploadToast

| Prop | Type | Default | Description |
|---|---|---|---|
| `items` | `UploadToastItem[]` | **required** | Current files; pass the new list on every change |

### UploadToastItem

| Prop | Type | Default | Description |
|---|---|---|---|
| `id` | `string \| number` | **required** | Stable key |

Plus every FileItem prop.

### FileRejection

| Prop | Type | Default | Description |
|---|---|---|---|
| `file` | `File` | **required** | The rejected file |
| `reason` | `string` | **required** | Why, and how to recover (Vietnamese) |

## Files

- `file-upload.tsx`: components
- `file-upload.css`: `.dtx-drop*`, `.dtx-files`, `.dtx-file*`, and the toast list (`.dtx-toast__body`, `__toggle`, scroll fade)
- `file.ts` + `file.check.ts`: validation and formatting helpers and their node check

Catalog: `#/catalog/upload`
