import { useAppDispatch, useAppState } from '@/state/AppContext';
import { currentMode, addableCountries } from '@/state/selectors';
import { POOL } from '@/data/pool';
import { flag } from '@/lib/flag';
import { BlueprintFrame } from '@/components/primitives/BlueprintFrame';
import { FlagSwatch } from '@/components/primitives/FlagSwatch';

// Ported from Scout Hub.dc.html lines 795-819.
export function AddCountryDialog() {
  const state = useAppState();
  const dispatch = useAppDispatch();
  if (!state.addOpen) return null;

  const m = currentMode(state);
  const addable = addableCountries(state).map((code) => ({ code, ...POOL[code], flagSm: flag(code, 40) }));

  return (
    <div className="dialog-backdrop" onClick={() => dispatch({ type: 'CLOSE_ADD' })}>
      <div
        className="dialog blueprint"
        onClick={(e) => e.stopPropagation()}
        style={{ width: 'min(620px,100%)', background: 'var(--color-bg)' }}
      >
        <BlueprintFrame />
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 'var(--space-3)' }}>
          <div className="dialog-title">対戦国を追加 — {m.short}</div>
          <span style={{ marginLeft: 'auto', fontSize: 11, color: 'color-mix(in srgb,var(--color-text) 55%,transparent)' }}>
            追加した国はこのカテゴリーのグリッドにのみ入ります
          </span>
        </div>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill,minmax(150px,1fr))',
            gap: 1,
            background: 'var(--color-divider)',
            border: '1px solid var(--color-divider)',
            maxHeight: 340,
            overflow: 'auto',
          }}
        >
          {addable.map((a) => (
            <button
              key={a.code}
              onClick={() => dispatch({ type: 'ADD_COUNTRY', code: a.code })}
              className="osh-row-hover"
              style={{
                cursor: 'pointer',
                border: 0,
                background: 'var(--color-bg)',
                padding: 'var(--space-3)',
                textAlign: 'left',
                display: 'flex',
                flexDirection: 'column',
                gap: 2,
              }}
            >
              <span style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                <FlagSwatch src={a.flagSm} en={a.en} width={22} height={15} />
                <span style={{ fontFamily: 'var(--font-heading)', fontSize: 16 }}>{a.ja}</span>
              </span>
              <span
                style={{
                  fontSize: 10,
                  letterSpacing: '.08em',
                  textTransform: 'uppercase',
                  color: 'color-mix(in srgb,var(--color-text) 55%,transparent)',
                }}
              >
                {a.en} · {a.conf} · {a.rank}位
              </span>
            </button>
          ))}
        </div>
        <div className="dialog-actions">
          <button className="btn btn-secondary" onClick={() => dispatch({ type: 'CLOSE_ADD' })}>
            閉じる
          </button>
        </div>
      </div>
    </div>
  );
}
