import { useAppState } from '@/state/AppContext';
import { useCategoryCollection } from '@/state/CollectedContext';
import { POOL, type CountryCode } from '@/data/pool';
import { TIER_KEYS, TIERS } from '@/data/tiers';
import { BlueprintFrame } from '@/components/primitives/BlueprintFrame';
import { TierBadge } from '@/components/primitives/TierBadge';
import { Tag } from '@/components/primitives/Tag';

const STATUS_LABEL: Record<string, string> = { ok: '成功', stale: '前回分', never_collected: '未収集' };
const STATUS_VARIANT: Record<string, 'accent' | 'outline' | 'neutral'> = {
  ok: 'accent',
  stale: 'outline',
  never_collected: 'neutral',
};

function formatDateTime(iso: string | undefined): string {
  if (!iso) return '—';
  return new Date(iso).toLocaleString('ja-JP', { month: 'numeric', day: 'numeric', hour: '2-digit', minute: '2-digit' });
}

// Real-data version: the original design's per-tier "採用信頼度 98%" scores
// and named RSS/API sources were sample data. Both are now derived from
// what the collector actually gathered — real per-source article counts,
// and a real per-country collection log (see collector/collect.mjs).
export function SourcesScreen() {
  const state = useAppState();
  const collection = useCategoryCollection(state.mode);
  const allItems = Object.values(collection.countries).flatMap((c) => c.items);

  const columns = TIER_KEYS.map((k) => {
    const t = TIERS[k];
    const items = allItems.filter((i) => i.tier === k);
    const bySource = new Map<string, number>();
    items.forEach((i) => bySource.set(i.sourceName, (bySource.get(i.sourceName) ?? 0) + 1));
    const sources = [...bySource.entries()].sort((a, b) => b[1] - a[1]);
    return { key: k, ...t, count: items.length, sources, automatable: k === 'T1' || k === 'T2' };
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>
      <p style={{ margin: 0, maxWidth: '70ch', fontSize: 13, lineHeight: 1.6, color: 'color-mix(in srgb,var(--color-text) 70%,transparent)' }}>
        情報源は4段階のティアで管理します。既定では T1・T2 のみが各画面に表示され、T3・T4
        はヘッダーのフィルタで明示的に有効化したときだけ現れます。自動収集はT1・T2のみ対応しており（下記参照）、T3・T4は現時点で対象外です。
      </p>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(212px,1fr))', gap: 'var(--space-4)' }}>
        {columns.map((col) => (
          <div key={col.key} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
            <div className="blueprint" style={{ padding: 'var(--space-3)', background: col.headBg }}>
              <BlueprintFrame />
              <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
                <TierBadge tier={col.key} fontSize={13} padding="2px 7px" />
                <span style={{ fontFamily: 'var(--font-heading)', fontSize: 16 }}>{col.label}</span>
              </div>
              <div style={{ fontSize: 11.5, lineHeight: 1.55, marginTop: 6, color: 'color-mix(in srgb,var(--color-text) 68%,transparent)' }}>
                {col.desc}
              </div>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 6, marginTop: 'var(--space-2)' }}>
                <span style={{ fontFamily: 'var(--font-heading)', fontSize: 24 }}>{col.count}</span>
                <span style={{ fontSize: 10, letterSpacing: '.08em', textTransform: 'uppercase', color: 'color-mix(in srgb,var(--color-text) 50%,transparent)' }}>
                  収集記事数
                </span>
              </div>
            </div>
            {col.sources.map(([name, count], i) => (
              <div key={i} className="card blueprint" style={{ padding: 'var(--space-3)', gap: 6 }}>
                <BlueprintFrame />
                <div style={{ fontFamily: 'var(--font-heading)', fontSize: 15, lineHeight: 1.2 }}>{name}</div>
                <div style={{ fontSize: 11, color: 'color-mix(in srgb,var(--color-text) 55%,transparent)' }}>{count}件の記事</div>
              </div>
            ))}
            {col.automatable && col.sources.length === 0 && (
              <div style={{ fontSize: 12, color: 'color-mix(in srgb,var(--color-text) 50%,transparent)' }}>まだ記事がありません</div>
            )}
            {!col.automatable && (
              <div style={{ fontSize: 12, color: 'color-mix(in srgb,var(--color-text) 50%,transparent)' }}>自動収集は非対応です</div>
            )}
          </div>
        ))}
      </div>

      <section className="card blueprint" style={{ padding: 'var(--space-4)', gap: 'var(--space-3)' }}>
        <BlueprintFrame />
        <h4 style={{ margin: 0 }}>収集ログ（国別）</h4>
        <table className="table">
          <thead>
            <tr>
              <th>国</th>
              <th>記事数</th>
              <th style={{ width: 140 }}>取得</th>
              <th style={{ width: 96 }}>状態</th>
            </tr>
          </thead>
          <tbody>
            {Object.entries(collection.countries).map(([code, c]) => (
              <tr key={code}>
                <td style={{ fontSize: 13 }}>{POOL[code as CountryCode]?.ja ?? code}</td>
                <td style={{ fontSize: 13 }}>{c.items.length}件</td>
                <td style={{ fontSize: 12, color: 'color-mix(in srgb,var(--color-text) 60%,transparent)' }}>{formatDateTime(c.fetchedAt)}</td>
                <td>
                  <Tag variant={STATUS_VARIANT[c.status]}>{STATUS_LABEL[c.status]}</Tag>
                </td>
              </tr>
            ))}
            {Object.keys(collection.countries).length === 0 && (
              <tr>
                <td colSpan={4} style={{ fontSize: 13, color: 'color-mix(in srgb,var(--color-text) 55%,transparent)' }}>
                  まだ収集が実行されていません。
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </section>
    </div>
  );
}
