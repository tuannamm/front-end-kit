# ImageViewer

One image with zoom, pan, quarter-turn rotation and download. Plain `<img>`, no extra dependency.

```tsx
import { ImageViewer } from '@dgtx/ui-frek';

<ImageViewer src="/files/trang-1.jpg" fileName="trang-1.jpg" />

// a File from FileDropzone or an <input type="file">: nothing is uploaded
<ImageViewer src={file} fileName={file?.name} className="h-[70vh]" />
```

### Boxes over the image

`renderPage` wraps the image in any component that draws in 0–1 image fractions: BoxOverlay (rectangles and polygons),
ScanBeam, FieldLink. Same prop as PdfViewer, so swapping viewers keeps the overlay.

```tsx
<ImageViewer src={scan} renderPage={(page, { width, height }) => (
  <BoxOverlay boxes={lines.map(l => ({ id: l.id, text: l.text, ...toBox(l.poly, width, height) }))}>{page}</BoxOverlay>
)} />
```

- The wrapper zooms, pans and turns with the image. `width`/`height` are the image's natural pixels.
- A click on a box selects it; a mouse drag that starts on a box still pans. Double-click on a box does not zoom.
- BoxOverlay's lens turns with the page, so after a quarter turn the magnified crop is sideways too.

## Notes

- **Formats:** whatever the browser draws: PNG, JPEG, WebP, GIF (animated), AVIF, SVG, BMP, ICO. TIFF and HEIC draw
  only in Safari; elsewhere the error says so and asks for PNG or JPEG. Multi-page TIFF needs a server-side conversion.
- **Sources:** a URL or a `File`/`Blob`. A Blob gets an object URL that is revoked when `src` changes. Keep `src` stable
  between renders (state, memo): a new value reloads the image and resets zoom and rotation.
- **Zoom:** −/+ step through the 25–400% presets of PdfViewer plus the fit scale, which goes below 25% for a big scan.
  "Vừa khung" (`'fit'`) shows the whole image, never enlarged past 100%, and follows the container size; pressing it
  again goes to 100%. Ctrl + wheel and trackpad pinch zoom smoothly around the pointer; double-click toggles fit and
  100% at the pointer. Button zooms keep the centre of the view in place.
- **Pan:** the image area is a native scroller, so touch, trackpad, wheel and arrow keys pan it. With a mouse, drag the
  image once it is larger than the view (the cursor turns into a hand).
- **Rotate:** "Xoay phải 90°" turns the view only; the file and the download stay as they are.
- **States:** loading, empty, and an error that names the cause it can know: TIFF/HEIC, a broken file (Blob), or a URL
  that did not load. An `<img>` error has no HTTP status, so 404 and network errors share one message; "Thử lại" appears
  only for URLs.
- **Download:** a cross-origin URL without `Content-Disposition` opens in a new tab instead of downloading; that is the
  browser's rule for the `download` attribute.
- **Accessibility:** the toolbar is a `toolbar`, icon buttons have names and tooltips, the zoom label is announced, and
  the image area is a focusable `region`. The image's `alt` defaults to `fileName`; pass a real description when the
  picture carries meaning.
- Transparent areas show a light checkerboard in both themes, so dark ink stays visible on the dark theme.
- Size the viewer from outside (`className` with a height, or a flex parent); the default height is 640px.

## Props

### ImageViewer

| Prop | Type | Default | Description |
|---|---|---|---|
| `src` | `string \| Blob \| null` |  | The image; nothing shows the empty state |
| `alt` | `string` | `fileName` | Text alternative for the image |
| `fileName` | `string` |  | Toolbar title, name of the image region and of the downloaded file |
| `defaultZoom` | `number \| 'fit'` | `'fit'` | `'fit'` = whole image in view; a number is a scale (1 = 100%) |
| `download` | `boolean` | `true` | Show the download button |
| `renderPage` | `(page: ReactNode, info: { index, width, height }) => ReactNode` |  | Wraps the image (BoxOverlay, ScanBeam…); size in natural pixels, `index` is 0 |
| `className` | `string` |  | Extra classes, e.g. a height |

## Files

- `image-viewer.tsx`: ImageViewer. Uses Button, Tooltip, Skeleton, EmptyState and the zoom presets of `pdf-viewer/view.ts`.
- `image-viewer.css`: `.dtx-img*`.
- `view.ts` + `view.check.ts`: fit scale, rotation box, zoom stops, wheel zoom, error messages, and their node check.

Catalog: `#/catalog/image-viewer`
