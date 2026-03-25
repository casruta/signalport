import Link from 'next/link';
import type { Signal } from '@/types';
import { SignalBadge } from '@/components/ui/SignalBadge';

interface Props {
  title: string;
  signals: Signal[];
}

export function TopSignalsTable({ title, signals }: Props) {
  return (
    <div className="card">
      <h2 className="text-sm font-semibold text-white mb-4">{title}</h2>
      {signals.length === 0 ? (
        <p className="text-sm py-4 text-center" style={{ color: 'var(--text-muted)' }}>No signals</p>
      ) : (
        <div className="space-y-3">
          {signals.map((s) => (
            <Link
              key={s.ticker}
              href={`/signals#${s.ticker}`}
              className="flex items-center justify-between p-3 rounded-lg transition-colors group"
              style={{ background: 'var(--bg-secondary)' }}
            >
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-semibold text-white font-mono">{s.ticker}</span>
                  <SignalBadge direction={s.direction} strength={s.strength} size="sm" />
                </div>
                <p className="text-xs mt-0.5 truncate" style={{ color: 'var(--text-secondary)' }}>
                  {s.name}
                </p>
              </div>
              <div className="flex items-center gap-3 ml-3 flex-shrink-0">
                <div className="text-center hidden sm:block">
                  <p
                    className={`text-sm font-bold font-mono ${s.score > 60 ? 'text-emerald-400' : s.score < 40 ? 'text-red-400' : 'text-amber-400'}`}
                  >
                    {s.score}
                  </p>
                  <p className="text-xs" style={{ color: 'var(--text-muted)' }}>score</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold text-white">
                    ${s.price.toFixed(2)}
                  </p>
                  <p className={`text-xs font-medium ${s.priceChangePct >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                    {s.priceChangePct >= 0 ? '+' : ''}{s.priceChangePct.toFixed(2)}%
                  </p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
