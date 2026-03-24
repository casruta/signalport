import { PageHeader } from '@/components/ui/PageHeader';

function FormulaBlock({ children }: { children: React.ReactNode }) {
  return (
    <pre className="text-sm font-mono p-4 rounded-lg overflow-x-auto my-4 leading-relaxed" style={{ background: '#0d1117', color: '#e2e8f0', border: '1px solid var(--border)' }}>
      {children}
    </pre>
  );
}

function SectionHeading({ children }: { children: React.ReactNode }) {
  return <h2 className="text-lg font-semibold text-white mt-8 mb-3">{children}</h2>;
}

function SubHeading({ children }: { children: React.ReactNode }) {
  return <h3 className="text-base font-semibold mb-2 mt-5" style={{ color: 'var(--text-primary)' }}>{children}</h3>;
}

function P({ children }: { children: React.ReactNode }) {
  return <p className="text-sm leading-relaxed mb-3" style={{ color: 'var(--text-secondary)' }}>{children}</p>;
}

export default function MethodologyPage() {
  return (
    <div className="max-w-3xl mx-auto space-y-2">
      <PageHeader
        title="Methodology"
        subtitle="How SignalPort calculates and scores investment signals"
      />

      {/* ── Introduction ───────────────────────────────────────────────── */}
      <div className="card">
        <SectionHeading>Overview</SectionHeading>
        <P>
          SignalPort combines four well-established technical indicators into a single composite score
          for each tracked asset. Each indicator is calculated using its standard financial definition,
          then weighted and normalized to produce a 0–100 score where:
        </P>
        <ul className="list-disc list-inside text-sm space-y-1 mb-4" style={{ color: 'var(--text-secondary)' }}>
          <li><strong className="text-white">Score &gt; 52</strong> → <span className="text-emerald-400">BUY</span> signal</li>
          <li><strong className="text-white">Score 42–52</strong> → <span className="text-amber-400">HOLD</span> signal</li>
          <li><strong className="text-white">Score &lt; 42</strong> → <span className="text-red-400">SELL</span> signal</li>
        </ul>
        <P>
          RSI and Bollinger %B receive higher combined weight (55%) so that an oversold condition
          can independently trigger a BUY signal even when trend indicators (MACD, SMAs) are still
          declining — supporting mean-reversion entries at the end of corrections.
        </P>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4">
          {[
            { label: 'RSI', weight: '40%' },
            { label: 'MACD', weight: '25%' },
            { label: 'Moving Avgs', weight: '20%' },
            { label: 'Bollinger %B', weight: '15%' },
          ].map(({ label, weight }) => (
            <div key={label} className="text-center p-3 rounded-lg" style={{ background: 'var(--bg-secondary)' }}>
              <p className="text-xs font-medium mb-1" style={{ color: 'var(--text-muted)' }}>{label}</p>
              <p className="text-lg font-bold text-brand-400">{weight}</p>
            </div>
          ))}
        </div>
      </div>

      {/* ── RSI ────────────────────────────────────────────────────────── */}
      <div className="card">
        <SectionHeading>RSI — Relative Strength Index</SectionHeading>
        <P>
          The RSI is a momentum oscillator developed by J. Welles Wilder (1978). It measures the speed
          and magnitude of recent price changes to evaluate overbought or oversold conditions on a scale
          of 0–100.
        </P>
        <SubHeading>Formula (Wilder Smoothed, 14-period)</SubHeading>
        <FormulaBlock>{`RS  = Avg Gain (14) / Avg Loss (14)
RSI = 100 − (100 / (1 + RS))

First avg = simple mean of first 14 gains/losses
Subsequent: SMMA_n = (SMMA_{n-1} × 13 + value) / 14`}</FormulaBlock>
        <SubHeading>Signal Interpretation</SubHeading>
        <ul className="list-disc list-inside text-sm space-y-1" style={{ color: 'var(--text-secondary)' }}>
          <li><strong className="text-emerald-400">RSI &lt; 30</strong> — Oversold; potential reversal to the upside.</li>
          <li><strong className="text-amber-400">RSI 30–70</strong> — Neutral momentum; no directional bias.</li>
          <li><strong className="text-red-400">RSI &gt; 70</strong> — Overbought; potential reversal to the downside.</li>
        </ul>
        <SubHeading>Sub-score Mapping</SubHeading>
        <P>
          RSI sub-score = 100 − RSI value. This maps an oversold RSI (low number) to a high (bullish) score
          and an overbought RSI to a low (bearish) score. The sub-score is clamped to [0, 100].
        </P>
      </div>

      {/* ── MACD ───────────────────────────────────────────────────────── */}
      <div className="card">
        <SectionHeading>MACD — Moving Average Convergence Divergence</SectionHeading>
        <P>
          Developed by Gerald Appel in the late 1970s, MACD tracks the relationship between two
          exponential moving averages (EMAs). The histogram shows the difference between the MACD
          line and the signal line — its sign indicates bullish or bearish momentum.
        </P>
        <SubHeading>Formula</SubHeading>
        <FormulaBlock>{`MACD Line   = EMA(12) − EMA(26)
Signal Line = EMA(9) of MACD Line
Histogram   = MACD Line − Signal Line

EMA(n) seeded with SMA(n), then:
  EMA_t = Price_t × k + EMA_{t-1} × (1 − k)
  where k = 2 / (n + 1)`}</FormulaBlock>
        <SubHeading>Signal Interpretation</SubHeading>
        <ul className="list-disc list-inside text-sm space-y-1" style={{ color: 'var(--text-secondary)' }}>
          <li><strong className="text-emerald-400">Histogram &gt; 0</strong> — Bullish momentum; MACD above signal line.</li>
          <li><strong className="text-red-400">Histogram &lt; 0</strong> — Bearish momentum; MACD below signal line.</li>
          <li><strong className="text-white">Zero-line crossover</strong> — MACD crossing above/below zero signals trend change.</li>
        </ul>
      </div>

      {/* ── Moving Averages ────────────────────────────────────────────── */}
      <div className="card">
        <SectionHeading>Simple Moving Averages (SMA-50 / SMA-200)</SectionHeading>
        <P>
          Moving averages smooth out price data to identify trend direction. The 50-day and 200-day
          SMAs are among the most widely watched indicators by institutional investors.
        </P>
        <SubHeading>Formula</SubHeading>
        <FormulaBlock>{`SMA(n) = (P_1 + P_2 + ... + P_n) / n

where P_i are the most recent n closing prices`}</FormulaBlock>
        <SubHeading>Golden Cross & Death Cross</SubHeading>
        <ul className="list-disc list-inside text-sm space-y-1" style={{ color: 'var(--text-secondary)' }}>
          <li>
            <strong className="text-emerald-400">Golden Cross</strong> — SMA-50 crosses above SMA-200:
            historically a long-term bullish signal.
          </li>
          <li>
            <strong className="text-red-400">Death Cross</strong> — SMA-50 crosses below SMA-200:
            historically a long-term bearish signal.
          </li>
        </ul>
        <SubHeading>Sub-score Mapping</SubHeading>
        <P>
          25 points awarded if price is above SMA-50, another 25 if above SMA-200.
          Total SMA sub-score is 0, 25, or 50.
        </P>
      </div>

      {/* ── Bollinger Bands ─────────────────────────────────────────────── */}
      <div className="card">
        <SectionHeading>Bollinger Bands</SectionHeading>
        <P>
          Developed by John Bollinger in the 1980s, Bollinger Bands use standard deviation to adapt
          to market volatility. The %B indicator shows where the current price is relative to the bands.
        </P>
        <SubHeading>Formula</SubHeading>
        <FormulaBlock>{`Middle Band = SMA(20)
Upper Band  = SMA(20) + 2σ
Lower Band  = SMA(20) − 2σ

σ = population std dev of last 20 closes

%B = (Price − Lower) / (Upper − Lower)
  %B = 1.0 → price at upper band
  %B = 0.5 → price at middle band
  %B = 0.0 → price at lower band`}</FormulaBlock>
        <SubHeading>Sub-score Mapping</SubHeading>
        <P>
          Bollinger sub-score = (1 − %B) × 100. A low %B (price near lower band) scores high
          (oversold, potentially bullish). A high %B (price near upper band) scores low
          (overbought, potentially bearish).
        </P>
        <SubHeading>Bandwidth (Volatility Indicator)</SubHeading>
        <FormulaBlock>{`Bandwidth = (Upper − Lower) / Middle`}</FormulaBlock>
        <P>
          Bandwidth measures the width of the bands relative to the middle band. A very low bandwidth
          ({"<"}8%) indicates a <strong className="text-amber-300">Bollinger Squeeze</strong> — a
          period of unusually low volatility that often precedes a significant price breakout in either
          direction. Traders use squeezes as a signal to watch for an imminent move.
        </P>
      </div>

      {/* ── Data Source ─────────────────────────────────────────────────── */}
      <div className="card">
        <SectionHeading>Data Source & Limitations</SectionHeading>
        <P>
          The current version uses <strong className="text-white">simulated price data</strong> generated
          using a Geometric Brownian Motion (GBM) model — the same stochastic process underlying the
          Black-Scholes option pricing framework.
        </P>
        <FormulaBlock>{`GBM step: P_{t+1} = P_t × exp((μ − σ²/2)Δt + σ√Δt × Z)

  μ   = annualised drift (asset-specific)
  σ   = annualised volatility (asset-specific)
  Δt  = 1/252 (one trading day)
  Z   ~ N(0,1) via Box-Muller transform`}</FormulaBlock>
        <P>
          Each asset uses a seeded random number generator (Mulberry32), making all price series
          fully deterministic and reproducible.
        </P>
        <div className="mt-4 p-3 rounded-lg border border-amber-800/40 bg-amber-950/20">
          <p className="text-sm text-amber-200/70">
            <strong className="text-amber-300">Production upgrade path:</strong> Replace{' '}
            <code className="font-mono text-xs bg-black/30 px-1 rounded">getPriceSeries()</code> in{' '}
            <code className="font-mono text-xs bg-black/30 px-1 rounded">src/lib/mockData.ts</code> with a
            call to a real market data API (Yahoo Finance, Polygon.io, Alpha Vantage) to operate with
            live data.
          </p>
        </div>
      </div>

      {/* ── Disclaimer ────────────────────────────────────────────────── */}
      <div className="card border border-red-900/40" style={{ background: '#1a1010' }}>
        <h2 className="text-sm font-semibold text-red-400 mb-2">Legal Disclaimer</h2>
        <p className="text-xs leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
          SignalPort is provided for <strong className="text-white">educational and informational purposes only</strong>.
          It does not constitute financial advice, investment advice, trading advice, or any other advice.
          The signals and scores generated by this platform are based on technical indicators applied to
          simulated data. Past performance of technical patterns is not indicative of future results.
          Users should conduct their own research and consult a qualified financial advisor before making
          any investment decisions. The authors accept no liability for any financial losses incurred.
        </p>
      </div>
    </div>
  );
}
