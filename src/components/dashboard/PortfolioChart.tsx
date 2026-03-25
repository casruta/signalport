'use client';

import { useId } from 'react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ReferenceLine,
} from 'recharts';
import type { PortfolioSnapshot } from '@/types';

interface Props {
  data: PortfolioSnapshot[];
  costBasis?: number;
}

function formatAxisDate(dateStr: string) {
  const d = new Date(dateStr + 'T00:00:00');
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

function formatUSD(v: number) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(v);
}

export function PortfolioChart({ data, costBasis }: Props) {
  const uid = useId();
  const fillId = `portfolioGrad-${uid.replace(/:/g, '')}`;

  const startValue = data[0]?.totalValue ?? 0;
  const endValue   = data[data.length - 1]?.totalValue ?? 0;
  const gain       = endValue - startValue;
  const gainPct    = startValue > 0 ? (gain / startValue) * 100 : 0;
  const isPositive = gain >= 0;

  const strokeColor = isPositive ? '#34d399' : '#f87171';

  return (
    <div className="card h-full">
      <div className="flex items-start justify-between mb-6">
        <div>
          <h2 className="text-sm font-semibold text-white">Portfolio Performance</h2>
          <p className="text-xs mt-0.5" style={{ color: 'var(--text-secondary)' }}>Last 90 trading days</p>
        </div>
        <div className="text-right">
          <p className="text-xl font-bold text-white">{formatUSD(endValue)}</p>
          <p className={`text-sm font-medium ${isPositive ? 'text-emerald-400' : 'text-red-400'}`}>
            {isPositive ? '+' : ''}{formatUSD(gain)} ({isPositive ? '+' : ''}{gainPct.toFixed(2)}%)
          </p>
        </div>
      </div>

      <ResponsiveContainer width="100%" height={240}>
        <AreaChart data={data} margin={{ top: 4, right: 4, left: 4, bottom: 0 }}>
          <defs>
            <linearGradient id={fillId} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={strokeColor} stopOpacity={0.35} />
              <stop offset="60%" stopColor={strokeColor} stopOpacity={0.10} />
              <stop offset="100%" stopColor={strokeColor} stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
          <XAxis
            dataKey="date"
            tickFormatter={formatAxisDate}
            tick={{ fontSize: 10, fill: '#5a6478' }}
            axisLine={false}
            tickLine={false}
            interval={Math.floor(data.length / 5)}
          />
          <YAxis
            tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`}
            tick={{ fontSize: 10, fill: '#5a6478' }}
            axisLine={false}
            tickLine={false}
            width={50}
            domain={[
              (dataMin: number) => Math.floor(dataMin * 0.97),
              (dataMax: number) => Math.ceil(dataMax * 1.03),
            ]}
          />
          <Tooltip
            contentStyle={{
              background: '#1e2535',
              border: '1px solid #2a3347',
              borderRadius: '8px',
              fontSize: 12,
            }}
            labelStyle={{ color: '#8b95a9', marginBottom: 4 }}
            itemStyle={{ color: '#e8edf5' }}
            labelFormatter={formatAxisDate}
            formatter={(value: number) => [formatUSD(value), 'Value']}
          />
          <Area
            type="monotone"
            dataKey="totalValue"
            stroke={strokeColor}
            strokeWidth={2}
            fill={`url(#${fillId})`}
            dot={false}
            activeDot={{ r: 4, fill: strokeColor, stroke: 'none' }}
          />
          {costBasis && costBasis > 0 && (
            <ReferenceLine
              y={costBasis}
              stroke="#f59e0b"
              strokeDasharray="4 3"
              strokeWidth={1.5}
              label={{
                value: `Cost basis ${formatUSD(costBasis)}`,
                position: 'insideTopLeft',
                fill: '#f59e0b',
                fontSize: 10,
              }}
            />
          )}
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
