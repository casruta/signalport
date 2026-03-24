'use client';

import clsx from 'clsx';

interface Props {
  label: string;
  value: number;
  min?: number;
  max?: number;
  lowThreshold?: number;
  highThreshold?: number;
  unit?: string;
  format?: (v: number) => string;
}

/**
 * A horizontal progress-bar gauge for numeric indicators (e.g. RSI).
 */
export function IndicatorGauge({
  label,
  value,
  min = 0,
  max = 100,
  lowThreshold = 30,
  highThreshold = 70,
  unit = '',
  format,
}: Props) {
  const pct = Math.max(0, Math.min(100, ((value - min) / (max - min)) * 100));
  const lowPct = ((lowThreshold - min) / (max - min)) * 100;
  const highPct = ((highThreshold - min) / (max - min)) * 100;

  const color =
    value < lowThreshold
      ? 'bg-emerald-400'
      : value > highThreshold
        ? 'bg-red-400'
        : 'bg-amber-400';

  const display = format ? format(value) : `${value.toFixed(1)}${unit}`;

  return (
    <div>
      <div className="flex items-center justify-between mb-1.5">
        <span className="text-xs font-medium" style={{ color: 'var(--text-secondary)' }}>{label}</span>
        <span className={clsx('text-xs font-mono font-semibold', color.replace('bg-', 'text-'))}>{display}</span>
      </div>
      <div className="relative h-2 rounded-full overflow-hidden" style={{ background: 'var(--border)' }}>
        {/* Zone markers */}
        <div className="absolute top-0 bottom-0 w-px bg-white/20" style={{ left: `${lowPct}%` }} />
        <div className="absolute top-0 bottom-0 w-px bg-white/20" style={{ left: `${highPct}%` }} />
        {/* Fill */}
        <div
          className={clsx('absolute top-0 left-0 h-full rounded-full transition-all duration-500', color)}
          style={{ width: `${pct}%` }}
        />
      </div>
      <div className="flex justify-between mt-0.5">
        <span className="text-[10px]" style={{ color: 'var(--text-muted)' }}>{min}</span>
        <span className="text-[10px]" style={{ color: 'var(--text-muted)' }}>{max}</span>
      </div>
    </div>
  );
}
