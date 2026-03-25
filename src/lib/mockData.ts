/**
 * Mock market data for SignalPort demo.
 *
 * Price series are generated using a seeded geometric Brownian motion model
 * (GBM), which is the standard model used by the Black-Scholes option pricing
 * framework. Each series is deterministic so that indicators are reproducible.
 *
 * GBM step: P_{t+1} = P_t × exp((μ − σ²/2)Δt + σ√Δt × Z)
 *   where Z ~ N(0,1) approximated by Box-Muller transform seeded per ticker.
 */

import type { OHLCV, Signal, Position, PortfolioSnapshot } from '@/types';
import { rsi, macd, bollingerBands, movingAverages, compositeScore } from './indicators';

// ─── Seeded Pseudo-Random (Mulberry32) ───────────────────────────────────────

function mulberry32(seed: number) {
  return function (): number {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// Box-Muller transform: uniform → standard normal
function boxMuller(rand: () => number): number {
  const u1 = Math.max(1e-10, rand());
  const u2 = rand();
  return Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);
}

interface AssetDef {
  ticker: string;
  name: string;
  sector: string;
  startPrice: number;
  mu: number;        // annualised drift (e.g. 0.12 = 12% per year)
  sigma: number;     // annualised volatility (e.g. 0.25 = 25%)
  seed: number;
  // Optional: apply a sharp correction in the last `correctionBars` trading
  // days to simulate a pullback. This produces oversold RSI → BUY signals.
  correctionBars?: number;  // number of trailing bars with bearish regime
  correctionMu?: number;    // annualised drift during correction (negative = falling)
}

const ASSETS: AssetDef[] = [
  // ── Strong uptrend → SELL (overbought)
  { ticker: 'NVDA',  name: 'NVIDIA Corp.',           sector: 'Technology',    startPrice: 200, mu: 0.50, sigma: 0.55, seed: 1005 },
  // ── Uptrend then sharp correction → oversold RSI → BUY
  // Wilder smoothing requires long corrections (70+ bars) to overcome prior history
  { ticker: 'AAPL',  name: 'Apple Inc.',             sector: 'Technology',    startPrice: 150, mu: 0.22, sigma: 0.28, seed: 1001, correctionBars: 75, correctionMu: -4.5 },
  { ticker: 'MSFT',  name: 'Microsoft Corp.',        sector: 'Technology',    startPrice: 310, mu: 0.20, sigma: 0.25, seed: 1002, correctionBars: 65, correctionMu: -4.0 },
  { ticker: 'JPM',   name: 'JPMorgan Chase & Co.',   sector: 'Financials',    startPrice: 145, mu: 0.12, sigma: 0.22, seed: 1006, correctionBars: 80, correctionMu: -3.5 },
  { ticker: 'XOM',   name: 'Exxon Mobil Corp.',      sector: 'Energy',        startPrice: 95,  mu: 0.10, sigma: 0.28, seed: 1008, correctionBars: 70, correctionMu: -4.0 },
  // ── Sideways / consolidating → HOLD
  { ticker: 'TSLA',  name: 'Tesla Inc.',             sector: 'Consumer',      startPrice: 200, mu: 0.10, sigma: 0.65, seed: 1011 },
];

// ─── Price Series Generation ──────────────────────────────────────────────────

const TRADING_DAYS = 252;
const DT = 1 / TRADING_DAYS;

function generateOHLCV(asset: AssetDef, bars = 260): OHLCV[] {
  const rand = mulberry32(asset.seed);
  const result: OHLCV[] = [];
  let close = asset.startPrice;

  const correctionStart = asset.correctionBars
    ? bars - asset.correctionBars
    : bars + 1; // never triggers if no correction defined

  // Reference date: 260 trading days back from "today" (2024-01-01 proxy)
  const endMs = new Date('2024-12-31').getTime();
  const startMs = endMs - bars * 1.4 * 24 * 3600 * 1000; // approx

  let tradingDay = 0;
  let calDay = 0;
  while (tradingDay < bars) {
    const d = new Date(startMs + calDay * 24 * 3600 * 1000);
    calDay++;
    const dow = d.getDay();
    if (dow === 0 || dow === 6) continue; // skip weekends

    // Use correction drift for the final `correctionBars` trading days
    const mu =
      tradingDay >= correctionStart && asset.correctionMu !== undefined
        ? asset.correctionMu
        : asset.mu;

    const z = boxMuller(rand);
    const dailyReturn = Math.exp(
      (mu - 0.5 * asset.sigma ** 2) * DT + asset.sigma * Math.sqrt(DT) * z,
    );
    const open = close;
    close = open * dailyReturn;

    // Intra-day range (high/low)
    const intraVol = asset.sigma * Math.sqrt(DT) * (0.5 + rand() * 0.5);
    const high = Math.max(open, close) * (1 + intraVol * rand());
    const low = Math.min(open, close) * (1 - intraVol * rand());

    const volume = Math.round(
      (asset.startPrice * 1_000_000 * (0.5 + rand())) / close,
    );

    result.push({
      date: d.toISOString().slice(0, 10),
      open: parseFloat(open.toFixed(2)),
      high: parseFloat(high.toFixed(2)),
      low: parseFloat(low.toFixed(2)),
      close: parseFloat(close.toFixed(2)),
      volume,
    });

    tradingDay++;
  }

  return result;
}

// ─── Memoised series cache ────────────────────────────────────────────────────

const seriesCache = new Map<string, OHLCV[]>();

export function getPriceSeries(ticker: string): OHLCV[] {
  if (seriesCache.has(ticker)) return seriesCache.get(ticker)!;
  const asset = ASSETS.find((a) => a.ticker === ticker);
  if (!asset) return [];
  const series = generateOHLCV(asset);
  seriesCache.set(ticker, series);
  return series;
}

// ─── Signal Generation ────────────────────────────────────────────────────────

function strengthFromScore(score: number): Signal['strength'] {
  if (score > 70 || score < 30) return 'STRONG';
  if (score > 60 || score < 40) return 'MODERATE';
  return 'WEAK';
}

function buildRationale(
  direction: Signal['direction'],
  rsiVal: number,
  macdHist: number,
  price: number,
  sma50: number,
  sma200: number,
): string {
  const parts: string[] = [];

  if (direction === 'BUY') {
    if (rsiVal < 30) parts.push(`RSI at ${rsiVal.toFixed(0)} signals oversold conditions`);
    if (macdHist > 0) parts.push('MACD histogram turned positive (bullish crossover)');
    if (price > sma50 && price > sma200) parts.push('Price above both 50-day and 200-day moving averages');
    else if (price > sma200) parts.push('Price above long-term 200-day moving average');
  } else if (direction === 'SELL') {
    if (rsiVal > 70) parts.push(`RSI at ${rsiVal.toFixed(0)} signals overbought conditions`);
    if (macdHist < 0) parts.push('MACD histogram turned negative (bearish crossover)');
    if (price < sma50 && price < sma200) parts.push('Price below both 50-day and 200-day moving averages');
    else if (price < sma200) parts.push('Price below long-term 200-day moving average');
  } else {
    parts.push(`RSI neutral at ${rsiVal.toFixed(0)}`);
    parts.push('No strong MACD crossover detected');
    parts.push('Mixed trend signals — waiting for confirmation');
  }

  return parts.length > 0 ? parts.join('. ') + '.' : 'No strong signal at current levels.';
}

export function getSignals(): Signal[] {
  return ASSETS.map((asset) => {
    const series = getPriceSeries(asset.ticker);
    const closes = series.map((b) => b.close);

    const latestBar = series[series.length - 1];
    const prevBar = series[series.length - 2];
    const price = latestBar.close;
    const priceChange = parseFloat((price - prevBar.close).toFixed(2));
    const priceChangePct = parseFloat(((priceChange / prevBar.close) * 100).toFixed(2));

    const rsiResult = rsi(closes);
    const macdResult = macd(closes);
    const bbResult = bollingerBands(closes);
    const maResult = movingAverages(closes);
    const composite = compositeScore(closes);

    return {
      id: asset.ticker,
      ticker: asset.ticker,
      name: asset.name,
      direction: composite.direction,
      strength: strengthFromScore(composite.score),
      price,
      priceChange,
      priceChangePct,
      rsi: rsiResult.value,
      macd: macdResult.macd,
      macdSignal: macdResult.signal,
      macdHistogram: macdResult.histogram,
      sma50: maResult.sma50,
      sma200: maResult.sma200,
      bollingerUpper: bbResult.upper,
      bollingerMiddle: bbResult.middle,
      bollingerLower: bbResult.lower,
      bollingerPercentB: parseFloat(bbResult.percentB.toFixed(3)),
      bollingerBandwidth: parseFloat(bbResult.bandwidth.toFixed(3)),
      score: composite.score,
      generatedAt: new Date().toISOString(),
      rationale: buildRationale(
        composite.direction,
        rsiResult.value,
        macdResult.histogram,
        price,
        maResult.sma50,
        maResult.sma200,
      ),
    };
  });
}

// ─── Portfolio Mock Data ──────────────────────────────────────────────────────

export function getPortfolioPositions(): Position[] {
  // Portfolio holds positions across all 6 tracked assets
  const holdings = [
    { ticker: 'NVDA',  shares: 20,  avgCost: 195.00 },
    { ticker: 'AAPL',  shares: 30,  avgCost: 135.00 },
    { ticker: 'MSFT',  shares: 15,  avgCost: 285.00 },
    { ticker: 'JPM',   shares: 25,  avgCost: 130.00 },
    { ticker: 'XOM',   shares: 40,  avgCost: 85.00  },
    { ticker: 'TSLA',  shares: 10,  avgCost: 185.00 },
  ];

  return holdings.map(({ ticker, shares, avgCost }) => {
    const series = getPriceSeries(ticker);
    const asset = ASSETS.find((a) => a.ticker === ticker)!;
    const currentPrice = series[series.length - 1].close;
    return {
      ticker,
      name: asset.name,
      shares,
      avgCostBasis: avgCost,
      currentPrice,
      sector: asset.sector,
    };
  });
}

export function getPortfolioHistory(): PortfolioSnapshot[] {
  // Use 90 days of portfolio history
  const positions = [
    { ticker: 'NVDA',  shares: 20,  avgCost: 195.00 },
    { ticker: 'AAPL',  shares: 30,  avgCost: 135.00 },
    { ticker: 'MSFT',  shares: 15,  avgCost: 285.00 },
    { ticker: 'JPM',   shares: 25,  avgCost: 130.00 },
    { ticker: 'XOM',   shares: 40,  avgCost: 85.00  },
    { ticker: 'TSLA',  shares: 10,  avgCost: 185.00 },
  ];

  const series: { [ticker: string]: OHLCV[] } = {};
  for (const p of positions) {
    series[p.ticker] = getPriceSeries(p.ticker);
  }

  const minLength = Math.min(...positions.map((p) => series[p.ticker].length));
  const snapshots: PortfolioSnapshot[] = [];

  for (let i = Math.max(0, minLength - 90); i < minLength; i++) {
    const totalValue = positions.reduce((sum, p) => {
      return sum + p.shares * series[p.ticker][i].close;
    }, 0);
    snapshots.push({
      date: series[positions[0].ticker][i].date,
      totalValue: parseFloat(totalValue.toFixed(2)),
    });
  }

  return snapshots;
}

export { ASSETS };
