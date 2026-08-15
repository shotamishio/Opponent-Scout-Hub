import type { Coach } from '@/lib/coach';
import { BlueprintFrame } from '@/components/primitives/BlueprintFrame';

interface CareerTimelineProps {
  coach: Coach;
}

// Ported from Scout Hub.dc.html lines 457-471.
export function CareerTimeline({ coach }: CareerTimelineProps) {
  return (
    <section className="card blueprint" style={{ padding: 'var(--space-4)', gap: 'var(--space-4)' }}>
      <BlueprintFrame />
      <h4 style={{ margin: 0 }}>経歴</h4>
      <div style={{ display: 'flex', flexDirection: 'column' }}>
        {coach.career.map((c, i) => (
          <div
            key={i}
            style={{
              display: 'grid',
              gridTemplateColumns: '104px 1fr',
              gap: 'var(--space-3)',
              padding: 'var(--space-3) 0',
              borderTop: '1px solid var(--color-divider)',
            }}
          >
            <div style={{ fontFamily: 'var(--font-heading)', fontSize: 14, color: 'var(--color-accent-700)' }}>{c.years}</div>
            <div>
              <div style={{ fontFamily: 'var(--font-heading)', fontSize: 17, lineHeight: 1.2 }}>{c.role}</div>
              <p style={{ margin: '2px 0 0', fontSize: 12.5, lineHeight: 1.6, color: 'color-mix(in srgb,var(--color-text) 72%,transparent)' }}>
                {c.detail}
              </p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
