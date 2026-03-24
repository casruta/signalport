import clsx from 'clsx';

interface Props {
  label: string;
  value: string | number;
  sub?: string;
  trend?: 'up' | 'down' | 'neutral';
  className?: string;
}

export function StatCard({ label, value, sub, trend, className }: Props) {
  return (
    <div className={clsx('card', className)}>
      <p className="stat-label mb-2">{label}</p>
      <p className={clsx('stat-value', trend === 'up' && 'text-emerald-400', trend === 'down' && 'text-red-400')}>
        {value}
      </p>
      {sub && (
        <p
          className={clsx(
            'mt-1 text-sm',
            trend === 'up' && 'text-emerald-400',
            trend === 'down' && 'text-red-400',
            trend === 'neutral' && 'text-amber-400',
            !trend && 'text-[var(--text-secondary)]',
          )}
        >
          {sub}
        </p>
      )}
    </div>
  );
}
