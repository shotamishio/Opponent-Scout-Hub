import { useAppDispatch, useAppState } from '@/state/AppContext';
import { BlueprintFrame } from '@/components/primitives/BlueprintFrame';

// Ported from Scout Hub.dc.html lines 510-527.
export function VideoInputCard({ currentJa }: { currentJa: string }) {
  const state = useAppState();
  const dispatch = useAppDispatch();
  const analyzeLabel = state.video === 'run' ? '解析中…' : '文字起こし＋要約';

  return (
    <div className="card blueprint" style={{ padding: 'var(--space-4)', gap: 'var(--space-3)' }}>
      <BlueprintFrame />
      <div style={{ display: 'flex', gap: 'var(--space-3)', alignItems: 'flex-end', flexWrap: 'wrap' }}>
        <div className="field" style={{ flex: 1, minWidth: 320 }}>
          <label>動画URL（記者会見・ハイライト・現地番組など）</label>
          <input
            className="input"
            value={state.url}
            onChange={(e) => dispatch({ type: 'SET_URL', url: e.target.value })}
            placeholder="https://…"
          />
        </div>
        <div className="field" style={{ width: 180 }}>
          <label>対象国</label>
          <input className="input" value={currentJa} readOnly />
        </div>
        <button
          className="btn btn-primary blueprint"
          onClick={() => dispatch({ type: 'START_ANALYZE' })}
          style={{ position: 'relative', minHeight: 36 }}
        >
          <BlueprintFrame />
          {analyzeLabel}
        </button>
      </div>
      <p style={{ margin: 0, fontSize: 12, lineHeight: 1.6, color: 'color-mix(in srgb,var(--color-text) 60%,transparent)' }}>
        音声を自動言語判定して文字起こしし、日本語に翻訳・要約します。字幕が公開されている動画は字幕を優先し、無料枠では1本あたり最大90分まで処理します。
        （この機能はUIデモです。実際の文字起こし・翻訳は行われません。）
      </p>
    </div>
  );
}
