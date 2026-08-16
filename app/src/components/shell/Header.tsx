import type { ScreenKey } from '@/types';
import { POOL } from '@/data/pool';
import { useAppDispatch, useAppState } from '@/state/AppContext';
import { useCollected, formatCollected } from '@/state/CollectedContext';
import { RUN_WORKFLOW_URL } from '@/lib/collectedData';
import { currentMode } from '@/state/selectors';
import { BlueprintFrame } from '@/components/primitives/BlueprintFrame';
import { TierFilterSeg } from '@/components/primitives/TierFilterSeg';

// Ported from Scout Hub.dc.html lines 77-99 + titles/crumbs maps (1031-1032).
export function Header() {
  const state = useAppState();
  const dispatch = useAppDispatch();
  const m = currentMode(state);
  const cur = POOL[state.code];
  const collected = useCollected();

  const titles: Record<ScreenKey, string> = {
    home: `${m.ja} — 対戦国一覧`,
    country: `${cur.ja} — 国別詳細`,
    coach: `${cur.ja} — 監督プロファイル`,
    video: '動画URL → 日本語要約',
    sources: '情報源と信頼度の管理',
    feed: '更新フィード / アラート',
    report: 'レポート出力',
  };
  const crumbs: Record<ScreenKey, string> = {
    home: `${m.en} category`,
    country: `${m.en} category / ${cur.en}`,
    coach: `${m.en} category / ${cur.en} / coach`,
    video: 'tools / transcript',
    sources: 'settings / sources',
    feed: 'monitor / feed',
    report: 'output / report',
  };

  return (
    <header
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 'var(--space-4)',
        padding: 'var(--space-4) var(--space-6)',
        borderBottom: '1px solid var(--color-divider)',
        position: 'sticky',
        top: 0,
        background: 'var(--color-bg)',
        zIndex: 5,
      }}
    >
      <div style={{ minWidth: 0 }}>
        <div
          style={{
            fontSize: 10,
            letterSpacing: '.12em',
            textTransform: 'uppercase',
            color: 'color-mix(in srgb,var(--color-text) 50%,transparent)',
          }}
        >
          {crumbs[state.screen]}
        </div>
        <h3 style={{ margin: 0 }}>{titles[state.screen]}</h3>
      </div>
      <div
        style={{
          marginLeft: 'auto',
          display: 'flex',
          alignItems: 'center',
          gap: 'var(--space-4)',
          flexWrap: 'wrap',
          justifyContent: 'flex-end',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', flex: 'none' }}>
          <span
            style={{
              fontSize: 10,
              letterSpacing: '.1em',
              textTransform: 'uppercase',
              color: 'color-mix(in srgb,var(--color-text) 50%,transparent)',
            }}
          >
            信頼度
          </span>
          <TierFilterSeg active={state.tiers} onToggle={(tier) => dispatch({ type: 'TOGGLE_TIER', tier })} />
        </div>
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'flex-end',
            gap: 2,
            fontSize: 11,
            color: 'color-mix(in srgb,var(--color-text) 55%,transparent)',
          }}
        >
          <span style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
            <span style={{ width: 6, height: 6, background: 'var(--color-accent)', display: 'block' }} />
            最終収集 {collected.lastCollectedAt ? formatCollected(collected.lastCollectedAt) : '未収集'}
          </span>
          {collected.message && (
            <span
              style={{
                maxWidth: 380,
                textAlign: 'right',
                color:
                  collected.status === 'error'
                    ? 'var(--color-accent-700)'
                    : 'color-mix(in srgb,var(--color-text) 55%,transparent)',
              }}
            >
              {collected.message}
            </span>
          )}
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'stretch', gap: 3 }}>
          <button
            className="btn btn-primary blueprint"
            onClick={collected.refresh}
            disabled={collected.status === 'loading'}
            title="収集済みデータを取り込み直して、画面を最新にします"
            style={{ position: 'relative' }}
          >
            <BlueprintFrame />
            {collected.status === 'loading' ? '取得中…' : '再収集'}
          </button>
          {/* Starting a new collection run needs credentials this page must
              not carry, so that half is a link to the Actions page. */}
          <a
            href={RUN_WORKFLOW_URL}
            target="_blank"
            rel="noreferrer noopener"
            style={{ fontSize: 10.5, textAlign: 'center', color: 'color-mix(in srgb,var(--color-text) 55%,transparent)' }}
          >
            新しい収集を実行 ↗
          </a>
        </div>
      </div>
    </header>
  );
}
