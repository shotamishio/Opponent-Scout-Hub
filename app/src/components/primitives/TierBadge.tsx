import type { CSSProperties } from 'react';
import { TIERS } from '@/data/tiers';
import type { TierKey } from '@/types';

interface TierBadgeProps {
  tier: TierKey;
  fontSize?: number;
  padding?: string;
  style?: CSSProperties;
}

// Ported from the tier chip markup repeated across notes (line 319), tier
// columns (368), source columns (614), collection log (647), feed (671) and
// coach reputation (496).
export function TierBadge({ tier, fontSize = 11, padding = '2px 6px', style }: TierBadgeProps) {
  const t = TIERS[tier];
  return (
    <span
      style={{
        fontFamily: 'var(--font-heading)',
        letterSpacing: '.06em',
        fontSize,
        padding,
        background: t.bg,
        color: t.fg,
        border: `1px solid ${t.bd}`,
        ...style,
      }}
    >
      {tier}
    </span>
  );
}
