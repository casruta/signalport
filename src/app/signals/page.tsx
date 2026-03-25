import Link from 'next/link';
import { getSignals, getPriceSeries } from '@/lib/mockData';
import { PageHeader } from '@/components/ui/PageHeader';
import { SignalBadge } from '@/components/ui/SignalBadge';
import { IndicatorGauge } from '@/components/ui/IndicatorGauge';
import { PriceSparkline } from '@/components/ui/PriceSparkline';
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

function SignalRow({ signal: s, prices }: { signal: Signal; prices: number[] }) {
  return (
    <div id={s.ticker} className="card-hover scroll-mt-4">
      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-3 mb-3">
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

      {/* 30-day price sparkline */}
      <div className="mb-4">
        <p className="text-xs mb-1" style={{ color: 'var(--text-muted)' }}>30-day price trend</p>
        <PriceSparkline prices={prices} direction={s.direction} />
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
          <div className="space-y-1 text-xs font-mono mb-2">
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
          {/* %B position indicator */}
          <div className="mt-2">
            <div className="flex justify-between text-xs mb-1">
              <span style={{ color: 'var(--text-muted)' }}>%B position</span>
              <span className={`font-mono font-medium ${s.bollingerPercentB < 0.2 ? 'text-emerald-400' : s.bollingerPercentB > 0.8 ? 'text-red-400' : 'text-white'}`}>
                {(s.bollingerPercentB * 100).toFixed(0)}%
              </span>
            </div>
            <div className="h-1.5 rounded-full overflow-hidden" style={{ background: 'var(--border)' }}>
              <div
                className={`h-full rounded-full ${s.bollingerPercentB < 0.2 ? 'bg-emerald-500' : s.bollingerPercentB > 0.8 ? 'bg-red-500' : 'bg-amber-500'}`}
                style={{ width: `${Math.min(100, Math.max(0, s.bollingerPercentB * 100))}%` }}
              />
            </div>
            <div className="flex justify-between text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>
              <span>Lower band</span><span>Upper band</span>
            </div>
          </div>
          {/* Bandwidth (volatility) */}
          <div className="flex justify-between text-xs mt-2">
            <span style={{ color: 'var(--text-muted)' }}>Bandwidth</span>
            <span className={`font-mono ${s.bollingerBandwidth < 0.08 ? 'text-amber-400 font-semibold' : 'text-white'}`}>
              {(s.bollingerBandwidth * 100).toFixed(1)}%
              {s.bollingerBandwidth < 0.08 && <span className="text-amber-400 ml-1">· squeeze</span>}
            </span>
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

type FilterParam = 'all' | 'BUY' | 'HOLD' | 'SELL';

export default function SignalsPage({
  searchParams,
}: {
  searchParams: { filter?: string };
}) {
  const allSignals = getSignals();

  const buys  = allSignals.filter((s) => s.direction === 'BUY').sort((a, b) => b.score - a.score);
  const sells = allSignals.filter((s) => s.direction === 'SELL').sort((a, b) => a.score - b.score);
  const holds = allSignals.filter((s) => s.direction === 'HOLD').sort((a, b) => b.score - a.score);

  const activeFilter = (['BUY', 'HOLD', 'SELL'].includes(searchParams.filter ?? '')
    ? searchParams.filter
    : 'all') as FilterParam;

  const allSorted = [...buys, ...holds, ...sells];
  const displayed = activeFilter === 'all' ? allSorted : allSorted.filter((s) => s.direction === activeFilter);

  // Pre-compute last 30 days of closing prices per ticker (server-side)
  const pricesByTicker: Record<string, number[]> = {};
  for (const s of allSorted) {
    const series = getPriceSeries(s.ticker);
    pricesByTicker[s.ticker] = series.slice(-30).map((b) => b.close);
  }

  const tabs: { label: string; value: FilterParam; count: number; color: string; active: string }[] = [
    { label: 'All',  value: 'all',  count: allSignals.length, color: 'text-white',        active: 'bg-slate-700' },
    { label: 'Buy',  value: 'BUY',  count: buys.length,       color: 'text-emerald-400',  active: 'bg-emerald-900/50' },
    { label: 'Hold', value: 'HOLD', count: holds.length,      color: 'text-amber-400',    active: 'bg-amber-900/50' },
    { label: 'Sell', value: 'SELL', count: sells.length,      color: 'text-red-400',      active: 'bg-red-900/50' },
  ];

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <PageHeader
        title="Signal Analysis"
        subtitle={`${allSignals.length} assets scanned · ${buys.length} buy · ${holds.length} hold · ${sells.length} sell`}
      />

      {/* Filter Tabs */}
      <div className="flex gap-2 flex-wrap">
        {tabs.map((tab) => {
          const isActive = activeFilter === tab.value;
          const href = tab.value === 'all' ? '/signals' : `/signals?filter=${tab.value}`;
          return (
            <Link
              key={tab.value}
              href={href}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors border
                ${isActive
                  ? `${tab.active} ${tab.color} border-transparent`
                  : 'border-transparent hover:bg-slate-800'
                }`}
              style={{ color: isActive ? undefined : 'var(--text-secondary)' }}
            >
              {tab.label}
              <span className={`text-xs font-bold px-1.5 py-0.5 rounded-full ${isActive ? tab.color : ''}`}
                style={{ background: isActive ? undefined : 'var(--bg-secondary)' }}>
                {tab.count}
              </span>
            </Link>
          );
        })}
      </div>

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
        {displayed.length === 0 ? (
          <div className="card text-center py-12">
            <p className="text-lg font-medium text-white mb-2">No {activeFilter} signals</p>
            <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
              All assets are currently showing different signal directions.
            </p>
            <Link href="/signals" className="mt-4 inline-block text-sm text-brand-400 hover:text-brand-300">
              View all signals →
            </Link>
          </div>
        ) : (
          displayed.map((signal) => (
            <SignalRow key={signal.ticker} signal={signal} prices={pricesByTicker[signal.ticker]} />
          ))
        )}
      </div>
    </div>
  );
}
