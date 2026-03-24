import { getSignals, getPortfolioPositions, getPortfolioHistory } from '@/lib/mockData';
import { StatCard } from '@/components/ui/StatCard';
import { SignalBadge } from '@/components/ui/SignalBadge';
import { PageHeader } from '@/components/ui/PageHeader';
import { PortfolioChart } from '@/components/dashboard/PortfolioChart';
import { TopSignalsTable } from '@/components/dashboard/TopSignalsTable';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

export default function DashboardPage() {
  const signals = getSignals();
  const positions = getPortfolioPositions();
  const history = getPortfolioHistory();

  // Portfolio stats
  const totalValue = positions.reduce(
    (sum, p) => sum + p.shares * p.currentPrice,
    0,
  );
  const totalCost = positions.reduce(
    (sum, p) => sum + p.shares * p.avgCostBasis,
    0,
  );
  const totalGain = totalValue - totalCost;
  const totalGainPct = (totalGain / totalCost) * 100;

  // Signal stats
  const buyCount  = signals.filter((s) => s.direction === 'BUY').length;
  const sellCount = signals.filter((s) => s.direction === 'SELL').length;
  const holdCount = signals.filter((s) => s.direction === 'HOLD').length;

  // Top 5 signals by score
  const topBuys  = signals.filter((s) => s.direction === 'BUY').sort((a, b) => b.score - a.score).slice(0, 3);
  const topSells = signals.filter((s) => s.direction === 'SELL').sort((a, b) => a.score - b.score).slice(0, 3);

  const formatUSD = (v: number) =>
    new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(v);

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      <PageHeader
        title="Dashboard"
        subtitle={`Signal scan across ${signals.length} assets · Updated ${new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`}
      />

      {/* ── Key Metrics Row ────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Portfolio Value"
          value={formatUSD(totalValue)}
          sub={`${totalGainPct >= 0 ? '+' : ''}${totalGainPct.toFixed(2)}% all-time`}
          trend={totalGain >= 0 ? 'up' : 'down'}
        />
        <StatCard
          label="Total Gain / Loss"
          value={`${totalGain >= 0 ? '+' : ''}${formatUSD(totalGain)}`}
          sub={`Cost basis ${formatUSD(totalCost)}`}
          trend={totalGain >= 0 ? 'up' : 'down'}
        />
        <StatCard
          label="Buy Signals"
          value={buyCount}
          sub={`of ${signals.length} tracked assets`}
          trend="up"
        />
        <StatCard
          label="Sell Signals"
          value={sellCount}
          sub={`${holdCount} hold signals`}
          trend={sellCount > buyCount ? 'down' : 'neutral'}
        />
      </div>

      {/* ── Portfolio Chart + Signal Distribution ─────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <PortfolioChart data={history} />
        </div>

        {/* Signal Distribution */}
        <div className="card flex flex-col">
          <h2 className="text-sm font-semibold text-white mb-4">Signal Distribution</h2>

          <div className="space-y-3 flex-1">
            {[
              { label: 'Buy', count: buyCount, color: 'bg-emerald-500', textColor: 'text-emerald-400' },
              { label: 'Hold', count: holdCount, color: 'bg-amber-500', textColor: 'text-amber-400' },
              { label: 'Sell', count: sellCount, color: 'bg-red-500', textColor: 'text-red-400' },
            ].map(({ label, count, color, textColor }) => (
              <div key={label}>
                <div className="flex justify-between items-center mb-1">
                  <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>{label}</span>
                  <span className={`text-sm font-semibold ${textColor}`}>{count}</span>
                </div>
                <div className="h-2 rounded-full overflow-hidden" style={{ background: 'var(--border)' }}>
                  <div
                    className={`h-full rounded-full ${color} transition-all`}
                    style={{ width: `${(count / signals.length) * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </div>

          <div className="mt-4 pt-4 border-t" style={{ borderColor: 'var(--border)' }}>
            <div className="grid grid-cols-3 text-center gap-2">
              {[
                { label: 'Strong', count: signals.filter((s) => s.strength === 'STRONG').length },
                { label: 'Moderate', count: signals.filter((s) => s.strength === 'MODERATE').length },
                { label: 'Weak', count: signals.filter((s) => s.strength === 'WEAK').length },
              ].map(({ label, count }) => (
                <div key={label} className="rounded-lg p-2" style={{ background: 'var(--bg-secondary)' }}>
                  <p className="text-lg font-bold text-white">{count}</p>
                  <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ── Top Signals ───────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <TopSignalsTable title="Top Buy Signals" signals={topBuys} />
        <TopSignalsTable title="Top Sell Signals" signals={topSells} />
      </div>

      {/* ── CTA ───────────────────────────────────────────────────────── */}
      <div className="card flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-white">View all {signals.length} signal analyses</p>
          <p className="text-xs mt-0.5" style={{ color: 'var(--text-secondary)' }}>
            Sorted by signal strength with full indicator breakdown
          </p>
        </div>
        <Link
          href="/signals"
          className="px-4 py-2 rounded-lg bg-brand-600 hover:bg-brand-700 text-white text-sm font-medium transition-colors"
        >
          Open Signals →
        </Link>
      </div>
    </div>
  );
}
