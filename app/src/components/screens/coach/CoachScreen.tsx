import { useAppDispatch, useAppState } from '@/state/AppContext';
import { countryData } from '@/lib/countryData';
import { useCoach } from '@/state/CollectedContext';
import { BlueprintFrame } from '@/components/primitives/BlueprintFrame';
import { Tag } from '@/components/primitives/Tag';
import { CoachSources } from './CoachSources';
import { CoachArticleList } from './CoachArticleList';

// Layout follows Scout Hub.dc.html lines 425-506, but the content is now the
// collected coach (collector/lib/wikipedia.mjs) instead of the prototype's
// sample profile. The tactical-traits meter, career timeline, honours table
// and tiered reputation quotes that used to fill this screen are gone: every
// one of them was generated from the country code, and there is no free
// source for them. What replaces them is what can actually be sourced — the
// coach's name, their Wikipedia biography, and articles that name them.
export function CoachScreen() {
  const state = useAppState();
  const dispatch = useAppDispatch();
  const cur = countryData(state.code);
  const coach = useCoach(state.mode, state.code);
  const initials = coach.name ? `${coach.name.slice(0, 1)}.` : '—';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>
      <div style={{ display: 'flex', gap: 'var(--space-6)', alignItems: 'flex-start', flexWrap: 'wrap' }}>
        <div
          className="blueprint duotone"
          style={{ width: 150, height: 190, background: 'var(--color-accent-200)', display: 'grid', placeItems: 'center' }}
        >
          <BlueprintFrame />
          <span style={{ fontFamily: 'var(--font-heading)', fontSize: 44, color: 'var(--color-accent-800)' }}>{initials}</span>
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
          <div style={{ fontFamily: 'var(--font-heading)', fontSize: 44, lineHeight: 1.05 }}>
            {coach.status === 'ok' ? coach.name : '監督情報なし'}
          </div>

          <div style={{ display: 'flex', gap: 'var(--space-2)', flexWrap: 'wrap' }}>
            {coach.description && <Tag variant="accent">{coach.description}</Tag>}
            {coach.stale && <Tag variant="outline">前回収集分</Tag>}
            {coach.fetchedAt && <Tag variant="neutral">収集 {formatDate(coach.fetchedAt)}</Tag>}
          </div>

          {coach.bio ? (
            <p
              style={{
                margin: 'var(--space-2) 0 0',
                fontSize: 13.5,
                lineHeight: 1.65,
                color: 'color-mix(in srgb,var(--color-text) 78%,transparent)',
              }}
            >
              {coach.bio}
            </p>
          ) : (
            <p
              style={{
                margin: 'var(--space-2) 0 0',
                fontSize: 13,
                lineHeight: 1.65,
                color: 'color-mix(in srgb,var(--color-text) 65%,transparent)',
              }}
            >
              {NO_BIO_NOTE[coach.status]}
            </p>
          )}

          <button
            className="btn btn-secondary"
            onClick={() => dispatch({ type: 'GO_SCREEN', screen: 'country' })}
            style={{ alignSelf: 'flex-start', marginTop: 'var(--space-2)' }}
          >
            ← 国別詳細へ戻る
          </button>
        </div>

        <CoachSources coach={coach} countryEn={cur.en} />
      </div>

      <CoachArticleList coach={coach} />
    </div>
  );
}

const NO_BIO_NOTE: Record<string, string> = {
  ok: 'この監督個人のWikipedia記事は見つかりませんでした。下記のリンクから、チームの公式情報や関連記事をご確認ください。',
  no_coach_listed:
    'チームのWikipedia記事は見つかりましたが、監督が記載されていません（就任前・空位・未更新のいずれか）。下記のリンクから直接ご確認ください。',
  no_team_article: 'このカテゴリーのチームについて、Wikipediaに該当する記事が見つかりませんでした。',
  error: '前回の収集でエラーが発生しました。次回の自動収集で再取得を試みます。',
};

function formatDate(iso: string): string {
  const d = new Date(iso);
  return `${d.getFullYear()}/${String(d.getMonth() + 1).padStart(2, '0')}/${String(d.getDate()).padStart(2, '0')}`;
}
