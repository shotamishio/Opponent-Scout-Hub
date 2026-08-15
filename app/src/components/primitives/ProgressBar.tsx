import type { CSSProperties } from 'react';

interface ProgressBarProps {
  pct: string; // e.g. '82%'
  height?: number;
  trackColor?: string;
  fillColor?: string;
  style?: CSSProperties;
}

// Ported from the filled-bar pattern used for coach tactical traits (line
// 450, height 4px), video analysis progress (533, height 6px) and source
// adoption scores (629, height 3px).
export function ProgressBar({
  pct,
  height = 4,
  trackColor = 'var(--color-neutral-200)',
  fillColor = 'var(--color-accent)',
  style,
}: ProgressBarProps) {
  return (
    <div style={{ height, background: trackColor, ...style }}>
      <div style={{ height, width: pct, background: fillColor, transition: 'width .4s' }} />
    </div>
  );
}
