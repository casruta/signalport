'use client';

import { Component, ReactNode } from 'react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  message: string;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, message: '' };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, message: error.message };
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback ?? (
        <div className="card flex items-center gap-3 border border-red-800/40 bg-red-950/20">
          <span className="text-red-400 text-lg flex-shrink-0">⚠</span>
          <div>
            <p className="text-sm font-medium text-red-300">Component failed to render</p>
            <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>{this.state.message}</p>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}
