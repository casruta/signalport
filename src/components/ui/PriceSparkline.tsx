'use client';

import { useId } from 'react';
import { ResponsiveContainer, AreaChart, Area, ReferenceLine, Tooltip } from 'recharts';

interface Props {
  prices: number[];   // last N closing prices, oldest first
  direction: 'BUY' | 'SELL' | 'HOLD';
}

const COLORS = {
  BUY:  { stroke: '#10b981' },
  SELL: { stroke: '#ef4444' },
  HOLD: { stroke: '#f59e0b' },
};

export function PriceSparkline({ prices, direction }: Props) {
  const uid = useId();
  const gradId = `spark-grad-${uid.replace(/:/g, '')}`;

  if (prices.length < 2) return null;

  const data = prices.map((close, i) => ({ i, close }));
  const { stroke } = COLORS[direction];
  const minP = Math.min(...prices);
  const maxP = Math.max(...prices);
  const mid = (minP + maxP) / 2;

  return (
    <div>
      <ResponsiveContainer width="100%" height={56}>
        <AreaChart data={data} margin={{ top: 4, right: 0, left: 0, bottom: 4 }}>
          <defs>
            <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%"  stopColor={stroke} stopOpacity={0.3} />
              <stop offset="95%" stopColor={stroke} stopOpacity={0} />
            </linearGradient>
          </defs>
          <ReferenceLine y={mid} stroke={stroke} strokeOpacity={0.2} strokeDasharray="3 3" />
          <Tooltip
            contentStyle={{ background: '#1a1f2e', border: '1px solid #2d3748', borderRadius: 6, padding: '4px 8px' }}
            labelStyle={{ display: 'none' }}
            formatter={(v: number) => [`$${v.toFixed(2)}`, 'Price']}
          />
          <Area
            type="monotone"
            dataKey="close"
            stroke={stroke}
            strokeWidth={1.5}
            fill={`url(#${gradId})`}
            dot={false}
            isAnimationActive={false}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
