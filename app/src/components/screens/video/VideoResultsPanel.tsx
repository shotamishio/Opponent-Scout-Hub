import { useAppDispatch, useAppState } from '@/state/AppContext';
import { VIDEO_META, VIDEO_POINTS, VIDEO_TAGS, VIDEO_PEOPLE_BASE } from '@/data/video';
import { BlueprintFrame } from '@/components/primitives/BlueprintFrame';

interface VideoResultsPanelProps {
  coachName: string | null;
  countryJa: string;
}

// Ported from Scout Hub.dc.html lines 546-579. The last "person" in the
// source is dynamic (the country's head coach, role '監督') — appended here
// rather than baked into the static VIDEO_PEOPLE_BASE table, and omitted
// entirely when the coach isn't known rather than shown as a blank name.
export function VideoResultsPanel({ coachName, countryJa }: VideoResultsPanelProps) {
  const state = useAppState();
  const dispatch = useAppDispatch();
  const people = coachName ? [...VIDEO_PEOPLE_BASE, { name: coachName, role: '監督' }] : VIDEO_PEOPLE_BASE;
  const saveLabel = state.saved ? '保存しました（国別メモ）' : `要約を${countryJa}のメモに保存`;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>
      <section className="card blueprint" style={{ padding: 'var(--space-4)', gap: 'var(--space-3)' }}>
        <BlueprintFrame />
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 'var(--space-3)' }}>
          <h4 style={{ margin: 0 }}>要点</h4>
          <span style={{ fontSize: 11, color: 'color-mix(in srgb,var(--color-text) 50%,transparent)' }}>{VIDEO_META}</span>
        </div>
        <ol style={{ margin: 0, paddingLeft: '1.25em', display: 'flex', flexDirection: 'column', gap: 'var(--space-2)', fontSize: 13, lineHeight: 1.65 }}>
          {VIDEO_POINTS.map((p, i) => (
            <li key={i}>
              {p.text}{' '}
              <a href="#" onClick={(e) => e.preventDefault()} style={{ fontFamily: 'var(--font-heading)', fontSize: 12 }}>
                [{p.at}]
              </a>
            </li>
          ))}
        </ol>
      </section>

      <section className="card blueprint" style={{ padding: 'var(--space-4)', gap: 'var(--space-3)' }}>
        <BlueprintFrame />
        <h4 style={{ margin: 0 }}>戦術タグ</h4>
        <div style={{ display: 'flex', gap: 'var(--space-2)', flexWrap: 'wrap' }}>
          {VIDEO_TAGS.map((t, i) => (
            <span key={i} className="tag tag-accent" style={{ fontFamily: 'var(--font-heading)', fontSize: 12 }}>
              {t.label} <span style={{ opacity: 0.6, marginLeft: 5 }}>{t.count}</span>
            </span>
          ))}
        </div>
        <div style={{ height: 1, background: 'var(--color-divider)', margin: 'var(--space-2) 0' }} />
        <h4 style={{ margin: 0 }}>抽出された選手・人物</h4>
        <div style={{ display: 'flex', gap: 'var(--space-2)', flexWrap: 'wrap' }}>
          {people.map((p, i) => (
            <a
              key={i}
              href="#"
              onClick={(e) => e.preventDefault()}
              className="tag tag-outline"
              style={{ fontFamily: 'var(--font-heading)', fontSize: 12, textDecoration: 'none' }}
            >
              {p.name} · {p.role}
            </a>
          ))}
        </div>
        <button
          className="btn btn-primary blueprint"
          onClick={() => dispatch({ type: 'SAVE_MEMO' })}
          style={{ position: 'relative', alignSelf: 'flex-start', marginTop: 'var(--space-2)' }}
        >
          <BlueprintFrame />
          {saveLabel}
        </button>
      </section>
    </div>
  );
}
