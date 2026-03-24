import clsx from 'clsx';
import type { SignalDirection, SignalStrength } from '@/types';

interface Props {
  direction: SignalDirection;
  strength?: SignalStrength;
  size?: 'sm' | 'md';
}

const DIRECTION_STYLES: Record<SignalDirection, string> = {
  BUY:  'bg-emerald-900/40 text-emerald-400 border border-emerald-800/60',
  SELL: 'bg-red-900/40   text-red-400   border border-red-800/60',
  HOLD: 'bg-amber-900/40 text-amber-400 border border-amber-800/60',
};

const DIRECTION_DOT: Record<SignalDirection, string> = {
  BUY:  'bg-emerald-400',
  SELL: 'bg-red-400',
  HOLD: 'bg-amber-400',
};

export function SignalBadge({ direction, strength, size = 'md' }: Props) {
  return (
    <span
      className={clsx(
        'inline-flex items-center gap-1.5 rounded-full font-semibold',
        size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-3 py-1 text-sm',
        DIRECTION_STYLES[direction],
      )}
    >
      <span className={clsx('rounded-full flex-shrink-0', size === 'sm' ? 'w-1.5 h-1.5' : 'w-2 h-2', DIRECTION_DOT[direction])} />
      {strength ? `${strength} ${direction}` : direction}
    </span>
  );
}
