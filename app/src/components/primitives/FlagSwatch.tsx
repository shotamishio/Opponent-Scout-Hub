import type { CSSProperties } from 'react';

interface FlagSwatchProps {
  src: string;
  en: string;
  width: number | string;
  height: number | string;
  style?: CSSProperties;
}

// Rendered as a CSS background (not <img>) so no request fires — and no
// broken-image flicker shows — before the country code resolves. Ported
// from the flag treatment settled on in the design chat (6 call sites: home
// even-grid 44×30, lanes/compact rows 24×16, country header 132×88, feed
// chips 18×12, add-dialog rows 22×15, Asia-20 grid 24×16).
export function FlagSwatch({ src, en, width, height, style }: FlagSwatchProps) {
  return (
    <span
      role="img"
      aria-label={en}
      style={{
        display: 'block',
        flex: 'none',
        width,
        height,
        border: '1px solid var(--color-divider)',
        // The url() value MUST be quoted: in the production build, small
        // SVGs get inlined as data URIs by Vite, and flag SVGs' path/
        // transform data (e.g. matrix(...)) contains unescaped parentheses
        // — unquoted inside url(...) that truncates the CSS value early and
        // the browser silently drops the whole background declaration.
        background: `var(--color-accent-100) center/cover no-repeat url("${src}")`,
        ...style,
      }}
    />
  );
}
