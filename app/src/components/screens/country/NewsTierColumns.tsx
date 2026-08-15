import type { TierKey } from '@/types';
import type { CountryCollection } from '@/lib/collectedData';
import { TIERS } from '@/data/tiers';
import { BlueprintFrame } from '@/components/primitives/BlueprintFrame';

interface NewsTierColumnsProps {
  collection: CountryCollection;
  activeTiers: TierKey[];
}

function formatDate(iso: string | null): string {
  if (!iso) return '日時不明';
  return new Date(iso).toLocaleString('ja-JP', { month: 'numeric', day: 'numeric', hour: '2-digit', minute: '2-digit' });
}

// Real news, split into the same T1-T4 column layout the design used for
// sample notes — but only T1/T2 are ever populated by the collector (see
// collector/collect.mjs). T3 (記者個人) and T4 (ファン情報) columns are kept
// for the trust-tier system's sake, but always show an honest "not
// collected for free" message rather than sample content standing in for
// data that was never actually gathered.
export function NewsTierColumns({ collection, activeTiers }: NewsTierColumnsProps) {
  const columns = (['T1', 'T2', 'T3', 'T4'] as TierKey[]).map((key) => {
    const t = TIERS[key];
    const active = activeTiers.includes(key);
    const automatable = key === 'T1' || key === 'T2';
    const items = active && automatable ? collection.items.filter((i) => i.tier === key) : [];
    return { key, label: t.label, accent: t.accent, bg: t.bg, fg: t.fg, bd: t.bd, items, active, automatable };
  });

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(220px,1fr))', gap: 'var(--space-4)' }}>
      {columns.map((col) => (
        <div key={col.key} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)', opacity: col.active ? 1 : 0.45 }}>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 'var(--space-2)',
              paddingBottom: 'var(--space-2)',
              borderBottom: `2px solid ${col.accent}`,
            }}
          >
            <span
              style={{
                fontFamily: 'var(--font-heading)',
                fontSize: 12,
                padding: '2px 7px',
                background: col.bg,
                color: col.fg,
                border: `1px solid ${col.bd}`,
              }}
            >
              {col.key}
            </span>
            <span style={{ fontFamily: 'var(--font-heading)', fontSize: 14 }}>{col.label}</span>
            <span style={{ marginLeft: 'auto', fontSize: 11, color: 'color-mix(in srgb,var(--color-text) 50%,transparent)' }}>
              {col.items.length}件
            </span>
          </div>
          {col.items.map((item, i) => (
            <article key={i} className="card blueprint" style={{ padding: 'var(--space-3)', gap: 6 }}>
              <BlueprintFrame />
              <div
                style={{
                  fontSize: 10,
                  letterSpacing: '.06em',
                  textTransform: 'uppercase',
                  color: 'color-mix(in srgb,var(--color-text) 50%,transparent)',
                }}
              >
                {item.sourceName} · {formatDate(item.publishedAt)}
              </div>
              <a
                href={item.link}
                target="_blank"
                rel="noreferrer"
                style={{
                  fontFamily: 'var(--font-heading)',
                  fontSize: 15,
                  lineHeight: 1.3,
                  color: 'var(--color-text)',
                  textDecoration: 'none',
                }}
              >
                {item.title}
              </a>
            </article>
          ))}
          {col.active && col.automatable && col.items.length === 0 && (
            <div
              style={{
                border: '1px dashed color-mix(in srgb,var(--color-text) 22%,transparent)',
                padding: 'var(--space-4)',
                fontSize: 12,
                color: 'color-mix(in srgb,var(--color-text) 45%,transparent)',
              }}
            >
              このティアでは新着なし
            </div>
          )}
          {!col.automatable && (
            <div
              style={{
                border: '1px dashed color-mix(in srgb,var(--color-text) 22%,transparent)',
                padding: 'var(--space-4)',
                fontSize: 12,
                color: 'color-mix(in srgb,var(--color-text) 45%,transparent)',
              }}
            >
              {col.key === 'T3' ? '記者個人SNSの自動収集は無償の範囲では非対応です' : 'ファン情報の自動収集は無償の範囲では非対応です'}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
