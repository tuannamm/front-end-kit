import type { ReactNode } from 'react';

/** Always-dark brand band: fading grid, blue glow, circuit traces that draw in on load. */
export function TechBackdrop({ children, circuit = true, className }: { children: ReactNode; circuit?: boolean; className?: string }) {
  return (
    <section className={['dtx-backdrop-tech', className].filter(Boolean).join(' ')} data-theme="dark">
      <div className="dtx-backdrop-tech__grid" aria-hidden />
      <div className="dtx-backdrop-tech__glow" aria-hidden />
      {circuit && (
        <svg className="dtx-backdrop-tech__circuit" viewBox="0 0 1200 640" preserveAspectRatio="xMidYMid slice" aria-hidden>
          <path d="M1200 90H980l-40 40H760" /><rect x="756" y="126" width="8" height="8" />
          <path d="M1200 170H1040l-30 30H900l-20 20H700" /><rect x="696" y="216" width="8" height="8" />
          <path d="M1200 520H1010l-50-50H820" /><rect x="816" y="466" width="8" height="8" />
          <path d="M1200 590H900l-30-30H640" /><rect x="636" y="556" width="8" height="8" />
          <path d="M0 600H160l40-40h120" /><rect x="316" y="556" width="8" height="8" />
        </svg>
      )}
      {children}
    </section>
  );
}
