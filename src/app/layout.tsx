import type { Metadata } from 'next';
import './globals.css';
import { Sidebar } from '@/components/layout/Sidebar';

export const metadata: Metadata = {
  title: 'SignalPort — Investment Signals Dashboard',
  description:
    'Data-driven investment signals powered by RSI, MACD, Bollinger Bands, and moving average analysis.',
  keywords: ['investment signals', 'stock analysis', 'technical analysis', 'portfolio tracker'],
  openGraph: {
    title: 'SignalPort',
    description: 'Data-driven investment signals for serious investors.',
    type: 'website',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="flex min-h-screen" style={{ background: 'var(--bg-primary)' }}>
        <Sidebar />
        <main className="flex-1 ml-60 min-h-screen flex flex-col">
          <div className="flex-1 p-6 lg:p-8">
            {children}
          </div>
        </main>
      </body>
    </html>
  );
}
