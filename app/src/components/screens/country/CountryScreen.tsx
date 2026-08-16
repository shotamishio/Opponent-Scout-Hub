import { useAppState } from '@/state/AppContext';
import { countryData } from '@/lib/countryData';
import { useCountryCollection } from '@/state/CollectedContext';
import { safeHref } from '@/lib/collectedData';
import { BlueprintFrame } from '@/components/primitives/BlueprintFrame';
import { Tag } from '@/components/primitives/Tag';
import { FlagSwatch } from '@/components/primitives/FlagSwatch';
import { StatsStrip } from './StatsStrip';
import { NewsTierColumns } from './NewsTierColumns';
import { CoachTeaserCard } from './CoachTeaserCard';

// Real-data version: the original design's "2カラム分析 / ティア並列" layout
// toggle was built around fabricated match-results + schedule tables, which
// have no reliable free data source across 5 age categories and ~28
// opponent countries — dropped per explicit direction. What's left (real
// news split by trust tier) maps directly onto the tier-parallel layout, so
// that's now the only country-detail layout.
export function CountryScreen() {
  const state = useAppState();
  const cur = countryData(state.code);
  const collection = useCountryCollection(state.mode, state.code);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 'var(--space-6)', flexWrap: 'wrap' }}>
        <div className="blueprint" style={{ width: 132, height: 88, display: 'grid', background: 'var(--color-accent-100)' }}>
          <BlueprintFrame />
          <FlagSwatch src={cur.flag} en={cur.en} width="100%" height="100%" />
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 'var(--space-3)' }}>
            <span style={{ fontFamily: 'var(--font-heading)', fontSize: 15, letterSpacing: '.1em', color: 'var(--color-accent-800)' }}>
              {cur.code}
            </span>
            <span style={{ fontFamily: 'var(--font-heading)', fontSize: 40, lineHeight: 1 }}>{cur.ja}</span>
            <span
              style={{
                fontSize: 12,
                letterSpacing: '.12em',
                textTransform: 'uppercase',
                color: 'color-mix(in srgb,var(--color-text) 55%,transparent)',
              }}
            >
              {cur.en}
            </span>
          </div>
          <div style={{ display: 'flex', gap: 'var(--space-2)', flexWrap: 'wrap' }}>
            <Tag variant="accent">FIFA {cur.rank}位</Tag>
            <Tag variant="neutral">{cur.conf}</Tag>
            <Tag variant="outline">収集記事 {collection.items.length} 件</Tag>
          </div>
          <p
            style={{
              margin: '4px 0 0',
              maxWidth: '64ch',
              fontSize: 13,
              lineHeight: 1.6,
              color: 'color-mix(in srgb,var(--color-text) 70%,transparent)',
            }}
          >
            {cur.ja}に関する公開ニュース記事を自動収集しています（1日3回更新、無償ソースのみ）。
            {collection.federationUrl
              ? '協会公式サイトは個別に検索し、T1として優先表示します。'
              : 'この国は協会公式サイトが特定できていないため、T1（協会公式）は収集対象外です。'}
          </p>
          {collection.federationUrl && (
            <a
              href={safeHref(collection.federationUrl)}
              target="_blank"
              rel="noreferrer noopener"
              style={{ fontSize: 12.5, fontFamily: 'var(--font-heading)', color: 'var(--color-accent-700)' }}
            >
              協会公式サイトを開く ↗
            </a>
          )}
        </div>
      </div>

      {collection.status === 'never_collected' && (
        <div
          className="blueprint"
          style={{ padding: 'var(--space-4)', fontSize: 13, lineHeight: 1.6, color: 'color-mix(in srgb,var(--color-text) 75%,transparent)' }}
        >
          <BlueprintFrame />
          この国はまだ収集が実行されていません。GitHub
          Actionsのスケジューラーが最初に実行されると、ここに実際のニュースが表示されます。
        </div>
      )}
      {collection.status === 'stale' && (
        <div
          className="blueprint"
          style={{ padding: 'var(--space-4)', fontSize: 13, lineHeight: 1.6, color: 'color-mix(in srgb,var(--color-text) 75%,transparent)' }}
        >
          <BlueprintFrame />
          直近の収集が失敗したため、前回取得できた分を表示しています。（{collection.lastError}）
        </div>
      )}

      <StatsStrip collection={collection} />
      <NewsTierColumns collection={collection} activeTiers={state.tiers} />
      <CoachTeaserCard cur={cur} />
    </div>
  );
}
