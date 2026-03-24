'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import clsx from 'clsx';

const NAV_ITEMS = [
  {
    href: '/',
    label: 'Dashboard',
    icon: (
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
        <rect x="1" y="1" width="6" height="6" rx="1" />
        <rect x="9" y="1" width="6" height="6" rx="1" />
        <rect x="1" y="9" width="6" height="6" rx="1" />
        <rect x="9" y="9" width="6" height="6" rx="1" />
      </svg>
    ),
  },
  {
    href: '/signals',
    label: 'Signals',
    icon: (
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M1 12 L4 7 L7 9 L10 4 L13 6 L15 2" strokeLinecap="round" strokeLinejoin="round" />
        <circle cx="15" cy="2" r="1.5" fill="currentColor" stroke="none" />
      </svg>
    ),
  },
  {
    href: '/portfolio',
    label: 'Portfolio',
    icon: (
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
        <circle cx="8" cy="8" r="6.5" />
        <path d="M8 1.5 A6.5 6.5 0 0 1 14.5 8 L8 8 Z" fill="currentColor" stroke="none" opacity="0.4" />
        <path d="M8 1.5 L8 8" />
        <path d="M8 8 L14.5 8" />
      </svg>
    ),
  },
  {
    href: '/methodology',
    label: 'Methodology',
    icon: (
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M2 4h12M2 8h8M2 12h5" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    href: '/grade',
    label: 'Quality Grade',
    icon: (
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M8 1.5 L10 6 L15 6.5 L11.5 10 L12.5 15 L8 12.5 L3.5 15 L4.5 10 L1 6.5 L6 6 Z" />
      </svg>
    ),
  },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside
      className="fixed left-0 top-0 h-screen w-60 flex flex-col border-r z-10"
      style={{ background: 'var(--bg-secondary)', borderColor: 'var(--border)' }}
    >
      {/* Logo */}
      <div className="flex items-center gap-2.5 px-5 py-5 border-b" style={{ borderColor: 'var(--border)' }}>
        <div className="w-7 h-7 rounded-lg bg-brand-600 flex items-center justify-center flex-shrink-0">
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <path
              d="M2 10 L5 6 L8 8 L11 3 L13 5"
              stroke="white"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>
        <div>
          <div className="text-sm font-semibold text-white">SignalPort</div>
          <div className="text-xs" style={{ color: 'var(--text-muted)' }}>Investment Signals</div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-0.5">
        {NAV_ITEMS.map(({ href, label, icon }) => {
          const isActive = href === '/' ? pathname === '/' : pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              className={clsx(
                'nav-link',
                isActive && 'active',
              )}
            >
              <span className="flex-shrink-0">{icon}</span>
              {label}
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="px-5 py-4 border-t" style={{ borderColor: 'var(--border)' }}>
        <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
          Signals for educational purposes only. Not financial advice.
        </p>
      </div>
    </aside>
  );
}
