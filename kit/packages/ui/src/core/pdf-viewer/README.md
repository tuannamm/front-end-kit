# PdfViewer

A scrolling column of PDF pages with page navigation, zoom and download. Built on pdf.js (`pdfjs-dist`).

```tsx
import { PdfViewer } from '@dtx/ui';

<PdfViewer src="/files/hop-dong.pdf" fileName="hop-dong.pdf" />

// a File from FileDropzone or an <input type="file">: nothing is uploaded
<PdfViewer src={file} fileName={file?.name} className="h-[70vh]" />
```

## Notes

- **Sources:** a URL (same origin, or a server that sends CORS headers), a `File`/`Blob`, an `ArrayBuffer` or a
  `Uint8Array`. The bytes are copied before pdf.js takes them, so your buffer stays usable. Keep `src` stable between
  renders (state, memo): a new value reopens the file.
- **Loading:** pdf.js (about 1 MB) is imported with the first viewer, not with the kit, and parses in a Web Worker
  (`pdf.worker.ts`, bundled by Vite or webpack 5 through `new Worker(new URL(…))`).
- **Drawing:** every page size is read on open, so the scroll height is right at once. Pages within one viewport of the
  visible area are drawn to a canvas at the screen's pixel ratio; pages further away release theirs. A zoom draws the
  new canvas off-screen and swaps it in, so pages never flash blank. Canvases are capped at 16.7M pixels (iOS limit).
- **Zoom:** −/+ step through 25–400% presets. "Vừa chiều rộng" (`'fit'`) fits every page to the width, portrait and
  landscape alike, and follows the container width; the label shows the current page's scale. Pressing it again goes
  to 100%. Zooming keeps the spot at the top of the view.
- **Page box:** type a number and press Enter (or leave the box); Escape restores it. The current page is the one a third
  of the way down the view, or the last page once scrolled to the bottom.
- **States:** loading (with a percentage when the server sends a length), empty, and an error that says what failed
  and how to recover: password, not a PDF, HTTP 404 or other status, network. "Thử lại" appears only when retrying can help.
  A page that fails to draw says so in place.
- **Accessibility:** the toolbar is a `toolbar`, icon buttons have names and tooltips, the page area is a focusable
  `region` (arrow keys and Page Up/Down scroll). Pages are `role="img"` named "Trang 3 / 12": there is no text layer yet,
  so text cannot be selected, searched or read aloud.
- Pages are paper: white in both themes, edged with a hairline on the sunken surface.
- Size the viewer from outside (`className` with a height, or a flex parent); the default height is 640px.

## Props

### PdfViewer

| Prop | Type | Default | Description |
|---|---|---|---|
| `src` | `string \| Blob \| ArrayBuffer \| Uint8Array \| null` |  | The file; nothing shows the empty state |
| `fileName` | `string` |  | Toolbar title, name of the page region and of the downloaded file |
| `defaultZoom` | `number \| 'fit'` | `'fit'` | `'fit'` = every page fills the width; a number is a scale (1 = 100%) |
| `download` | `boolean` | `true` | Show the download button |
| `className` | `string` |  | Extra classes, e.g. a height |

## Files

- `pdf-viewer.tsx`: PdfViewer and its Page. Uses Button, Tooltip and Skeleton.
- `pdf-viewer.css`: `.dtx-pdf*`. Load it after `field.css` (it narrows `.dtx-input` for the page box).
- `pdf.worker.ts`: the pdf.js worker entry.
- `view.ts` + `view.check.ts`: zoom steps, page-at-scroll, page box parsing, error messages, and their node check.

Catalog: `#/catalog/pdf-viewer`
