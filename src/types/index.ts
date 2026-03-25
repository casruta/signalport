// ─── Asset & Price Types ─────────────────────────────────────────────────────

export interface OHLCV {
  date: string;   // ISO date string, e.g. "2024-01-15"
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

export interface Asset {
  ticker: string;
  name: string;
  sector: string;
  exchange: string;
  currency: string;
}

// ─── Signal Types ─────────────────────────────────────────────────────────────

export type SignalDirection = 'BUY' | 'SELL' | 'HOLD';
export type SignalStrength = 'STRONG' | 'MODERATE' | 'WEAK';

export interface Signal {
  id: string;
  ticker: string;
  name: string;
  direction: SignalDirection;
  strength: SignalStrength;
  price: number;
  priceChange: number;       // absolute change from previous close
  priceChangePct: number;    // percent change
  rsi: number;               // 0–100
  macd: number;
  macdSignal: number;
  macdHistogram: number;
  sma50: number;
  sma200: number;
  bollingerUpper: number;
  bollingerMiddle: number;
  bollingerLower: number;
  bollingerPercentB: number; // (price − lower) / (upper − lower), 0=lower band, 1=upper band
  bollingerBandwidth: number; // (upper - lower) / middle
  score: number;             // composite signal score 0–100
  generatedAt: string;       // ISO datetime
  rationale: string;
}

// ─── Portfolio Types ──────────────────────────────────────────────────────────

export interface Position {
  ticker: string;
  name: string;
  shares: number;
  avgCostBasis: number;      // USD per share at purchase
  currentPrice: number;
  sector: string;
}

export interface PortfolioSnapshot {
  date: string;
  totalValue: number;
}

// ─── Indicator Results ────────────────────────────────────────────────────────

export interface RSIResult {
  value: number;             // 0–100
  signal: SignalDirection;
}

export interface MACDResult {
  macd: number;
  signal: number;
  histogram: number;
  crossover: 'bullish' | 'bearish' | 'none';
}

export interface BollingerResult {
  upper: number;
  middle: number;
  lower: number;
  bandwidth: number;         // (upper - lower) / middle
  percentB: number;          // (price - lower) / (upper - lower)
}

export interface MovingAverageResult {
  sma50: number;
  sma200: number;
  goldenCross: boolean;      // sma50 recently crossed above sma200
  deathCross: boolean;       // sma50 recently crossed below sma200
}

// ─── Grading Types ────────────────────────────────────────────────────────────

export interface GradeCategory {
  name: string;
  score: number;             // 0–100
  weight: number;            // 0–1, sum of weights = 1
  notes: string[];
}

export interface AppGrade {
  overall: number;           // 0–100 weighted average
  categories: GradeCategory[];
  readyForProduction: boolean;
  blockers: string[];
  suggestions: string[];
}
