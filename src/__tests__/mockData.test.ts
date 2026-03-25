/**
 * Integration tests for mock data generation and signal coherence.
 */

import { getSignals, getPortfolioPositions, getPortfolioHistory, getPriceSeries } from '@/lib/mockData';

describe('getPriceSeries', () => {
  it('returns 260 bars for a known ticker', () => {
    const series = getPriceSeries('AAPL');
    expect(series.length).toBe(260);
  });

  it('returns empty array for unknown ticker', () => {
    expect(getPriceSeries('UNKNOWN')).toEqual([]);
  });

  it('all prices are positive', () => {
    const series = getPriceSeries('MSFT');
    for (const bar of series) {
      expect(bar.close).toBeGreaterThan(0);
      expect(bar.open).toBeGreaterThan(0);
      expect(bar.high).toBeGreaterThanOrEqual(bar.open);
      expect(bar.high).toBeGreaterThanOrEqual(bar.close);
      expect(bar.low).toBeLessThanOrEqual(bar.open);
      expect(bar.low).toBeLessThanOrEqual(bar.close);
      expect(bar.volume).toBeGreaterThan(0);
    }
  });

  it('dates are weekdays only', () => {
    const series = getPriceSeries('NVDA');
    for (const bar of series) {
      const day = new Date(bar.date + 'T00:00:00').getDay();
      expect(day).toBeGreaterThanOrEqual(1); // Monday
      expect(day).toBeLessThanOrEqual(5);    // Friday
    }
  });

  it('is deterministic (same seed → same prices)', () => {
    const a = getPriceSeries('AAPL');
    const b = getPriceSeries('AAPL');
    expect(a[0].close).toBe(b[0].close);
    expect(a[100].close).toBe(b[100].close);
  });
});

describe('getSignals', () => {
  it('returns a signal for each tracked asset', () => {
    const signals = getSignals();
    expect(signals.length).toBeGreaterThanOrEqual(6);
  });

  it('every signal has required fields', () => {
    const signals = getSignals();
    for (const s of signals) {
      expect(s.ticker).toBeTruthy();
      expect(s.name).toBeTruthy();
      expect(['BUY', 'SELL', 'HOLD']).toContain(s.direction);
      expect(['STRONG', 'MODERATE', 'WEAK']).toContain(s.strength);
      expect(s.price).toBeGreaterThan(0);
      expect(s.rsi).toBeGreaterThanOrEqual(0);
      expect(s.rsi).toBeLessThanOrEqual(100);
      expect(s.score).toBeGreaterThanOrEqual(0);
      expect(s.score).toBeLessThanOrEqual(100);
      expect(s.rationale).toBeTruthy();
    }
  });

  it('MACD histogram equals MACD minus signal', () => {
    const signals = getSignals();
    for (const s of signals) {
      expect(s.macdHistogram).toBeCloseTo(s.macd - s.macdSignal, 2);
    }
  });

  it('Bollinger lower <= middle <= upper', () => {
    const signals = getSignals();
    for (const s of signals) {
      expect(s.bollingerLower).toBeLessThanOrEqual(s.bollingerMiddle);
      expect(s.bollingerMiddle).toBeLessThanOrEqual(s.bollingerUpper);
    }
  });

  it('score drives direction correctly', () => {
    const signals = getSignals();
    for (const s of signals) {
      if (s.direction === 'BUY') expect(s.score).toBeGreaterThan(52);
      if (s.direction === 'SELL') expect(s.score).toBeLessThan(42);
      if (s.direction === 'HOLD') {
        expect(s.score).toBeGreaterThanOrEqual(42);
        expect(s.score).toBeLessThanOrEqual(52);
      }
    }
  });
});

describe('getPortfolioPositions', () => {
  it('returns at least 3 positions', () => {
    const positions = getPortfolioPositions();
    expect(positions.length).toBeGreaterThanOrEqual(3);
  });

  it('all position prices are positive', () => {
    const positions = getPortfolioPositions();
    for (const p of positions) {
      expect(p.currentPrice).toBeGreaterThan(0);
      expect(p.avgCostBasis).toBeGreaterThan(0);
      expect(p.shares).toBeGreaterThan(0);
    }
  });
});

describe('getPortfolioHistory', () => {
  it('returns at least 30 daily snapshots', () => {
    const history = getPortfolioHistory();
    expect(history.length).toBeGreaterThanOrEqual(30);
  });

  it('all snapshot values are positive', () => {
    const history = getPortfolioHistory();
    for (const snap of history) {
      expect(snap.totalValue).toBeGreaterThan(0);
    }
  });
});
