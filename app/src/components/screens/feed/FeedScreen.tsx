import { useAppDispatch, useAppState } from '@/state/AppContext';
import { getCategoryCollection } from '@/lib/collectedData';
import { flag } from '@/lib/flag';
import { POOL, type CountryCode } from '@/data/pool';
import { ALERT_RULES } from '@/data/feed';
import { BlueprintFrame } from '@/components/primitives/BlueprintFrame';
import { TierBadge } from '@/components/primitives/TierBadge';
import { Tag } from '@/components/primitives/Tag';
import { FlagSwatch } from '@/components/primitives/FlagSwatch';

function formatDate(iso: string | null): string {
  if (!iso) return '日時不明';
  return new Date(iso).toLocaleString('ja-JP', { month: 'numeric', day: 'numeric', hour: '2-digit', minute: '2-digit' });
}

// Real-data version: aggregates every country's collected news within the
// current category into one feed, newest first. The original design's
// "kind" tag (メンバー／日程／戦術…) isn't something the collector can
// determine from an RSS headline with any real accuracy, so it's dropped
// rather than faked.
export function FeedScreen() {
  const state = useAppState();
  const dispatch = useAppDispatch();
  const categoryCollection = getCategoryCollection(state.mode);

  const feed = Object.entries(categoryCollection.countries)
    .flatMap(([code, collection]) => collection.items.map((item) => ({ code: code as CountryCode, item })))
    .filter(({ item }) => state.tiers.includes(item.tier))
    .sort((a, b) => (b.item.publishedAt ?? '').localeCompare(a.item.publishedAt ?? ''));

  const feedCount = `${feed.length} 件 · 表示ティア ${state.tiers.join(' ')}`;
  const t1Count = feed.filter((f) => f.item.tier === 'T1').length;

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0,1fr) 300px', gap: 'var(--space-6)' }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 'var(--space-3)' }}>
          <span style={{ fontSize: 11, letterSpacing: '.1em', textTransform: 'uppercase', color: 'color-mix(in srgb,var(--color-text) 50%,transparent)' }}>
            {feedCount}
          </span>
          <span style={{ flex: 1, height: 1, background: 'var(--color-divider)' }} />
        </div>
        {feed.length === 0 && (
          <div
            className="blueprint"
            style={{ padding: 'var(--space-4)', fontSize: 13, lineHeight: 1.6, color: 'color-mix(in srgb,var(--color-text) 75%,transparent)' }}
          >
            <BlueprintFrame />
            表示できるニュースがありません。収集が未実行か、選択中の信頼度フィルタに該当する記事がまだありません。
          </div>
        )}
        {feed.map(({ code, item }, i) => {
          const c = POOL[code];
          return (
            <article
              key={i}
              className="card blueprint osh-card-hover"
              onClick={() => dispatch({ type: 'OPEN_COUNTRY', code })}
              style={{ padding: 'var(--space-4)', gap: 'var(--space-2)', cursor: 'pointer', flexDirection: 'row', alignItems: 'flex-start' }}
            >
              <BlueprintFrame />
              <div style={{ width: 64, flex: 'none', display: 'flex', flexDirection: 'column', gap: 4, alignItems: 'flex-start' }}>
                <TierBadge tier={item.tier} />
                <span style={{ fontSize: 11, color: 'color-mix(in srgb,var(--color-text) 55%,transparent)' }}>{formatDate(item.publishedAt)}</span>
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', flexWrap: 'wrap' }}>
                  <span
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 5,
                      fontFamily: 'var(--font-heading)',
                      fontSize: 12,
                      letterSpacing: '.08em',
                      color: 'var(--color-accent-800)',
                      border: '1px solid var(--color-divider)',
                      padding: '1px 6px',
                      background: 'var(--color-accent-100)',
                    }}
                  >
                    <FlagSwatch src={flag(code, 40)} en={c.en} width={18} height={12} />
                    {code}
                  </span>
                  <a
                    href={item.link}
                    target="_blank"
                    rel="noreferrer"
                    onClick={(e) => e.stopPropagation()}
                    style={{ fontFamily: 'var(--font-heading)', fontSize: 18, lineHeight: 1.2, color: 'var(--color-text)', textDecoration: 'none' }}
                  >
                    {item.title}
                  </a>
                </div>
                <div style={{ marginTop: 6, fontSize: 11, color: 'color-mix(in srgb,var(--color-text) 50%,transparent)' }}>
                  {item.sourceName} · {c.ja}
                </div>
              </div>
            </article>
          );
        })}
      </div>
      <aside style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)', position: 'sticky', top: 96, alignSelf: 'start' }}>
        <div className="card blueprint" style={{ padding: 'var(--space-4)', gap: 'var(--space-3)' }}>
          <BlueprintFrame />
          <h4 style={{ margin: 0 }}>アラート条件</h4>
          {ALERT_RULES.map((a, i) => {
            const variant = a.tagClass.replace('tag-', '') as 'accent' | 'accent-2' | 'neutral' | 'outline';
            return (
              <div
                key={i}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  gap: 'var(--space-2)',
                  alignItems: 'center',
                  padding: 'var(--space-2) 0',
                  borderTop: '1px solid var(--color-divider)',
                  fontSize: 12.5,
                }}
              >
                <span>{a.label}</span>
                <Tag variant={variant}>{a.state}</Tag>
              </div>
            );
          })}
          <button className="btn btn-secondary" style={{ marginTop: 'var(--space-2)' }}>
            条件を追加
          </button>
        </div>
        <div className="card blueprint" style={{ padding: 'var(--space-4)', gap: 'var(--space-2)' }}>
          <BlueprintFrame />
          <h4 style={{ margin: 0 }}>今日の要注意</h4>
          <p style={{ margin: 0, fontSize: 12.5, lineHeight: 1.6, color: 'color-mix(in srgb,var(--color-text) 75%,transparent)' }}>
            {t1Count > 0
              ? `T1（協会・公式）のニュースが${t1Count}件あります。優先的にご確認ください。`
              : '現在、T1（協会・公式）の新着はありません。'}
          </p>
          <button
            className="btn btn-primary blueprint"
            onClick={() => dispatch({ type: 'GO_SCREEN', screen: 'report' })}
            style={{ position: 'relative', marginTop: 'var(--space-2)' }}
          >
            <BlueprintFrame />
            レポートにまとめる
          </button>
        </div>
      </aside>
    </div>
  );
}
