import type { CSSProperties } from 'react';

interface SegOption {
  key: string;
  label: string;
  active: boolean;
  onClick: () => void;
}

interface SegToggleProps {
  options: [SegOption, SegOption];
  style?: CSSProperties;
}

// Exclusive 2-way toggle inside the design system's `.seg` wrapper. Ported
// from the home grid-variant toggle (lines 110-113) and the country detail
// variant toggle (242-245) — both hand-roll the active/inactive colors
// rather than using native radios + `.seg-opt`.
export function SegToggle({ options, style }: SegToggleProps) {
  return (
    <div className="seg" style={style}>
      {options.map((opt, i) => (
        <button
          key={opt.key}
          onClick={opt.onClick}
          style={{
            cursor: 'pointer',
            padding: '7px 12px',
            fontSize: 12,
            fontFamily: 'var(--font-heading)',
            border: 0,
            borderLeft: i > 0 ? '1px solid var(--color-divider)' : undefined,
            background: opt.active ? 'var(--color-accent)' : 'transparent',
            color: opt.active ? 'var(--color-bg)' : 'var(--color-text)',
          }}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
}
