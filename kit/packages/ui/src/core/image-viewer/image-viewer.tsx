/**
 * # ImageViewer
 *
 * One image with zoom, pan, quarter-turn rotation and download. Plain `<img>`, no extra dependency.
 *
 * ```tsx
 * import { ImageViewer } from '@dgtx/ui-frek';
 *
 * <ImageViewer src="/files/page-1.jpg" fileName="page-1.jpg" />
 *
 * // a File from FileDropzone or an <input type="file">: nothing is uploaded
 * <ImageViewer src={file} fileName={file?.name} className="h-[70vh]" />
 * ```
 *
 * ### Boxes over the image
 *
 * `renderPage` wraps the image in any component that draws in 0–1 image fractions: BoxOverlay (rectangles and polygons),
 * ScanBeam, FieldLink. Same prop as PdfViewer, so swapping viewers keeps the overlay.
 *
 * ```tsx
 * <ImageViewer src={scan} renderPage={(page, { width, height }) => (
 *   <BoxOverlay boxes={lines.map(l => ({ id: l.id, text: l.text, ...toBox(l.poly, width, height) }))}>{page}</BoxOverlay>
 * )} />
 * ```
 *
 * - The wrapper zooms, pans and turns with the image. `width`/`height` are the image's natural pixels.
 * - A click on a box selects it; a mouse drag that starts on a box still pans. Double-click on a box does not zoom.
 * - BoxOverlay's lens turns with the page, so after a quarter turn the magnified crop is sideways too.
 *
 * ## Notes
 *
 * - **Formats:** whatever the browser draws: PNG, JPEG, WebP, GIF (animated), AVIF, SVG, BMP, ICO. TIFF and HEIC draw
 *   only in Safari; elsewhere the error says so and asks for PNG or JPEG. Multi-page TIFF needs a server-side conversion.
 * - **Sources:** a URL or a `File`/`Blob`. A Blob gets an object URL that is revoked when `src` changes. Keep `src` stable
 *   between renders (state, memo): a new value reloads the image and resets zoom and rotation.
 * - **Zoom:** −/+ step through the 25–400% presets of PdfViewer plus the fit scale, which goes below 25% for a big scan.
 *   "Fit" (`'fit'`) shows the whole image, never enlarged past 100%, and follows the container size; pressing it
 *   again goes to 100%. Ctrl + wheel and trackpad pinch zoom smoothly around the pointer; double-click toggles fit and
 *   100% at the pointer. Button zooms keep the centre of the view in place.
 * - **Pan:** the image area is a native scroller, so touch, trackpad, wheel and arrow keys pan it. With a mouse, drag the
 *   image once it is larger than the view (the cursor turns into a hand).
 * - **Rotate:** "Rotate 90°" turns the view only; the file and the download stay as they are.
 * - **States:** loading, empty, and an error that names the cause it can know: TIFF/HEIC, a broken file (Blob), or a URL
 *   that did not load. An `<img>` error has no HTTP status, so 404 and network errors share one message; "Retry" appears
 *   only for URLs.
 * - **Download:** a cross-origin URL without `Content-Disposition` opens in a new tab instead of downloading; that is the
 *   browser's rule for the `download` attribute.
 * - **Accessibility:** the toolbar is a `toolbar`, icon buttons have names and tooltips, the zoom label is announced, and
 *   the image area is a focusable `region`. The image's `alt` defaults to `fileName`; pass a real description when the
 *   picture carries meaning.
 * - Transparent areas show a light checkerboard in both themes, so dark ink stays visible on the dark theme.
 * - Size the viewer from outside (`className` with a height, or a flex parent); the default height is 640px.
 *
 * ## Props
 *
 * ### ImageViewer
 *
 * | Prop | Type | Default | Description |
 * |---|---|---|---|
 * | `src` | `string \| Blob \| null` |  | The image; nothing shows the empty state |
 * | `alt` | `string` | `fileName` | Text alternative for the image |
 * | `fileName` | `string` |  | Toolbar title, name of the image region and of the downloaded file |
 * | `defaultZoom` | `number \| 'fit'` | `'fit'` | `'fit'` = whole image in view; a number is a scale (1 = 100%) |
 * | `download` | `boolean` | `true` | Show the download button |
 * | `renderPage` | `(page: ReactNode, info: { index, width, height }) => ReactNode` |  | Wraps the image (BoxOverlay, ScanBeam…); size in natural pixels, `index` is 0 |
 * | `className` | `string` |  | Extra classes, e.g. a height |
 *
 * ## Files
 *
 * - `image-viewer.tsx`: ImageViewer. Uses Button, Tooltip, Skeleton, EmptyState and the zoom presets of `pdf-viewer/view.ts`.
 * - `image-viewer.css`: `.dtx-img*`.
 * - `view.ts` + `view.check.ts`: fit scale, rotation box, zoom stops, wheel zoom, error messages, and their node check.
 *
 * Catalog: `#/catalog/image-viewer`
 *
 * @generated from README.md in this folder. Edit the README, then run `npm run docs:sync`.
 */

import { useEffect, useLayoutEffect, useRef, useState, type ComponentProps } from 'react';
import { Download, FileImage, ImageIcon, Maximize, Minus, Plus, RotateCw } from 'lucide-react';
import { cx } from '../../cx';
import { Skeleton } from '../../motion/primitives';
import { Button } from '../button/button';
import { Tooltip } from '../controls/controls';
import { EmptyState } from '../empty-state/empty-state';
import type { RenderPage } from '../pdf-viewer/pdf-viewer';
import { ZOOM_MAX, ZOOM_MIN, stepZoom } from '../pdf-viewer/view';
import { describeError, fitScale, turned, wheelZoom, zoomStops, type ImageError, type Size, type Turn } from './view';

export type ImageSource = string | Blob;

export type ImageViewerProps = {
  /** URL or File/Blob, in any format the browser draws (PNG, JPEG, WebP, GIF, AVIF, SVG, BMP). Keep it stable: a new value reloads. */
  src?: ImageSource | null;
  /** Text alternative; defaults to `fileName`. */
  alt?: string;
  /** Shown in the toolbar; names the image region and the downloaded file. */
  fileName?: string;
  /** 'fit' = the whole image in view (never enlarged) and follows resizes; a number is a scale, 1 = 100%. */
  defaultZoom?: number | 'fit';
  /** Show the download button. */
  download?: boolean;
  /** Wraps the image, e.g. `page => <BoxOverlay boxes={lines}>{page}</BoxOverlay>`; the wrapper zooms and turns with it. */
  renderPage?: RenderPage;
  className?: string;
};

type State =
  | { status: 'empty' }
  | { status: 'loading' }
  | { status: 'error'; error: ImageError }
  | { status: 'ready'; url: string; size: Size };

/** Space around the image; matches .dtx-img__stage. */
const PAD = 16;

function Tool({ label, ...rest }: { label: string } & ComponentProps<'button'>) {
  return <Tooltip content={label}><Button variant="ghost" size="sm" icon aria-label={label} {...rest} /></Tooltip>;
}

/**
 * One image with zoom (buttons, ctrl + wheel, pinch, double-click), mouse-drag pan, quarter-turn rotation and download.
 * The scroller is native, so touch, trackpad and arrow keys pan without extra code. Loading, empty and error states built in.
 */
export function ImageViewer({ src, alt, fileName, defaultZoom = 'fit', download = true, renderPage, className }: ImageViewerProps) {
  const [state, setState] = useState<State>({ status: 'empty' });
  const [attempt, setAttempt] = useState(0);
  const [zoom, setZoom] = useState(defaultZoom);
  const [rot, setRot] = useState<Turn>(0);
  const [box, setBox] = useState<Size>({ w: 0, h: 0 });
  const scroller = useRef<HTMLDivElement>(null);
  const frame = useRef<HTMLDivElement>(null);
  // the image point (fractions of the frame) to keep under a viewport point through the next zoom or turn
  const anchor = useRef<{ fx: number; fy: number; px: number; py: number } | null>(null);
  const drag = useRef<{ x: number; y: number; left: number; top: number; id: number; on: boolean } | null>(null);
  // latest scale for wheel events that arrive faster than renders
  const live = useRef(1);

  useEffect(() => {
    if (!src) { setState({ status: 'empty' }); return; }
    const url = typeof src === 'string' ? src : URL.createObjectURL(src);
    const img = new Image();
    let alive = true;
    setState({ status: 'loading' });
    setZoom(defaultZoom);
    setRot(0);
    img.src = url;
    // decoded before it shows, so the first frame already has its size and an undrawable file fails here
    img.decode().then(
      () => { if (alive) setState({ status: 'ready', url, size: { w: img.naturalWidth || 300, h: img.naturalHeight || 150 } }); },
      () => { if (alive) setState({ status: 'error', error: describeError(src, fileName) }); },
    );
    return () => { alive = false; if (url !== src) URL.revokeObjectURL(url); };
  }, [src, attempt]); // eslint-disable-line react-hooks/exhaustive-deps

  useLayoutEffect(() => {
    const el = scroller.current;
    if (!el) return;
    const measure = () => setBox({ w: el.clientWidth, h: el.clientHeight });
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    measure();
    return () => ro.disconnect();
  }, []);

  const ready = state.status === 'ready';
  const size = ready ? turned(state.size, rot) : { w: 0, h: 0 };
  const fit = ready ? fitScale(size, box, PAD) : 1;
  const scale = zoom === 'fit' ? fit : zoom;
  const min = Math.min(ZOOM_MIN, fit);
  const pannable = size.w * scale + 2 * PAD > box.w + 1 || size.h * scale + 2 * PAD > box.h + 1;
  live.current = scale;

  /** Remember the image point under (px, py), relative to the scroller, so the layout effect can put it back. */
  const hold = (px: number, py: number) => {
    const el = scroller.current, f = frame.current;
    if (!el || !f) return;
    const r = f.getBoundingClientRect(), s = el.getBoundingClientRect();
    const frac = (v: number) => Math.min(1, Math.max(0, v));
    anchor.current = { fx: frac((s.left + px - r.left) / r.width), fy: frac((s.top + py - r.top) / r.height), px, py };
  };

  const zoomTo = (next: number | 'fit', px = box.w / 2, py = box.h / 2) => {
    const k = next === 'fit' ? fit : next;
    if (Math.abs(k - live.current) < 0.0005) { setZoom(next); return; }
    hold(px, py);
    live.current = k;
    setZoom(Math.abs(k - fit) < 0.0005 ? 'fit' : k);
  };

  const turn = () => {
    hold(box.w / 2, box.h / 2);
    // a quarter turn clockwise carries the point at (x, y) of the frame to (1 − y, x)
    const a = anchor.current;
    if (a) anchor.current = { ...a, fx: 1 - a.fy, fy: a.fx };
    setRot(r => ((r + 90) % 360) as Turn);
  };

  useLayoutEffect(() => {
    const el = scroller.current, f = frame.current, a = anchor.current;
    anchor.current = null;
    if (!el || !f || !a) return;
    const r = f.getBoundingClientRect(), s = el.getBoundingClientRect();
    el.scrollLeft += r.left + a.fx * r.width - (s.left + a.px);
    el.scrollTop += r.top + a.fy * r.height - (s.top + a.py);
  }, [scale, rot]);

  // React's onWheel is passive, and ctrl + wheel must not zoom the whole page
  useEffect(() => {
    const el = scroller.current;
    if (!el || !ready) return;
    const onWheel = (e: WheelEvent) => {
      if (!e.ctrlKey) return; // a plain wheel scrolls; trackpad pinch arrives as ctrl + wheel
      e.preventDefault();
      const s = el.getBoundingClientRect();
      zoomTo(wheelZoom(live.current, e.deltaY * (e.deltaMode === 1 ? 16 : 1), min), e.clientX - s.left, e.clientY - s.top);
    };
    el.addEventListener('wheel', onWheel, { passive: false });
    return () => el.removeEventListener('wheel', onWheel);
  });

  const name = fileName ?? 'Image';
  return (
    <div className={cx('dtx-img', className)}>
      <div className="dtx-img__bar" role="toolbar" aria-label={`Controls for ${name}`}>
        {fileName && <span className="dtx-img__name" title={fileName}><FileImage aria-hidden /><span>{fileName}</span></span>}
        <div className="dtx-img__group">
          <Tool label="Zoom out" onClick={() => zoomTo(stepZoom(scale, -1, zoomStops(fit)))} disabled={!ready || scale <= min + 0.0005}><Minus aria-hidden /></Tool>
          <span className="dtx-img__zoom dtx-num" aria-live="polite">{ready ? `${Math.round(scale * 100)}%` : '–'}</span>
          <Tool label="Zoom in" onClick={() => zoomTo(stepZoom(scale, 1, zoomStops(fit)))} disabled={!ready || scale >= ZOOM_MAX - 0.0005}><Plus aria-hidden /></Tool>
          <Tool label="Fit" aria-pressed={zoom === 'fit'} onClick={() => zoomTo(zoom === 'fit' ? 1 : 'fit')} disabled={!ready}><Maximize aria-hidden /></Tool>
          <Tool label="Rotate 90°" onClick={turn} disabled={!ready}><RotateCw aria-hidden /></Tool>
        </div>
        {download && ready && <>
          <i className="dtx-img__sep" aria-hidden />
          <Tooltip content="Download"><Button variant="ghost" size="sm" icon href={state.url} download={fileName ?? ''} aria-label={`Download ${name}`}><Download aria-hidden /></Button></Tooltip>
        </>}
      </div>
      <div
        ref={scroller} className="dtx-img__scroll" data-pan={ready && pannable ? '' : undefined}
        // focusable so keyboard users can pan with the arrow keys; only a region once there is something to see
        tabIndex={ready ? 0 : undefined} role={ready ? 'region' : undefined} aria-label={ready ? name : undefined}
        onPointerDown={e => {
          // touch and pen pan natively; the mouse drags only when there is somewhere to go
          if (!ready || !pannable || e.pointerType !== 'mouse' || e.button !== 0) return;
          drag.current = { x: e.clientX, y: e.clientY, left: e.currentTarget.scrollLeft, top: e.currentTarget.scrollTop, id: e.pointerId, on: false };
        }}
        onPointerMove={e => {
          const d = drag.current;
          if (!d) return;
          const dx = e.clientX - d.x, dy = e.clientY - d.y;
          // captured only once it is a drag, so a click still reaches a box drawn over the image
          if (!d.on) {
            if (Math.hypot(dx, dy) < 4) return;
            d.on = true;
            e.currentTarget.setPointerCapture(d.id);
          }
          e.currentTarget.scrollLeft = d.left - dx;
          e.currentTarget.scrollTop = d.top - dy;
        }}
        onPointerUp={() => { drag.current = null; }}
        onPointerCancel={() => { drag.current = null; }}
        onDoubleClick={e => {
          if (!ready || (e.target as Element).closest('button, a, input, [role="button"]')) return; // a box, not the image
          const s = e.currentTarget.getBoundingClientRect();
          if (zoom === 'fit') zoomTo(fit < 1 ? 1 : 2, e.clientX - s.left, e.clientY - s.top);
          else zoomTo('fit');
        }}
      >
        {state.status === 'ready' ? (
          <div className="dtx-img__stage">
            <div ref={frame} className="dtx-img__frame" style={{ width: size.w * scale, height: size.h * scale }}>
              {/* the page turns as a whole, so whatever renderPage draws over the image turns with it */}
              <div className="dtx-img__page" style={{ width: state.size.w * scale, height: state.size.h * scale, transform: `translate(-50%, -50%) rotate(${rot}deg)` }}>
                {(() => {
                  const img = <img className="dtx-img__img" src={state.url} alt={alt ?? name} width={state.size.w} height={state.size.h} draggable={false} />;
                  return renderPage ? renderPage(img, { index: 0, width: state.size.w, height: state.size.h }) : img;
                })()}
              </div>
            </div>
          </div>
        ) : state.status === 'loading' ? (
          <div className="dtx-img__state" role="status">
            <span>Opening image…</span>
            <Skeleton width={Math.max(0, Math.min(box.w - 2 * PAD, 480))} height={Math.max(0, Math.min(box.w - 2 * PAD, 480)) * 0.75} radius={2} />
          </div>
        ) : state.status === 'error' ? (
          <EmptyState size="sm" tone="err" title={state.error.title}
            action={state.error.retry && <Button variant="secondary" size="sm" onClick={() => setAttempt(a => a + 1)}>Retry</Button>}>{state.error.hint}</EmptyState>
        ) : (
          <EmptyState size="sm" icon={<ImageIcon />} title="No image yet">Choose an image to view it here.</EmptyState>
        )}
      </div>
    </div>
  );
}
