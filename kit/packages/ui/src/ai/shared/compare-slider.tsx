import { useId, useState, type CSSProperties, type ReactNode } from 'react';

/** Drag (or use arrow keys) to compare original and processed pages. */
export function CompareSlider({ before, after, defaultValue = 50, beforeLabel = 'Bản gốc', afterLabel = 'Đã xử lý' }: { before: ReactNode; after: ReactNode; defaultValue?: number; beforeLabel?: string; afterLabel?: string }) {
  const [pos, setPos] = useState(defaultValue);
  const id = useId();
  return (
    <div className="dtx-compare" style={{ '--pos': `${pos}%` } as CSSProperties}>
      <div className="dtx-compare__layer">{before}</div>
      <div className="dtx-compare__layer dtx-compare__after" aria-hidden>{after}</div>
      <span className="dtx-compare__tag" style={{ left: 8 }}>{beforeLabel}</span>
      <span className="dtx-compare__tag" style={{ right: 8 }}>{afterLabel}</span>
      <div className="dtx-compare__handle" aria-hidden />
      <label htmlFor={id} className="dtx-sr">Vị trí so sánh</label>
      <input id={id} className="dtx-compare__range" type="range" min={0} max={100} value={pos} onChange={e => setPos(+e.target.value)} />
    </div>
  );
}
