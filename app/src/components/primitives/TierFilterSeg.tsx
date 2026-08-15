import { TIER_KEYS, TIERS } from '@/data/tiers';
import type { TierKey } from '@/types';

interface TierFilterSegProps {
  active: TierKey[];
  onToggle: (tier: TierKey) => void;
}

// Header's independent multi-toggle tier filter (lines 85-89) — distinct
// selection semantics from SegToggle (each button toggles on its own,
// nothing is mutually exclusive), so kept as its own component even though
// it shares the `.seg` wrapper markup.
export function TierFilterSeg({ active, onToggle }: TierFilterSegProps) {
  return (
    <div className="seg" style={{ flex: 'none' }}>
      {TIER_KEYS.map((k) => {
        const isActive = active.includes(k);
        return (
          <button
            key={k}
            onClick={() => onToggle(k)}
            title={TIERS[k].label}
            style={{
              cursor: 'pointer',
              padding: '7px 11px',
              fontSize: 12,
              fontFamily: 'var(--font-heading)',
              border: 0,
              borderLeft: '1px solid var(--color-divider)',
              background: isActive ? 'var(--color-accent)' : 'transparent',
              color: isActive ? 'var(--color-bg)' : 'color-mix(in srgb, var(--color-text) 55%, transparent)',
            }}
          >
            {k}
          </button>
        );
      })}
    </div>
  );
}
