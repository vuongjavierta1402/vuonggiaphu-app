/**
 * Brand color palette — edit this file to restyle the entire app.
 *
 * These values are injected as CSS custom properties on <html> in src/index.js,
 * so every component that uses var(--color-*) will update automatically.
 */
const theme = {
  /** Main brand color — buttons, links, active nav, highlights */
  primary:      '#c0392b',
  /** Darker variant — gradient ends, deep accents */
  primaryDark:  '#8e1010',
  /** Hover state on primary buttons */
  primaryHover: '#a93226',
  /** Very light tint — card hover bg, selected row */
  primaryLight: '#fff5f5',
  /** Dark tone — footer background, strong headings */
  secondary:    '#2c3e50',
  /** Accent — discount badges, sale alerts */
  accent:       '#f39c12',
  /** Default body text */
  textDark:     '#212529',
  /** Muted / secondary text */
  textMuted:    '#6c757d',
  /** Page / section light background */
  bgLight:      '#f8f9fa',
};

export default theme;
