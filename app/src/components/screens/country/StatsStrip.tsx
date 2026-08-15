import type { CountryCollection } from '@/lib/collectedData';

interface StatsStripProps {
  collection: CountryCollection;
}

const STATUS_LABEL: Record<CountryCollection['status'], string> = {
  ok: '最新',
  stale: '前回収集分（今回は取得失敗）',
  never_collected: '未収集',
};

function formatDateTime(iso: string | undefined): string {
  if (!iso) return '—';
  return new Date(iso).toLocaleString('ja-JP', { month: 'numeric', day: 'numeric', hour: '2-digit', minute: '2-digit' });
}

// Replaces the original design's fabricated match-record stats (勝-分-敗
// etc.) with real, honestly-derived numbers about the collection itself.
export function StatsStrip({ collection }: StatsStripProps) {
  const t1 = collection.items.filter((i) => i.tier === 'T1').length;
  const t2 = collection.items.filter((i) => i.tier === 'T2').length;
  const tiles = [
    { label: '収集記事数', value: String(collection.items.length), note: '直近の収集分' },
    { label: 'T1（協会・公式）', value: String(t1), note: '公式ソース一致' },
    { label: 'T2（一般メディア）', value: String(t2), note: 'その他ニュース' },
    { label: '状態', value: STATUS_LABEL[collection.status], note: formatDateTime(collection.fetchedAt) },
  ];
  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit,minmax(180px,1fr))',
        gap: 1,
        background: 'var(--color-divider)',
        border: '1px solid var(--color-divider)',
      }}
    >
      {tiles.map((s, i) => (
        <div key={i} style={{ background: 'var(--color-bg)', padding: 'var(--space-4)' }}>
          <div style={{ fontSize: 10, letterSpacing: '.1em', textTransform: 'uppercase', color: 'color-mix(in srgb,var(--color-text) 50%,transparent)' }}>
            {s.label}
          </div>
          <div style={{ fontFamily: 'var(--font-heading)', fontSize: 30, lineHeight: 1.1 }}>{s.value}</div>
          <div style={{ fontSize: 11, color: 'color-mix(in srgb,var(--color-text) 55%,transparent)' }}>{s.note}</div>
        </div>
      ))}
    </div>
  );
}
