import { VIDEO_TRANSCRIPT } from '@/data/video';
import { BlueprintFrame } from '@/components/primitives/BlueprintFrame';

// Ported from Scout Hub.dc.html lines 582-599.
export function TranscriptPanel() {
  return (
    <section className="card blueprint" style={{ padding: 'var(--space-4)', gap: 'var(--space-3)' }}>
      <BlueprintFrame />
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 'var(--space-3)' }}>
        <h4 style={{ margin: 0 }}>文字起こし（日本語訳）</h4>
        <span style={{ marginLeft: 'auto', fontSize: 11, color: 'color-mix(in srgb,var(--color-text) 50%,transparent)' }}>
          原語: Spanish · 自動翻訳
        </span>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 1, background: 'var(--color-divider)', maxHeight: 520, overflow: 'auto' }}>
        {VIDEO_TRANSCRIPT.map((l, i) => (
          <div
            key={i}
            style={{ background: 'var(--color-bg)', display: 'grid', gridTemplateColumns: '64px 1fr', gap: 'var(--space-3)', padding: 'var(--space-3) var(--space-2)' }}
          >
            <span style={{ fontFamily: 'var(--font-heading)', fontSize: 13, color: 'var(--color-accent-700)' }}>{l.at}</span>
            <div>
              <div style={{ fontSize: 10, letterSpacing: '.08em', textTransform: 'uppercase', color: 'color-mix(in srgb,var(--color-text) 50%,transparent)' }}>
                {l.who}
              </div>
              <p style={{ margin: 0, fontSize: 12.5, lineHeight: 1.6 }}>{l.text}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
