'use client';

import { AlertTriangle } from 'lucide-react';

// global-error.tsx replaces the entire root layout, so providers (including
// next-intl) are not available. Text is hardcoded in Spanish (app default).
// CSS tokens are inlined since globals.css is not loaded in this context.

interface GlobalErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

const INLINE_STYLES = `
  :root {
    --surface-base:   oklch(99% 0.004 75);
    --surface-raised: oklch(97% 0.004 75);
    --surface-sunken: oklch(94% 0.005 75);
    --border-strong:  oklch(70% 0.005 75);
    --text-primary:   oklch(20% 0.006 75);
    --text-secondary: oklch(50% 0.006 75);
    --text-tertiary:  oklch(56% 0.005 75);
    --accent:         oklch(52% 0.23 278);
    --warning:        oklch(72% 0.18 70);
  }
  @media (prefers-color-scheme: dark) {
    :root {
      --surface-base:   oklch(14% 0.010 250);
      --surface-raised: oklch(19% 0.010 250);
      --surface-sunken: oklch(10% 0.008 250);
      --border-strong:  oklch(55% 0.010 250);
      --text-primary:   oklch(92% 0.006 250);
      --text-secondary: oklch(65% 0.008 250);
      --text-tertiary:  oklch(60% 0.010 250);
      --accent:         oklch(52% 0.23 278);
      --warning:        oklch(76% 0.18 70);
    }
  }
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  html, body { height: 100%; }
  body {
    min-height: 100vh;
    display: flex;
    align-items: center;
    justify-content: center;
    background-color: var(--surface-base);
    color: var(--text-primary);
    font-family: system-ui, -apple-system, sans-serif;
    padding: 24px;
    font-variant-numeric: tabular-nums;
  }
  .ge-wrap  { display:flex; flex-direction:column; align-items:center; gap:24px; text-align:center; max-width:600px; width:100%; }
  .ge-icon  { color: var(--warning); }
  .ge-text  { display:flex; flex-direction:column; gap:8px; max-width:440px; }
  .ge-title { font-size:22px; font-weight:600; line-height:1.3; }
  .ge-sub   { font-size:14px; color:var(--text-secondary); line-height:1.6; }
  .ge-btns  { display:flex; gap:12px; flex-wrap:wrap; justify-content:center; }
  .ge-primary {
    display:inline-flex; align-items:center; justify-content:center;
    height:36px; padding:0 16px; font-size:14px; font-weight:500;
    background-color:var(--accent); color:#fff;
    border:none; border-radius:4px; cursor:pointer;
  }
  .ge-secondary {
    display:inline-flex; align-items:center; justify-content:center;
    height:36px; padding:0 16px; font-size:14px; font-weight:500;
    background-color:var(--surface-raised); color:var(--text-primary);
    border:1px solid var(--border-strong); border-radius:4px; cursor:pointer;
  }
  details { width:100%; max-width:640px; text-align:left; }
  summary { font-size:12px; color:var(--text-tertiary); cursor:pointer; }
  pre {
    margin-top:8px; padding:16px; background-color:var(--surface-sunken);
    border-radius:8px; font-size:12px; font-family:monospace;
    color:var(--text-tertiary); overflow:auto; white-space:pre-wrap; word-break:break-all;
  }
`;

export default function GlobalError({ error, reset }: GlobalErrorProps) {
  const isDev = process.env.NODE_ENV === 'development';

  return (
    <html lang="es">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <style dangerouslySetInnerHTML={{ __html: INLINE_STYLES }} />
      </head>
      <body>
        <div className="ge-wrap">
          <AlertTriangle size={48} className="ge-icon" aria-hidden />
          <div className="ge-text">
            <h1 className="ge-title">Algo salió mal</h1>
            <p className="ge-sub">
              Ha ocurrido un error inesperado. Puedes intentar recargar la página.
            </p>
          </div>
          <div className="ge-btns">
            <button className="ge-primary" onClick={reset}>
              Reintentar
            </button>
            <button
              className="ge-secondary"
              onClick={() => { window.location.href = '/'; }}
            >
              Volver al inicio
            </button>
          </div>
          {isDev && (
            <details>
              <summary>Ver detalles del error</summary>
              <pre>
                {error.message}
                {error.stack ? `\n\n${error.stack}` : ''}
              </pre>
            </details>
          )}
        </div>
      </body>
    </html>
  );
}
