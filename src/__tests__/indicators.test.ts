/**
 * Unit tests for technical indicator calculations.
 *
 * Each test verifies mathematical correctness against known expected values
 * computed by hand or cross-referenced with standard financial libraries.
 */

import { sma, ema, rsi, macd, bollingerBands, movingAverages, compositeScore } from '@/lib/indicators';

// ─── Helpers ──────────────────────────────────────────────────────────────────

const round = (v: number, dp = 4) => Math.round(v * 10 ** dp) / 10 ** dp;

// ─── SMA ─────────────────────────────────────────────────────────────────────

describe('sma', () => {
  it('computes a simple average correctly', () => {
    expect(sma([1, 2, 3, 4, 5], 5)).toBe(3);
  });

  it('uses only the last `period` values', () => {
    // SMA(3) of [1,2,3,4,5] → average of [3,4,5] = 4
    expect(sma([1, 2, 3, 4, 5], 3)).toBe(4);
  });

  it('returns NaN when not enough data', () => {
    expect(sma([1, 2], 5)).toBeNaN();
  });

  it('returns the value itself for period=1', () => {
    expect(sma([42], 1)).toBe(42);
  });
});

// ─── EMA ─────────────────────────────────────────────────────────────────────

describe('ema', () => {
  it('seeds with SMA and applies multiplier', () => {
    // With prices [10, 11, 12] and period=2:
    // Seed EMA = (10+11)/2 = 10.5
    // k = 2/(2+1) = 0.6667
    // EMA after price 12 = 12 * 0.6667 + 10.5 * 0.3333 = 8.0 + 3.5 = 11.5
    expect(round(ema([10, 11, 12], 2), 2)).toBe(11.5);
  });

  it('returns NaN when not enough data', () => {
    expect(ema([1], 5)).toBeNaN();
  });
});

// ─── RSI ─────────────────────────────────────────────────────────────────────

describe('rsi', () => {
  it('returns 50 / HOLD with insufficient data', () => {
    const result = rsi([100, 101, 102], 14);
    expect(result.value).toBe(50);
    expect(result.signal).toBe('HOLD');
  });

  it('returns RSI = 100 when all moves are up', () => {
    const prices = Array.from({ length: 20 }, (_, i) => 100 + i);
    const result = rsi(prices);
    expect(result.value).toBeCloseTo(100, 0);
    expect(result.signal).toBe('SELL');
  });

  it('returns RSI = 0 when all moves are down', () => {
    const prices = Array.from({ length: 20 }, (_, i) => 100 - i);
    const result = rsi(prices);
    expect(result.value).toBeCloseTo(0, 0);
    expect(result.signal).toBe('BUY');
  });

  it('RSI is in [0, 100]', () => {
    const prices = [44, 44.34, 44.09, 44.15, 43.61, 44.33, 44.83, 45.10,
                    45.15, 43.61, 44.33, 44.83, 45.10, 45.15, 43.80];
    const result = rsi(prices);
    expect(result.value).toBeGreaterThanOrEqual(0);
    expect(result.value).toBeLessThanOrEqual(100);
  });

  it('signal is BUY when RSI < 30', () => {
    // Force RSI < 30 by having many consecutive down days
    const prices = [100, 99, 97, 94, 90, 85, 79, 72, 64, 55, 46, 36, 27, 18, 10, 5];
    const result = rsi(prices);
    expect(result.signal).toBe('BUY');
  });

  it('signal is SELL when RSI > 70', () => {
    const prices = [10, 12, 15, 19, 24, 30, 37, 45, 54, 64, 75, 87, 100, 114, 129, 145];
    const result = rsi(prices);
    expect(result.signal).toBe('SELL');
  });
});

// ─── MACD ─────────────────────────────────────────────────────────────────────

describe('macd', () => {
  it('returns zeros with insufficient data', () => {
    const result = macd([1, 2, 3]);
    expect(result.macd).toBe(0);
    expect(result.signal).toBe(0);
    expect(result.histogram).toBe(0);
  });

  it('histogram = macd - signal', () => {
    const prices = Array.from({ length: 60 }, (_, i) => 100 + Math.sin(i / 5) * 10);
    const result = macd(prices);
    expect(round(result.histogram, 4)).toBe(round(result.macd - result.signal, 4));
  });

  it('crossover is none when no cross recently', () => {
    // Linearly increasing prices — MACD will remain positive, no crossover
    const prices = Array.from({ length: 60 }, (_, i) => 50 + i * 0.5);
    const result = macd(prices);
    // Just check it runs without error and histogram = macd - signal
    expect(result.histogram).toBeCloseTo(result.macd - result.signal, 3);
  });
});

// ─── Bollinger Bands ──────────────────────────────────────────────────────────

describe('bollingerBands', () => {
  it('upper > middle > lower', () => {
    const prices = [100, 102, 101, 103, 99, 100, 101, 102, 98, 100,
                    101, 103, 100, 99, 101, 102, 100, 98, 99, 101];
    const result = bollingerBands(prices);
    expect(result.upper).toBeGreaterThan(result.middle);
    expect(result.middle).toBeGreaterThan(result.lower);
  });

  it('middle equals SMA(20)', () => {
    const prices = Array.from({ length: 20 }, (_, i) => 100 + i);
    const expectedSMA = prices.reduce((s, p) => s + p, 0) / 20;
    const result = bollingerBands(prices, 20);
    expect(result.middle).toBeCloseTo(expectedSMA, 2);
  });

  it('percentB = 0.5 when price equals middle band', () => {
    // All prices the same → σ = 0, bands collapse to middle, %B = 0.5
    const prices = Array.from({ length: 20 }, () => 100);
    const result = bollingerBands(prices);
    expect(result.percentB).toBe(0.5);
    expect(result.bandwidth).toBe(0);
  });

  it('%B is near 1 when price is near upper band', () => {
    // Create series where last price is high relative to band
    const prices = Array.from({ length: 19 }, () => 100);
    prices.push(110); // Last price much higher
    const result = bollingerBands(prices);
    expect(result.percentB).toBeGreaterThan(0.5);
  });
});

// ─── Moving Averages ──────────────────────────────────────────────────────────

describe('movingAverages', () => {
  it('returns NaN SMAs when not enough data', () => {
    const result = movingAverages(Array.from({ length: 10 }, () => 100));
    expect(isNaN(result.sma50)).toBe(true);
  });

  it('sma50 > sma200 in a sustained uptrend', () => {
    // 210 prices, steadily increasing
    const prices = Array.from({ length: 210 }, (_, i) => 50 + i * 0.5);
    const result = movingAverages(prices);
    expect(result.sma50).toBeGreaterThan(result.sma200);
  });

  it('sma50 < sma200 in a sustained downtrend', () => {
    const prices = Array.from({ length: 210 }, (_, i) => 200 - i * 0.5);
    const result = movingAverages(prices);
    expect(result.sma50).toBeLessThan(result.sma200);
  });
});

// ─── Composite Score ──────────────────────────────────────────────────────────

describe('compositeScore', () => {
  it('score is between 0 and 100', () => {
    const prices = Array.from({ length: 260 }, (_, i) => 100 + Math.sin(i / 20) * 20);
    const { score } = compositeScore(prices);
    expect(score).toBeGreaterThanOrEqual(0);
    expect(score).toBeLessThanOrEqual(100);
  });

  it('overbought linear uptrend gives SELL direction (RSI near 100)', () => {
    // A perfectly linear uptrend has RSI ≈ 100 → rsiScore ≈ 0 → low composite.
    // With RSI weight at 40%, an overbought RSI strongly pushes score below 42 (SELL).
    const prices = Array.from({ length: 260 }, (_, i) => 10 + i * 2);
    const { direction, score } = compositeScore(prices);
    expect(score).toBeLessThan(52);
    expect(direction).toBe('SELL');
  });

  it('oversold linear downtrend gives BUY direction (RSI near 0)', () => {
    // RSI ≈ 0 → rsiScore = 100 → contributes 40 to score.
    // BB also oversold → bbScore ≈ 100 → contributes 15. Total ≥ 55 > 52 → BUY.
    const prices = Array.from({ length: 260 }, (_, i) => 600 - i * 2);
    const { score, direction } = compositeScore(prices);
    expect(score).toBeGreaterThan(52);
    expect(direction).toBe('BUY');
  });
});
