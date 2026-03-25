import Link from 'next/link';
import { getPortfolioPositions, getPortfolioHistory, getSignals } from '@/lib/mockData';
import { PageHeader } from '@/components/ui/PageHeader';
import { StatCard } from '@/components/ui/StatCard';
import { PortfolioChart } from '@/components/dashboard/PortfolioChart';
import { ErrorBoundary } from '@/components/ui/ErrorBoundary';
import { SignalBadge } from '@/components/ui/SignalBadge';

export const dynamic = 'force-dynamic';

function formatUSD(v: number, decimals = 2) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(v);
}

function formatPct(v: number) {
  return `${v >= 0 ? '+' : ''}${v.toFixed(2)}%`;
}

export default function PortfolioPage() {
  const positions = getPortfolioPositions();
  const history   = getPortfolioHistory();
  const signals   = getSignals();
  const signalMap = new Map(signals.map((s) => [s.ticker, s]));

  const totalValue = positions.reduce((s, p) => s + p.shares * p.currentPrice, 0);
  const totalCost  = positions.reduce((s, p) => s + p.shares * p.avgCostBasis, 0);
  const totalGain  = totalValue - totalCost;
  const totalGainPct = (totalGain / totalCost) * 100;

  // Daily change (uses per-asset priceChange from signals)
  const todayChange = positions.reduce((s, p) => {
    const sig = signalMap.get(p.ticker);
    return s + p.shares * (sig?.priceChange ?? 0);
  }, 0);
  const todayChangePct = totalValue > 0 ? (todayChange / (totalValue - todayChange)) * 100 : 0;

  // Sector allocation + P&L
  const sectorMap = new Map<string, { value: number; cost: number }>();
  for (const p of positions) {
    const v = p.shares * p.currentPrice;
    const c = p.shares * p.avgCostBasis;
    const prev = sectorMap.get(p.sector) ?? { value: 0, cost: 0 };
    sectorMap.set(p.sector, { value: prev.value + v, cost: prev.cost + c });
  }
  const sectors = Array.from(sectorMap.entries())
    .sort((a, b) => b[1].value - a[1].value);

  const sectorColors = ['bg-brand-500', 'bg-emerald-500', 'bg-amber-500', 'bg-purple-500', 'bg-pink-500'];

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      <PageHeader
        title="Portfolio"
        subtitle={`${positions.length} positions · demo portfolio`}
      />

      {/* ── Summary Stats ─────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Total Value"
          value={formatUSD(totalValue, 0)}
          sub={`Today: ${todayChange >= 0 ? '+' : ''}${formatUSD(todayChange, 0)} (${todayChange >= 0 ? '+' : ''}${todayChangePct.toFixed(2)}%)`}
          trend={todayChange >= 0 ? 'up' : 'down'}
        />
        <StatCard
          label="Cost Basis"
          value={formatUSD(totalCost, 0)}
          sub="Total invested"
        />
        <StatCard
          label="Unrealized P&L"
          value={formatUSD(totalGain, 0)}
          sub={formatPct(totalGainPct)}
          trend={totalGain >= 0 ? 'up' : 'down'}
        />
        <StatCard
          label="Positions"
          value={positions.length}
          sub={`${sectors.length} sectors`}
        />
      </div>

      {/* ── Performance Chart ─────────────────────────────────────────── */}
      <ErrorBoundary>
        <PortfolioChart data={history} costBasis={totalCost} />
      </ErrorBoundary>

      {/* ── Holdings Table ─────────────────────────────────────────────── */}
      <div className="card">
        <h2 className="text-sm font-semibold text-white mb-4">Holdings</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr style={{ color: 'var(--text-muted)' }} className="text-xs uppercase tracking-wider">
                <th className="text-left pb-3 font-medium">Asset</th>
                <th className="text-left pb-3 font-medium">Signal</th>
                <th className="text-right pb-3 font-medium">Shares</th>
                <th className="text-right pb-3 font-medium">Avg Cost</th>
                <th className="text-right pb-3 font-medium">Price</th>
                <th className="text-right pb-3 font-medium">Market Value</th>
                <th className="text-right pb-3 font-medium">P&L</th>
                <th className="text-right pb-3 font-medium">Allocation</th>
              </tr>
            </thead>
            <tbody className="divide-y" style={{ borderColor: 'var(--border)' }}>
              {positions.map((p) => {
                const mv = p.shares * p.currentPrice;
                const cost = p.shares * p.avgCostBasis;
                const gain = mv - cost;
                const gainPct = (gain / cost) * 100;
                const allocation = (mv / totalValue) * 100;

                const sig = signalMap.get(p.ticker);
                return (
                  <tr key={p.ticker} className="transition-colors" style={{ borderColor: 'var(--border)' }}>
                    <td className="py-3 pr-4">
                      <Link href={`/signals#${p.ticker}`} className="font-mono font-semibold text-white hover:text-brand-400 transition-colors">
                        {p.ticker}
                      </Link>
                      <br />
                      <span className="text-xs" style={{ color: 'var(--text-secondary)' }}>{p.sector}</span>
                    </td>
                    <td className="py-3 pr-4">
                      {sig ? (
                        <SignalBadge direction={sig.direction} strength={sig.strength} />
                      ) : (
                        <span className="text-xs" style={{ color: 'var(--text-muted)' }}>—</span>
                      )}
                    </td>
                    <td className="py-3 text-right font-mono text-white">{p.shares}</td>
                    <td className="py-3 text-right font-mono" style={{ color: 'var(--text-secondary)' }}>
                      {formatUSD(p.avgCostBasis)}
                    </td>
                    <td className="py-3 text-right font-mono text-white">{formatUSD(p.currentPrice)}</td>
                    <td className="py-3 text-right font-mono text-white">{formatUSD(mv, 0)}</td>
                    <td className="py-3 text-right">
                      <span className={`font-mono font-medium ${gain >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                        {gain >= 0 ? '+' : ''}{formatUSD(gain, 0)}
                      </span>
                      <br />
                      <span className={`text-xs ${gain >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                        {formatPct(gainPct)}
                      </span>
                    </td>
                    <td className="py-3 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <div className="w-16 h-1.5 rounded-full overflow-hidden" style={{ background: 'var(--border)' }}>
                          <div
                            className="h-full bg-brand-500 rounded-full"
                            style={{ width: `${allocation}%` }}
                          />
                        </div>
                        <span className="text-xs font-mono w-10 text-right" style={{ color: 'var(--text-secondary)' }}>
                          {allocation.toFixed(1)}%
                        </span>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── Sector Allocation ─────────────────────────────────────────── */}
      <div className="card">
        <h2 className="text-sm font-semibold text-white mb-4">Sector Allocation</h2>
        <div className="space-y-3">
          {sectors.map(([sector, { value, cost }], i) => {
            const pct = (value / totalValue) * 100;
            const sectorGain = value - cost;
            const sectorGainPct = (sectorGain / cost) * 100;
            return (
              <div key={sector}>
                <div className="flex justify-between items-center mb-1">
                  <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>{sector}</span>
                  <div className="flex items-center gap-3">
                    <span className={`text-xs font-mono ${sectorGain >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                      {sectorGain >= 0 ? '+' : ''}{formatUSD(sectorGain, 0)}
                      <span className="ml-1 opacity-70">({sectorGain >= 0 ? '+' : ''}{sectorGainPct.toFixed(1)}%)</span>
                    </span>
                    <span className="text-sm font-mono" style={{ color: 'var(--text-secondary)' }}>
                      {formatUSD(value, 0)}
                    </span>
                    <span className="text-sm font-semibold text-white w-12 text-right">
                      {pct.toFixed(1)}%
                    </span>
                  </div>
                </div>
                <div className="h-2 rounded-full overflow-hidden" style={{ background: 'var(--border)' }}>
                  <div
                    className={`h-full rounded-full ${sectorColors[i % sectorColors.length]}`}
                    style={{ width: `${pct}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
