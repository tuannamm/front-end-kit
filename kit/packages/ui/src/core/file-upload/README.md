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

## Files

- `file-upload.tsx`: components
- `file-upload.css`: `.dtx-drop*`, `.dtx-files`, `.dtx-file*`, and the toast list (`.dtx-toast__body`, `__toggle`, scroll fade)
- `file.ts` + `file.check.ts`: validation and formatting helpers and their node check

Catalog: `#/catalog/upload`

Props are documented in TSDoc on the types in the `.tsx`; this file covers usage and decisions only.
