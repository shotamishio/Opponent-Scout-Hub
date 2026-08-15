import type { Coach } from '@/lib/coach';
import { BlueprintFrame } from '@/components/primitives/BlueprintFrame';
import { TierBadge } from '@/components/primitives/TierBadge';

interface ReputationListProps {
  coach: Coach;
}

// Ported from Scout Hub.dc.html lines 487-502.
export function ReputationList({ coach }: ReputationListProps) {
  return (
    <section className="card blueprint" style={{ padding: 'var(--space-4)', gap: 'var(--space-3)' }}>
      <BlueprintFrame />
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 'var(--space-3)' }}>
        <h4 style={{ margin: 0 }}>評判</h4>
        <span style={{ fontSize: 11, color: 'color-mix(in srgb,var(--color-text) 50%,transparent)' }}>
          ティア別に出典を明示。個人記者・ファン情報は参考値として扱ってください。
        </span>
      </div>
      {coach.reputation.map((r, i) => (
        <blockquote
          key={i}
          style={{ margin: 0, borderLeft: `2px solid ${r.accent}`, paddingLeft: 'var(--space-3)', display: 'flex', flexDirection: 'column', gap: 4 }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
            <TierBadge tier={r.tier} />
            <span style={{ fontSize: 11, color: 'color-mix(in srgb,var(--color-text) 55%,transparent)' }}>{r.src}</span>
          </div>
          <p style={{ margin: 0, fontSize: 12.5, lineHeight: 1.6 }}>{r.text}</p>
        </blockquote>
      ))}
    </section>
  );
}
