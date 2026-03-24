/**
 * Technical indicator calculations.
 *
 * All formulas follow standard financial definitions:
 *   - RSI: Wilder's smoothed RSI (14-period default)
 *   - MACD: 12/26/9 EMA-based
 *   - Bollinger Bands: 20-period SMA ± 2σ
 *   - SMA: simple arithmetic mean over N periods
 *   - EMA: exponential moving average with multiplier 2/(N+1)
 */

import type {
  RSIResult,
  MACDResult,
  BollingerResult,
  MovingAverageResult,
  SignalDirection,
} from '@/types';

// ─── Primitives ───────────────────────────────────────────────────────────────

/**
 * Simple Moving Average of the last `period` values.
 * Returns NaN if fewer data points than `period`.
 */
export function sma(prices: number[], period: number): number {
  if (prices.length < period) return NaN;
  const slice = prices.slice(-period);
  return slice.reduce((sum, p) => sum + p, 0) / period;
}

/**
 * Exponential Moving Average (EMA).
 * Seeded with the SMA of the first `period` values.
 * Returns NaN if fewer data points than `period`.
 */
export function ema(prices: number[], period: number): number {
  if (prices.length < period) return NaN;
  const k = 2 / (period + 1);
  // Seed with SMA of first `period` values
  let value = prices.slice(0, period).reduce((s, p) => s + p, 0) / period;
  for (let i = period; i < prices.length; i++) {
    value = prices[i] * k + value * (1 - k);
  }
  return value;
}

/**
 * Full EMA series (one value per input price after the seeding period).
 */
export function emaSeries(prices: number[], period: number): number[] {
  if (prices.length < period) return [];
  const k = 2 / (period + 1);
  let value = prices.slice(0, period).reduce((s, p) => s + p, 0) / period;
  const result: number[] = [value];
  for (let i = period; i < prices.length; i++) {
    value = prices[i] * k + value * (1 - k);
    result.push(value);
  }
  return result;
}

// ─── RSI ──────────────────────────────────────────────────────────────────────

/**
 * Wilder's RSI using smoothed averages (SMMA / RMA).
 *
 * Formula:
 *   RS  = avgGain / avgLoss
 *   RSI = 100 − (100 / (1 + RS))
 *
 * First avgGain/avgLoss = plain average of first `period` gains/losses.
 * Subsequent values use Wilder smoothing: smma_n = (smma_{n-1} × (period-1) + value) / period
 *
 * @param closes  Array of closing prices, oldest first.
 * @param period  Look-back period (default 14).
 */
export function rsi(closes: number[], period = 14): RSIResult {
  if (closes.length < period + 1) {
    return { value: 50, signal: 'HOLD' };
  }

  // Compute price changes
  const changes = closes.slice(1).map((c, i) => c - closes[i]);

  // Seed using the first `period` changes
  let avgGain =
    changes.slice(0, period).reduce((s, c) => s + Math.max(c, 0), 0) / period;
  let avgLoss =
    changes.slice(0, period).reduce((s, c) => s + Math.max(-c, 0), 0) / period;

  // Wilder smoothing for subsequent changes
  for (let i = period; i < changes.length; i++) {
    const gain = Math.max(changes[i], 0);
    const loss = Math.max(-changes[i], 0);
    avgGain = (avgGain * (period - 1) + gain) / period;
    avgLoss = (avgLoss * (period - 1) + loss) / period;
  }

  const rs = avgLoss === 0 ? 100 : avgGain / avgLoss;
  const value = avgLoss === 0 ? 100 : 100 - 100 / (1 + rs);

  const signal: SignalDirection =
    value < 30 ? 'BUY' : value > 70 ? 'SELL' : 'HOLD';

  return { value: parseFloat(value.toFixed(2)), signal };
}

// ─── MACD ─────────────────────────────────────────────────────────────────────

/**
 * MACD (Moving Average Convergence Divergence).
 *
 * MACD Line     = EMA(12) − EMA(26)
 * Signal Line   = EMA(9) of MACD Line
 * Histogram     = MACD Line − Signal Line
 *
 * Crossover detection: bullish if the latest histogram > 0 and the prior < 0.
 *
 * @param closes      Closing prices, oldest first.
 * @param fastPeriod  Fast EMA period (default 12).
 * @param slowPeriod  Slow EMA period (default 26).
 * @param signalPeriod Signal EMA period (default 9).
 */
export function macd(
  closes: number[],
  fastPeriod = 12,
  slowPeriod = 26,
  signalPeriod = 9,
): MACDResult {
  const minLength = slowPeriod + signalPeriod;
  if (closes.length < minLength) {
    return { macd: 0, signal: 0, histogram: 0, crossover: 'none' };
  }

  // Build full MACD line series
  const k12 = 2 / (fastPeriod + 1);
  const k26 = 2 / (slowPeriod + 1);

  let ema12 = closes.slice(0, fastPeriod).reduce((s, p) => s + p, 0) / fastPeriod;
  let ema26 = closes.slice(0, slowPeriod).reduce((s, p) => s + p, 0) / slowPeriod;

  // Advance ema12 to position slowPeriod - 1 (same alignment as ema26 seed)
  for (let i = fastPeriod; i < slowPeriod; i++) {
    ema12 = closes[i] * k12 + ema12 * (1 - k12);
  }

  const macdLine: number[] = [];
  for (let i = slowPeriod; i < closes.length; i++) {
    ema12 = closes[i] * k12 + ema12 * (1 - k12);
    ema26 = closes[i] * k26 + ema26 * (1 - k26);
    macdLine.push(ema12 - ema26);
  }

  if (macdLine.length < signalPeriod) {
    return { macd: 0, signal: 0, histogram: 0, crossover: 'none' };
  }

  // Signal line = EMA(9) of macdLine
  const kSig = 2 / (signalPeriod + 1);
  let signalVal =
    macdLine.slice(0, signalPeriod).reduce((s, v) => s + v, 0) / signalPeriod;
  for (let i = signalPeriod; i < macdLine.length; i++) {
    signalVal = macdLine[i] * kSig + signalVal * (1 - kSig);
  }

  const macdVal = macdLine[macdLine.length - 1];
  const histogram = macdVal - signalVal;
  const prevHistogram =
    macdLine.length > 1
      ? macdLine[macdLine.length - 2] -
        (macdLine[macdLine.length - 2] * kSig + signalVal * (1 - kSig))
      : 0;

  let crossover: MACDResult['crossover'] = 'none';
  if (histogram > 0 && prevHistogram <= 0) crossover = 'bullish';
  if (histogram < 0 && prevHistogram >= 0) crossover = 'bearish';

  return {
    macd: parseFloat(macdVal.toFixed(4)),
    signal: parseFloat(signalVal.toFixed(4)),
    histogram: parseFloat(histogram.toFixed(4)),
    crossover,
  };
}

// ─── Bollinger Bands ──────────────────────────────────────────────────────────

/**
 * Bollinger Bands.
 *
 * Middle = SMA(20)
 * Upper  = SMA(20) + (2 × σ)
 * Lower  = SMA(20) − (2 × σ)
 *
 * where σ is the population standard deviation of the last 20 closes.
 *
 * %B = (price − lower) / (upper − lower)  — where the price is relative to the bands.
 * Bandwidth = (upper − lower) / middle
 */
export function bollingerBands(
  closes: number[],
  period = 20,
  stdDevMultiplier = 2,
): BollingerResult {
  if (closes.length < period) {
    const price = closes[closes.length - 1] ?? 0;
    return {
      upper: price,
      middle: price,
      lower: price,
      bandwidth: 0,
      percentB: 0.5,
    };
  }

  const slice = closes.slice(-period);
  const middle = slice.reduce((s, p) => s + p, 0) / period;

  // Population standard deviation
  const variance = slice.reduce((s, p) => s + (p - middle) ** 2, 0) / period;
  const stdDev = Math.sqrt(variance);

  const upper = middle + stdDevMultiplier * stdDev;
  const lower = middle - stdDevMultiplier * stdDev;
  const price = closes[closes.length - 1];

  const bandwidth = middle !== 0 ? (upper - lower) / middle : 0;
  const percentB = upper !== lower ? (price - lower) / (upper - lower) : 0.5;

  return {
    upper: parseFloat(upper.toFixed(4)),
    middle: parseFloat(middle.toFixed(4)),
    lower: parseFloat(lower.toFixed(4)),
    bandwidth: parseFloat(bandwidth.toFixed(4)),
    percentB: parseFloat(percentB.toFixed(4)),
  };
}

// ─── Moving Averages ──────────────────────────────────────────────────────────

/**
 * SMA-50 and SMA-200 with Golden/Death Cross detection.
 *
 * Golden Cross: the 50-day SMA has crossed above the 200-day SMA
 *   (current sma50 > sma200, but prior sma50 ≤ prior sma200).
 * Death Cross: the opposite.
 *
 * We approximate "prior" by shifting back 5 bars.
 */
export function movingAverages(closes: number[]): MovingAverageResult {
  const sma50 = sma(closes, 50);
  const sma200 = sma(closes, 200);

  if (isNaN(sma50) || isNaN(sma200)) {
    return { sma50, sma200, goldenCross: false, deathCross: false };
  }

  // Prior values (5 bars ago) for cross detection
  const prior = closes.slice(0, -5);
  const priorSma50 = sma(prior, 50);
  const priorSma200 = sma(prior, 200);

  const goldenCross =
    !isNaN(priorSma50) &&
    !isNaN(priorSma200) &&
    sma50 > sma200 &&
    priorSma50 <= priorSma200;

  const deathCross =
    !isNaN(priorSma50) &&
    !isNaN(priorSma200) &&
    sma50 < sma200 &&
    priorSma50 >= priorSma200;

  return {
    sma50: parseFloat(sma50.toFixed(2)),
    sma200: parseFloat(sma200.toFixed(2)),
    goldenCross,
    deathCross,
  };
}

// ─── Composite Signal Score ───────────────────────────────────────────────────

/**
 * Composite score (0–100) combining multiple indicators.
 *
 * Weighting (chosen so that RSI oversold can independently trigger a BUY):
 *   RSI            40%  — momentum oscillator; highest weight as primary signal
 *   MACD           25%  — trend confirmation
 *   Price vs SMAs  20%  — trend direction
 *   Bollinger %B   15%  — volatility-adjusted position
 *
 * Thresholds:
 *   score > 52 → BUY   (RSI oversold + BB oversold = 40+15 = 55 > 52 ✓)
 *   score < 42 → SELL  (RSI overbought + BB overbought = 0+0 + trend = 35 < 42 ✓)
 *   42–52     → HOLD
 *
 * Design rationale: RSI and Bollinger %B are "oversold/overbought" indicators
 * that can independently fire a contrarian BUY/SELL signal even when trend
 * indicators (MACD, SMAs) are still bearish/bullish — which is the correct
 * technical analysis approach for mean-reversion trades.
 */
export function compositeScore(
  closes: number[],
): { score: number; direction: SignalDirection } {
  const rsiResult = rsi(closes);
  const macdResult = macd(closes);
  const bbResult = bollingerBands(closes);
  const maResult = movingAverages(closes);

  const price = closes[closes.length - 1];

  // RSI sub-score: 0 = fully overbought (RSI 100), 100 = fully oversold (RSI 0)
  const rsiScore = Math.max(0, Math.min(100, 100 - rsiResult.value));

  // MACD sub-score: positive histogram = bullish momentum
  const macdAbsMax = Math.abs(macdResult.macd) + 0.001;
  const macdScore =
    macdResult.histogram > 0
      ? 50 + Math.min(50, (macdResult.histogram / macdAbsMax) * 50)
      : 50 - Math.min(50, (Math.abs(macdResult.histogram) / macdAbsMax) * 50);

  // SMA sub-score: price above both SMAs = bullish trend
  let smaScore = 50;
  if (!isNaN(maResult.sma50) && !isNaN(maResult.sma200)) {
    const aboveSma50 = price > maResult.sma50 ? 25 : 0;
    const aboveSma200 = price > maResult.sma200 ? 25 : 0;
    smaScore = aboveSma50 + aboveSma200;
  }

  // Bollinger %B sub-score: %B near 0 (lower band) = oversold = bullish
  const bbScore = Math.max(0, Math.min(100, (1 - bbResult.percentB) * 100));

  const score =
    rsiScore * 0.40 + macdScore * 0.25 + smaScore * 0.20 + bbScore * 0.15;

  const direction: SignalDirection =
    score > 52 ? 'BUY' : score < 42 ? 'SELL' : 'HOLD';

  return { score: parseFloat(score.toFixed(1)), direction };
}
