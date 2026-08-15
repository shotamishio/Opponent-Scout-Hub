import type { CountryData } from '@/lib/countryData';
import { useAppDispatch, useAppState } from '@/state/AppContext';
import { getCoach } from '@/lib/collectedData';
import { BlueprintFrame } from '@/components/primitives/BlueprintFrame';

interface CoachTeaserCardProps {
  cur: CountryData;
}

// Ported from Scout Hub.dc.html lines 329-341. The name and one-line summary
// are the collected coach (collector/lib/wikipedia.mjs); the prototype's
// invented appointment date and win-loss record are gone, since nothing free
// supplies them for women's national teams.
export function CoachTeaserCard({ cur }: CoachTeaserCardProps) {
  const dispatch = useAppDispatch();
  const state = useAppState();
  const coach = getCoach(state.mode, cur.code);
  const found = coach.status === 'ok' && coach.name;

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
          {found ? `${coach.name!.slice(0, 1)}.` : '—'}
        </div>
        <div style={{ minWidth: 0 }}>
          <div style={{ fontFamily: 'var(--font-heading)', fontSize: 20, lineHeight: 1.15 }}>
            {found ? coach.name : '監督情報なし'}
          </div>
          <div style={{ fontSize: 11, color: 'color-mix(in srgb,var(--color-text) 55%,transparent)' }}>
            {found ? coach.description ?? 'Wikipedia より収集' : 'Wikipediaに該当情報が見つかりませんでした'}
          </div>
        </div>
      </div>
      <p style={{ margin: 0, fontSize: 12.5, lineHeight: 1.6, color: 'color-mix(in srgb,var(--color-text) 75%,transparent)' }}>
        {coach.bio
          ? truncate(coach.bio, 130)
          : '監督の経歴・関連記事へのリンクを、監督プロファイル画面にまとめています。'}
      </p>
      <span style={{ fontSize: 12, color: 'var(--color-accent-700)', fontFamily: 'var(--font-heading)' }}>
        経歴・関連記事・情報源を見る →
      </span>
    </section>
  );
}

function truncate(text: string, max: number): string {
  return text.length <= max ? text : `${text.slice(0, max).trimEnd()}…`;
}
