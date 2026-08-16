import { MODES } from '@/data/modes';
import type { ScreenKey } from '@/types';
import { useAppDispatch, useAppState } from '@/state/AppContext';
import { rosterOf } from '@/state/selectors';
import { useCategoryCollection } from '@/state/CollectedContext';
import { BlueprintFrame } from '@/components/primitives/BlueprintFrame';

// Ported from Scout Hub.dc.html lines 43-74.
const NAV: { key: ScreenKey; label: string }[] = [
  { key: 'home', label: '対戦国一覧' },
  { key: 'country', label: '国別詳細' },
  { key: 'coach', label: '監督プロファイル' },
  { key: 'video', label: '動画 → 日本語要約' },
  { key: 'sources', label: '情報源・信頼度' },
  { key: 'feed', label: '更新フィード' },
  { key: 'report', label: 'レポート出力' },
];

export function Sidebar() {
  const state = useAppState();
  const dispatch = useAppDispatch();
  const categoryCollection = useCategoryCollection(state.mode);

  const navBadge = (key: ScreenKey): string => {
    if (key === 'home') return String(rosterOf(state, state.mode).length);
    if (key === 'country') return state.code;
    if (key === 'feed') {
      const collection = categoryCollection;
      const count = Object.values(collection.countries)
        .flatMap((c) => c.items)
        .filter((item) => state.tiers.includes(item.tier)).length;
      return String(count);
    }
    return '';
  };

  return (
    <aside
      style={{
        borderRight: '1px solid var(--color-divider)',
        padding: 'var(--space-4) var(--space-4) var(--space-8)',
        display: 'flex',
        flexDirection: 'column',
        gap: 'var(--space-6)',
        position: 'sticky',
        top: 0,
        height: '100vh',
        overflow: 'auto',
      }}
    >
      <div>
        <div style={{ fontFamily: 'var(--font-heading)', fontSize: 20, letterSpacing: '.02em' }}>
          OPPONENT SCOUT HUB
        </div>
        <div
          style={{
            fontSize: 11,
            letterSpacing: '.08em',
            textTransform: 'uppercase',
            color: 'color-mix(in srgb,var(--color-text) 50%,transparent)',
          }}
        >
          対戦国情報集約 / JFA WOMEN
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
        <div
          style={{
            fontSize: 10,
            letterSpacing: '.12em',
            textTransform: 'uppercase',
            color: 'color-mix(in srgb,var(--color-text) 50%,transparent)',
          }}
        >
          Category / カテゴリー
        </div>
        {MODES.map((m) => {
          const active = m.key === state.mode;
          return (
            <button
              key={m.key}
              className="osh-mode-btn"
              onClick={() => dispatch({ type: 'SET_MODE', mode: m.key })}
              style={{
                textAlign: 'left',
                cursor: 'pointer',
                fontFamily: 'var(--font-heading)',
                fontSize: 16,
                lineHeight: 1.15,
                padding: 'var(--space-2) var(--space-3)',
                border: `1px solid ${active ? 'var(--color-accent)' : 'var(--color-divider)'}`,
                background: active ? 'var(--color-accent-100)' : 'transparent',
                color: 'var(--color-text)',
                borderRadius: 0,
                display: 'flex',
                flexDirection: 'column',
                gap: 1,
              }}
            >
              <span>{m.ja}</span>
              <span
                style={{
                  fontFamily: 'var(--font-body)',
                  fontSize: 10,
                  letterSpacing: '.1em',
                  textTransform: 'uppercase',
                  opacity: 0.7,
                }}
              >
                {m.en} · {rosterOf(state, m.key).length} nations
              </span>
            </button>
          );
        })}
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
        <div
          style={{
            fontSize: 10,
            letterSpacing: '.12em',
            textTransform: 'uppercase',
            color: 'color-mix(in srgb,var(--color-text) 50%,transparent)',
            marginBottom: 'var(--space-2)',
          }}
        >
          Sections
        </div>
        {NAV.map((n) => {
          const active = n.key === state.screen;
          return (
            <button
              key={n.key}
              className="osh-nav-btn"
              onClick={() => dispatch({ type: 'GO_SCREEN', screen: n.key })}
              style={{
                textAlign: 'left',
                cursor: 'pointer',
                fontSize: 13,
                padding: '7px var(--space-3)',
                border: 0,
                borderLeft: `2px solid ${active ? 'var(--color-accent)' : 'transparent'}`,
                background: active ? 'var(--color-accent-100)' : 'transparent',
                color: 'var(--color-text)',
                display: 'flex',
                justifyContent: 'space-between',
                gap: 8,
                alignItems: 'center',
              }}
            >
              <span>{n.label}</span>
              <span style={{ fontSize: 10, fontFamily: 'var(--font-heading)', color: 'var(--color-accent-700)' }}>
                {navBadge(n.key)}
              </span>
            </button>
          );
        })}
      </div>

      <div
        className="blueprint"
        style={{
          marginTop: 'auto',
          padding: 'var(--space-3)',
          fontSize: 11,
          lineHeight: 1.5,
          color: 'color-mix(in srgb,var(--color-text) 60%,transparent)',
        }}
      >
        <BlueprintFrame />
        <div style={{ fontFamily: 'var(--font-heading)', fontSize: 13, color: 'var(--color-text)', letterSpacing: '.04em' }}>
          無料構成での運用
        </div>
        公式RSS・公開API・SNS公開投稿のみを収集。有料契約は不要ですが、取得頻度は1日3回に制限されます。
      </div>
    </aside>
  );
}
