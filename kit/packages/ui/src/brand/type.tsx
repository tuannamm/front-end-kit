import type { ReactNode } from 'react';

export function SectionHeader({ title, description, id }: { title: ReactNode; description?: ReactNode; id?: string }) {
  return (
    <div className="dtx-section-head">
      <div className="dtx-section-head__bar" aria-hidden />
      <h2 id={id}>{title}</h2>
      {description && <p>{description}</p>}
    </div>
  );
}

export function Eyebrow({ children }: { children: ReactNode }) {
  return <span className="dtx-eyebrow">{children}</span>;
}

/** Hexagon icon container (brand motif). */
export function HexIcon({ children }: { children: ReactNode }) {
  return <div className="dtx-hex" aria-hidden>{children}</div>;
}

/** Hero headline: Roboto Bold Italic uppercase. Wrap the accent words in <em> for the sky gradient. */
export function Display({ children, as: Tag = 'h1' }: { children: ReactNode; as?: 'h1' | 'h2' | 'p' }) {
  return <Tag className="dtx-display">{children}</Tag>;
}
export function Lede({ children }: { children: ReactNode }) {
  return <p className="dtx-lede">{children}</p>;
}
