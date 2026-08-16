import { useAppState } from '@/state/AppContext';
import { currentMode } from '@/state/selectors';
import { countryData } from '@/lib/countryData';
import { useCountryCollection } from '@/state/CollectedContext';
import { safeHref } from '@/lib/collectedData';
import { REPORT_BLOCKS } from '@/data/report';
import { BlueprintFrame } from '@/components/primitives/BlueprintFrame';

// Real-data version: the fabricated "直近の試合結果" section is gone (no
// free structured match-result source — dropped per explicit direction).
// The report now centers on the real collected news, always limited to
// T1/T2 regardless of the header tier filter, same as the original design's
// intent of keeping the exported report to verifiable sources only.
export function ReportScreen() {
  const state = useAppState();
  const m = currentMode(state);
  const cur = countryData(state.code);
  const collection = useCountryCollection(state.mode, state.code);
  const reportNews = collection.items.filter((n) => n.tier === 'T1' || n.tier === 'T2').slice(0, 8);
  const today = new Date().toLocaleDateString('ja-JP', { year: 'numeric', month: '2-digit', day: '2-digit' });

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(300px,1fr))', gap: 'var(--space-6)', alignItems: 'start' }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
        <div className="card blueprint" style={{ padding: 'var(--space-4)', gap: 'var(--space-3)' }}>
          <BlueprintFrame />
          <h4 style={{ margin: 0 }}>出力内容</h4>
          {REPORT_BLOCKS.map((b, i) => (
            <label
              key={i}
              className="radio"
              style={{ justifyContent: 'space-between', width: '100%', padding: 'var(--space-2) 0', borderTop: '1px solid var(--color-divider)' }}
            >
              <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span
                  style={{
                    width: 12,
                    height: 12,
                    border: '1px solid var(--color-accent)',
                    background: b.checked ? 'var(--color-accent)' : 'transparent',
                    display: 'block',
                  }}
                />
                {b.label}
              </span>
              <span style={{ fontSize: 11, color: 'color-mix(in srgb,var(--color-text) 50%,transparent)' }}>{b.pages}</span>
            </label>
          ))}
        </div>
        <div className="card blueprint" style={{ padding: 'var(--space-4)', gap: 'var(--space-3)' }}>
          <BlueprintFrame />
          <h4 style={{ margin: 0 }}>共有</h4>
          <div className="field">
            <label>共有リンク（閲覧のみ・7日間）</label>
            <input className="input" value="https://scouthub.local/r/nadeshiko-08-14" readOnly />
          </div>
          <div style={{ display: 'flex', gap: 'var(--space-2)', flexWrap: 'wrap' }}>
            <button className="btn btn-primary blueprint" style={{ position: 'relative' }}>
              <BlueprintFrame />
              PDFを書き出す
            </button>
            <button className="btn btn-secondary">リンクをコピー</button>
          </div>
          <p style={{ margin: 0, fontSize: 11.5, lineHeight: 1.55, color: 'color-mix(in srgb,var(--color-text) 58%,transparent)' }}>
            出力にはティア表記と取得時刻が必ず併記されます。T3・T4を含める場合は表紙に注記が入ります。
          </p>
        </div>
      </div>

      <div
        className="blueprint"
        style={{
          minWidth: 0,
          background: 'var(--color-neutral-100)',
          padding: 'var(--space-6)',
          display: 'grid',
          placeItems: 'start center',
          overflowX: 'auto',
        }}
      >
        <BlueprintFrame />
        <div
          style={{
            width: '100%',
            minWidth: 0,
            maxWidth: 660,
            background: '#fff',
            border: '1px solid var(--color-divider)',
            boxShadow: 'var(--shadow-md)',
            padding: 'clamp(20px,4%,44px) clamp(20px,4.5%,46px)',
            display: 'flex',
            flexDirection: 'column',
            gap: 22,
          }}
        >
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'flex-start',
              borderBottom: '2px solid var(--color-text)',
              paddingBottom: 12,
            }}
          >
            <div>
              <div style={{ fontSize: 10, letterSpacing: '.14em', textTransform: 'uppercase', color: 'color-mix(in srgb,var(--color-text) 55%,transparent)' }}>
                Opponent Scout Report
              </div>
              <div style={{ fontFamily: 'var(--font-heading)', fontSize: 30, lineHeight: 1.05 }}>{cur.ja} 対策レポート</div>
            </div>
            <div style={{ textAlign: 'right', whiteSpace: 'nowrap', fontSize: 11, lineHeight: 1.5, color: 'color-mix(in srgb,var(--color-text) 60%,transparent)' }}>
              {today}
              <br />
              {m.short}
              <br />
              T1–T2 のみ
            </div>
          </div>
          <div>
            <div style={{ fontFamily: 'var(--font-heading)', fontSize: 13, letterSpacing: '.1em', textTransform: 'uppercase', marginBottom: 6 }}>
              1. サマリー
            </div>
            <p style={{ margin: 0, fontSize: 12, lineHeight: 1.7 }}>
              {cur.ja}（FIFA {cur.rank}位・{cur.conf}）に関する公開ニュースを自動収集しています。今回の収集では{collection.items.length}
              件の記事を確認し、うちT1（協会・公式）が{collection.items.filter((n) => n.tier === 'T1').length}件、T2（一般メディア）が
              {collection.items.filter((n) => n.tier === 'T2').length}件でした。
            </p>
          </div>
          <div>
            <div style={{ fontFamily: 'var(--font-heading)', fontSize: 13, letterSpacing: '.1em', textTransform: 'uppercase', marginBottom: 6 }}>
              2. 収集ニュース（T1–T2）
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {reportNews.length === 0 && (
                <p style={{ margin: 0, fontSize: 11.5, color: 'color-mix(in srgb,var(--color-text) 55%,transparent)' }}>
                  {collection.status === 'never_collected' ? 'まだ収集が実行されていません。' : '該当する記事がありません。'}
                </p>
              )}
              {reportNews.map((n, i) => (
                <div key={i} style={{ borderLeft: '2px solid var(--color-accent)', paddingLeft: 10 }}>
                  <div style={{ fontFamily: 'var(--font-heading)', fontSize: 13 }}>
                    {n.title}
                    <span style={{ fontFamily: 'var(--font-body)', fontSize: 10, marginLeft: 8, color: 'color-mix(in srgb,var(--color-text) 55%,transparent)' }}>
                      {n.tier} / {n.sourceName}
                    </span>
                  </div>
                  <p style={{ margin: '2px 0 0', fontSize: 11.5, lineHeight: 1.6 }}>
                    <a href={safeHref(n.link)} target="_blank" rel="noreferrer" style={{ color: 'var(--color-accent-700)' }}>
                      {n.link}
                    </a>
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
