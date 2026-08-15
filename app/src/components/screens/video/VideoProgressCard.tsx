import { useAppState } from '@/state/AppContext';
import { VIDEO_STEP_LABELS } from '@/data/video';
import { BlueprintFrame } from '@/components/primitives/BlueprintFrame';

// Ported from Scout Hub.dc.html lines 529-542.
export function VideoProgressCard() {
  const state = useAppState();
  const pct = `${(state.videoStep + 1) * 25}%`;
  const steps = VIDEO_STEP_LABELS.map((label, i) => ({
    label,
    color: i <= state.videoStep ? 'var(--color-text)' : 'color-mix(in srgb, var(--color-text) 40%, transparent)',
    fill: i <= state.videoStep ? 'var(--color-accent)' : 'transparent',
  }));

  return (
    <div className="card blueprint" style={{ padding: 'var(--space-6)', gap: 'var(--space-4)' }}>
      <BlueprintFrame />
      <div style={{ fontFamily: 'var(--font-heading)', fontSize: 22 }}>解析中 — {VIDEO_STEP_LABELS[state.videoStep]}</div>
      <div style={{ height: 6, background: 'var(--color-neutral-200)' }}>
        <div style={{ height: 6, width: pct, background: 'var(--color-accent)', transition: 'width .4s' }} />
      </div>
      <div style={{ display: 'flex', gap: 'var(--space-6)', flexWrap: 'wrap' }}>
        {steps.map((s, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12.5, color: s.color }}>
            <span style={{ width: 10, height: 10, border: '1px solid var(--color-accent)', background: s.fill, display: 'block' }} />
            {s.label}
          </div>
        ))}
      </div>
    </div>
  );
}
