import type { CollectedCoach } from '@/lib/collectedData';
import { BlueprintFrame } from '@/components/primitives/BlueprintFrame';
import { TierBadge } from '@/components/primitives/TierBadge';

interface CoachArticleListProps {
  coach: CollectedCoach;
}

// Recent articles that name this coach, collected alongside the biography
// (collector/collect.mjs, collectCoach). This is what replaced the invented
// "reputation" quotes: real headlines, with the outlet and date shown, each
// one opening the actual article.
export function CoachArticleList({ coach }: CoachArticleListProps) {
  const articles = coach.articles ?? [];

  return (
    <section className="card blueprint" style={{ padding: 'var(--space-4)', gap: 'var(--space-3)' }}>
      <BlueprintFrame />
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 'var(--space-3)' }}>
        <h4 style={{ margin: 0 }}>監督に言及した記事</h4>
        <span style={{ fontSize: 12, color: 'color-mix(in srgb,var(--color-text) 55%,transparent)' }}>{articles.length}件</span>
      </div>

      {articles.length === 0 ? (
        <p style={{ margin: 0, fontSize: 13, lineHeight: 1.6, color: 'color-mix(in srgb,var(--color-text) 65%,transparent)' }}>
          {coach.status === 'ok'
            ? '直近の期間内に、この監督名を含む記事は見つかりませんでした。右の「Googleニュース検索」から、期間を問わず直接検索できます。'
            : '監督が特定できていないため、記事の収集も行っていません。'}
        </p>
      ) : (
        <ul style={{ listStyle: 'none', margin: 0, padding: 0, display: 'flex', flexDirection: 'column' }}>
          {articles.map((article) => (
            <li
              key={article.link}
              style={{
                display: 'flex',
                gap: 'var(--space-3)',
                alignItems: 'flex-start',
                padding: 'var(--space-3) 0',
                borderTop: '1px solid var(--color-divider)',
              }}
            >
              <TierBadge tier={article.tier} />
              <div style={{ display: 'flex', flexDirection: 'column', gap: 3, minWidth: 0 }}>
                <a
                  href={article.link}
                  target="_blank"
                  rel="noreferrer noopener"
                  style={{ fontSize: 13.5, lineHeight: 1.5, textDecoration: 'none' }}
                >
                  {article.title} ↗
                </a>
                <span style={{ fontSize: 11.5, color: 'color-mix(in srgb,var(--color-text) 55%,transparent)' }}>
                  {article.sourceName}
                  {article.publishedAt ? ` · ${article.publishedAt.slice(0, 10)}` : ''}
                </span>
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
