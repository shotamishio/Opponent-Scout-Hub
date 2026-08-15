import type { CountryData } from '@/lib/countryData';
import { useAppDispatch } from '@/state/AppContext';
import { BlueprintFrame } from '@/components/primitives/BlueprintFrame';

interface CoachTeaserCardProps {
  cur: CountryData;
}

// Ported from Scout Hub.dc.html lines 329-341.
export function CoachTeaserCard({ cur }: CoachTeaserCardProps) {
  const dispatch = useAppDispatch();
  return (
    <section
      className="card blueprint osh-card-hover"
      onClick={() => dispatch({ type: 'GO_SCREEN', screen: 'coach' })}
      style={{ padding: 'var(--space-4)', gap: 'var(--space-3)', cursor: 'pointer' }}
    >
      <BlueprintFrame />
      <h4 style={{ margin: 0 }}>監督</h4>
      <div style={{ display: 'flex', gap: 'var(--space-3)', alignItems: 'center' }}>
        <div
          className="duotone"
          style={{
            width: 52,
            height: 52,
            border: '1px solid var(--color-divider)',
            background: 'var(--color-accent-200)',
            display: 'grid',
            placeItems: 'center',
            fontFamily: 'var(--font-heading)',
            fontSize: 18,
            color: 'var(--color-accent-800)',
          }}
        >
          {cur.coach.initials}
        </div>
        <div>
          <div style={{ fontFamily: 'var(--font-heading)', fontSize: 20, lineHeight: 1.1 }}>{cur.coach.name}</div>
          <div style={{ fontSize: 11, color: 'color-mix(in srgb,var(--color-text) 55%,transparent)' }}>
            {cur.coach.nat} · 就任 {cur.coach.since} · 通算 {cur.coach.record}
          </div>
        </div>
      </div>
      <p style={{ margin: 0, fontSize: 12.5, lineHeight: 1.6, color: 'color-mix(in srgb,var(--color-text) 75%,transparent)' }}>
        {cur.coach.brief}
      </p>
      <span style={{ fontSize: 12, color: 'var(--color-accent-700)', fontFamily: 'var(--font-heading)' }}>
        実績・経歴・評判を見る →
      </span>
    </section>
  );
}
