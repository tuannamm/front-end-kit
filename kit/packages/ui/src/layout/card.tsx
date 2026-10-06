import type { ComponentProps, ReactNode } from 'react';
import { cx } from '../cx';

export function Card({ className, ...rest }: ComponentProps<'section'>) {
  return <section className={cx('dtx-card', className)} {...rest} />;
}

export function CardHeader({ title, action, id }: { title: ReactNode; action?: ReactNode; id?: string }) {
  return (
    <div className="dtx-card__head">
      <h2 className="dtx-card__title" id={id}>{title}</h2>
      {action && <div className="dtx-card__action">{action}</div>}
    </div>
  );
}

export function CardBody({ className, ...rest }: ComponentProps<'div'>) {
  return <div className={cx('dtx-card__body', className)} {...rest} />;
}
