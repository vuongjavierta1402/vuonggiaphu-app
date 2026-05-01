import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import ErrorBoundary from './components/ErrorBoundary';
import theme from './config/theme';

// ── Inject theme as CSS custom properties on <html> ──────────────────
// Edit src/config/theme.js to change colors across the entire app.
const root = document.documentElement;
const cssVars = {
  '--color-primary':       theme.primary,
  '--color-primary-dark':  theme.primaryDark,
  '--color-primary-hover': theme.primaryHover,
  '--color-primary-light': theme.primaryLight,
  '--color-secondary':     theme.secondary,
  '--color-accent':        theme.accent,
  '--color-text-dark':     theme.textDark,
  '--color-text-muted':    theme.textMuted,
  '--color-bg-light':      theme.bgLight,
};
Object.entries(cssVars).forEach(([k, v]) => root.style.setProperty(k, v));

// ── Render ────────────────────────────────────────────────────────────
ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </React.StrictMode>
);
