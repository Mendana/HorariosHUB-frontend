'use client';

import React from 'react';
import Link from 'next/link';
import { AlertTriangle } from 'lucide-react';

// ── Default fallback UI ────────────────────────────────────────────────────────

function DefaultFallback({ error }: { error: Error | null }) {
  const isDev = process.env.NODE_ENV === 'development';

  return (
    <div className="flex flex-col items-center justify-center min-h-[400px] px-4 text-center gap-6">
      <AlertTriangle size={48} className="text-warning" aria-hidden />
      <div className="flex flex-col gap-2 max-w-md">
        <h1 className="text-[22px] font-semibold text-primary">Algo salió mal</h1>
        <p className="text-[14px] text-secondary leading-relaxed">
          Ha ocurrido un error inesperado. Puedes intentar recargar la página.
        </p>
      </div>
      <div className="flex gap-3 flex-wrap justify-center">
        <button
          onClick={() => window.location.reload()}
          className="inline-flex items-center justify-center h-9 px-4 text-[14px] font-medium bg-accent text-white rounded-sm btn-transition enabled:hover:brightness-[1.08]"
        >
          Recargar página
        </button>
        <Link
          href="/"
          className="inline-flex items-center justify-center h-9 px-4 text-[14px] font-medium bg-surface-raised border border-strong text-primary rounded-sm btn-transition"
        >
          Volver al inicio
        </Link>
      </div>
      {isDev && error && (
        <details className="w-full max-w-2xl text-left">
          <summary className="text-[12px] text-tertiary cursor-pointer select-none">
            Ver detalles del error
          </summary>
          <pre className="mt-2 p-4 bg-surface-sunken rounded-md text-[12px] font-mono text-tertiary overflow-auto whitespace-pre-wrap break-all">
            {error.message}
            {error.stack ? `\n\n${error.stack}` : ''}
          </pre>
        </details>
      )}
    </div>
  );
}

// ── ErrorBoundary class component ─────────────────────────────────────────────

interface ErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    if (process.env.NODE_ENV === 'development') {
      console.error('[ErrorBoundary]', error, info.componentStack);
    }
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback ?? <DefaultFallback error={this.state.error} />;
    }
    return this.props.children;
  }
}
