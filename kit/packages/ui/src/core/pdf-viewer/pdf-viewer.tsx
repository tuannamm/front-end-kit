import { useEffect, useLayoutEffect, useRef, useState, type ComponentProps, type RefObject } from 'react';
import { ChevronLeft, ChevronRight, CircleAlert, Download, FileText, Minus, MoveHorizontal, Plus } from 'lucide-react';
import type { PDFDocumentLoadingTask, PDFDocumentProxy, RenderTask } from 'pdfjs-dist';
import { cx } from '../../cx';
import { Skeleton } from '../../motion/primitives';
import { Button } from '../button/button';
import { Tooltip } from '../controls/controls';
import { PT_TO_PX, ZOOM_MAX, ZOOM_MIN, clampZoom, describeError, pageAt, parsePage, stepZoom, type PdfError } from './view';

export type PdfSource = string | Blob | ArrayBuffer | Uint8Array;

export type PdfViewerProps = {
  /** URL (same origin or CORS-enabled), File/Blob, or the bytes. Keep it stable between renders: a new value reopens the file. */
  src?: PdfSource | null;
  /** Shown in the toolbar; names the page region and the downloaded file. */
  fileName?: string;
  /** 'fit' = each page fills the width (portrait and landscape alike) and follows resizes; a number is a scale, 1 = 100%. */
  defaultZoom?: number | 'fit';
  /** Show the download button. */
  download?: boolean;
  className?: string;
};

type Size = { w: number; h: number };
type State =
  | { status: 'empty' }
  | { status: 'loading'; progress?: number }
  | { status: 'error'; error: PdfError }
  | { status: 'ready'; pdf: PDFDocumentProxy; sizes: Size[] };

/** Space around and between pages; matches .dtx-pdf__pages. */
const PAD = 16;
/** iOS Safari refuses canvases over ~16.7M pixels: a deeper zoom renders at this ceiling and is stretched. */
const MAX_PIXELS = 16_777_216;

let lib: Promise<typeof import('pdfjs-dist')> | undefined;
/** pdf.js (~1 MB) loads with the first viewer, not with the kit; a failed chunk load can be retried. */
function loadPdfjs() {
  return lib ??= import('pdfjs-dist').then(m => {
    m.GlobalWorkerOptions.workerPort ??= new Worker(new URL('./pdf.worker.ts', import.meta.url), { type: 'module' });
    return m;
  }, e => { lib = undefined; throw e; });
}

async function toInit(src: PdfSource) {
  if (typeof src === 'string') return { url: src };
  // pdf.js hands the bytes to its worker; copy them so the caller's buffer stays usable
  return { data: src instanceof Blob ? new Uint8Array(await src.arrayBuffer()) : new Uint8Array(src instanceof ArrayBuffer ? src.slice(0) : src) };
}

/** Link target for the download button; object URLs are revoked when the source changes. */
function useHref(src: PdfSource | null | undefined) {
  const [href, setHref] = useState<string>();
  useEffect(() => {
    if (!src || typeof src === 'string') { setHref(src || undefined); return; }
    const url = URL.createObjectURL(src instanceof Blob ? src : new Blob([src instanceof ArrayBuffer ? src : src.slice()], { type: 'application/pdf' }));
    setHref(url);
    return () => URL.revokeObjectURL(url);
  }, [src]);
  return href;
}

function Tool({ label, ...rest }: { label: string } & ComponentProps<'button'>) {
  return <Tooltip content={label}><Button variant="ghost" size="sm" icon aria-label={label} {...rest} /></Tooltip>;
}

/**
 * Scrolling column of PDF pages with page and zoom controls. Pages near the viewport are drawn to a canvas
 * (and released when far away), so long files stay light. Loading, empty, error and per-page failure states built in.
 */
export function PdfViewer({ src, fileName, defaultZoom = 'fit', download = true, className }: PdfViewerProps) {
  const [state, setState] = useState<State>({ status: 'empty' });
  const [attempt, setAttempt] = useState(0);
  const [zoom, setZoom] = useState(defaultZoom);
  const [width, setWidth] = useState(0);
  const [page, setPage] = useState(1);
  const [draft, setDraft] = useState<string | null>(null);
  const scroller = useRef<HTMLDivElement>(null);
  const pages = useRef<(HTMLDivElement | null)[]>([]);
  // the page at the top of the view and how far into it, kept so a zoom stays on the same spot
  const anchor = useRef({ index: 0, frac: 0 });
  const href = useHref(download ? src : null);

  useEffect(() => {
    if (!src) { setState({ status: 'empty' }); return; }
    let alive = true, opened = false, task: PDFDocumentLoadingTask | undefined;
    setState({ status: 'loading' });
    setPage(1);
    anchor.current = { index: 0, frac: 0 };
    (async () => {
      try {
        const [pdfjs, init] = await Promise.all([loadPdfjs(), toInit(src)]);
        if (!alive) return;
        task = pdfjs.getDocument(init);
        // range requests keep reporting after the document opens; only the first load shows progress
        task.onProgress = ({ loaded, total }: { loaded: number; total: number }) => {
          if (alive && !opened && total > 0) setState({ status: 'loading', progress: Math.min(1, loaded / total) });
        };
        const pdf = await task.promise;
        opened = true;
        // ponytail: every page size up front (one getPage each) so the scroll height is right before anything draws; fine into the thousands
        const sizes = await Promise.all(Array.from({ length: pdf.numPages }, (_, i) => pdf.getPage(i + 1).then(p => {
          const v = p.getViewport({ scale: PT_TO_PX });
          return { w: v.width, h: v.height };
        })));
        if (alive) setState({ status: 'ready', pdf, sizes });
      } catch (e) {
        if (alive) setState({ status: 'error', error: describeError(e) });
      }
    })();
    return () => { alive = false; void task?.destroy(); };
  }, [src, attempt]);

  useLayoutEffect(() => {
    const el = scroller.current;
    if (!el) return;
    const ro = new ResizeObserver(() => setWidth(el.clientWidth));
    ro.observe(el);
    setWidth(el.clientWidth);
    return () => ro.disconnect();
  }, []);

  const sizes = state.status === 'ready' ? state.sizes : [];
  const count = sizes.length;
  const scaleOf = (s: Size) => (zoom === 'fit' ? clampZoom((width - 2 * PAD) / s.w) : zoom);
  // what the zoom label shows and −/+ step from: the current page's scale (they differ only in 'fit' with mixed sizes)
  const scale = sizes.length ? scaleOf(sizes[Math.min(page, sizes.length) - 1]) : 1;

  // same spot after a zoom or a fit resize: the anchor page's top moves, the fraction into it does not
  useLayoutEffect(() => {
    const el = scroller.current, p = pages.current[anchor.current.index];
    if (!el || !p) return;
    el.scrollTop = p.offsetTop + anchor.current.frac * p.offsetHeight - PAD;
    el.scrollLeft = (el.scrollWidth - el.clientWidth) / 2; // pages are centred; a wider landscape page sets the scroll width
  }, [zoom === 'fit' ? width : zoom]); // eslint-disable-line react-hooks/exhaustive-deps

  const onScroll = () => {
    const el = scroller.current;
    if (!el) return;
    const list = pages.current.slice(0, count);
    const tops = list.map(p => p?.offsetTop ?? 0);
    const i = pageAt(tops, el.scrollTop + PAD);
    const p = list[i];
    if (p) anchor.current = { index: i, frac: (el.scrollTop + PAD - p.offsetTop) / p.offsetHeight };
    // the current page is the one a third down the view; at the bottom, the last one even when it is short
    const atEnd = el.scrollTop + el.clientHeight >= el.scrollHeight - 2;
    setPage(atEnd ? count : pageAt(tops, el.scrollTop + el.clientHeight / 3) + 1);
  };

  const goTo = (n: number) => {
    const el = scroller.current, p = pages.current[n - 1];
    if (!el || !p) return;
    el.scrollTop = p.offsetTop - PAD;
    setPage(n);
  };

  const commitDraft = () => {
    if (draft === null) return;
    const n = parsePage(draft, count);
    if (n) goTo(n);
    setDraft(String(n ?? page));
  };

  const ready = state.status === 'ready';
  const name = fileName ?? 'Tài liệu PDF';
  return (
    <div className={cx('dtx-pdf', className)}>
      <div className="dtx-pdf__bar" role="toolbar" aria-label={`Điều khiển ${name}`}>
        {fileName && <span className="dtx-pdf__name" title={fileName}><FileText aria-hidden /><span>{fileName}</span></span>}
        <div className="dtx-pdf__group dtx-pdf__nav">
          <Tool label="Trang trước" onClick={() => goTo(page - 1)} disabled={!ready || page <= 1}><ChevronLeft aria-hidden /></Tool>
          <input
            className="dtx-input dtx-pdf__page-input dtx-num" inputMode="numeric" enterKeyHint="go" disabled={!ready}
            aria-label={ready ? `Trang, trên tổng ${count}` : 'Trang'} value={ready ? draft ?? String(page) : ''}
            onFocus={e => { setDraft(String(page)); e.currentTarget.select(); }}
            onChange={e => setDraft(e.target.value.replace(/\D/g, ''))}
            onKeyDown={e => { if (e.key === 'Enter') { commitDraft(); e.currentTarget.select(); } else if (e.key === 'Escape') setDraft(String(page)); }}
            onBlur={() => { commitDraft(); setDraft(null); }}
          />
          <span className="dtx-pdf__of dtx-num" aria-hidden>/ {ready ? count : '–'}</span>
          <Tool label="Trang sau" onClick={() => goTo(page + 1)} disabled={!ready || page >= count}><ChevronRight aria-hidden /></Tool>
        </div>
        <i className="dtx-pdf__sep" aria-hidden />
        <div className="dtx-pdf__group">
          <Tool label="Thu nhỏ" onClick={() => setZoom(stepZoom(scale, -1))} disabled={!ready || scale <= ZOOM_MIN}><Minus aria-hidden /></Tool>
          <span className="dtx-pdf__zoom dtx-num">{ready ? `${Math.round(scale * 100)}%` : '–'}</span>
          <Tool label="Phóng to" onClick={() => setZoom(stepZoom(scale, 1))} disabled={!ready || scale >= ZOOM_MAX}><Plus aria-hidden /></Tool>
          <Tool label="Vừa chiều rộng" aria-pressed={zoom === 'fit'} onClick={() => setZoom(zoom === 'fit' ? 1 : 'fit')} disabled={!ready}><MoveHorizontal aria-hidden /></Tool>
        </div>
        {download && ready && href && <>
          <i className="dtx-pdf__sep" aria-hidden />
          <Tooltip content="Tải xuống"><Button variant="ghost" size="sm" icon href={href} download={fileName ?? ''} aria-label={`Tải xuống ${name}`}><Download aria-hidden /></Button></Tooltip>
        </>}
      </div>
      <div
        ref={scroller} className="dtx-pdf__scroll" onScroll={ready ? onScroll : undefined}
        // focusable so keyboard users can scroll the pages; only a region once there is something to read
        tabIndex={ready ? 0 : undefined} role={ready ? 'region' : undefined} aria-label={ready ? name : undefined}
      >
        {state.status === 'ready' ? (
          <div className="dtx-pdf__pages">
            {state.sizes.map((s, i) => {
              const k = scaleOf(s);
              return <Page key={i} pdf={state.pdf} n={i + 1} count={count} width={s.w * k} height={s.h * k} scale={k} root={scroller} slot={el => { pages.current[i] = el; }} />;
            })}
          </div>
        ) : state.status === 'loading' ? (
          <div className="dtx-pdf__state" role="status">
            <span>Đang mở tài liệu…{state.progress !== undefined && <span className="dtx-num"> {Math.round(state.progress * 100)}%</span>}</span>
            <Skeleton width={Math.max(0, Math.min(width - 2 * PAD, 480))} height={Math.max(0, Math.min(width - 2 * PAD, 480)) * 1.414} radius={2} />
          </div>
        ) : state.status === 'error' ? (
          <div className="dtx-pdf__state" role="alert">
            <CircleAlert aria-hidden /><b>{state.error.title}</b><span>{state.error.hint}</span>
            {state.error.retry && <Button variant="secondary" size="sm" onClick={() => setAttempt(a => a + 1)}>Thử lại</Button>}
          </div>
        ) : (
          <div className="dtx-pdf__state" role="status"><FileText aria-hidden /><b>Chưa có tài liệu</b><span>Chọn một file PDF để xem tại đây.</span></div>
        )}
      </div>
    </div>
  );
}

type PageProps = { pdf: PDFDocumentProxy; n: number; count: number; width: number; height: number; scale: number; root: RefObject<HTMLDivElement | null>; slot: (el: HTMLDivElement | null) => void };

/** One sheet. Draws while within a viewport of the visible area, releases the canvas when it scrolls further away. */
function Page({ pdf, n, count, width, height, scale, root, slot }: PageProps) {
  const box = useRef<HTMLDivElement | null>(null);
  const canvasBox = useRef<HTMLDivElement>(null);
  const [near, setNear] = useState(false);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    const el = box.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => setNear(e.isIntersecting), { root: root.current, rootMargin: '100% 0px' });
    io.observe(el);
    return () => io.disconnect();
  }, [root]);

  useEffect(() => {
    const holder = canvasBox.current;
    if (!holder) return;
    if (!near) { holder.replaceChildren(); return; }
    let alive = true, task: RenderTask | undefined;
    pdf.getPage(n).then(p => {
      if (!alive) return;
      const base = p.getViewport({ scale: PT_TO_PX });
      const k = Math.min(scale * (window.devicePixelRatio || 1), Math.sqrt(MAX_PIXELS / (base.width * base.height)));
      const viewport = p.getViewport({ scale: PT_TO_PX * k });
      const canvas = document.createElement('canvas');
      canvas.width = Math.floor(viewport.width);
      canvas.height = Math.floor(viewport.height);
      task = p.render({ canvas, viewport });
      // drawn off-screen and swapped in, so a zoom never flashes a blank page
      return task.promise.then(() => { if (alive) { holder.replaceChildren(canvas); setFailed(false); } });
    }).catch((e: unknown) => {
      if (alive && (e as Error)?.name !== 'RenderingCancelledException') setFailed(true);
    });
    return () => { alive = false; task?.cancel(); };
  }, [near, scale, pdf, n]);

  return (
    <div ref={el => { box.current = el; slot(el); }} className="dtx-pdf__page" style={{ width, height }} role="img" aria-label={failed ? `Trang ${n} / ${count}: không hiển thị được` : `Trang ${n} / ${count}`}>
      <span className="dtx-pdf__page-n dtx-num" aria-hidden>{n}</span>
      <div ref={canvasBox} className="dtx-pdf__canvas" />
      {failed && <span className="dtx-pdf__page-err">Không hiển thị được trang {n}.</span>}
    </div>
  );
}
