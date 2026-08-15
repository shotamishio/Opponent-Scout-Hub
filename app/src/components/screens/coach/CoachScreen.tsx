import { useAppDispatch, useAppState } from '@/state/AppContext';
import { countryData } from '@/lib/countryData';
import { BlueprintFrame } from '@/components/primitives/BlueprintFrame';
import { Tag } from '@/components/primitives/Tag';
import { ProgressBar } from '@/components/primitives/ProgressBar';
import { CareerTimeline } from './CareerTimeline';
import { HonoursTable } from './HonoursTable';
import { ReputationList } from './ReputationList';

// Ported from Scout Hub.dc.html lines 425-506.
export function CoachScreen() {
  const state = useAppState();
  const dispatch = useAppDispatch();
  const cur = countryData(state.code);
  const coach = cur.coach;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>
      <div style={{ display: 'flex', gap: 'var(--space-6)', alignItems: 'flex-start', flexWrap: 'wrap' }}>
        <div
          className="blueprint duotone"
          style={{ width: 150, height: 190, background: 'var(--color-accent-200)', display: 'grid', placeItems: 'center' }}
        >
          <BlueprintFrame />
          <span style={{ fontFamily: 'var(--font-heading)', fontSize: 44, color: 'var(--color-accent-800)' }}>{coach.initials}</span>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)', maxWidth: '60ch' }}>
          <div
            style={{
              fontSize: 11,
              letterSpacing: '.12em',
              textTransform: 'uppercase',
              color: 'color-mix(in srgb,var(--color-text) 55%,transparent)',
            }}
          >
            {cur.ja} / {cur.en} — head coach
          </div>
          <div style={{ fontFamily: 'var(--font-heading)', fontSize: 44, lineHeight: 1 }}>{coach.name}</div>
          <div style={{ display: 'flex', gap: 'var(--space-2)', flexWrap: 'wrap' }}>
            <Tag variant="accent">{coach.nat}</Tag>
            <Tag variant="neutral">就任 {coach.since}</Tag>
            <Tag variant="neutral">通算 {coach.record}</Tag>
            <Tag variant="outline">勝率 {coach.winRate}</Tag>
          </div>
          <p style={{ margin: 'var(--space-2) 0 0', fontSize: 13.5, lineHeight: 1.65, color: 'color-mix(in srgb,var(--color-text) 78%,transparent)' }}>
            {coach.brief}
          </p>
          <button
            className="btn btn-secondary"
            onClick={() => dispatch({ type: 'GO_SCREEN', screen: 'country' })}
            style={{ alignSelf: 'flex-start', marginTop: 'var(--space-2)' }}
          >
            ← 国別詳細へ戻る
          </button>
        </div>
        <div className="card blueprint" style={{ marginLeft: 'auto', padding: 'var(--space-4)', minWidth: 230, gap: 'var(--space-3)' }}>
          <BlueprintFrame />
          <div
            style={{
              fontSize: 10,
              letterSpacing: '.1em',
              textTransform: 'uppercase',
              color: 'color-mix(in srgb,var(--color-text) 50%,transparent)',
            }}
          >
            戦術的な傾向
          </div>
          {coach.traits.map((t, i) => (
            <div key={i} style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12 }}>
                <span>{t.label}</span>
                <span style={{ fontFamily: 'var(--font-heading)' }}>{t.value}</span>
              </div>
              <ProgressBar pct={t.pct} />
            </div>
          ))}
        </div>
      </div>

      <div
        className="blueprint"
        style={{ padding: 'var(--space-4)', fontSize: 13, lineHeight: 1.6, color: 'color-mix(in srgb,var(--color-text) 75%,transparent)' }}
      >
        <BlueprintFrame />
        監督プロファイルは現時点でサンプルデータです（自動収集は未対応）。経歴・実績・評判の自動収集は、対応する無償ソースが確認でき次第、対戦国ニュースと同様に実データへ切り替える予定です。
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0,1fr) minmax(0,1fr)', gap: 'var(--space-6)' }}>
        <CareerTimeline coach={coach} />
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>
          <HonoursTable coach={coach} />
          <ReputationList coach={coach} />
        </div>
      </div>
    </div>
  );
}
