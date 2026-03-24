import { getSignals } from '@/lib/mockData';
import { PageHeader } from '@/components/ui/PageHeader';
import { SignalBadge } from '@/components/ui/SignalBadge';
import { IndicatorGauge } from '@/components/ui/IndicatorGauge';
import type { Signal } from '@/types';

export const dynamic = 'force-dynamic';

function ScoreBar({ score }: { score: number }) {
  const color =
    score > 60 ? 'bg-emerald-500' : score < 40 ? 'bg-red-500' : 'bg-amber-500';
  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 h-1.5 rounded-full overflow-hidden" style={{ background: 'var(--border)' }}>
        <div className={`h-full rounded-full ${color}`} style={{ width: `${score}%` }} />
      </div>
      <span className="text-xs font-mono w-8 text-right text-white">{score}</span>
    </div>
  );
}

function SignalRow({ signal: s }: { signal: Signal }) {
  return (
    <div id={s.ticker} className="card-hover scroll-mt-4">
      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-3 mb-5">
        <div>
          <div className="flex items-center gap-3">
            <span className="text-lg font-bold text-white font-mono">{s.ticker}</span>
            <SignalBadge direction={s.direction} strength={s.strength} />
          </div>
          <p className="text-sm mt-0.5" style={{ color: 'var(--text-secondary)' }}>{s.name}</p>
        </div>
        <div className="text-right">
          <p className="text-xl font-bold text-white">${s.price.toFixed(2)}</p>
          <p className={`text-sm font-medium ${s.priceChangePct >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
            {s.priceChangePct >= 0 ? '+' : ''}{s.priceChange.toFixed(2)} ({s.priceChangePct >= 0 ? '+' : ''}{s.priceChangePct.toFixed(2)}%)
          </p>
        </div>
      </div>

      {/* Composite Score */}
      <div className="mb-5 p-3 rounded-lg" style={{ background: 'var(--bg-secondary)' }}>
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-medium uppercase tracking-wider" style={{ color: 'var(--text-secondary)' }}>
            Composite Signal Score
          </span>
          <span className="text-xs font-mono" style={{ color: 'var(--text-muted)' }}>
            0 = strong sell · 100 = strong buy
          </span>
        </div>
        <ScoreBar score={s.score} />
      </div>

      {/* Indicators Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4 mb-5">
        <IndicatorGauge
          label="RSI (14)"
          value={s.rsi}
          lowThreshold={30}
          highThreshold={70}
        />
        <div>
          <p className="text-xs font-medium mb-1" style={{ color: 'var(--text-secondary)' }}>MACD (12/26/9)</p>
          <div className="flex gap-4 text-xs font-mono">
            <span>
              <span style={{ color: 'var(--text-muted)' }}>MACD </span>
              <span className={s.macd >= 0 ? 'text-emerald-400' : 'text-red-400'}>{s.macd.toFixed(3)}</span>
            </span>
            <span>
              <span style={{ color: 'var(--text-muted)' }}>Signal </span>
              <span className="text-white">{s.macdSignal.toFixed(3)}</span>
            </span>
            <span>
              <span style={{ color: 'var(--text-muted)' }}>Hist </span>
              <span className={s.macdHistogram >= 0 ? 'text-emerald-400' : 'text-red-400'}>
                {s.macdHistogram >= 0 ? '+' : ''}{s.macdHistogram.toFixed(3)}
              </span>
            </span>
          </div>
        </div>
        <div>
          <p className="text-xs font-medium mb-1.5" style={{ color: 'var(--text-secondary)' }}>Moving Averages</p>
          <div className="space-y-1 text-xs font-mono">
            {[
              { label: 'SMA 50', value: s.sma50, vsPrice: s.price / s.sma50 - 1 },
              { label: 'SMA 200', value: s.sma200, vsPrice: s.price / s.sma200 - 1 },
            ].map(({ label, value, vsPrice }) => (
              <div key={label} className="flex items-center justify-between">
                <span style={{ color: 'var(--text-muted)' }}>{label}</span>
                <span className="text-white">${value.toFixed(2)}</span>
                <span className={vsPrice >= 0 ? 'text-emerald-400' : 'text-red-400'}>
                  {vsPrice >= 0 ? '+' : ''}{(vsPrice * 100).toFixed(1)}%
                </span>
              </div>
            ))}
          </div>
        </div>
        <div>
          <p className="text-xs font-medium mb-1.5" style={{ color: 'var(--text-secondary)' }}>Bollinger Bands (20, 2σ)</p>
          <div className="space-y-1 text-xs font-mono">
            {[
              { label: 'Upper', value: s.bollingerUpper },
              { label: 'Middle', value: s.bollingerMiddle },
              { label: 'Lower', value: s.bollingerLower },
            ].map(({ label, value }) => (
              <div key={label} className="flex justify-between">
                <span style={{ color: 'var(--text-muted)' }}>{label}</span>
                <span className="text-white">${value.toFixed(2)}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Rationale */}
      <div className="p-3 rounded-lg border-l-2 border-brand-600 pl-4" style={{ background: 'var(--bg-secondary)' }}>
        <p className="text-xs font-semibold uppercase tracking-wider mb-1" style={{ color: 'var(--text-muted)' }}>
          Signal Rationale
        </p>
        <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>{s.rationale}</p>
      </div>
    </div>
  );
}

export default function SignalsPage() {
  const allSignals = getSignals();

  const buys  = allSignals.filter((s) => s.direction === 'BUY').sort((a, b) => b.score - a.score);
  const sells = allSignals.filter((s) => s.direction === 'SELL').sort((a, b) => a.score - b.score);
  const holds = allSignals.filter((s) => s.direction === 'HOLD').sort((a, b) => b.score - a.score);

  const sorted = [...buys, ...holds, ...sells];

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      <PageHeader
        title="Signal Analysis"
        subtitle={`${allSignals.length} assets scanned · ${buys.length} buy · ${holds.length} hold · ${sells.length} sell`}
      />

      {/* Disclaimer */}
      <div className="flex gap-3 p-4 rounded-xl border border-amber-800/40 bg-amber-950/20">
        <span className="text-amber-400 text-lg flex-shrink-0">⚠</span>
        <p className="text-sm text-amber-200/70">
          <strong className="text-amber-300">Educational use only.</strong> Signals are generated from technical
          indicators on simulated price data. Past patterns do not guarantee future results. Always conduct
          independent research before making investment decisions.
        </p>
      </div>

      {/* Signal Cards */}
      <div className="space-y-4">
        {sorted.map((signal) => (
          <SignalRow key={signal.ticker} signal={signal} />
        ))}
      </div>
    </div>
  );
}
