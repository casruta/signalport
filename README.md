# SignalPort

**Investment signals dashboard** — data-driven buy/sell/hold signals powered by RSI, MACD, Bollinger Bands, and moving average analysis.

## What It Does

SignalPort scans 12 major assets (S&P 500 components) and generates technical signals for each:

| Page | Purpose |
|------|---------|
| **Dashboard** | At-a-glance overview: portfolio value, signal distribution, top signals |
| **Signals** | Full breakdown per asset: RSI, MACD, Bollinger Bands, SMAs, rationale |
| **Portfolio** | Positions table with P&L, sector allocation, performance chart |
| **Methodology** | Exact formulas used — transparent, auditable |
| **Quality Grade** | Automated scoring of the app's production readiness |

## Signal Model

Each asset receives a composite score (0–100):

| Weight | Indicator | Bullish Signal |
|--------|-----------|---------------|
| 30% | RSI (14) | RSI < 30 (oversold) |
| 30% | MACD (12/26/9) | Histogram > 0 |
| 25% | SMA-50 / SMA-200 | Price above both MAs |
| 15% | Bollinger %B | %B near 0 (near lower band) |

- Score **> 60** → BUY
- Score **40–60** → HOLD
- Score **< 40** → SELL

## Getting Started

```bash
npm install
npm run dev       # http://localhost:3000
npm test          # Run unit + integration tests
npm run type-check  # TypeScript validation
npm run build     # Production build
```

## Architecture

```
src/
├── app/                  # Next.js App Router pages
│   ├── page.tsx          # Dashboard
│   ├── signals/page.tsx  # Signal analysis
│   ├── portfolio/page.tsx
│   ├── methodology/page.tsx
│   └── grade/page.tsx    # App quality grade
├── components/
│   ├── layout/Sidebar.tsx
│   ├── dashboard/        # Chart, top-signals table
│   └── ui/               # Reusable: badges, gauges, stat cards
├── lib/
│   ├── indicators.ts     # Pure math: RSI, MACD, Bollinger, SMA/EMA
│   ├── mockData.ts       # GBM price generation + signal assembly
│   └── grading.ts        # App quality scoring framework
├── types/index.ts        # All TypeScript types
└── __tests__/            # Unit + integration tests
```

## Production Readiness

To deploy with live data:
1. Replace `getPriceSeries()` in `src/lib/mockData.ts` with a real market data API call (Polygon.io, Alpha Vantage, Yahoo Finance).
2. Add authentication (NextAuth.js) for private investor access.
3. Deploy on Vercel — `next.config.js` is already set to `output: 'standalone'`.

## Disclaimer

This platform is for **educational purposes only** and does not constitute financial advice. Signals are generated from simulated price data using deterministic GBM. Past patterns do not guarantee future results.
